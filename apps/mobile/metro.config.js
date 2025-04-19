const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Add the root of the project to allow importing from monorepo packages
    path.resolve(__dirname, '../..'),
  ],
  resolver: {
    // Configure module resolution for monorepo packages
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // Ensure proper resolution of React Native modules
    disableHierarchicalLookup: true,
    // Ensure these file extensions are handled properly
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs', 'cjs'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Enable hermes transform for better performance
    hermesParser: true,
    // Optimize polyfill processing
    minifierConfig: {
      keep_classnames: true,
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
  // Enable caching for better performance
  cacheVersion: '1.0',
  hasteImplModulePath: null,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
