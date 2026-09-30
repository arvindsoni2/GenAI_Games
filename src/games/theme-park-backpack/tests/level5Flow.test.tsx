import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeParkGame } from "../ThemeParkGame";

/**
 * AC-06 / AC-07: the Level 5 plan-change and repack flow.
 *
 * The teaching claim is that relevance changed because the task changed, so
 * these tests assert that the morning pack is frozen and that the evening score
 * is computed from a genuinely different pack.
 */

function itemButton(name: RegExp) {
  const list = screen.getByRole("region", { name: /available items/i });
  return within(list).getByRole("button", { name: new RegExp(name.source, "i") });
}

async function startGame(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /start packing/i }));
}

/** Play Levels 1-4 straight through to reach Level 5. */
async function reachLevel5(user: ReturnType<typeof userEvent.setup>) {
  await startGame(user);

  // The three item sets that clear a level, one per level's own vocabulary.
  const packs = [
    [/water bottle/i, /power bank/i, /park map/i], // L1 capacity 100
    [/water/i, /power bank/i, /park map/i], // L2 capacity 70
    [/water/i, /power bank/i, /park map/i], // L3 capacity 70
    // L4 has no "Water"; the level's own items are the picnic/guide/coat pairs.
    [/energy bar/i, /power bank/i, /pocket map/i], // L4 capacity 60
  ];

  for (const pack of packs) {
    await user.click(itemButton(pack[0]));
    await user.click(itemButton(pack[1]));
    await user.click(itemButton(pack[2]));
    await user.click(screen.getByRole("button", { name: /start the day/i }));
    await user.click(screen.getByRole("button", { name: /see how the day went/i }));

    if (screen.queryByRole("button", { name: /what does this have to do with ai/i })) {
      await user.click(screen.getByRole("button", { name: /what does this have to do with ai/i }));
      await user.click(screen.getByRole("button", { name: /continue/i }));
    } else {
      await user.click(screen.getByRole("button", { name: /next level/i }));
    }
  }

  expect(screen.getByRole("heading", { name: /when the plan changes/i })).toBeTruthy();
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("AC-06: the plan changes mid-level", () => {
  it("shows the original conditions before the change", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    expect(screen.getByText("☀️ Sunny morning")).toBeTruthy();
    expect(screen.getByText("🕔 Leaving at 5 PM")).toBeTruthy();
    expect(screen.queryByText(/plan updated/i)).toBeNull();
  });

  it("interrupts the morning with the change and forces a repack", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    // A sensible sunny-morning pack: water, snack, sunglasses.
    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));

    expect(screen.getByRole("heading", { name: /morning in the sun/i })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    // The plan-change banner replaces the conditions.
    expect(screen.getByText(/plan updated/i)).toBeTruthy();
    // The rain text appears in both the condition chip and the banner copy.
    expect(screen.getAllByText(/heavy rain expected after 6 pm/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/9 pm fireworks/i).length).toBeGreaterThan(0);
    // The morning pack is still listed for comparison.
    expect(screen.getByText(/this is what you brought/i)).toBeTruthy();
  });

  it("empties the active pack for the evening so the player must choose again", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    // Sunglasses are deselected: the evening pack starts empty.
    expect(itemButton(/sunglasses/i).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("0 / 60")).toBeTruthy();
    expect(screen.getByRole("button", { name: /continue to evening/i })).toBeTruthy();
  });
});

