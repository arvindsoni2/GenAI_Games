import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end smoke test for the critical path (spec 33):
 *
 *   Open game -> Level 1 -> results -> Levels 2-3 -> first AI reveal
 *   -> Level 4 -> Level 5 change/repack -> final concept reveal
 *
 * Runs on both a desktop and a mobile viewport, which is where layout bugs
 * actually surface.
 */

const GAME_URL = "/games/theme-park-backpack";

async function startGame(page: Page) {
  await page.goto(GAME_URL);
  await page.getByRole("button", { name: /start packing/i }).click();
}

/** Click an item in the "Available items" list. */
async function pick(page: Page, name: RegExp) {
  await page.getByRole("region", { name: /available items/i }).getByRole("button", { name }).first().click();
}

/** Click a backpack row to remove that item. */
async function drop(page: Page, name: RegExp) {
  await page.getByRole("region", { name: /your backpack/i }).getByRole("button", { name }).first().click();
}

/** Advance past a result, taking the reveal when one is offered. */
async function advanceFromResult(page: Page) {
  const reveal = page.getByRole("button", { name: /what does this have to do with ai/i });
  if (await reveal.isVisible().catch(() => false)) {
    await reveal.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: /continue|finish/i }).click();
    await expect(dialog).toBeHidden();
    return "reveal" as const;
  }
  await page.getByRole("button", { name: /next level/i }).click();
  return "next" as const;
}

