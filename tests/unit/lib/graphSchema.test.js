import { validateNode, validateEdge, validateWorkflow } from '../../../src/lib/graphSchema.js';
import { validNode, invalidNode, validWorkflow, invalidWorkflow } from '../../setup/test-data/testData.js';

describe('graphSchema.js', () => {
  it('validates a correct node', () => {
    expect(validateNode(validNode).isValid).toBe(true);
  });

  it('invalidates an incorrect node', () => {
    expect(validateNode(invalidNode).isValid).toBe(false);
  });

  it('validates a correct workflow', () => {
    expect(validateWorkflow(validWorkflow).isValid).toBe(true);
  });

  it('invalidates an incorrect workflow', () => {
    expect(validateWorkflow(invalidWorkflow).isValid).toBe(false);
  });
});
