import { fieldsToRecord, upsertField } from '../../../src/lib/nodeModel';

describe('nodeModel helpers', () => {
	test('fieldsToRecord converts array to map', () => {
		const fields = [{ name: 'a', value: 1 }, { name: 'b', value: 'x' }];
		const rec = fieldsToRecord(fields);
		expect(rec).toEqual({ a: 1, b: 'x' });
	});

	test('upsertField adds and updates fields', () => {
		const f1 = upsertField([], 'a', 'text', 'v');
		expect(f1.length).toBe(1);
		const f2 = upsertField(f1, 'a', 'text', 'v2');
		expect(f2[0].value).toBe('v2');
	});
});
