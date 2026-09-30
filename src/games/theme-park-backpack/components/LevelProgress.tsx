import { levelLabels } from "../game.config";

/**
 * Five-dot progress indicator (spec section 21).
 *
 * `implementedCount` is how many levels actually exist today. Only Level 1
 * does, so this must render a partially complete ladder without implying the
 * player has failed anything.
 */
export function LevelProgress({
  currentLevel,
  highestCompleted,
  implementedCount,
}: {
  currentLevel: number;
  highestCompleted: number;
  implementedCount: number;
}) {
  const total = levelLabels.length;

  return (
    <nav className="progress" aria-label="Level progress">
      <p className="progress__count">
        Level {currentLevel} of {total}
      </p>

      <ol className="progress__dots">
        {levelLabels.map((label, index) => {
          const levelNumber = index + 1;
          const state =
            levelNumber <= highestCompleted
              ? "complete"
              : levelNumber === currentLevel
                ? "current"
                : "locked";

          return (
            <li key={label} className={`progress__step progress__step--${state}`}>
              <span className="progress__dot" aria-hidden="true" />
              <span className="progress__label">
                <span className="progress__num">{levelNumber}</span> {label}
              </span>
              <span className="visually-hidden">
                {state === "complete"
                  ? "completed"
                  : state === "current"
                    ? "current level"
                    : levelNumber <= implementedCount
                      ? "not yet played"
                      : "coming soon"}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
