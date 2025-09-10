import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { Play } from "lucide-react";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import { fieldsToRecord } from '@/lib/nodeModel';

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

const SemanticNode95 = ({ id, data, isConnectable, selected }) => {
  const rec = fieldsToRecord(Array.isArray(data.fields) ? data.fields : []);
  const displayTitle = rec.title ?? data.title ?? data.label ?? 'Node';
  const displayTags = Array.isArray(rec.tags) ? rec.tags : (Array.isArray(data.tags) ? data.tags : (Array.isArray(data.metadata?.tags) ? data.metadata.tags : []));
  const displayDescription = rec.description ?? data.description ?? data.metadata?.description ?? '';
  const displayContent = rec.content ?? data.content ?? '';
  const displayIcon = rec.icon ?? NODE_TYPES[data.type]?.icon ?? '📦';

  const nodeType = NODE_TYPES[data.type];
  const clusterColor = CLUSTER_COLORS[data.metadata?.cluster] || '#6B7280';

  const handleExecute = () => {
    console.log(`Executing node ${id} of type ${data.type}`);
  };

  // No inline enhancement/conversion here; FieldEditor rows handle per-field AI

  const openModal = () => {
    try {
      window.dispatchEvent(new CustomEvent('node:openModal', { detail: { id } }));
    } catch {}
  };

  return (
  <div data-testid="semantic-node" onDoubleClick={openModal} style={{ ...styles.panel(selected), borderLeft: `4px solid ${clusterColor}`, cursor: 'move' }}>
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
          <div style={styles.headerTitle}>{displayTitle}</div>
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
          {/* Modal open hint button (optional for discoverability) */}
          <button
            style={styles.bevelBtn}
            onClick={openModal}
            aria-label="Open editor"
            title="Open Node Modal (double-click node)"
            onMouseDown={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtnPressed).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
            onMouseUp={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
            onMouseLeave={(e) => e.currentTarget.style.cssText = Object.entries(styles.bevelBtn).map(([k,v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}
          >
            •
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.metaRow}>
          <span style={styles.tag}>{data.type}</span>
          {(Array.isArray(displayTags) ? displayTags : []).slice(0, 3).map((t, i) => (
            <span key={i} style={styles.tag}>{t}</span>
          ))}
        </div>
        {/* Summary description / content snippet */}
        <div style={styles.description}>
          {(displayDescription || displayContent || NODE_TYPES[data.type]?.description) && (
            <span>{String.fromCodePoint(0x1F4A1)} {(displayDescription || (displayContent ? `${String(displayContent).slice(0,120)}${displayContent.length>120?'…':''}` : NODE_TYPES[data.type]?.description))}</span>
          )}
        </div>
        {Array.isArray(data.fields) && data.fields.length > 0 && (
          <div style={{ fontSize: 10, color: '#000080', background: '#E0E0FF', padding: '2px 4px', border: '1px outset #C0C0C0' }}>
            {String.fromCodePoint(0x1F4CB)} {data.fields.length} field{data.fields.length>1?'s':''}
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
