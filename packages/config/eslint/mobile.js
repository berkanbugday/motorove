module.exports = {
  extends: ["@react-native", require.resolve("./base")],
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-var-requires": "error",
      },
    },
    {
      files: ["*.config.js", "*.config.ts", "metro.config.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
