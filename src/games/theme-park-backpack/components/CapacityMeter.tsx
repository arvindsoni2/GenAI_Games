/**
 * Capacity readout plus meter.
 *
 * Shows the raw "used / capacity" pair as text first. The bar is decoration on
 * top of that text, so the number is never communicated by width alone
 * (spec section 26).
 */
export function CapacityMeter({
  capacity,
  used,
}: {
  capacity: number;
  used: number;
}) {
  const free = capacity - used;
  const percent = capacity === 0 ? 0 : Math.min(100, Math.round((used / capacity) * 100));
  const isFull = free === 0;

  return (
    <div className="capacity">
      <div className="capacity__row">
        <span className="capacity__label">Backpack capacity</span>
        <span className="capacity__value">
          {used} / {capacity}
        </span>
      </div>

      <div
        className="capacity__track"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-label={`Backpack space used: ${used} of ${capacity}`}
      >
        <div
          className={`capacity__fill${isFull ? " capacity__fill--full" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="capacity__free">
        {isFull ? "Backpack full." : `Free: ${free}`}
      </p>
    </div>
  );
}
