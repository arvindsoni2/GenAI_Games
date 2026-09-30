import type { GameEvent } from "../game.types";

/**
 * One consequence from the day. Shows the outcome text for the pack that was
 * chosen; it does not decide the outcome (spec section 30).
 */
export function EventCard({
  event,
  success,
  index,
}: {
  event: GameEvent;
  success: boolean;
  index: number;
}) {
  return (
    <li className={`event${success ? " event--success" : " event--failure"}`}>
      <div className="event__head">
        <span className="event__icon" aria-hidden="true">
          {event.icon}
        </span>
        <h4 className="event__title">{event.title}</h4>
      </div>

      {/* Status is text, not just a colour (spec 26). */}
      <p className="event__status">{success ? "Handled" : "Not handled"}</p>
      <p className="event__text">{success ? event.successText : event.failureText}</p>

      {/* Staggered reveal, disabled under reduced motion. */}
      <span className="event__index" aria-hidden="true">
        {index + 1}
      </span>
    </li>
  );
}
