/**
 * Polyfills for Node.js core modules in React Native
 * This file should be imported at the top of index.js
 */

// CRITICAL: URL polyfill must be loaded FIRST (needed by many other polyfills)
require('react-native-url-polyfill/auto');

// Import crypto polyfill (needed for random values)
require('react-native-get-random-values');

// Polyfill for global objects
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Polyfill for stream
if (typeof global.stream === 'undefined') {
  global.stream = require('readable-stream');
}

// Polyfill for events
if (typeof global.events === 'undefined') {
  global.events = require('events');
}

// Polyfill for crypto
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto-browserify');
}

// Suppress specific warnings for polyfilled modules
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Require cycle:') ||
      message.includes('node_modules/readable-stream') ||
      message.includes('node_modules/events') ||
      message.includes('node_modules/ws'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
