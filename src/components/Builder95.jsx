import React, { useEffect, useState } from 'react';
import NodePalette95 from './NodePalette95';
import LabCanvas from './LabCanvas';
import SemanticNode95 from './SemanticNode95';
import { createWorkflowSchema, generateId } from '@/lib/graphSchema';
import WorkflowExecutionEngine from '@/lib/WorkflowExecutionEngine';
import { useMemo } from 'react';

const win98 = {
  app: { height: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', gridTemplateRows: '32px 1fr', gap: 8, background: '#E0E0E0', color: '#000', fontFamily: 'JetBrains Mono, monospace' },
  toolbar: { display: 'flex', alignItems: 'center', gap: 6, padding: 6, borderBottom: '1px solid #808080', background: '#C0C0C0' },
  panel: { background: '#FFF', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', display: 'flex', flexDirection: 'column', minHeight: 0 },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700 },
  body: { padding: 8, overflow: 'hidden' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '2px 8px', cursor: 'pointer' },
};

export default function Builder95() {
  const [workflow, setWorkflow] = useState(() => {
    const saved = localStorage.getItem('current-workflow');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    const wf = createWorkflowSchema();
    wf.id = generateId();
    wf.metadata.title = 'Untitled Workflow';
    wf.metadata.createdAt = new Date().toISOString();
    wf.metadata.updatedAt = new Date().toISOString();
    return wf;
  });

  useEffect(() => { localStorage.setItem('current-workflow', JSON.stringify(workflow)); }, [workflow]);

  // Listen for external workflow updates (e.g., from IDE95) and sync Builder
  useEffect(() => {
    const onExternalUpdate = (e) => {
      try {
        const { source, workflow: next } = e.detail || {};
        if (!next || source === 'Builder') return; // avoid loopback
        setWorkflow((prev) => ({ ...prev, ...next }));
      } catch {}
    };
    window.addEventListener('workflow:updated', onExternalUpdate);
    return () => window.removeEventListener('workflow:updated', onExternalUpdate);
  }, []);

  const onExecuteWorkflow = async () => {
    const engine = new WorkflowExecutionEngine('demo-user');
    await engine.executeWorkflow(workflow, () => {});
  };

  const memoNodeTypes = useMemo(() => ({ semantic: SemanticNode95 }), []);

  return (
    <div style={win98.app}>
      <div style={win98.toolbar}>
        <strong>Builder</strong>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>Windows 95 layout</span>
      </div>

    <div style={{ ...win98.panel, gridColumn: '1 / 2' }}>
        <div style={win98.head}>Palette</div>
        <div style={{ ...win98.body, overflow: 'auto' }}>
      <NodePalette95 />
        </div>
      </div>

      <div style={{ ...win98.panel }}>
        <div style={win98.head}>Canvas</div>
        {/* Ensure the canvas area expands to fill the panel so ReactFlow gets a real height */}
        <div style={{ ...win98.body, padding: 0, flex: 1, minHeight: 0 }}>
          <LabCanvas
            workflow={workflow}
            onWorkflowChange={setWorkflow}
            onExecuteWorkflow={onExecuteWorkflow}
            isExecuting={false}
            nodeTypes={memoNodeTypes}
          />
          {/* Removed global Text-to-Workflow generator; per-field AI lives in FieldEditor rows */}
        </div>
      </div>
    </div>
  );
}
