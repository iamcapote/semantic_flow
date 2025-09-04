import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, Play, Sparkles } from "lucide-react";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import NodeEnhancementModal from './NodeEnhancementModal';
import FieldEditor95 from './FieldEditor95';
import { convertContent, detectFormat } from '@/lib/formatUtils';
import { serializeFields, fieldsToRecord } from '@/lib/nodeModel';

const styles = {
  panel: (selected) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    minWidth: 280,
    minHeight: 180,
    background: '#C0C0C0',
    border: '2px outset #C0C0C0',
    boxShadow: selected ? '0 0 0 2px #FF69B4, 2px 2px 4px rgba(0,0,0,0.3)' : '2px 2px 4px rgba(0,0,0,0.3)',
    fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif',
    fontSize: '11px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }),
  header: { 
    background: 'linear-gradient(90deg, #000080 0%, #0000FF 100%)', 
    color: '#FFFFFF', 
    padding: '3px 6px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottom: '1px solid #404040',
    minHeight: '18px'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 },
  headerTitle: { 
    fontSize: '11px', 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1
  },
  body: {
    padding: '8px',
    background: '#E8E8E8',
    flex: 1, 
    overflow: 'auto',
    borderTop: '1px inset #C0C0C0'
  },
  bevelBtn: { 
    background: '#C0C0C0', 
    border: '1px outset #C0C0C0', 
    height: '16px', 
    width: '16px', 
    display: 'inline-flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer',
    fontSize: '10px',
    boxShadow: 'inset -1px -1px 0 #808080, inset 1px 1px 0 #FFFFFF'
  },
  bevelBtnPressed: {
    background: '#C0C0C0', 
    border: '1px inset #C0C0C0', 
    height: '16px', 
    width: '16px', 
    display: 'inline-flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer',
    fontSize: '10px',
    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
  },
  tag: { 
    fontSize: '9px', 
    border: '1px inset #C0C0C0', 
    padding: '1px 4px', 
    background: '#E0E0E0', 
    marginRight: 4,
    color: '#000080'
  },
  metaRow: { 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: 4, 
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: '1px solid #D0D0D0'
  },
  status: { 
    marginTop: 8, 
    paddingTop: 6, 
    borderTop: '1px inset #C0C0C0', 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontSize: '10px', 
    color: '#000080',
    background: '#F8F8F8',
    padding: '4px 6px',
    borderRadius: '2px'
  },
  description: {
    fontSize: '10px',
    color: '#111827',
    fontStyle: 'italic',
    marginBottom: 6,
    padding: '4px 6px',
    background: '#FFF',
    border: '1px inset #E0E0E0',
    borderRadius: '0px'
  },
  contentArea: {
    minHeight: '60px',
    marginTop: 4
  },
  editingArea: {
    background: '#FFFFFF',
    border: '1px inset #C0C0C0',
    padding: '6px',
    borderRadius: '0px',
    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
  },
  smallLabel: {
    fontSize: '9px',
    color: '#4B5563',
    marginRight: 4,
    opacity: 0.9,
    fontWeight: 'bold'
  }
};