test.describe("Theme Park Backpack", () => {
  test("plays the whole game from intro to final reveal", async ({ page }) => {
    await startGame(page);

    // Level 1: capacity.
    await expect(page.getByText("Level 1 of 5")).toBeVisible();
    await pick(page, /water bottle/i);
    await pick(page, /power bank/i);
    await pick(page, /park map/i);
    await expect(page.getByText("45 / 100")).toBeVisible();
    await page.getByRole("button", { name: /start the day/i }).click();
    await expect(page.getByText("Handled").first()).toBeVisible();
    await page.getByRole("button", { name: /see how the day went/i }).click();
    await expect(page.getByText("Day readiness")).toBeVisible();
    // No combined score anywhere (spec 13).
    await expect(page.getByText(/final score/i)).toHaveCount(0);
    // Level 1 must not mention AI yet (spec 14).
    await expect(page.getByText(/context window/i)).toHaveCount(0);
    await advanceFromResult(page);

    // Level 2: priorities, smaller bag.
    await expect(page.getByText("Level 2 of 5")).toBeVisible();
    await expect(page.getByText("0 / 70")).toBeVisible();
    await pick(page, /water/i);
    await pick(page, /power bank/i);
    await pick(page, /park map/i);
    await page.getByRole("button", { name: /start the day/i }).click();
    await page.getByRole("button", { name: /see how the day went/i }).click();
    await advanceFromResult(page);

    // Level 3: noise, first AI reveal.
    await expect(page.getByText("Level 3 of 5")).toBeVisible();
    await pick(page, /water/i);
    await pick(page, /power bank/i);
    await pick(page, /park map/i);
    await page.getByRole("button", { name: /start the day/i }).click();
    await page.getByRole("button", { name: /see how the day went/i }).click();
    expect(await advanceFromResult(page)).toBe("reveal");

    // Level 4: compression.
    await expect(page.getByText("Level 4 of 5")).toBeVisible();
    await pick(page, /energy bar/i);
    await pick(page, /pocket map/i);
    await pick(page, /foldable poncho/i);
    await expect(page.getByText("21 / 60")).toBeVisible();
    await page.getByRole("button", { name: /start the day/i }).click();
    await expect(page.getByText("Handled")).toHaveCount(3);
    await page.getByRole("button", { name: /see how the day went/i }).click();
    expect(await advanceFromResult(page)).toBe("reveal");

    // Level 5: the plan changes.
    await expect(page.getByText("Level 5 of 5")).toBeVisible();
    await expect(page.getByText("☀️ Sunny morning")).toBeVisible();
    await pick(page, /water/i);
    await pick(page, /snack/i);
    await pick(page, /sunglasses/i);
    await page.getByRole("button", { name: /start the morning/i }).click();
    await expect(page.getByText(/morning in the sun/i)).toBeVisible();

    // The interruption.
    await page.getByRole("button", { name: /^continue$/i }).click();
    await expect(page.getByText(/plan updated/i)).toBeVisible();
    await expect(page.getByText(/heavy rain expected/i).first()).toBeVisible();
    // The pack is emptied for the evening decision.
    await expect(page.getByText("0 / 60")).toBeVisible();

    // Repack: drop the sunglasses, add the poncho.
    await pick(page, /foldable poncho/i);
    await pick(page, /water/i);
    await pick(page, /snack/i);
    await page.getByRole("button", { name: /continue to evening/i }).click();
    await expect(page.getByText(/heavy rain/i).first()).toBeVisible();
    await page.getByRole("button", { name: /see how the evening went/i }).click();

    // Both phases shown separately, never one combined number.
    await expect(page.getByText(/before the plan changed/i)).toBeVisible();
    await expect(page.getByText(/after the plan changed/i)).toBeVisible();
    await expect(page.getByText(/the items did not change\. the task did\./i)).toBeVisible();

    // Final reveal.
    await page.getByRole("button", { name: /see the final reveal/i }).click();
    const finalDialog = page.getByRole("dialog");
    await expect(finalDialog).toBeVisible();
    await expect(finalDialog.getByText("Task-dependent context")).toBeVisible();
    await expect(finalDialog.getByText("Context engineering")).toBeVisible();
    await finalDialog.getByRole("button", { name: /finish/i }).click();

    await expect(page.getByText(/that is the whole game/i)).toBeVisible();
  });

  test("enforces capacity and explains the rejection (AC-01)", async ({ page }) => {
    await startGame(page);

    // Fill the bag exactly to 100.
    await pick(page, /laptop/i); // 35
    await pick(page, /water bottle/i); // 20
    await pick(page, /power bank/i); // 20
    await pick(page, /sunglasses/i); // 10
    await pick(page, /snacks/i); // 15
    await expect(page.getByText("100 / 100")).toBeVisible();
    await expect(page.getByText(/backpack full/i)).toBeVisible();

    // One more item is rejected with a message, not silently swapped.
    await pick(page, /rain jacket/i);
    await expect(page.getByText(/rain jacket won't fit/i)).toBeVisible();
    await expect(page.getByText("100 / 100")).toBeVisible();
  });

  test("does not reward a full bag of noise (AC-02)", async ({ page }) => {
    await startGame(page);

    await pick(page, /laptop/i); // 35, usefulness 0
    await pick(page, /spare t-shirt/i); // 15, usefulness 1
    await pick(page, /rain jacket/i); // 20, usefulness 1
    await page.getByRole("button", { name: /start the day/i }).click();
    await expect(page.getByText("Not handled").first()).toBeVisible();
    await page.getByRole("button", { name: /see how the day went/i }).click();

    await expect(page.getByText(/never helped you/i)).toBeVisible();
    // Useful capacity is 0 despite a mostly-full bag.
    await expect(page.getByText("0%").first()).toBeVisible();
  });

  test("keeps progress across a reload (spec 27)", async ({ page }) => {
    await startGame(page);
    await pick(page, /water bottle/i);
    await page.getByRole("button", { name: /start the day/i }).click();
    await page.getByRole("button", { name: /see how the day went/i }).click();
    await advanceFromResult(page);

    await page.reload();

    // Progress survived the reload: the intro offers to resume where the
    // player left off rather than pretending nothing was completed.
    const resume = page.getByRole("button", { name: /continue from level 2/i });
    await expect(resume).toBeVisible();
    await resume.click();
    await expect(page.getByText("Level 2 of 5")).toBeVisible();
    await expect(page.getByRole("heading", { name: /smaller bag/i })).toBeVisible();
  });

  test("is fully keyboard operable (spec 26)", async ({ page }) => {
    await startGame(page);

    // Tab to the first item and activate it with the keyboard alone.
    const firstItem = page.getByRole("region", { name: /available items/i }).getByRole("button").first();
    await firstItem.focus();
    await expect(firstItem).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(firstItem).toHaveAttribute("aria-pressed", "true");

    // A visible focus ring is required, so focus must not be suppressed.
    const outline = await firstItem.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("has no horizontal overflow at 320px (spec 25)", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await startGame(page);
    await pick(page, /water bottle/i);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("removes an item from the backpack (spec 10)", async ({ page }) => {
    await startGame(page);
    await pick(page, /water bottle/i);
    await expect(page.getByText("20 / 100")).toBeVisible();

    await drop(page, /remove water bottle/i);
    await expect(page.getByText("0 / 100")).toBeVisible();
  });
});
