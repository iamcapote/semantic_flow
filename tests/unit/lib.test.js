import { exportWorkflowAsJSON, exportWorkflowAsMarkdown, exportWorkflowAsYAML } from '../../src/lib/exportUtils.js';
import { cn } from '../../src/lib/utils.js';
import { validWorkflow } from '../setup/test-data/testData.js';

describe('exportUtils', () => {
  it('exports workflow as JSON', () => {
    const result = exportWorkflowAsJSON(validWorkflow);
    expect(typeof result.content).toBe('string');
    expect(result.content).toMatch(/Valid Statement/);
    expect(result.filename).toMatch(/workflow-1-workflow.json/);
    expect(result.mimeType).toBe('application/json');
  });
  it('exports workflow as Markdown', () => {
    const result = exportWorkflowAsMarkdown(validWorkflow);
    expect(typeof result.content).toBe('string');
    expect(result.content).toMatch(/Valid Statement/);
    expect(result.filename).toMatch(/workflow-1-workflow.md/);
    expect(result.mimeType).toBe('text/markdown');
  });
  it('exports workflow as YAML', () => {
    const result = exportWorkflowAsYAML(validWorkflow);
    expect(typeof result.content).toBe('string');
    expect(result.content).toMatch(/nodes:/);
    expect(result.filename).toMatch(/workflow-1-workflow.yml/);
    expect(result.mimeType).toBe('application/x-yaml');
  });
});

describe('utils', () => {
  it('cn merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
});
