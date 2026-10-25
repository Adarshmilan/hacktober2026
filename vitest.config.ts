/**
 * Vitest configuration.
 * Exports: the Vitest config object (default export).
 * Depends on: vitest, node:url.
 *
 * Mirrors the `@/` -> `src/` alias from tsconfig so tests import files the
 * same way the app does.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The real package throws outside React Server Components; tests run in plain Node.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
