import { expect, test } from "@playwright/test";

/**
 * Static-host routing.
 *
 * The game is a plain static bundle, so a host must be configured to fall back
 * to index.html. Cloudflare Pages does this with public/_redirects; Netlify with
 * a similar rules file. This test guards the failure that a misconfigured host
 * causes: a 404 on any deep link or refresh.
 */
test.describe("deep links", () => {
  test("the game route survives a hard refresh", async ({ page }) => {
    const response = await page.goto("/games/theme-park-backpack");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("button", { name: /start packing/i })).toBeVisible();
  });

  test("the home route renders the game list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /ai learning games/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^play$/i })).toBeVisible();
  });

  test("navigating between routes does not reload the page", async ({ page }) => {
    await page.goto("/");
    // A full reload would wipe this marker.
    await page.evaluate(() => {
      (window as unknown as Record<string, string>).__spaMarker = "alive";
    });

    await page.getByRole("button", { name: /^play$/i }).click();
    await expect(page.getByRole("button", { name: /start packing/i })).toBeVisible();

    const marker = await page.evaluate(
      () => (window as unknown as Record<string, string>).__spaMarker,
    );
    expect(marker).toBe("alive");
  });

  test("an unknown route shows a not-found page rather than a blank screen", async ({ page }) => {
    await page.goto("/games/does-not-exist");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("serves the SPA fallback file the hosts read", async ({ request }) => {
    const response = await request.get("/_redirects");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("/index.html");
  });
});
