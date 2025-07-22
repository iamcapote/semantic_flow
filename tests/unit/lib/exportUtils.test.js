import { exportAsJSON, exportAsYAML, exportAsMarkdown, exportAsXML } from '../../../src/lib/exportUtils.js';
import { validWorkflow } from '../../setup/test-data/testData.js';

describe('exportUtils.js', () => {
  it('exports workflow as JSON', () => {
    const result = exportAsJSON(validWorkflow);
    expect(result.content).toContain('workflow-1');
  });

  it('exports workflow as YAML', () => {
    const result = exportAsYAML(validWorkflow);
    expect(result.content).toContain('workflow-1');
  });

  it('exports workflow as Markdown', () => {
    const result = exportAsMarkdown(validWorkflow);
    expect(result.content).toContain('workflow-1');
  });

  it('exports workflow as XML', () => {
    const result = exportAsXML(validWorkflow);
    expect(result.content).toContain('workflow-1');
  });
});
