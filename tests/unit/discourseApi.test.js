import { getLatest, getTopic } from '../../src/lib/discourseApi';

global.fetch = jest.fn();

describe('discourseApi', () => {
  beforeEach(() => fetch.mockReset());

  test('getLatest ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const r = await getLatest(0);
    expect(r).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api/discourse/latest?page=0', { credentials: 'include' });
  });

  test('getTopic ok', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) });
    const r = await getTopic(1);
    expect(r).toEqual({ id: 1 });
  });
});
