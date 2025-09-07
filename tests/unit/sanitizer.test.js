import { stripWorkflow, serializeNodeForAI } from '../../src/lib/sanitizer';

describe('sanitizer utilities', () => {
  test('stripWorkflow removes empty fields and preserves core node data', () => {
    const workflow = {
      metadata: { title: 'Test', description: '', tags: [] },
      nodes: [
        { id: 'n1', data: { title: 'A', description: 'D', fields: [{ name: 'x', value: '1' }, { name: 'content', value: 'should be omitted' }] } },
        { id: 'n2', data: { label: 'B', fields: [] } }
      ]
    };
    const stripped = stripWorkflow(workflow);
    expect(stripped).toHaveProperty('nodes');
    expect(Array.isArray(stripped.nodes)).toBe(true);
    expect(stripped.nodes[0]).toHaveProperty('title', 'A');
    expect(stripped.nodes[0]).toHaveProperty('fields');
    expect(stripped.nodes[0].fields).toHaveProperty('x', '1');
    // second node should be present but minimal
    expect(stripped.nodes[1].title).toBe('B');
  });

  test('serializeNodeForAI respects json and xml formats', () => {
    const nodeJson = { data: { fields: [{ name: 'k', value: { a: 1 } }], fileFormat: 'json' } };
    const sJson = serializeNodeForAI(nodeJson);
    expect(typeof sJson).toBe('string');
    expect(sJson.trim().startsWith('{')).toBe(true);

    const nodeXml = { data: { fields: [{ name: 'k', value: 'v' }], fileFormat: 'xml' } };
    const sXml = serializeNodeForAI(nodeXml);
    expect(typeof sXml).toBe('string');
    expect(sXml).toMatch(/<node|<k|\/node>/i);
  });
});
