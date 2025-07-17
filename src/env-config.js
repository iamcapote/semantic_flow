// Expose environment variables to browser window
if (typeof window !== 'undefined') {
  // Create ENV object on window if it doesn't exist
  window.ENV = window.ENV || {};
  
  // Expose Vite environment variables
  window.ENV.VITE_API_URL = "https://bookish-robot-r7779gg5695hpr95-3002.app.github.dev";
  window.ENV.VITE_TRPC_URL = "https://bookish-robot-r7779gg5695hpr95-3002.app.github.dev/api/trpc";
}

export {};
