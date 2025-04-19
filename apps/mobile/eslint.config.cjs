const {FlatCompat} = require('@eslint/eslintrc');

// Create compatibility layer between new flat config and existing eslintrc
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
});

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Ignore node_modules, build outputs, and config files
  {
    ignores: [
      'node_modules/**',
      'vendor/**',
      'ios/**',
      'android/**',
      '.bundle/**',
      '.eslintrc.js', // Ignore the old config file
      '__tests__/**/*.js',
      '*.config.js', // Ignore config files
      '.prettierrc.js',
      'babel.config.js',
      'metro.config.js',
    ],
  },

  // Apply React Native ESLint config via compatibility layer
  ...compat.extends('@react-native'),

  // Add custom rules or overrides
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Disable the flow rules that are causing issues with ESLint 9
      'ft-flow/define-flow-type': 'off',
      'ft-flow/use-flow-type': 'off',

      // Disable React Native rules that are incompatible with ESLint 9
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'off',
      'react-native/no-raw-text': 'off',
      'react-native/no-unused-styles': 'off',
      'react-native/split-platform-components': 'off',
    },
  },
];
