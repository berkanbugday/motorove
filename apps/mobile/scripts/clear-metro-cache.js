#!/usr/bin/env node

/**
 * Metro Cache Clear Script
 *
 * This script clears the Metro bundler cache. It can be used in CI/CD pipelines
 * or manually by developers when a clean build is needed.
 *
 * Usage:
 *   node scripts/clear-metro-cache.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const {execSync} = require('child_process');

// Define known Metro cache locations
const cacheDirs = [
  // Custom cache directory from our Metro config
  path.join(os.tmpdir(), 'metro-cache'),

  // Default Metro cache locations
  path.join(os.tmpdir(), 'metro-bundler-cache'),
  path.join(os.homedir(), '.cache', 'metro'),
  path.join(os.homedir(), 'Library', 'Caches', 'metro'),

  // Project-specific cache
  path.join(__dirname, '..', 'node_modules', '.cache', 'metro'),
  path.join(__dirname, '..', '..', '..', 'node_modules', '.cache', 'metro'),

  // React Native caches
  path.join(os.homedir(), 'Library', 'Developer', 'Xcode', 'DerivedData'),
  path.join(__dirname, '..', 'ios', 'build'),
  path.join(__dirname, '..', 'android', 'build'),
];

// Function to clear a directory if it exists
function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    console.log(`Clearing cache at: ${directory}`);
    try {
      fs.rmSync(directory, {recursive: true, force: true});
      console.log(`✅ Cache cleared: ${directory}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to clear: ${directory}`, error.message);
      return false;
    }
  }
  return false;
}

// Main function to clear all Metro caches
(async function main() {
  console.log('🧹 Clearing Metro bundler cache...');

  let clearedAny = false;

  // Clear Metro cache directories
  for (const dir of cacheDirs) {
    const cleared = clearDirectory(dir);
    if (cleared) {
      clearedAny = true;
    }
  }

  // Clear watchman watches if available
  try {
    console.log('Clearing watchman watches...');
    execSync('watchman watch-del-all', {stdio: 'inherit'});
    console.log('✅ Watchman watches cleared');
    clearedAny = true;
  } catch {
    console.log('ℹ️ Watchman not available or failed to clear watches');
  }

  // Clear React Native cache
  try {
    console.log('Clearing React Native cache...');
    execSync('rm -rf $TMPDIR/react-*', {stdio: 'inherit'});
    console.log('✅ React Native cache cleared');
    clearedAny = true;
  } catch {
    console.log('ℹ️ Failed to clear React Native cache');
  }

  if (clearedAny) {
    console.log('✨ All caches cleared successfully.');
    console.log('ℹ️ Recommended next steps:');
    console.log('  1. Close Metro bundler if running');
    console.log('  2. Restart your development environment');
    console.log('  3. Run the app with RESET_CACHE=true option');
  } else {
    console.log('ℹ️ No cache directories found.');
  }
})().catch(err => {
  console.error('❌ Error clearing Metro cache:', err);
  process.exit(1);
});
