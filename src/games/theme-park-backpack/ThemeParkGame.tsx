import { useCallback, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { gameConfig, isDynamicLevel, levels } from "./game.config";
import type { DynamicLevel, GameItem, GamePhase, Level, PhaseResult } from "./game.types";
import { calculatePhaseResult, canFitItem, usedSpaceFor } from "./scoring";
import { Backpack } from "./components/Backpack";
import { CapacityMeter } from "./components/CapacityMeter";
import { ConceptReveal } from "./components/ConceptReveal";
import { EventCard } from "./components/EventCard";
import { ItemCard } from "./components/ItemCard";
import { LevelProgress } from "./components/LevelProgress";
import { ScorePanel } from "./components/ScorePanel";
import { PlanChange } from "./components/PlanChange";
import { useGameProgress } from "../../hooks/useGameProgress";

const FEEDBACK_TEXT: Record<string, string> = {
  excellent:
    "You handled the day without filling the whole backpack. Useful choices mattered more than maximum utilisation.",
  efficient:
    "You handled everything, but some of the space went on things that did not help much.",
  "full-but-noisy":
    "Your backpack was completely full, but some of that space never helped you.",
  "missing-context":
    "Useful things were left behind while less relevant items consumed your limited space.",
  balanced:
    "Your choices worked, but there may be a more space-efficient combination.",
};

const PHASE_IDS = {
  single: "main",
  morning: "morning",
  evening: "evening",
} as const;

/**
 * Owns all game state (spec 31): current level, selections, phase, and result.
 * Every child is presentational.
 *
 * Level 5 needs two independent selections rather than one. `morningSelection`
 * is frozen the moment the plan changes and is never re-scored against the
 * repacked bag, so the before/after comparison the teaching depends on stays
 * truthful (decisions note 4).
 */
export function ThemeParkGame() {
  const { progress, completeLevel, markGameCompleted } = useGameProgress();

  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [morningSelection, setMorningSelection] = useState<string[] | null>(null);
  const [phase, setPhase] = useState<GamePhase>("packing");
  const [message, setMessage] = useState<string | null>(null);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [resumed, setResumed] = useState(false);

  const level: Level = levels[levelIndex];
  const isDynamic = isDynamicLevel(level);
  const dynamicLevel: DynamicLevel | null = isDynamic ? level : null;

  /**
   * Which pack the backpack panel shows.
   *
   * Normally that is the live selection. The one exception is the Level 5
   * result screen, where the frozen morning pack is shown for comparison.
   */
  const activeSelection =
    phase === "result" && isDynamic && morningSelection ? morningSelection : selectedItemIds;

  const used = useMemo(() => usedSpaceFor(level.items, activeSelection), [level, activeSelection]);

  const result = useMemo(
    () =>
      calculatePhaseResult({
        items: level.items,
        selectedItemIds: activeSelection,
        events: level.events,
        capacity: level.capacity,
        phaseId: isDynamic ? PHASE_IDS.morning : PHASE_IDS.single,
      }),
    [level, activeSelection, isDynamic],
  );

  const morningResult: PhaseResult | null = useMemo(() => {
    if (!isDynamic || !morningSelection) return null;
    return calculatePhaseResult({
      items: level.items,
      selectedItemIds: morningSelection,
      events: (level as DynamicLevel).morningEvents,
      capacity: level.capacity,
      phaseId: PHASE_IDS.morning,
    });
  }, [level, isDynamic, morningSelection]);

  const eveningResult: PhaseResult | null = useMemo(() => {
    if (!isDynamic || !morningSelection) return null;
    return calculatePhaseResult({
      items: level.items,
      selectedItemIds,
      events: (level as DynamicLevel).eveningEvents,
      capacity: level.capacity,
      phaseId: PHASE_IDS.evening,
    });
  }, [level, isDynamic, morningSelection, selectedItemIds]);

  const selectedItems: GameItem[] = useMemo(
    () => level.items.filter((item) => activeSelection.includes(item.id)),
    [level, activeSelection],
  );

  /**
   * Level 5 has two pack states in the `events` phase: the morning playback
   * (the pack the player just built) and the evening playback (the repacked
   * one). Only the morning one is frozen, and only while it is being shown.
   */
  const isMorningPlayback = isDynamic && phase === "events" && morningSelection === null;

  const toggleItem = useCallback(
    (itemId: string) => {
      const item = level.items.find((candidate) => candidate.id === itemId);
      if (!item) return;

      // The morning pack is a record of what the player brought; editing it
      // after the fact would make the before/after comparison a lie.
      if (isMorningPlayback) return;

      setSelectedItemIds((current) => {
        if (current.includes(itemId)) {
          setMessage(null);
          return current.filter((id) => id !== itemId);
        }

        const usedNow = usedSpaceFor(level.items, current);

        // AC-01: reject with an explanation, never silently swap another item.
        if (!canFitItem({ used: usedNow, capacity: level.capacity, size: item.size })) {
          setMessage(`${item.name} won't fit. Remove something first.`);
          return current;
        }

        setMessage(null);
        return [...current, itemId];
      });
    },
    [level, isMorningPlayback],
  );

  const resetLevel = useCallback(() => {
    setSelectedItemIds([]);
    setMorningSelection(null);
    setMessage(null);
    setPhase("packing");
  }, []);

  const startDay = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    setMessage(null);
    setPhase("events");
  }, [selectedItemIds.length]);

  /** Freezes the morning pack and forces a repack for Level 5. */
  const handlePlanChange = useCallback(() => {
    setMorningSelection(selectedItemIds);
    setSelectedItemIds([]);
    setMessage(null);
    setPhase("repacking");
  }, [selectedItemIds]);

  const continueToEvening = useCallback(() => {
    setMessage(null);
    setPhase("events");
  }, []);

  const showResult = useCallback(() => {
    setPhase("result");
  }, []);

  const goToNextLevel = useCallback(() => {
    if (levelIndex + 1 < levels.length) {
      setLevelIndex((index) => index + 1);
      setSelectedItemIds([]);
      setMorningSelection(null);
      setPhase("packing");
      return;
    }

    markGameCompleted();
    setPhase("complete");
  }, [levelIndex, markGameCompleted]);

  /**
   * From the result screen: either show this level's reveal, or move on.
   */
  const advance = useCallback(() => {
    completeLevel(level.id);

    if (level.aiReveal) {
      setPhase("reveal");
      return;
    }

    goToNextLevel();
  }, [completeLevel, goToNextLevel, level.aiReveal, level.id]);

  /**
   * From inside the reveal dialog: close it and move on.
   *
   * This must NOT re-check `level.aiReveal`. Doing so would re-enter the
   * reveal phase forever and soft-lock the game on any level that has one.
   */
  const closeReveal = useCallback(() => {
    goToNextLevel();
  }, [goToNextLevel]);

  /**
   * The furthest level the player has actually finished, capped to a level
   * that exists. Persisted progress can outrun the level list after an update
   * that removes levels, so this must not index past the end.
   */
  const resumeIndex = Math.min(
    Math.max(0, progress.highestCompletedLevel),
    levels.length - 1,
  );
  const canResume = progress.highestCompletedLevel > 0 && !progress.gameCompleted;

  if (!introDismissed) {
    return (
      <div className="intro">
        <h2>{gameConfig.title}</h2>
        <p>{gameConfig.intro}</p>
        <p className="intro__note">
          Five short levels, about 5–8 minutes. You do not need any AI knowledge to start.
        </p>

        {canResume && !resumed && (
          <div className="intro__actions">
            <Button
              variant="primary"
              onClick={() => {
                setLevelIndex(resumeIndex);
                setResumed(true);
                setIntroDismissed(true);
              }}
            >
              Continue from Level {levels[resumeIndex].id}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setLevelIndex(0);
                setIntroDismissed(true);
              }}
            >
              Start from Level 1
            </Button>
          </div>
        )}

        {!canResume && (
          <Button variant="primary" onClick={() => setIntroDismissed(true)}>
            Start packing
          </Button>
        )}
      </div>
    );
  }

  const isReadOnly = isMorningPlayback;
  const isFinalLevel = levelIndex === levels.length - 1;
  const canAdvance = !isDynamic || eveningResult !== null;

  return (
    <div className="game">
      <LevelProgress
        currentLevel={level.id}
        highestCompleted={progress.highestCompletedLevel}
        implementedCount={levels.length}
      />

      <section className="level">
        <h2 className="level__title">{level.title}</h2>
        <p className="level__description">{level.description}</p>

        <ul className="level__conditions">
          {(phase === "repacking" && isDynamic
            ? dynamicLevel!.changedConditions
            : level.conditions
          ).map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      </section>

      {/*
        The result screen carries its own before/after breakdown, so the
        packing controls and the live meter are hidden there. Leaving them
        visible would invite edits that silently invalidate the numbers
        already on screen.
      */}
      {phase !== "result" && <CapacityMeter capacity={level.capacity} used={used} />}

      <p role="status" aria-live="polite" className="game__message">
        {message ?? ""}
      </p>

      {phase !== "result" && (
        <div className="game__columns">
          <section className="game__panel" aria-label="Available items">
          <h3 className="game__panel-title">Available items</h3>
          <ul className="item-list">
            {level.items.map((item) => (
              <li key={item.id}>
                <ItemCard
                  item={item}
                  selected={activeSelection.includes(item.id)}
                  onToggle={toggleItem}
                  disabled={isReadOnly}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="game__panel" aria-label="Your backpack">
          <h3 className="game__panel-title">
            Your backpack
            {isMorningPlayback ? " (morning pack)" : ""}
          </h3>
          <Backpack selectedItems={selectedItems} onRemove={toggleItem} disabled={isReadOnly} />

          <div className="game__actions">
            {(phase === "packing" || phase === "repacking") && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={selectedItemIds.length === 0}
                  onClick={phase === "repacking" ? continueToEvening : startDay}
                >
                  {phase === "repacking"
                    ? "Continue to evening →"
                    : isDynamic
                      ? "Start the morning"
                      : "Start the day"}
                </Button>
                <Button variant="ghost" onClick={resetLevel}>
                  Reset level
                </Button>
              </>
            )}

            {phase === "events" && !isDynamic && (
              <Button variant="primary" fullWidth onClick={showResult}>
                See how the day went
              </Button>
            )}

            {phase === "events" && isDynamic && morningSelection !== null && (
              <Button variant="primary" fullWidth onClick={showResult}>
                See how the evening went
              </Button>
            )}
          </div>
          </section>
        </div>
      )}

      {phase === "repacking" && dynamicLevel && (
        <PlanChange
          message={dynamicLevel.changeMessage}
          morningItems={level.items.filter((item) => morningSelection?.includes(item.id))}
        />
      )}

      {/*
        Consequences stay on screen through the result. Hiding them the moment
        the player asks "how did the day go" would make the scores arrive
        without the evidence that explains them (spec 22).
      */}
      {(phase === "events" || phase === "result") && (
        <section className="events" aria-label="What happened">
          <h3 className="game__panel-title">
            {isDynamic
              ? phase === "result"
                ? "The evening"
                : isMorningPlayback
                  ? "The morning"
                  : "The evening"
              : "The day"}
          </h3>
          <ul className="event-list">
            {(isDynamic ? (isMorningPlayback ? dynamicLevel!.morningEvents : dynamicLevel!.eveningEvents) : level.events).map(
              (event, index) => {
                // During the morning playback the pack is still selectedItemIds;
                // morningSelection is only frozen once the plan changes.
                const success = event.satisfyingItemIds.some((id) =>
                  selectedItemIds.includes(id),
                );
                return <EventCard key={event.id} event={event} success={success} index={index} />;
              },
            )}
          </ul>

          {isMorningPlayback && (
            <Button variant="primary" onClick={handlePlanChange}>
              Continue
            </Button>
          )}
        </section>
      )}

      {phase === "result" && (
        <section className="result" aria-label="Level result">
          {isDynamic && morningResult && eveningResult ? (
            <>
              <h3 className="game__panel-title">Before the plan changed</h3>
              <ScorePanel result={morningResult} />
              <ul className="pack-summary">
                {level.items
                  .filter((item) => morningSelection?.includes(item.id))
                  .map((item) => (
                    <li key={`m-${item.id}`}>
                      <span aria-hidden="true">{item.icon}</span> {item.name}
                    </li>
                  ))}
              </ul>

              <div className="result__arrow" aria-hidden="true">
                ↓
              </div>

              <h3 className="game__panel-title">After the plan changed</h3>
              <ScorePanel result={eveningResult} />
              <ul className="pack-summary">
                {level.items
                  .filter((item) => selectedItemIds.includes(item.id))
                  .map((item) => (
                    <li key={`e-${item.id}`}>
                      <span aria-hidden="true">{item.icon}</span> {item.name}
                    </li>
                  ))}
              </ul>

              <p className="result__feedback">
                The items did not change. The task did.
              </p>
            </>
          ) : (
            <>
              <h3 className="game__panel-title">How your day went</h3>
              <ScorePanel result={result} />
              <p className="result__feedback">{FEEDBACK_TEXT[result.feedbackType]}</p>
            </>
          )}

          <p className="result__lesson">{level.lesson}</p>
          {level.hint && <p className="result__hint">{level.hint}</p>}

          <Button variant="primary" onClick={advance} disabled={!canAdvance}>
            {level.aiReveal
              ? isFinalLevel
                ? "See the final reveal"
                : "So what does this have to do with AI?"
              : "Next level"}
          </Button>
        </section>
      )}

      {phase === "reveal" && level.aiReveal && (
        <Modal
          open
          title={level.aiReveal.title}
          onClose={closeReveal}
          actionLabel={isFinalLevel ? "Finish" : "Continue"}
          onAction={closeReveal}
        >
          <ConceptReveal reveal={level.aiReveal} />
        </Modal>
      )}

      {phase === "complete" && (
        <section className="result" aria-label="Game complete">
          <h3 className="game__panel-title">That is the whole game</h3>
          <p>
            You packed for capacity, then for priority, then for noise, then for density, and
            finally for a day that changed halfway through.
          </p>
          <p className="result__lesson">
            Good context engineering is not about giving AI the most information. It is about
            giving it the right information for the task.
          </p>
          <Button variant="secondary" onClick={resetLevel}>
            Replay Level {level.id}
          </Button>
        </section>
      )}
    </div>
  );
}
