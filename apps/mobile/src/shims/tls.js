/**
 * TLS module shim for React Native
 * The ws package requires this but doesn't actually use it in browser/RN environments
 */

module.exports = {
  connect: () => {
    throw new Error(
      'TLS is not supported in React Native - use wss:// URLs with native WebSocket',
    );
  },
  createSecureContext: () => ({}),
  Server: class Server {},
  TLSSocket: class TLSSocket {},
};
