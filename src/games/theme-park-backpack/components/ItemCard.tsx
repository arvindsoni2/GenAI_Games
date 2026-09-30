import type { GameItem } from "../game.types";

type ItemCardProps = {
  item: GameItem;
  selected: boolean;
  onToggle: (itemId: string) => void;
};

/**
 * An available item.
 *
 * Implements no capacity logic (spec section 30): it does not know whether the
 * item fits, only whether it is currently in the pack. Rejection messaging is
 * the parent's job, so this stays a pure `<button>` with `aria-pressed`.
 */
export function ItemCard({ item, selected, onToggle }: ItemCardProps) {
  return (
    <button
      type="button"
      className={`item${selected ? " item--selected" : ""}`}
      aria-pressed={selected}
      onClick={() => onToggle(item.id)}
    >
      <span className="item__icon" aria-hidden="true">
        {item.icon}
      </span>
      <span className="item__body">
        {/* Icon is decorative; the name carries the meaning (spec 26). */}
        <span className="item__name">{item.name}</span>
        <span className="item__size">Size {item.size}</span>
      </span>
      <span className="item__state">
        {selected ? (
          <>
            <span aria-hidden="true">✓</span> In backpack
          </>
        ) : (
          "Add"
        )}
      </span>
    </button>
  );
}
