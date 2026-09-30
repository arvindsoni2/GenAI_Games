import type { PhaseResult } from "../game.types";

/**
 * Displays the three scores from spec section 12.
 *
 * Contains no calculation (spec section 30) and deliberately offers no overall
 * score: spec section 13 forbids collapsing these into one number because the
 * game is about trade-offs.
 */
export function ScorePanel({ result }: { result: PhaseResult }) {
  return (
    <dl className="scores">
      <div className="scores__item">
        <dt>Day readiness</dt>
        <dd>
          {result.dayReadiness}%
          <span className="scores__hint">
            {result.successfulEvents} of {result.totalEvents} events handled
          </span>
        </dd>
      </div>

      <div className="scores__item">
        <dt>Useful capacity</dt>
        <dd>
          {result.usefulCapacity}%
          <span className="scores__hint">of the space you used carried something useful</span>
        </dd>
      </div>

      <div className="scores__item">
        <dt>Space used</dt>
        <dd>
          {result.usedSpace} / {result.capacity}
          <span className="scores__hint">a full bag is not automatically a good bag</span>
        </dd>
      </div>
    </dl>
  );
}
