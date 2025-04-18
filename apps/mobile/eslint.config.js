const mobileConfig = require('@motorove/config/eslint/mobile.js');

module.exports = [
  ...mobileConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
];
