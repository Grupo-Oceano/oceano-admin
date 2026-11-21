import js from "@eslint/js";
import { qwikEslint9Plugin } from "eslint-plugin-qwik";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  globalIgnores([
    "**/node_modules",
    "dist/**",
    "server/**",
    "tmp/**",
    "**/*.timestamp*",
    "**/vite.config.ts",
    "adapters/**",
    "eslint.config.js",
    ".prettierrc.js",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  // The Qwik rules need type information, so they only run on the app's TypeScript sources.
  ...qwikEslint9Plugin.configs.recommended.map((c) => ({
    ...c,
    files: ["src/**/*.ts", "src/**/*.tsx"],
  })),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // `*.server.ts` modules never reach the browser. Components may import their types only; routes,
  // entries and other server modules use them for loaders, actions and middleware.
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/routes/**", "src/**/*.server.ts", "src/entry.*"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/*.server", "**/*.server.*"],
              allowTypeImports: true,
              message:
                "Server-only module: import its types only, or call it from a routeLoader$/routeAction$/server$.",
            },
          ],
        },
      ],
    },
  },
);
