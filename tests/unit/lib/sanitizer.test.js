import { stripWorkflow, serializeNodeForAI } from '../../../src/lib/sanitizer';

describe('sanitizer lib (unit)', () => {
	test('stripWorkflow returns minimal structure', () => {
		const wf = { metadata: { title: 'T' }, nodes: [{ data: { title: 'N', fields: [{ name: 'a', value: '1' }] } }] };
		const s = stripWorkflow(wf);
		expect(s).toHaveProperty('nodes');
		expect(s.nodes[0]).toHaveProperty('title', 'N');
	});

	test('serializeNodeForAI outputs string for formats', () => {
		const node = { data: { fields: [{ name: 'k', value: 'v' }], fileFormat: 'markdown' } };
		const out = serializeNodeForAI(node);
		expect(typeof out).toBe('string');
	});
});
