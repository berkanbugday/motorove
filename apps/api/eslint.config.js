const apiConfig = require('@motorove/config/eslint/api.js');

module.exports = [
  ...apiConfig,
  {
    files: ['src/**/*.ts', 'apps/**/*.ts', 'libs/**/*.ts', 'test/**/*.ts'],
  },
];
