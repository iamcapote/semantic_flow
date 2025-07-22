import { GRAPH_SCHEMA_VERSION, PORT_TYPES } from '../../src/lib/graphSchema.js';

describe('GraphSchema', () => {
  it('should define schema version', () => {
    expect(GRAPH_SCHEMA_VERSION).toBe('1.0.0');
  });
  it('should define port types', () => {
    expect(PORT_TYPES.INPUT).toBe('input');
    expect(PORT_TYPES.OUTPUT).toBe('output');
  });
});
