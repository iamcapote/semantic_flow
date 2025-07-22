// Polyfill ResizeObserver for ReactFlow and other components
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
// Jest setup file for global test configuration
require('@testing-library/jest-dom');

// Polyfill TextEncoder for Node.js
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder } = require('util');
  global.TextEncoder = TextEncoder;
}

// Add any global mocks or setup here
// Mock window.matchMedia for tests
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() {},
    };
  };
}
