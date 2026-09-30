import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Two test projects rather than one global environment:
 *
 *  - `unit` runs the pure scoring module in node, which is faster and needs no
 *    DOM shims;
 *  - `dom` runs React component tests under jsdom.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
        },
      },
    ],
  },
});
