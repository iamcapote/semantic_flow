import { SECURITY_CONFIG } from '../../src/lib/security.js';

describe('SECURITY_CONFIG', () => {
  it('should use session storage and encryption', () => {
    expect(SECURITY_CONFIG.API_KEY_STORAGE.STORAGE_TYPE).toBe('session');
    expect(SECURITY_CONFIG.API_KEY_STORAGE.ENCRYPTION).toBe(true);
  });
  it('should not store API keys in database', () => {
    expect(SECURITY_CONFIG.DATABASE.NO_API_KEYS_STORED).toBe(true);
  });
  it('should clear API keys on logout', () => {
    expect(SECURITY_CONFIG.CLIENT_SIDE.CLEAR_ON_LOGOUT).toBe(true);
  });
});
