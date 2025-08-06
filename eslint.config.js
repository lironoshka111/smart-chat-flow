import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...reactRefresh.configs.vite.rules,
      "prettier/prettier": "warn",
    },
  },
]);
