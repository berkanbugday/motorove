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

// Define known Metro cache locations
const cacheDirs = [
  // Custom cache directory from our Metro config
  path.join(os.tmpdir(), 'metro-cache'),

  // Default Metro cache locations
  path.join(os.tmpdir(), 'metro-bundler-cache'),
  path.join(os.homedir(), '.cache', 'metro'),

  // Project-specific cache
  path.join(__dirname, '..', 'node_modules', '.cache', 'metro'),
];

// Function to clear a directory if it exists
function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    console.log(`Clearing Metro cache at: ${directory}`);
    fs.rmSync(directory, {recursive: true});
    console.log(`✅ Cache cleared: ${directory}`);
    return true;
  }
  return false;
}

// Main function to clear all Metro caches
(async function main() {
  console.log('🧹 Clearing Metro bundler cache...');

  let clearedAny = false;

  for (const dir of cacheDirs) {
    const cleared = clearDirectory(dir);
    if (cleared) {
      clearedAny = true;
    }
  }

  if (clearedAny) {
    console.log('✨ All Metro caches cleared successfully.');
  } else {
    console.log('ℹ️  No Metro cache directories found.');
  }
})().catch(err => {
  console.error('❌ Error clearing Metro cache:', err);
  process.exit(1);
});
