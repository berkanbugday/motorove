import baseConfig from "./base.js";
import reactPlugin from "eslint-plugin-react";
import reactNativePlugin from "eslint-plugin-react-native";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

// React Native config doesn't appear to export correctly for ESLint 9
// Recreate basic React Native rules without directly importing the config
export default [
  ...baseConfig,
  {
    plugins: {
      react: reactPlugin,
      "react-native": reactNativePlugin,
      "@typescript-eslint": typescriptEslint,
    },
    // Basic React Native rules
    files: ["*.jsx", "*.js", "*.tsx", "*.ts"],
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-native/no-unused-styles": "error",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "warn",
      "@typescript-eslint/no-var-requires": "error",
    },
  },
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    files: ["*.config.js", "*.config.ts", "metro.config.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
