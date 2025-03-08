module.exports = {
  extends: [require.resolve("./base")],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: process.cwd(),
    sourceType: "module",
  },
};
