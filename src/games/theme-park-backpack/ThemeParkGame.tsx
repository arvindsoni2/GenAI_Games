import { useCallback, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { gameConfig, levels, TOTAL_LEVELS } from "./game.config";
import type { GameItem, GamePhase, Level } from "./game.types";
import { calculatePhaseResult, canFitItem, usedSpaceFor } from "./scoring";
import { Backpack } from "./components/Backpack";
import { CapacityMeter } from "./components/CapacityMeter";
import { ConceptReveal } from "./components/ConceptReveal";
import { EventCard } from "./components/EventCard";
import { ItemCard } from "./components/ItemCard";
import { LevelProgress } from "./components/LevelProgress";
import { ScorePanel } from "./components/ScorePanel";
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

/**
 * Owns all game state (spec section 31): current level, selection, phase, and
 * result. Every child here is presentational.
 *
 * No Redux or Zustand for V1 - plain React state is sufficient.
 */
export function ThemeParkGame() {
  const { progress, completeLevel } = useGameProgress();

  const [levelIndex, setLevelIndex] = useState(0);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<GamePhase>("packing");
  const [message, setMessage] = useState<string | null>(null);
  const [introDismissed, setIntroDismissed] = useState(false);

  const level: Level = levels[levelIndex];
  const used = useMemo(() => usedSpaceFor(level.items, selectedItemIds), [level, selectedItemIds]);

  const result = useMemo(
    () =>
      calculatePhaseResult({
        items: level.items,
        selectedItemIds,
        events: level.events,
        capacity: level.capacity,
        phaseId: "main",
      }),
    [level, selectedItemIds],
  );

  const selectedItems: GameItem[] = useMemo(
    () => level.items.filter((item) => selectedItemIds.includes(item.id)),
    [level, selectedItemIds],
  );

  /** Tapping a packed item removes it, so a full bag is never a dead end. */
  const toggleItem = useCallback(
    (itemId: string) => {
      const item = level.items.find((candidate) => candidate.id === itemId);
      if (!item) return;

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
    [level],
  );

  const resetLevel = useCallback(() => {
    setSelectedItemIds([]);
    setMessage(null);
    setPhase("packing");
  }, []);

  const startDay = useCallback(() => {
    if (selectedItemIds.length === 0) return;
    setMessage(null);
    setPhase("events");
  }, [selectedItemIds.length]);

  const showResult = useCallback(() => {
    setPhase("result");
  }, []);

  const advance = useCallback(() => {
    completeLevel(level.id);

    if (level.aiReveal) {
      setPhase("reveal");
      return;
    }

    if (levelIndex + 1 < levels.length) {
      setLevelIndex((index) => index + 1);
      setSelectedItemIds([]);
      setPhase("packing");
      return;
    }

    setSelectedItemIds([]);
    setMessage(null);
    setPhase("complete");
  }, [completeLevel, level.aiReveal, level.id, levelIndex]);

  if (!introDismissed) {
    return (
      <div className="intro">
        <h2>{gameConfig.title}</h2>
        <p>{gameConfig.intro}</p>
        <p className="intro__note">
          Five short levels, about 5–8 minutes. You do not need any AI knowledge to start.
        </p>
        <Button variant="primary" onClick={() => setIntroDismissed(true)}>
          Start packing
        </Button>
      </div>
    );
  }

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
          {level.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ul>
      </section>

      <CapacityMeter capacity={level.capacity} used={used} />

      {/*
        Capacity rejections are announced, not just shown: a screen reader user
        cannot infer why a click did nothing (spec section 26).
      */}
      <p role="status" aria-live="polite" className="game__message">
        {message ?? ""}
      </p>

      <div className="game__columns">
        <section className="game__panel" aria-label="Available items">
          <h3 className="game__panel-title">Available items</h3>
          <ul className="item-list">
            {level.items.map((item) => (
              <li key={item.id}>
                <ItemCard
                  item={item}
                  selected={selectedItemIds.includes(item.id)}
                  onToggle={toggleItem}
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="game__panel" aria-label="Your backpack">
          <h3 className="game__panel-title">Your backpack</h3>
          <Backpack selectedItems={selectedItems} onRemove={toggleItem} />

          <div className="game__actions">
            {phase === "packing" && (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={selectedItemIds.length === 0}
                  onClick={startDay}
                >
                  Start the day
                </Button>
                <Button variant="ghost" onClick={resetLevel}>
                  Reset level
                </Button>
              </>
            )}

            {phase === "events" && (
              <Button variant="primary" fullWidth onClick={showResult}>
                See how the day went
              </Button>
            )}
          </div>
        </section>
      </div>

      {/*
        The consequences stay on screen through the result. Hiding them the
        moment the player asks "how did the day go" would make the scores
        arrive without the evidence that explains them (spec 22).
      */}
      {(phase === "events" || phase === "result") && (
        <section className="events" aria-label="What happened during the day">
          <h3 className="game__panel-title">The day</h3>
          <ul className="event-list">
            {level.events.map((event) => {
              const success = event.satisfyingItemIds.some((id) => selectedItemIds.includes(id));
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  success={success}
                  index={level.events.indexOf(event)}
                />
              );
            })}
          </ul>
        </section>
      )}

      {phase === "result" && (
        <section className="result" aria-label="Level result">
          <h3 className="game__panel-title">How your day went</h3>

          <ScorePanel result={result} />

          <p className="result__feedback">{FEEDBACK_TEXT[result.feedbackType]}</p>

          <p className="result__lesson">{level.lesson}</p>

          <Button variant="primary" onClick={advance}>
            {level.aiReveal
              ? "So what does this have to do with AI?"
              : levelIndex + 1 < levels.length
                ? "Next level"
                : "Finish"}
          </Button>
        </section>
      )}

      {phase === "reveal" && level.aiReveal && (
        <Modal
          open
          title={level.aiReveal.title}
          onClose={advance}
          actionLabel="Continue"
          onAction={advance}
        >
          <ConceptReveal reveal={level.aiReveal} />
        </Modal>
      )}

      {phase === "complete" && (
        <section className="result" aria-label="Game complete">
          <h3 className="game__panel-title">That is the whole game</h3>
          <p>
            You have played all {levels.length} of the {TOTAL_LEVELS} levels available so far.
            More are on the way.
          </p>
          <Button variant="secondary" onClick={resetLevel}>
            Replay Level {level.id}
          </Button>
        </section>
      )}
    </div>
  );
}
