
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ["dist/**", "**/*.test.ts", "**/__mocks__/**","eslint.config.mjs","jest.config.js"],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Ensure you have a tsconfig.json
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals:{
        ...globals.node,
        ...globals.browser,
      }, // Set environment to Node.js
    },
    rules: {
     "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": "warn",
    },
  },
];
