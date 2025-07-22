import { TextDecoder } from 'util';
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
import fetch from 'node-fetch';
if (!global.fetch) global.fetch = fetch;
import { trpcClient } from '../../../src/lib/trpc';

describe('tRPC Integration: Provider', () => {
  it('fetches provider config for demo-user', async () => {
    const config = await trpcClient.provider.getConfig.query({ userId: 'demo-user' });
    // Log for debug
    // eslint-disable-next-line no-console
    console.log('[tRPC TEST] provider.getConfig:', config);
    expect(Array.isArray(config)).toBe(true);
    expect(config.length).toBeGreaterThan(0);
    expect(config[0]).toHaveProperty('providerId');
  });
});
