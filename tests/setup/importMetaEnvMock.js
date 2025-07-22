// Jest/Node does not support import.meta.env, so we mock it globally
globalThis.importMetaEnv = {
  VITE_SEMANTIC_FLOW_API_URL: 'http://localhost:8081',
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  // Add other env vars as needed for your tests
};

// In your code/tests, reference globalThis.importMetaEnv instead of import.meta.env
