const baseConfig = require("./base.js");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
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
