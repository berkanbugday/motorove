import mobileConfig from '@motorove/config/eslint/mobile.js';

export default [
  ...mobileConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  },
];
