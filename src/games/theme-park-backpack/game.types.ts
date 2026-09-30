/**
 * Core data model for Theme Park Backpack.
 *
 * Authority order (per docs/decisions/pre-implementation-decisions.md):
 * this file's shape follows the decisions note where it overrides
 * docs/specs/theme-park-backpack-v1.0.md.
 */

/**
 * How much an item is worth in a given phase. 0 = pure noise.
 * Levels 1-4 use the static `GameItem.usefulness`. Level 5 overrides
 * per phase via `GameItem.usefulnessByPhase` because the task changes
 * mid-level and relevance must change with it.
 */
export type Usefulness = 0 | 1 | 2 | 3;

export type GameItem = {
  id: string;
  name: string;
  icon: string;
  size: number;

  /** Baseline usefulness, used when no phase override applies. */
  usefulness: Usefulness;

  /** Phase-scoped usefulness, e.g. `{ morning: 3, evening: 0 }`. */
  usefulnessByPhase?: Partial<Record<string, Usefulness>>;

  categories?: string[];
};

export type GameEvent = {
  id: string;
  title: string;
  icon: string;

  /**
   * The event is satisfied when ANY of these item ids is in the pack.
   * An event is failed only when none of them are present.
   */
  satisfyingItemIds: string[];

  successText: string;
  failureText: string;
};

export type AIReveal = {
  title: string;
  description: string;
  mappings?: {
    metaphor: string;
    aiConcept: string;
  }[];
};

export type Level = {
  id: number;
  title: string;
  description: string;

  capacity: number;

  conditions: string[];

  items: GameItem[];
  events: GameEvent[];

  lesson: string;

  aiReveal?: AIReveal;
};

/** Level 5 only: a level whose plan changes between two phases. */
export type DynamicLevel = Level & {
  initialConditions: string[];
  changedConditions: string[];

  morningEvents: GameEvent[];
  eveningEvents: GameEvent[];

  changeMessage: string;
};

/**
 * Generic phase set. AI reveals are a phase driven by level data, not
 * separately named states.
 */
export type GamePhase =
  | "packing"
  | "events"
  | "result"
  | "reveal"
  | "repacking"
  | "complete";

export type FeedbackType =
  | "excellent"
  | "efficient"
  | "full-but-noisy"
  | "missing-context"
  | "balanced";

export type PhaseResult = {
  successfulEvents: number;
  totalEvents: number;

  dayReadiness: number;
  usefulCapacity: number;

  usedSpace: number;
  capacity: number;

  feedbackType: FeedbackType;
};

/** Level 5 aggregate: two independent phase results, never recomputed. */
export type DynamicLevelResult = {
  morning: PhaseResult;
  evening: PhaseResult;
};

export type GameProgress = {
  highestCompletedLevel: number;
  gameCompleted: boolean;
};
