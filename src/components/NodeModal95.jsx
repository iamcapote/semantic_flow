import React, { useEffect, useMemo, useState } from 'react';
import FieldEditor95 from './FieldEditor95';
import { fieldsToRecord, serializeFields } from '@/lib/nodeModel';
import { NODE_TYPES, CLUSTER_COLORS } from '@/lib/ontology';
import { EDGE_OPERATORS, getOperatorMeta } from '@/lib/edges';

// Win95 modal styling (leans on existing CSS variables)
const sx = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: 40, zIndex: 1000
  },
  window: (clusterColor) => ({
    width: 760, maxWidth: '90%', maxHeight: 'calc(100vh - 80px)',
    background: 'var(--w95-face)', border: '2px solid var(--w95-shadow)',
    boxShadow: '4px 4px 0 #000', display: 'flex', flexDirection: 'column',
    fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif',
    position: 'relative', overflow: 'hidden'
  }),
  titleBar: (clusterColor) => ({
    background: clusterColor || 'var(--w95-title)', color: '#fff',
    padding: '4px 8px', fontWeight: 'bold', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  }),
  body: { padding: 12, overflowY: 'auto', display: 'flex', gap: 12 },
  colMain: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  colSide: { width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 },
  section: { background: '#FFFFFF', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 8 },
  sectionTitle: { margin: '-8px -8px 8px -8px', background: '#000080', color: '#fff', padding: '3px 6px', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 },
  input: { padding: '4px 6px', border: '2px solid #808080', background: '#fff', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
  tagInput: { padding: '4px 6px', border: '2px solid #808080', background: '#fff', fontSize: 11 },
  badge: { display: 'inline-block', padding: '2px 6px', background: '#E0E0E0', border: '1px solid #808080', fontSize: 10, marginRight: 4, marginBottom: 4 },
  connectionList: { listStyle: 'none', padding: 0, margin: 0, maxHeight: 140, overflowY: 'auto' },
  connectionItem: { fontSize: 11, padding: '2px 4px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E0E0E0', cursor: 'pointer' },
  footer: { padding: 8, display: 'flex', gap: 8, background: '#D0D0D0', borderTop: '2px solid #808080' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '4px 12px', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 },
  btnPrimary: { background: '#90EE90', border: '1px solid #2F6F2F', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000' },
  btnDanger: { background: '#f0c0c0', border: '1px solid #7a0000', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000' }
};

export default function NodeModal95({ node, edges, onUpdate, onDuplicate, onDelete, onClose }) {
  const [fields, setFields] = useState(() => Array.isArray(node?.data?.fields) ? [...node.data.fields] : []);
  const [title, setTitle] = useState(node?.data?.label || node?.data?.title || 'Node');
  const [tags, setTags] = useState(() => {
    const rec = fieldsToRecord(fields);
    return Array.isArray(rec.tags) ? rec.tags.join(', ') : (Array.isArray(node?.data?.tags) ? node.data.tags.join(', ') : '');
  });

  const nodeType = NODE_TYPES[node?.data?.type] || {};
  const clusterColor = CLUSTER_COLORS[node?.data?.metadata?.cluster] || 'var(--w95-title)';

  const inbound = useMemo(() => edges.filter(e => e.target === node.id), [edges, node?.id]);
  const outbound = useMemo(() => edges.filter(e => e.source === node.id), [edges, node?.id]);

  const openEdgeEditor = (edgeId) => {
    try { window.dispatchEvent(new CustomEvent('edge:openModal', { detail: { id: edgeId } })); } catch {}
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    const rec = fieldsToRecord(fields);
    const patch = {
      fields: [...fields],
      label: title,
      title,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description: rec.description || node.data.description,
      content: rec.content || node.data.content,
      icon: rec.icon || node.data.icon
    };
    onUpdate?.(node.id, patch);
    onClose();
  };

  if (!node) return null;

  return (
    <div style={sx.overlay}>
      <div style={sx.window(clusterColor)} role="dialog" aria-modal="true" aria-label={`Edit ${title}`}>
        <div style={sx.titleBar(clusterColor)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 16 }}>{nodeType.icon || '📦'}</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...sx.btn }} onClick={onClose}>×</button>
          </div>
        </div>
        <div style={sx.body}>
          <div style={sx.colMain}>
            <div style={sx.section}>
              <div style={sx.sectionTitle}>
                <span>Core</span>
                <span style={{ fontWeight: 400, fontSize: 10 }}>{node.data?.type}</span>
              </div>
              <div style={sx.fieldRow}>
                <label style={{ fontSize: 11, fontWeight: 600 }}>Title</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} style={sx.input} />
              </div>
              <div style={sx.fieldRow}>
                <label style={{ fontSize: 11, fontWeight: 600 }}>Tags (comma)</label>
                <input value={tags} onChange={(e)=>setTags(e.target.value)} style={sx.tagInput} />
              </div>
              {nodeType.description && (
                <div style={{ fontSize: 11, background: '#FFF', padding: '6px 8px', border: '1px inset #C0C0C0', fontStyle: 'italic', marginTop: 4 }}>
                  {nodeType.description}
                </div>
              )}
            </div>
            <div style={sx.section}>
              <div style={sx.sectionTitle}><span>Fields</span><span style={{ fontSize: 10 }}>{fields.length}</span></div>
              <FieldEditor95 value={fields} onChange={setFields} />
            </div>
            {fields.length > 0 && (
              <div style={sx.section}>
                <div style={sx.sectionTitle}><span>Serialized</span></div>
                <pre style={{ margin: 0, fontSize: 10, maxHeight: 180, overflow: 'auto', background: '#FFF', padding: 8, border: '1px inset #C0C0C0' }}>
                  {(() => { try { return serializeFields(fields, 'markdown'); } catch { return ''; } })()}
                </pre>
              </div>
            )}
          </div>
          <div style={sx.colSide}>
            <div style={sx.section}>
              <div style={sx.sectionTitle}><span>Connections</span></div>
              <div style={{ fontSize: 10, marginBottom: 4 }}>Inbound ({inbound.length})</div>
              <ul style={sx.connectionList}>
                {inbound.map(e => {
                  const op = e.data?.operator || 'related';
                  const meta = getOperatorMeta(op);
                  return (
                    <li key={e.id} style={{ ...sx.connectionItem, alignItems: 'center', gap: 6 }} onClick={() => openEdgeEditor(e.id)} title={`Edit edge ${e.id}`}>
                      <span style={{ flex: 1 }}>{e.source} → {e.target}</span>
                      <span title={meta.description} style={{ fontSize: 10, border: '1px inset #C0C0C0', padding: '0 4px', background: '#E0E0E0' }}>{meta.icon} {meta.label}</span>
                    </li>
                  );
                })}
                {inbound.length === 0 && <li style={{ fontSize: 10, opacity: 0.6 }}>None</li>}
              </ul>
              <div style={{ fontSize: 10, margin: '8px 0 4px' }}>Outbound ({outbound.length})</div>
              <ul style={sx.connectionList}>
                {outbound.map(e => {
                  const op = e.data?.operator || 'related';
                  const meta = getOperatorMeta(op);
                  return (
                    <li key={e.id} style={{ ...sx.connectionItem, alignItems: 'center', gap: 6 }} onClick={() => openEdgeEditor(e.id)} title={`Edit edge ${e.id}`}>
                      <span style={{ flex: 1 }}>{e.source} → {e.target}</span>
                      <span title={meta.description} style={{ fontSize: 10, border: '1px inset #C0C0C0', padding: '0 4px', background: '#E0E0E0' }}>{meta.icon} {meta.label}</span>
                    </li>
                  );
                })}
                {outbound.length === 0 && <li style={{ fontSize: 10, opacity: 0.6 }}>None</li>}
              </ul>
            </div>
            <div style={sx.section}>
              <div style={sx.sectionTitle}><span>Quick Actions</span></div>
              <button style={{ ...sx.btn, width: '100%' }} onClick={() => onDuplicate?.(node)}>Duplicate</button>
              <button style={{ ...sx.btn, width: '100%' }} onClick={() => onDelete?.(node)}>- Delete</button>
            </div>
          </div>
        </div>
        <div style={sx.footer}>
          <div style={{ marginRight: 'auto', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Esc to close</span>
          </div>
          <button style={sx.btn} onClick={onClose}>Cancel</button>
          <button style={{ ...sx.btn, ...sx.btnPrimary }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
