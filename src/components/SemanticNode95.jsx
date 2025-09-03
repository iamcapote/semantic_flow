import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3, Save, X, Play, Info, Sparkles } from "lucide-react";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import NodeEnhancementModal from './NodeEnhancementModal';
import FieldEditor95 from './FieldEditor95';
import { convertContent, detectFormat } from '@/lib/formatUtils';

const styles = {
  panel: (selected) => ({
    minWidth: 200,
    maxWidth: 320,
    background: '#FFFFFF',
    border: '2px solid #808080',
    boxShadow: selected ? '0 0 0 2px rgba(59,130,246,0.5)' : '2px 2px 0 #000',
    fontFamily: 'JetBrains Mono, monospace',
  }),
  header: { background: '#000080', color: '#fff', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 6 },
  body: { padding: 6, background: '#F5F5F5' },
  bevelBtn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', height: 20, width: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  tag: { fontSize: 10, border: '1px solid #808080', padding: '0 4px', background: '#EEE', marginRight: 4 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  status: { marginTop: 6, paddingTop: 6, borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5563' },
};

const SemanticNode95 = ({ id, data, isConnectable, selected, onNodeUpdate }) => {
  const [isEditing, setIsEditing] = useState(!!data.isNew);
  const [editContent, setEditContent] = useState(data.content || '');
  const isBlankNode = data.type === 'UTIL-BLANK';
  const [editLabel, setEditLabel] = useState(data.label || 'Blank Node');
  const [editTags, setEditTags] = useState(Array.isArray(data.metadata?.tags) ? data.metadata.tags : []);
  const [editType, setEditType] = useState(data.type);
  const [fields, setFields] = useState(Array.isArray(data.fields) ? data.fields : []);
  const [contentFormat, setContentFormat] = useState(detectFormat(editContent));

  const nodeType = NODE_TYPES[data.type];
  const clusterColor = CLUSTER_COLORS[data.metadata?.cluster] || '#6B7280';

  const handleSaveEdit = () => {
    data.content = editContent;
    if (isBlankNode) {
      data.label = editLabel;
      data.type = editType;
      data.metadata.tags = editTags;
    }
    data.fields = fields;
    data.metadata.updatedAt = new Date().toISOString();
    delete data.isNew;
    setIsEditing(false);
    const patch = { content: editContent, fields, ...(isBlankNode && { label: editLabel, type: editType, tags: editTags }) };
    if (typeof data._onUpdate === 'function') data._onUpdate(id, patch);
    else if (onNodeUpdate) onNodeUpdate(id, patch);
  };

  const handleCancelEdit = () => {
    setEditContent(data.content || '');
    setIsEditing(false);
  };

  const handleExecute = () => {
    console.log(`Executing node ${id} of type ${data.type}`);
  };

  const handleNodeEnhancementUpdate = (updatedNode) => {
    setEditContent(updatedNode.data.content);
    data.content = updatedNode.data.content;
    data.metadata.updatedAt = new Date().toISOString();
    if (typeof data._onUpdate === 'function') data._onUpdate(id, { content: updatedNode.data.content });
    else if (onNodeUpdate) onNodeUpdate(id, { content: updatedNode.data.content });
  };

  const handleConvertContent = (to) => {
    try {
      const from = contentFormat;
      const converted = convertContent(editContent, from, to);
      setEditContent(converted);
      setContentFormat(to);
    } catch (e) {
      console.error('conversion failed', e);
    }
  };

  return (
    <div data-testid="semantic-node" onDoubleClick={() => setIsEditing(true)} style={{ ...styles.panel(selected), borderLeft: `4px solid ${clusterColor}`, cursor: 'move' }}>
      <Handle type="target" position={Position.Left} style={{ background: clusterColor, width: 12, height: 12, left: -6 }} isConnectable={isConnectable} />

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 16 }}>{nodeType?.icon || '📦'}</span>
          <div style={{ width: 10, height: 10, background: clusterColor }} />
          <div style={{ fontSize: 12, fontWeight: 700 }}>{data.label}</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button style={styles.bevelBtn} aria-label="Info"><Info size={12} /></button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{nodeType?.label || data.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{nodeType?.description || 'Semantic node description'}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {data.config?.isExecutable && (
            <button style={styles.bevelBtn} onClick={handleExecute} aria-label="Execute"><Play size={12} /></button>
          )}
          <button style={styles.bevelBtn} onClick={() => setIsEditing(!isEditing)} aria-label="Edit"><Edit3 size={12} /></button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.metaRow}>
          <span style={styles.tag}>{data.type}</span>
          {(data.metadata?.tags || []).slice(0, 2).map((t, i) => (
            <span key={i} style={styles.tag}>{t}</span>
          ))}
        </div>

        {isEditing ? (
          <div style={{ marginTop: 6 }}>
            {isBlankNode && (
              <div style={{ display: 'grid', gap: 4, marginBottom: 4 }}>
                <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Node name" style={{ padding: '4px 6px', border: '2px solid #808080' }} />
                <input type="text" value={editType} onChange={(e) => setEditType(e.target.value)} placeholder="Node type (e.g. UTIL-BLANK)" style={{ padding: '4px 6px', border: '2px solid #808080' }} />
                <input type="text" value={Array.isArray(editTags) ? editTags.join(', ') : ''} onChange={(e) => setEditTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="Tags (comma separated)" style={{ padding: '4px 6px', border: '2px solid #808080' }} />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Enter node content..." className="min-h-[60px] text-sm bg-white text-black" />
              <div style={{ display: 'grid', gap: 4 }}>
                <div style={{ fontSize: 12, textAlign: 'center' }}>Format</div>
                <select value={contentFormat} onChange={(e)=>handleConvertContent(e.target.value)} style={{ padding: '4px 6px', border: '2px solid #808080', background: '#C0C0C0' }}>
                  {['text','markdown','json','yaml','xml'].map(f => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <FieldEditor95 value={fields} onChange={setFields} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={handleCancelEdit} style={styles.bevelBtn} aria-label="Cancel"><X size={12} /></button>
                <button onClick={handleSaveEdit} style={styles.bevelBtn} aria-label="Save"><Save size={12} /></button>
              </div>
              <NodeEnhancementModal
                node={{ id, data }}
                onNodeUpdate={handleNodeEnhancementUpdate}
                trigger={<button style={{ ...styles.bevelBtn, width: 24 }} aria-label="Enhance"><Sparkles size={12} /></button>}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 6, minHeight: 60 }}>
            {data.content ? (
              <p style={{ fontSize: 12, color: '#111', whiteSpace: 'pre-wrap' }}>{data.content}</p>
            ) : (
              <p style={{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>{data.metadata?.description || 'Click edit to add content...'}</p>
            )}
            {Array.isArray(data.fields) && data.fields.length > 0 && (
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Fields</div>
                <div style={{ display: 'grid', gap: 4 }}>
                  {data.fields.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr', gap: 6, alignItems: 'start' }}>
                      <span style={{ fontSize: 12 }}>{f.name}</span>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>{f.type}</span>
                      <pre style={{ margin: 0, fontSize: 11, background: '#fff', border: '1px solid #ddd', padding: 4, whiteSpace: 'pre-wrap' }}>{typeof f.value === 'string' ? f.value : JSON.stringify(f.value, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.executionState && (
          <div style={styles.status}>
            <div style={{ width: 8, height: 8, borderRadius: 9999, background:
              data.executionState === 'completed' ? '#10B981' :
              data.executionState === 'running' ? '#3B82F6' :
              data.executionState === 'failed' ? '#EF4444' : '#9CA3AF' }} />
            <span style={{ textTransform: 'capitalize' }}>{data.executionState}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: clusterColor, width: 12, height: 12, right: -6 }} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(SemanticNode95);
