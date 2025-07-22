import '../../src/env-config.js';

describe('env-config', () => {
  it('should set window.ENV variables', () => {
    expect(window.ENV).toBeDefined();
    expect(window.ENV.VITE_API_URL).toMatch(/localhost|supabase|semantic_flow/);
    expect(window.ENV.VITE_TRPC_URL).toMatch(/api\/trpc/);
  });
});
