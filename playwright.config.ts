import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke test config (spec 33).
 *
 * The suite runs against a production build rather than the dev server, so
 * the thing under test is the artifact that would actually be deployed.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : [["list"]],

  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],

  webServer: {
    command: "pnpm build && pnpm preview --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
