import apiConfig from '@motorove/config/eslint/api.js';

export default [
  ...apiConfig,
  {
    files: ['src/**/*.ts', 'apps/**/*.ts', 'libs/**/*.ts', 'test/**/*.ts'],
  },
];
