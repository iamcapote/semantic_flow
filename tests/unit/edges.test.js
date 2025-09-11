import { createEdge } from '@/lib/graphSchema';

describe('edges', () => {
	test('createEdge sets default operator', () => {
		const e = createEdge('A','B');
		expect(e.data.operator).toBe('related');
	});
});
