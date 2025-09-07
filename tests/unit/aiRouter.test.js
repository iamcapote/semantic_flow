const mod = require('../../src/lib/aiRouter');
const aiRouter = mod.getHeaders ? mod : (mod.default || mod);

describe('aiRouter basic', () => {
	test('getHeaders includes Authorization when apiKey provided', () => {
		const headers = aiRouter.getHeaders('openai', 'test-key-123');
		expect(headers.Authorization).toBeDefined();
		expect(headers.Authorization).toContain('test-key-123');
	});
});
