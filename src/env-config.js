// Expose environment variables to browser window

// Support both Vite/browser and Jest/Node test environments




let apiUrl;
if (typeof globalThis.importMetaEnv !== 'undefined') {
  // Use mocked env for tests (Jest/Node)
  apiUrl = globalThis.importMetaEnv.VITE_SEMANTIC_FLOW_API_URL || "http://localhost:3001/api/trpc";
} else if (typeof window !== 'undefined' && window.ENV && window.ENV.VITE_SEMANTIC_FLOW_API_URL) {
  // Use window.ENV if set (browser)
  apiUrl = window.ENV.VITE_SEMANTIC_FLOW_API_URL;
} else if (typeof window !== 'undefined') {
  // Only use import.meta.env if running in browser/Vite
  // Dynamically import getViteApiUrl only in browser
  try {
    apiUrl = require('./getViteApiUrl').getViteApiUrl();
  } catch (e) {
    apiUrl = "http://localhost:3001/api/trpc";
  }
} else {
  apiUrl = "http://localhost:3001/api/trpc";
}

if (typeof window !== 'undefined') {
  window.ENV = window.ENV || {};
  window.ENV.VITE_API_URL = apiUrl.replace(/\/api\/trpc$/, "");
  window.ENV.VITE_TRPC_URL = apiUrl;
  window.ENV.SEMANTIC_FLOW_API_URL = apiUrl;
}

export {};
