/**
 * Progress persistence (spec section 27).
 *
 * localStorage only, and only whole-level progress: a half-packed backpack is
 * never persisted, so a refresh mid-level restarts that level by design.
 *
 * If localStorage is unavailable (private mode, blocked cookies) the game must
 * still work, so every access is guarded and failures fall back to in-memory
 * state.
 */

import { useCallback, useState } from "react";
import { gameConfig } from "../games/theme-park-backpack/game.config";
import type { GameProgress } from "../games/theme-park-backpack/game.types";

const EMPTY: GameProgress = {
  highestCompletedLevel: 0,
  gameCompleted: false,
};

function readProgress(): GameProgress {
  try {
    const raw = window.localStorage.getItem(gameConfig.storageKey);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;

    const candidate = parsed as Partial<GameProgress>;

    return {
      highestCompletedLevel:
        typeof candidate.highestCompletedLevel === "number" &&
        candidate.highestCompletedLevel >= 0
          ? candidate.highestCompletedLevel
          : 0,
      gameCompleted: candidate.gameCompleted === true,
    };
  } catch {
    return EMPTY;
  }
}

function writeProgress(progress: GameProgress): void {
  try {
    window.localStorage.setItem(gameConfig.storageKey, JSON.stringify(progress));
  } catch {
    // Persistence is best-effort; the game keeps running without it.
  }
}

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(readProgress);

  const completeLevel = useCallback((levelId: number) => {
    setProgress((current) => {
      const next: GameProgress = {
        highestCompletedLevel: Math.max(current.highestCompletedLevel, levelId),
        gameCompleted: current.gameCompleted,
      };
      writeProgress(next);
      return next;
    });
  }, []);

  const markGameCompleted = useCallback(() => {
    setProgress((current) => {
      const next: GameProgress = { ...current, gameCompleted: true };
      writeProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(EMPTY);
    writeProgress(EMPTY);
  }, []);

  return { progress, completeLevel, markGameCompleted, resetProgress };
}
