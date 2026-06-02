import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["node_modules/**", "android/**", "ios/**", "babel.config.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",
      // require() is the idiomatic way to reference static assets (images,
      // fonts) in React Native, so allow it.
      "@typescript-eslint/no-require-imports": "off",
      // Treat `any` as a warning rather than a hard error while the app is
      // still being typed end-to-end.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
