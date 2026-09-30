import type { FeedbackType, GameItem, GameEvent, PhaseResult, Usefulness } from "./game.types";

/**
 * Scoring and capacity rules.
 *
 * Kept free of React so it can be unit tested without rendering anything
 * (spec section 32). Every function here is pure.
 *
 * Two rules are load-bearing for the teaching goal:
 *
 *  1. `usefulCapacity` is measured in SPACE, not item count. A backpack holding
 *     one 35-size laptop and a 5-size map must not outrank one holding a
 *     20-size water bottle and a 5-size map.
 *  2. Nothing here rewards filling the backpack. `usedSpace` is reported but
 *     never folded into a success value (spec sections 12.3 and 13).
 */

/** Items at or above this usefulness count as "useful space" (spec 12.2). */
export const USEFUL_THRESHOLD = 2;

export function getItemUsefulness(item: GameItem, phaseId?: string): Usefulness {
  if (phaseId) {
    const override = item.usefulnessByPhase?.[phaseId];
    // `!== undefined` rather than a truthiness check, so an explicit 0 override
    // (a useful item that became noise for this task) is respected.
    if (override !== undefined) return override;
  }

  return item.usefulness;
}

/** Total space consumed by the selected items. Unknown ids are ignored. */
export function usedSpaceFor(items: GameItem[], selectedItemIds: string[]): number {
  const selected = new Set(selectedItemIds);

  return items.reduce((total, item) => (selected.has(item.id) ? total + item.size : total), 0);
}

export function canFitItem({
  used,
  capacity,
  size,
}: {
  used: number;
  capacity: number;
  size: number;
}): boolean {
  return used + size <= capacity;
}

/** An event passes when at least one of its satisfying items is in the pack. */
export function isEventSatisfied(event: GameEvent, selectedItemIds: string[]): boolean {
  const selected = new Set(selectedItemIds);

  return event.satisfyingItemIds.some((id) => selected.has(id));
}

function usefulSpaceFor(items: GameItem[], selectedItemIds: string[], phaseId?: string): number {
  const selected = new Set(selectedItemIds);

  return items.reduce((total, item) => {
    if (!selected.has(item.id)) return total;
    return getItemUsefulness(item, phaseId) >= USEFUL_THRESHOLD ? total + item.size : total;
  }, 0);
}

function percent(numerator: number, denominator: number, whenEmpty: number): number {
  if (denominator === 0) return whenEmpty;
  return Math.round((numerator / denominator) * 100);
}

/**
 * Classifies a pack into one of the five feedback tones from spec section 22.
 *
 * Order matters. An all-noise pack is reported as noise even though it also
 * satisfies the "you left useful things behind" condition, because "your bag
 * was full of things that never helped" is the more useful observation.
 */
function classifyFeedback({
  dayReadiness,
  usefulCapacity,
  usedSpace,
  items,
  selectedItemIds,
  phaseId,
}: {
  dayReadiness: number;
  usefulCapacity: number;
  usedSpace: number;
  items: GameItem[];
  selectedItemIds: string[];
  phaseId?: string;
}): FeedbackType {
  const selected = new Set(selectedItemIds);

  const packedLowValue = items.some(
    (item) => selected.has(item.id) && getItemUsefulness(item, phaseId) < USEFUL_THRESHOLD,
  );
  const leftUsefulBehind = items.some(
    (item) => !selected.has(item.id) && getItemUsefulness(item, phaseId) >= USEFUL_THRESHOLD,
  );

  // Nothing packed was worth a single point of space.
  if (usedSpace > 0 && usefulCapacity === 0) return "full-but-noisy";

  // Handled everything, and the space spent was mostly worthwhile.
  if (dayReadiness === 100 && usefulCapacity >= 75) return "excellent";

  // Handled everything, but a denser combination was available.
  if (dayReadiness === 100) return "efficient";

  // Low-value items took room that useful items would have used well.
  if (usefulCapacity < 50 && packedLowValue && leftUsefulBehind) return "missing-context";

  return "balanced";
}

export function calculatePhaseResult({
  items,
  selectedItemIds,
  events,
  capacity,
  phaseId,
}: {
  items: GameItem[];
  selectedItemIds: string[];
  events: GameEvent[];
  capacity: number;
  phaseId?: string;
}): PhaseResult {
  const successfulEvents = events.filter((event) => isEventSatisfied(event, selectedItemIds)).length;
  const totalEvents = events.length;

  const usedSpace = usedSpaceFor(items, selectedItemIds);
  const usefulSpace = usefulSpaceFor(items, selectedItemIds, phaseId);

  const dayReadiness = percent(successfulEvents, totalEvents, 100);
  // Nothing packed means no useful share, not a division by zero.
  const usefulCapacity = percent(usefulSpace, usedSpace, 0);

  return {
    successfulEvents,
    totalEvents,
    dayReadiness,
    usefulCapacity,
    usedSpace,
    capacity,
    feedbackType: classifyFeedback({
      dayReadiness,
      usefulCapacity,
      usedSpace,
      items,
      selectedItemIds,
      phaseId,
    }),
  };
}
