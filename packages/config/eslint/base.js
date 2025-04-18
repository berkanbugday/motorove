const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptEslintParser = require("@typescript-eslint/parser");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");
const reactPlugin = require("eslint-plugin-react");
const reactNativePlugin = require("eslint-plugin-react-native");

module.exports = [
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier: prettierPlugin,
      react: reactPlugin,
      "react-native": reactNativePlugin,
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        node: true,
        jest: true,
      },
    },
    ignores: [".eslintrc.js"],
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": "error",
    },
  },
  prettierConfig,
];
