import { getCSRFCookie } from '../../src/lib/auth';

describe('auth helpers', () => {
  test('getCSRFCookie returns empty when missing', () => {
    Object.defineProperty(document, 'cookie', { value: '', writable: true });
    expect(getCSRFCookie()).toBe('');
  });

  test('getCSRFCookie parses cookie', () => {
    Object.defineProperty(document, 'cookie', { value: 'a=1; sf_csrf=token123; x=y', writable: true });
    expect(getCSRFCookie()).toBe('token123');
  });
});
