import type { GameItem } from "../game.types";

/**
 * The Level 5 interruption (spec 19).
 *
 * Shown while the player repacks, next to the frozen morning pack so the
 * before/after contrast is visible at the moment of the decision.
 */
export function PlanChange({
  message,
  morningItems,
}: {
  message: string;
  morningItems: GameItem[];
}) {
  return (
    <section className="plan-change" aria-label="Plan updated">
      <p className="plan-change__badge">⚠️ Plan updated</p>
      <p className="plan-change__message">{message}</p>

      <p className="plan-change__hint">
        You can change what you packed. Some of it is still worth keeping.
      </p>

      {morningItems.length > 0 && (
        <div className="plan-change__was">
          <h3 className="game__panel-title">This is what you brought</h3>
          <ul className="pack-summary">
            {morningItems.map((item) => (
              <li key={item.id}>
                <span aria-hidden="true">{item.icon}</span> {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
