import {getDefaultConfig, mergeConfig} from '@react-native/metro-config';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Add the root directory to the watchFolders to enable Metro to find packages in the monorepo root
  watchFolders: [path.resolve(__dirname, '../../node_modules')],
  resolver: {
    // This configuration tells Metro to look for modules in the root node_modules as well
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
  },
};

export default mergeConfig(getDefaultConfig(__dirname), config);
