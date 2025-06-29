const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const path = require('path');
const os = require('os');
const fs = require('fs');
const {FileStore} = require('metro-cache');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// Path aliases configuration for Metro
const srcPath = path.resolve(__dirname, 'src');
const extraNodeModules = {
  '@components': path.resolve(srcPath, 'components'),
  '@screens': path.resolve(srcPath, 'screens'),
  '@navigation': path.resolve(srcPath, 'navigation'),
  '@utils': path.resolve(srcPath, 'utils'),
  '@hooks': path.resolve(srcPath, 'hooks'),
  '@app-types': path.resolve(srcPath, 'types'),
  '@assets': path.resolve(srcPath, 'assets'),
  '@theme': path.resolve(srcPath, 'theme'),
  '@constants': path.resolve(srcPath, 'constants'),
  '@configs': path.resolve(srcPath, 'configs'),
  '@contexts': path.resolve(srcPath, 'contexts'),
  '@services': path.resolve(srcPath, 'services'),
  '@': srcPath,
};

// Define a custom cache directory
const cacheDir = path.join(os.tmpdir(), 'metro-cache');

// Check if cache reset is requested either from environment or global flag
const shouldResetCache = process.env.RESET_CACHE === 'true';

// Log the cache status
if (shouldResetCache) {
  console.log('🧹 Metro cache reset requested. Clearing cache...');
} else {
  console.log(`📦 Using Metro cache at: ${cacheDir}`);
}

/**
 * Handle special pnpm node_modules structure
 * This helps Metro understand pnpm's symlinked structure
 */
function getPnpmDependencyPath(packageName) {
  try {
    const nodeModules = path.resolve(__dirname, '../../node_modules');
    const pnpmDir = path.resolve(nodeModules, '.pnpm');

    // Direct resolution attempt
    const directPath = path.join(nodeModules, packageName);
    if (fs.existsSync(directPath)) {
      return directPath;
    }

    // If not found directly, look in .pnpm directory
    if (fs.existsSync(pnpmDir)) {
      const dirs = fs.readdirSync(pnpmDir);
      const packageDir = dirs.find(dir => dir.startsWith(`${packageName}@`));

      if (packageDir) {
        return path.join(pnpmDir, packageDir, 'node_modules', packageName);
      }
    }

    return null;
  } catch (err) {
    console.error(`Error resolving ${packageName}:`, err.message);
    return null;
  }
}

// Build the extraNodeModules with special handling for critical packages
const criticalPackages = ['metro', 'metro-runtime', 'react', 'react-native'];
criticalPackages.forEach(pkg => {
  const resolvedPath = getPnpmDependencyPath(pkg);
  if (resolvedPath) {
    extraNodeModules[pkg] = resolvedPath;
  }
});

const config = {
  watchFolders: [
    // Add the root of the project to allow importing from monorepo packages
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '../../shared'),
  ],
  resolver: {
    // Configure module resolution for monorepo packages
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // Ensure proper resolution of React Native modules
    disableHierarchicalLookup: true,
    // Filter svg from asset extensions
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    // Add svg to source extensions for react-native-svg-transformer
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    // Add alias paths for imports
    extraNodeModules,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  // Configure Metro caching
  cacheStores: [
    new FileStore({
      root: cacheDir,
    }),
  ],
  // Increase cache size limit (default is 50MB)
  maxWorkers: Math.max(os.cpus().length - 1, 1),
  resetCache: shouldResetCache,
  symbolicator: {
    // Improve error reporting
    customizeFrame: frame => {
      return {
        ...frame,
        collapse: false,
      };
    },
  },
};

const mergedConfig = mergeConfig(defaultConfig, config);
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
