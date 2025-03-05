// import globals from "globals";
// import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";


// /** @type {import('eslint').Linter.Config[]} */
// export default [
//   {files: ["**/*.{js,mjs,cjs,ts}"]},
//   {languageOptions: { globals: globals.browser }},
//   pluginJs.configs.recommended,
//   ...tseslint.configs.recommended,
// ];


import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["dist/**"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Ensure you have a tsconfig.json
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: globals.node, // Set environment to Node.js
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "no-console": "warn", // Warn on console.log
      "@typescript-eslint/no-unused-vars": ["error"], // Error on unused variables
      "@typescript-eslint/no-explicit-any": "warn", // Warn on `any` type usage
    },
  },
];