const SemanticNode95 = ({ id, data, isConnectable, selected, onNodeUpdate }) => {
  const [isEditing, setIsEditing] = useState(!!data.isNew);
  const [fields, setFields] = useState(Array.isArray(data.fields) ? data.fields : []);
  const rec = fieldsToRecord(fields);
  const displayTitle = rec.title ?? data.title ?? data.label ?? 'Node';
  const displayTags = Array.isArray(rec.tags) ? rec.tags : (Array.isArray(data.tags) ? data.tags : (Array.isArray(data.metadata?.tags) ? data.metadata.tags : []));
  const displayDescription = rec.description ?? data.description ?? data.metadata?.description ?? '';
  const displayContent = rec.content ?? data.content ?? '';
  const displayIcon = rec.icon ?? NODE_TYPES[data.type]?.icon ?? '📦';
  const [editTitle, setEditTitle] = useState(String(displayTitle || ''));
  const [editTags, setEditTags] = useState(Array.isArray(displayTags) ? displayTags : []);
  const [editDescription, setEditDescription] = useState(String(displayDescription || ''));
  const [editContent, setEditContent] = useState(displayContent || '');
  const [editIcon, setEditIcon] = useState(String(displayIcon || ''));
  const isBlankNode = data.type === 'UTIL-BLANK';
  const [editType, setEditType] = useState(data.type);
  const [contentFormat, setContentFormat] = useState(data.language || detectFormat(editContent || ''));

  const nodeType = NODE_TYPES[data.type];
  const clusterColor = CLUSTER_COLORS[data.metadata?.cluster] || '#6B7280';

  const handleSaveEdit = () => {
    data.title = editTitle;
    data.label = editTitle; // mirror for display
    data.tags = editTags;
    data.metadata.tags = editTags; // mirror for compatibility
    data.description = editDescription;
    data.content = editContent;
    data.language = contentFormat;
    // keep array-of-fields authoritative for core keys
    const upsert = (name, type, value) => {
      const idx = fields.findIndex(f => f?.name === name);
      const next = { name, type, value };
      if (idx >= 0) fields[idx] = next; else fields.push(next);
    };
    upsert('title','text', editTitle);
    upsert('tags','tags', editTags);
    upsert('description','longText', editDescription);
    upsert('content','longText', editContent);
    upsert('icon','text', editIcon || displayIcon);
    if (isBlankNode) {
      data.type = editType;
    }
    data.metadata.updatedAt = new Date().toISOString();
    delete data.isNew;
    setIsEditing(false);
    const patch = { title: editTitle, label: editTitle, tags: editTags, description: editDescription, content: editContent, language: contentFormat, fields: [...fields], ...(isBlankNode && { type: editType }) };
    if (typeof data._onUpdate === 'function') data._onUpdate(id, patch);
    else if (onNodeUpdate) onNodeUpdate(id, patch);
  };

  const handleCancelEdit = () => {
    setEditTitle(displayTitle || '');
    setEditTags(Array.isArray(displayTags) ? displayTags : []);
    setEditDescription(displayDescription || '');
    setEditContent(displayContent || '');
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
      <NodeResizer
        color={clusterColor}
        minWidth={280}
        minHeight={180}
        handleStyle={{ 
          width: 10, 
          height: 10, 
          borderRadius: 0,
          background: '#C0C0C0',
          border: '1px outset #C0C0C0'
        }}
        lineStyle={{ 
          strokeWidth: 1,
          stroke: '#808080'
        }}
      />
      <Handle type="target" position={Position.Left} style={{ background: clusterColor, width: 12, height: 12, left: -6 }} isConnectable={isConnectable} />

      <div style={styles.header}>
          <div style={styles.headerLeft}>
          <span style={{ fontSize: 14, marginRight: 4 }}>{displayIcon}</span>
          <div style={{ width: 8, height: 8, background: clusterColor, border: '1px solid #FFFFFF' }} />
          <div style={styles.headerTitle}>
            {isEditing ? (
              <div style={{ display: 'grid', gap: 2 }}>
                <div style={styles.smallLabel}>Title</div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e)=>setEditTitle(e.target.value)}
                  placeholder="Title"
                  style={{
                    width: '100%',
                    padding: '2px 4px',
                    border: '1px inset #C0C0C0',
                    background: '#FFFFFF',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '11px',
                    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                  }}
                />
              </div>
            ) : (
              displayTitle
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {data.config?.isExecutable && (
            <button 
              style={styles.bevelBtn} 
              onClick={handleExecute} 
              aria-label="Execute"
              onMouseDown={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtnPressed).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
              onMouseUp={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
              onMouseLeave={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
            >
              <Play size={10} />
            </button>
          )}
          <button 
            style={isEditing ? styles.bevelBtnPressed : styles.bevelBtn} 
            onClick={() => setIsEditing(!isEditing)} 
            aria-label="Edit"
            onMouseDown={(e) => !isEditing && (e.currentTarget.style.cssText = Object.entries(styles.bevelBtnPressed).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; '))}
            onMouseUp={(e) => !isEditing && (e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; '))}
            onMouseLeave={(e) => !isEditing && (e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; '))}
          >
            <Edit3 size={10} />
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.metaRow}>
          <span style={styles.tag}>{data.type}</span>
          {isEditing ? (
            <div style={{ display: 'grid', gap: 2, minWidth: 160 }}>
              <div style={styles.smallLabel}>Tags</div>
              <input
                type="text"
                value={Array.isArray(editTags) ? editTags.join(', ') : ''}
                onChange={(e)=>setEditTags(e.target.value.split(',').map(t=>t.trim()).filter(Boolean))}
                placeholder="tag1, tag2"
                style={{ 
                  padding: '2px 4px', 
                  border: '1px inset #C0C0C0', 
                  background: '#FFFFFF',
                  fontFamily: '"MS Sans Serif", sans-serif',
                  fontSize: '11px',
                  boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                }}
              />
            </div>
          ) : (
            (Array.isArray(displayTags) ? displayTags : []).slice(0, 3).map((t, i) => (
              <span key={i} style={styles.tag}>{t}</span>
            ))
          )}
        </div>

        {/* Inline description with Win95 styling */}
        <div style={styles.description}>
          {isEditing ? (
            <div style={{ display: 'grid', gap: 2 }}>
              <div style={styles.smallLabel}>Description</div>
              <Textarea
                value={editDescription}
                onChange={(e)=>setEditDescription(e.target.value)}
                placeholder="Description"
                className="w-full resize-y"
                style={{ 
                  fontSize: '10px',
                  fontFamily: '"MS Sans Serif", sans-serif',
                  background: '#FFFFFF',
                  color: '#000000',
                  border: '1px inset #C0C0C0',
                  padding: '6px',
                  boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                }}
              />
            </div>
          ) : (
            (displayDescription || nodeType?.description) && (
              <span>{String.fromCodePoint(0x1F4A1)} {displayDescription || nodeType?.description}</span>
            )
          )}
        </div>

        {isEditing ? (
          <div style={styles.editingArea}>
            {isBlankNode && (
              <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
                <input 
                  type="text" 
                  value={editType} 
                  onChange={(e) => setEditType(e.target.value)} 
                  placeholder="Node type (e.g. UTIL-BLANK)" 
                  style={{ 
                    padding: '4px 6px', 
                    border: '1px inset #C0C0C0', 
                    background: '#FFFFFF',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '11px',
                    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                  }} 
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8, alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 10, color: '#000080', fontWeight: 'bold' }}>Icon</label>
                <input value={editIcon} onChange={(e)=>setEditIcon(e.target.value)} style={{ padding: '4px 6px', border: '1px inset #C0C0C0', background: '#FFF' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}>
              <div style={{ display: 'grid', gap: 2 }}>
                <div style={styles.smallLabel}>Content</div>
                <Textarea 
                  value={editContent} 
                  onChange={(e) => setEditContent(e.target.value)} 
                  placeholder="Enter node content..." 
                  className="w-full resize-y"
                  style={{ 
                    minHeight: '100px',
                    fontSize: '11px',
                    fontFamily: '"MS Sans Serif", Consolas, monospace',
                    background: '#FFFFFF',
                    color: '#000000',
                    border: '1px inset #C0C0C0',
                    padding: '6px',
                    resize: 'both',
                    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                  }} 
                />
              </div>
              <div style={{ display: 'grid', gap: 4 }}>
                <div style={{ fontSize: 10, textAlign: 'center', color: '#000080', fontWeight: 'bold' }}>Node Language</div>
                <select 
                  value={contentFormat} 
                  onChange={(e)=>handleConvertContent(e.target.value)} 
                  style={{ 
                    padding: '4px 6px', 
                    border: '1px inset #C0C0C0', 
                    background: '#C0C0C0',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '10px',
                    boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #FFFFFF'
                  }}
                >
                  {['markdown','json','yaml','xml'].map(f => (<option key={f} value={f}>{f}</option>))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <FieldEditor95 value={fields} onChange={setFields} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 8, paddingTop: 6, borderTop: '1px solid #D0D0D0' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <button 
                  onClick={handleCancelEdit} 
                  style={styles.bevelBtn} 
                  aria-label="Cancel"
                  onMouseDown={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtnPressed).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                  onMouseUp={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                  onMouseLeave={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                >
                  <X size={10} />
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  style={{...styles.bevelBtn, background: '#90EE90', border: '1px outset #90EE90'}} 
                  aria-label="Save"
                  onMouseDown={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtnPressed, background: '#90EE90', border: '1px inset #90EE90'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                  onMouseUp={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtn, background: '#90EE90', border: '1px outset #90EE90'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                  onMouseLeave={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtn, background: '#90EE90', border: '1px outset #90EE90'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                >
                  <Save size={10} />
                </button>
              </div>
              <NodeEnhancementModal
                node={{ id, data }}
                onNodeUpdate={handleNodeEnhancementUpdate}
                trigger={
                  <button 
                    style={{ ...styles.bevelBtn, width: 24, background: '#FFE4B5', border: '1px outset #FFE4B5' }} 
                    aria-label="Enhance"
                    onMouseDown={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtnPressed, width: 24, background: '#FFE4B5', border: '1px inset #FFE4B5'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                    onMouseUp={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtn, width: 24, background: '#FFE4B5', border: '1px outset #FFE4B5'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                    onMouseLeave={(e) => e.currentTarget.style.cssText = Object.entries({...styles.bevelBtn, width: 24, background: '#FFE4B5', border: '1px outset #FFE4B5'}).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
                  >
                    <Sparkles size={10} />
                  </button>
                }
              />
            </div>
          </div>
        ) : (
          <div style={styles.contentArea}>
      {displayContent ? (
              <div style={{ 
                fontSize: '11px', 
                color: '#000000', 
                whiteSpace: 'pre-wrap',
                background: '#FFFFFF',
                border: '1px inset #C0C0C0',
                padding: '6px',
                borderRadius: '2px',
                fontFamily: 'Consolas, "Courier New", monospace'
              }}>
        {displayContent}
              </div>
            ) : (
              <div style={{ 
                fontSize: '11px', 
                color: '#808080', 
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px',
                border: '1px dashed #C0C0C0'
              }}>
        {displayDescription || 'Double-click to edit...'}
              </div>
            )}
      {Array.isArray(data.fields) && data.fields.filter(f=>!['title','tags','description','content','icon'].includes(f?.name)).length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  marginBottom: 4, 
                  color: '#000080',
                  background: '#E0E0FF',
                  padding: '2px 4px',
                  border: '1px outset #C0C0C0'
                }}>
          {String.fromCodePoint(0x1F4CB)} Fields ({data.fields.filter(f=>!['title','tags','description','content','icon'].includes(f?.name)).length})
                </div>
                <pre style={{ margin: 0, fontSize: 10, background: '#FFFFFF', border: '1px inset #C0C0C0', padding: 6, whiteSpace: 'pre-wrap', fontFamily: 'Consolas, "Courier New", monospace' }}>
                  {(() => {
                    try {
            const custom = data.fields.filter(f=>!['title','tags','description','content','icon'].includes(f?.name));
            return serializeFields(custom, data.language || 'markdown');
                    } catch (e) {
            try { return JSON.stringify(Object.fromEntries((data.fields||[]).filter(f=>!['title','tags','description','content','icon'].includes(f?.name)).map(f=>[f.name,f.value])), null, 2); } catch { return ''; }
                    }
                  })()}
                </pre>
              </div>
            )}
          </div>
        )}

        {data.executionState && (
          <div style={styles.status}>
            <div style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background:
                data.executionState === 'completed' ? '#00FF00' :
                data.executionState === 'running' ? '#0000FF' :
                data.executionState === 'failed' ? '#FF0000' : '#808080',
              border: '1px solid #000000'
            }} />
            <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{data.executionState}</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: clusterColor, width: 12, height: 12, right: -6 }} isConnectable={isConnectable} />
    </div>
  );
};

export default memo(SemanticNode95);
