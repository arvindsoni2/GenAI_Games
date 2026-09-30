/** Central place for the game's identity, copy, and level registry. */

import { level1 } from "./levels/level1";
import { level2 } from "./levels/level2";
import { level3 } from "./levels/level3";
import { level4 } from "./levels/level4";
import { level5 } from "./levels/level5";
import type { DynamicLevel, Level } from "./game.types";

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
 * Ordered by `id` so the array index is never assumed to be the level number.
 * Level 5 is the only dynamic level; see `isDynamicLevel`.
 */
export const levels: Level[] = [level1, level2, level3, level4, level5];

export const TOTAL_LEVELS = levels.length;

/** Narrowing helper for the Level 5 two-phase flow. */
export function isDynamicLevel(level: Level): level is DynamicLevel {
  return "morningEvents" in level && "eveningEvents" in level;
}
