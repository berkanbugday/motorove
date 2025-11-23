/**
 * Net module shim for React Native
 * The ws package requires this but doesn't actually use it in browser/RN environments
 */

module.exports = {
  isIP: () => 0,
  isIPv4: () => false,
  isIPv6: () => false,
  Socket: class Socket {
    constructor() {}
    connect() {}
    end() {}
    destroy() {}
    on() {}
    once() {}
    removeListener() {}
  },
  Server: class Server {
    constructor() {}
    listen() {}
    close() {}
    on() {}
  },
  createServer: () => new module.exports.Server(),
  createConnection: () => new module.exports.Socket(),
  connect: () => new module.exports.Socket(),
};
