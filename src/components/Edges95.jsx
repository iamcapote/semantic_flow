import React from 'react';
import { BaseEdge, getBezierPath } from 'reactflow';
import { getOperatorMeta } from '@/lib/edges';

export function SemanticEdge95({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const op = data?.operator || 'related';
  const meta = getOperatorMeta(op);
  const label = data?.metadata?.label || meta.label;
  const color = (data?.style?.stroke) || meta.color;

  const onClick = (e) => {
    e.stopPropagation();
    try { window.dispatchEvent(new CustomEvent('edge:openModal', { detail: { id } })); } catch {}
  };

  return (
    <g>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: 2, ...(style||{}) }} />
      <foreignObject x={labelX - 60} y={labelY - 12} width={120} height={24} requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility">
        <div title={`${meta.label} — ${meta.description}`} onClick={onClick} style={{ cursor: 'pointer', pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#C0C0C0', border: '1px solid #000', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', fontFamily: 'MS Sans Serif, Tahoma, Arial, sans-serif', fontSize: 10, padding: '2px 6px', color: '#000' }}>
          <span aria-hidden>{meta.icon}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 92 }}>{label}</span>
        </div>
      </foreignObject>
    </g>
  );
}

export const edgeTypes95 = {
  semantic95: SemanticEdge95,
};
