/**
 * ESLint flat configuration.
 * Exports: the ESLint config array (default export).
 * Depends on: eslint, eslint-config-next, eslint-config-prettier.
 *
 * Relative imports are banned so every internal import uses the `@/` alias,
 * which keeps paths correct when files move.
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./*", "../*"],
              message: "Use the @/ alias for internal imports.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);
