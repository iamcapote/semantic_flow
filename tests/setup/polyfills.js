// Polyfills for Node.js APIs in browser/JSDOM for Jest
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = function(fn, ...args) {
    return setTimeout(fn, 0, ...args);
  };
}

if (typeof global.process === 'undefined') {
  global.process = { env: {} };
}

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Add any other needed polyfills here
