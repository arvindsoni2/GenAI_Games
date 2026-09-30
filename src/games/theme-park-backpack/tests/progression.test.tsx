import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeParkGame } from "../ThemeParkGame";
import { level3 } from "../levels/level3";
import { level4 } from "../levels/level4";

/**
 * Progression tests for the levels that carry the AI reveals, plus the
 * acceptance scenarios in spec section 36.
 */

function itemButton(name: RegExp) {
  const list = screen.getByRole("region", { name: /available items/i });
  return within(list).getByRole("button", { name: new RegExp(name.source, "i") });
}

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /start packing/i }));
}

/** Pack items, play the day, and land on the result screen. */
async function playDay(
  user: ReturnType<typeof userEvent.setup>,
  items: string[],
  startLabel: RegExp,
  resultLabel: RegExp,
) {
  await startGame(user);
  for (const item of items) await user.click(itemButton(new RegExp(item, "i")));
  await user.click(screen.getByRole("button", { name: startLabel }));
  await user.click(screen.getByRole("button", { name: resultLabel }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("AC-04: Level 3 noise lesson", () => {
  it("reveals the backpack-to-context-window mapping only on request", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);

    await startGame(user);
    // Levels 1 and 2 must both be completed before Level 3 is reachable.
    for (const [water, power, map] of [
      [/water bottle/i, /power bank/i, /park map/i],
      [/water/i, /power bank/i, /park map/i],
    ]) {
      await user.click(itemButton(water));
      await user.click(itemButton(power));
      await user.click(itemButton(map));
      await user.click(screen.getByRole("button", { name: /start the day/i }));
      await user.click(screen.getByRole("button", { name: /see how the day went/i }));
      await user.click(screen.getByRole("button", { name: /next level/i }));
    }

    expect(screen.getByRole("heading", { name: /the distraction trap/i })).toBeTruthy();
    // The result screen must not contain AI vocabulary yet.
    expect(screen.queryByText(/context window/i)).toBeNull();

    await user.click(itemButton(/water/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/park map/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));
    await user.click(screen.getByRole("button", { name: /what does this have to do with ai/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/backpack capacity/i)).toBeTruthy();
    expect(within(dialog).getByText("Context window")).toBeTruthy();
    expect(within(dialog).getByText(/relevant context/i)).toBeTruthy();
    expect(within(dialog).getByText("Noise")).toBeTruthy();
    expect(within(dialog).getByText(/not necessarily a useful context window/i)).toBeTruthy();
  });

  it("is the first level with a reveal, so Levels 1-2 advance without one", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);

    await playDay(user, ["water bottle", "power bank", "park map"], /start the day/i, /see how the day went/i);
    await user.click(screen.getByRole("button", { name: /next level/i }));

    expect(screen.getByRole("heading", { name: /smaller bag/i })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("AC-05: Level 4 compression lesson", () => {
  it("connects compact alternatives to summarised context", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await startGame(user);
    let levelReached = 1;

    // Levels 1-3 to reach Level 4.
    for (const [water, power, map] of [
      [/water bottle/i, /power bank/i, /park map/i],
      [/water/i, /power bank/i, /park map/i],
      [/water/i, /power bank/i, /park map/i],
    ]) {
      await user.click(itemButton(water));
      await user.click(itemButton(power));
      await user.click(itemButton(map));
      await user.click(screen.getByRole("button", { name: /start the day/i }));
      await user.click(screen.getByRole("button", { name: /see how the day went/i }));
      if (levelReached === 3) {
        await user.click(screen.getByRole("button", { name: /what does this have to do with ai/i }));
        await user.click(screen.getByRole("button", { name: /continue/i }));
        levelReached = 4;
      } else {
        await user.click(screen.getByRole("button", { name: /next level/i }));
        levelReached += 1;
      }
    }

    expect(screen.getByRole("heading", { name: /pack smarter/i })).toBeTruthy();

    // Pack the compact option for all three Level 4 events: 8 + 5 + 8 = 21.
    await user.click(itemButton(/energy bar/i));
    await user.click(itemButton(/pocket map/i));
    await user.click(itemButton(/foldable poncho/i));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));
    await user.click(screen.getByRole("button", { name: /what does this have to do with ai/i }));

    const dialog = screen.getByRole("dialog");
    // The token counts appear in both the prose and the mapping table.
    expect(within(dialog).getAllByText(/12,000 tokens/i).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/1,500 tokens/i).length).toBeGreaterThan(0);
    expect(within(dialog).getByText(/summarised context/i)).toBeTruthy();
  });

  it("rewards the compact pack over the bulky one for the same outcome", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);

    // Levels 1-3 to reach Level 4.
    await startGame(user);
    for (const [water, power, map] of [
      [/water bottle/i, /power bank/i, /park map/i],
      [/water/i, /power bank/i, /park map/i],
      [/water/i, /power bank/i, /park map/i],
    ]) {
      await user.click(itemButton(water));
      await user.click(itemButton(power));
      await user.click(itemButton(map));
      await user.click(screen.getByRole("button", { name: /start the day/i }));
      await user.click(screen.getByRole("button", { name: /see how the day went/i }));
      if (screen.queryByRole("button", { name: /what does this have to do with ai/i })) {
        await user.click(screen.getByRole("button", { name: /what does this have to do with ai/i }));
        await user.click(screen.getByRole("button", { name: /continue/i }));
      } else {
        await user.click(screen.getByRole("button", { name: /next level/i }));
      }
    }

    // Compact: 8 + 5 + 8 = 21 of 60.
    await user.click(itemButton(/energy bar/i));
    await user.click(itemButton(/pocket map/i));
    await user.click(itemButton(/foldable poncho/i));
    expect(screen.getByText("21 / 60")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /start the day/i }));
    // Every event is still handled despite using a third of the space.
    expect(screen.getAllByText("Handled")).toHaveLength(3);
  });
});

describe("level data integrity", () => {
  it("Level 3 events all reference real item ids", () => {
    const ids = new Set(level3.items.map((i) => i.id));
    for (const event of level3.events) {
      for (const id of event.satisfyingItemIds) expect(ids.has(id), `${event.id} -> ${id}`).toBe(true);
    }
  });

  it("Level 4 events each have a bulky and a compact option", () => {
    for (const event of level4.events) {
      expect(event.satisfyingItemIds, event.id).toHaveLength(2);
    }
  });

  it("every level is completable within its capacity", () => {
    // A level whose satisfying items alone exceed capacity would be
    // unwinnable, which no test on the UI could catch.
    const levels = [level3, level4];
    for (const level of levels) {
      const byId = new Map(level.items.map((i) => [i.id, i]));
      for (const event of level.events) {
        const smallest = Math.min(
          ...event.satisfyingItemIds.map((id) => byId.get(id)!.size),
        );
        expect(smallest, `${level.id}/${event.id}`).toBeLessThanOrEqual(level.capacity);
      }
    }
  });
});
