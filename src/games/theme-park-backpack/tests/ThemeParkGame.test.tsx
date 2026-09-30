import "@testing-library/jest-dom/vitest";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeParkGame } from "../ThemeParkGame";

/** Get past the intro card. */
async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /start packing/i }));
}

/**
 * Look up an item in the "Available items" list only.
 *
 * Scoping matters: once an item is packed it also appears in the backpack, and
 * that row is also a button. Querying globally would match both.
 */
function itemButton(name: RegExp) {
  const list = screen.getByRole("region", { name: /available items/i });
  return within(list).getByRole("button", { name: new RegExp(name.source, "i") });
}

beforeEach(() => {
  window.localStorage.clear();
});

/**
 * Without this, every render() in a previous test stays in the document and
 * role queries match duplicate elements across tests.
 */
afterEach(() => {
  cleanup();
});

describe("Level 1 vertical slice", () => {
  it("starts on the intro card and reveals the level after starting", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);

    expect(screen.getByRole("heading", { name: /theme park backpack/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /start the day/i })).toBeNull();

    await startGame(user);

    expect(screen.getByRole("heading", { name: /pack your day/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /start the day/i })).toBeTruthy();
  });

  it("disables the primary action while the backpack is empty", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    expect(screen.getByRole("button", { name: /start the day/i })).toHaveProperty("disabled", true);
  });

  it("selects and deselects an item, toggling aria-pressed", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    const water = itemButton(/water bottle/i);
    expect(water.getAttribute("aria-pressed")).toBe("false");

    await user.click(water);
    expect(water.getAttribute("aria-pressed")).toBe("true");
    // It now appears in the backpack list too (spec 10).
    const pack = screen.getByRole("region", { name: /your backpack/i });
    expect(within(pack).getByText("Water bottle")).toBeTruthy();

    await user.click(water);
    expect(water.getAttribute("aria-pressed")).toBe("false");
    expect(within(pack).queryByText("Water bottle")).toBeNull();
  });

  it("rejects an item that does not fit and explains why (AC-01)", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    // 35 (laptop) + 20 (water) + 20 (power bank) = 75. Sunglasses needs 10, total 85.
    await user.click(itemButton(/laptop/i));
    await user.click(itemButton(/water bottle/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/sunglasses/i)); // 85 fits
    await user.click(itemButton(/snacks/i)); // 85 + 15 = 100 fits exactly

    // Backpack is now exactly full at 100/100.
    expect(screen.getByText("100 / 100")).toBeTruthy();
    expect(screen.getByText(/backpack full/i)).toBeTruthy();

    // Rain jacket would need 20 more.
    await user.click(itemButton(/rain jacket/i));

    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/rain jacket won't fit/i);
    // The selection was rejected, not silently swapped.
    expect(itemButton(/rain jacket/i).getAttribute("aria-pressed")).toBe("false");
  });

  it("updates the capacity readout as items are added", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    expect(screen.getByText("0 / 100")).toBeTruthy();
    await user.click(itemButton(/water bottle/i));
    expect(screen.getByText("20 / 100")).toBeTruthy();
  });

  it("plays the day and shows consequences, scores, and the lesson", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    await user.click(itemButton(/water bottle/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/park map/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));

    // Consequences render, each with a text status not just colour.
    expect(screen.getByRole("heading", { name: /long afternoon queue/i })).toBeTruthy();
    expect(screen.getAllByText("Handled")).toHaveLength(3);
    expect(screen.queryByText("Not handled")).toBeNull();

    await user.click(screen.getByRole("button", { name: /see how the day went/i }));
    // The consequence cards stay on screen through the result, so the scores
    // never arrive without the evidence that explains them.

    // Three independent dimensions, no overall score (spec 13).
    expect(screen.getByText("Day readiness")).toBeTruthy();
    expect(screen.getByText("Useful capacity")).toBeTruthy();
    expect(screen.getByText("Space used")).toBeTruthy();
    // Both dimensions read 100% for a fully-useful pack, so expect a pair.
    expect(screen.getAllByText("100%")).toHaveLength(2);
    // "45 / 100" also appears in the capacity meter, which is still on screen.
    expect(screen.getAllByText("45 / 100").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/final score/i)).toBeNull();

    // The lesson is shown but no AI vocabulary yet (spec 14).
    expect(screen.getByText(/limited capacity/i)).toBeTruthy();
    expect(screen.queryByText(/context window/i)).toBeNull();
  });

  it("reports unhandled events honestly for a weak pack", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    await user.click(itemButton(/laptop/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));

    expect(screen.getAllByText("Not handled")).toHaveLength(3);
    // Readiness and useful capacity are both 0 for a laptop-only pack.
    expect(screen.getAllByText("0%")).toHaveLength(2);
    expect(screen.getByText(/never helped you/i)).toBeTruthy();
  });

  it("clears the backpack after finishing and offers a replay", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    await user.click(itemButton(/water bottle/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/park map/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));
    // Level 1 has no aiReveal, so advancing goes to Level 2.
    await user.click(screen.getByRole("button", { name: /next level/i }));

    expect(screen.getByRole("heading", { name: /smaller bag/i })).toBeTruthy();
    expect(screen.getByText("0 / 70")).toBeTruthy();
    expect(screen.getByText("Level 2 of 5")).toBeTruthy();
  });

  it("resets a half-packed level back to empty", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);

    await user.click(itemButton(/water bottle/i));
    await user.click(screen.getByRole("button", { name: /reset level/i }));

    expect(screen.getByText("0 / 100")).toBeTruthy();
    expect(itemButton(/water bottle/i).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("button", { name: /start the day/i })).toHaveProperty("disabled", true);
  });

  it("persists completed progress so a reload can skip ahead", async () => {
    const user = userEvent.setup();
    const first = render(<ThemeParkGame />);

    await startGame(user);
    await user.click(itemButton(/water bottle/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/park map/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));
    await user.click(screen.getByRole("button", { name: /next level/i }));

    first.unmount();

    const stored = JSON.parse(window.localStorage.getItem("ai-learning-games.theme-park-backpack.v1") ?? "{}");
    expect(stored.highestCompletedLevel).toBe(1);
  });

  it("still works when localStorage throws (spec 29)", async () => {
    const user = userEvent.setup();
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };

    try {
      render(<ThemeParkGame />);
      await startGame(user);
      await user.click(itemButton(/water bottle/i));
      expect(screen.getByText("20 / 100")).toBeTruthy();
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
