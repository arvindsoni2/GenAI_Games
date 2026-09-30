import type { GameItem } from "../game.types";

/**
 * Current pack contents. Removing an item is always possible from here, which
 * is how the player recovers from a full backpack (spec section 29).
 */
export function Backpack({
  selectedItems,
  onRemove,
}: {
  selectedItems: GameItem[];
  onRemove: (itemId: string) => void;
}) {
  if (selectedItems.length === 0) {
    return (
      <div className="backpack backpack--empty">
        <p>Your backpack is empty. Choose something from your items.</p>
      </div>
    );
  }

  return (
    <ul className="backpack">
      {selectedItems.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="backpack__row"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name} from backpack, size ${item.size}`}
          >
            <span className="backpack__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="backpack__name">{item.name}</span>
            <span className="backpack__size">{item.size}</span>
            <span className="backpack__remove" aria-hidden="true">
              Remove
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
