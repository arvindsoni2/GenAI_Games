/** Central place for the game's identity, copy, and level registry. */

import { level1 } from "./levels/level1";
import type { Level } from "./game.types";

export const gameConfig = {
  id: "theme-park-backpack",
  title: "Theme Park Backpack",
  /** In-fiction park name. Deliberately not "Context Park" (decisions note 1). */
  parkName: "Adventure Park",
  storageKey: "ai-learning-games.theme-park-backpack.v1",
  intro:
    "You have one backpack and a whole day ahead. You cannot fit everything. Let's find out what to bring.",
} as const;

/** Progress labels from spec section 21. */
export const levelLabels = [
  "Capacity",
  "Priorities",
  "Noise",
  "Compression",
  "Changing Context",
] as const;

/**
 * Only Level 1 exists so far. The decisions note blocks Levels 2-5 until the
 * Level 1 vertical slice has validated the component and state boundaries, so
 * this array is intentionally length 1 and the UI must handle a partial list.
 */
export const levels: Level[] = [level1];

export const TOTAL_LEVELS = 5;
