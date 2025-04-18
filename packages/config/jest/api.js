const baseConfig = require("./base");

module.exports = {
  ...baseConfig,
  rootDir: "src",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  testEnvironment: "node",
};