describe("AC-07: relevance is task-dependent", () => {
  it("shows morning and evening results side by side, not one combined score", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    // Evening pack: swap the sunglasses for the poncho the rain will need.
    await user.click(itemButton(/foldable poncho/i));
    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(screen.getByRole("button", { name: /continue to evening/i }));
    await user.click(screen.getByRole("button", { name: /see how the evening went/i }));

    // Both phases are presented separately. The result is one section, so the
    // two blocks are separated by the arrow rather than by nested markup.
    const result = screen.getByRole("region", { name: /level result/i });
    const before = within(result).getByRole("heading", { name: /before the plan changed/i });
    const after = within(result).getByRole("heading", { name: /after the plan changed/i });
    expect(before).toBeTruthy();
    expect(after).toBeTruthy();
    expect(within(result).getByText(/the items did not change\. the task did\./i)).toBeTruthy();

    // Each block is: heading, ScorePanel, then the pack contents list. The
    // list is the second sibling, since ScorePanel sits in between.
    const morningList = before.nextElementSibling?.nextElementSibling as HTMLElement;
    expect(within(morningList).getByText(/sunglasses/i)).toBeTruthy();
    // The evening pack does not include them.
    const eveningList = after.nextElementSibling?.nextElementSibling as HTMLElement;
    expect(within(eveningList).queryByText(/sunglasses/i)).toBeNull();
    expect(within(eveningList).getByText(/foldable poncho/i)).toBeTruthy();
  });

  it("does not re-score the morning using the repacked evening bag", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    // Morning: 20 water + 10 snack + 10 sunglasses = 40 of 60, all useful.
    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    // Evening: a completely different pack, 28 of 60.
    await user.click(itemButton(/foldable poncho/i));
    await user.click(itemButton(/power bank/i));
    await user.click(screen.getByRole("button", { name: /continue to evening/i }));
    await user.click(screen.getByRole("button", { name: /see how the evening went/i }));

    // The morning block must still report 40 / 60, not the evening's 28.
    const before = screen.getByRole("heading", { name: /before the plan changed/i }).closest("section")!;
    expect(within(before).getByText("40 / 60")).toBeTruthy();
    const after = screen.getByRole("heading", { name: /after the plan changed/i }).closest("section")!;
    expect(within(after).getByText("28 / 60")).toBeTruthy();
  });

  it("penalises a player who ignores the change", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    // Bring exactly the same things, ignoring the rain.
    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/sunglasses/i));
    await user.click(screen.getByRole("button", { name: /continue to evening/i }));
    await user.click(screen.getByRole("button", { name: /see how the evening went/i }));

    // Only the extended-day event is handled: no poncho, no power bank.
    expect(screen.getAllByText("Not handled").length).toBeGreaterThan(0);
    const after = screen.getByRole("heading", { name: /after the plan changed/i }).closest("section")!;
    expect(within(after).getByText("33%")).toBeTruthy();
    // The sunglasses are still 10 of the 40 spaces used, but now worthless:
    // only water and snack count, so 30/40.
    expect(within(after).getByText("75%")).toBeTruthy();
  });

  it("ends on the final task-dependent reveal", async () => {
    const user = userEvent.setup();
    render(<ThemeParkGame />);
    await reachLevel5(user);

    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(itemButton(/foldable poncho/i));
    await user.click(itemButton(/power bank/i));
    await user.click(screen.getByRole("button", { name: /start the morning/i }));
    await user.click(screen.getByRole("button", { name: /^continue$/i }));
    await user.click(itemButton(/foldable poncho/i));
    await user.click(itemButton(/power bank/i));
    await user.click(itemButton(/water/i));
    await user.click(itemButton(/snack/i));
    await user.click(screen.getByRole("button", { name: /continue to evening/i }));
    await user.click(screen.getByRole("button", { name: /see how the evening went/i }));
    await user.click(screen.getByRole("button", { name: /see the final reveal/i }));

    const dialog = screen.getByRole("dialog");
    // The title is used both as the dialog label and as the reveal heading.
    expect(within(dialog).getAllByText(/weren't really learning how to pack a backpack/i).length)
      .toBeGreaterThan(0);
    expect(within(dialog).getByText("Task-dependent context")).toBeTruthy();
    expect(within(dialog).getByText("Context engineering")).toBeTruthy();
    expect(within(dialog).getByText(/relevance is task-dependent/i)).toBeTruthy();

    await user.click(within(dialog).getByRole("button", { name: /finish/i }));
    expect(screen.getByRole("heading", { name: /that is the whole game/i })).toBeTruthy();
  });
});
