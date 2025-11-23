/**
 * HTTP module shim for React Native
 * Use fetch or XMLHttpRequest instead
 */

module.exports = {
  request: () => {
    throw new Error(
      'Use fetch or XMLHttpRequest instead of http module in React Native',
    );
  },
  get: () => {
    throw new Error(
      'Use fetch or XMLHttpRequest instead of http module in React Native',
    );
  },
  Agent: class Agent {},
  Server: class Server {},
  createServer: () => new module.exports.Server(),
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  STATUS_CODES: {},
};
