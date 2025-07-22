import '../../src/env-config.js';

describe('env-config', () => {
  it('should set window.ENV variables', () => {
    expect(window.ENV).toBeDefined();
  });
});
