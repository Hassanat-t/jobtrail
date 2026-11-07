import { defineConfig } from "vitest/config";

// Unit tests live next to the code (*.test.ts / *.test.js). Playwright's e2e/ folder is separate.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "extension/**/*.test.js"],
  },
});
