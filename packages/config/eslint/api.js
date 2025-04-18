import baseConfig from "./base.js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  ...baseConfig,
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    files: ["*.ts"],
    languageOptions: {
      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
    },
  },
];
