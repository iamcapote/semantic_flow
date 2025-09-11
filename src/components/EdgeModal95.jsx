import React, { useEffect, useMemo, useState } from 'react';
import { EDGE_CONDITIONS } from '@/lib/graphSchema';
import { EDGE_OPERATORS, DEFAULT_EDGE_OPERATOR, getOperatorMeta } from '@/lib/edges';

const sx = {
	overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40, zIndex: 1100 },
	window: { width: 520, maxWidth: '92%', maxHeight: 'calc(100vh - 80px)', background: '#C0C0C0', border: '2px solid #808080', boxShadow: '4px 4px 0 #000', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'MS Sans Serif, Tahoma, Arial, sans-serif' },
	title: { background: '#000080', color: '#fff', padding: '4px 8px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
	body: { padding: 10, display: 'grid', gap: 8 },
	section: { background: '#FFFFFF', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 8 },
	row: { display: 'grid', gap: 4, marginBottom: 6 },
	label: { fontSize: 11, fontWeight: 700 },
	input: { padding: '4px 6px', border: '2px solid #808080', background: '#fff', fontSize: 12 },
	select: { padding: '4px 6px', border: '2px solid #808080', background: '#fff', fontSize: 12 },
	footer: { padding: 8, display: 'flex', gap: 8, background: '#D0D0D0', borderTop: '2px solid #808080' },
	btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '4px 12px', cursor: 'pointer', fontSize: 12 },
	btnPrimary: { background: '#90EE90', border: '1px solid #2F6F2F', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000' }
};

export default function EdgeModal95({ edge, nodes, onUpdate, onClose }) {
	const [operator, setOperator] = useState(edge?.data?.operator || DEFAULT_EDGE_OPERATOR);
	const [condition, setCondition] = useState(edge?.data?.condition || 'follows');
	const [label, setLabel] = useState(edge?.data?.metadata?.label || '');
	const [weight, setWeight] = useState(typeof edge?.data?.weight === 'number' ? edge.data.weight : 1.0);

	const meta = getOperatorMeta(operator);
	const src = useMemo(() => nodes.find(n => n.id === edge?.source), [nodes, edge?.source]);
	const tgt = useMemo(() => nodes.find(n => n.id === edge?.target), [nodes, edge?.target]);

	useEffect(() => {
		const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	if (!edge) return null;

	const handleSave = () => {
		onUpdate?.(edge.id, {
			data: {
				...edge.data,
				operator,
				condition,
				weight,
				metadata: { ...(edge.data?.metadata || {}), label }
			},
			style: { ...(edge.style || {}), stroke: meta.color }
		});
		onClose?.();
	};

	return (
		<div style={sx.overlay}>
			<div style={sx.window} role="dialog" aria-modal="true" aria-label="Edit Edge">
				<div style={sx.title}>
					<span>Edge Editor — {src?.data?.label || edge.source} → {tgt?.data?.label || edge.target}</span>
					<button style={sx.btn} onClick={onClose}>×</button>
				</div>
				<div style={sx.body}>
					<div style={sx.section}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
							<span>{meta.icon}</span>
							<strong style={{ fontSize: 12 }}>{meta.label}</strong>
							<span style={{ fontSize: 10, color: '#374151' }}>— {meta.description}</span>
						</div>
						{/* Dial-up style mini-connection */}
						<div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: 6, background: '#F0F0F0', border: '1px inset #C0C0C0' }}>
							<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>({src?.data?.label || 'Prev'})</span>
							<span style={{ fontSize: 12 }}>[ {meta.label} ]</span>
							<span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>({tgt?.data?.label || 'Next'})</span>
						</div>
					</div>

					<div style={sx.section}>
						<div style={sx.row}>
							<label style={sx.label}>Operator</label>
							<select value={operator} onChange={(e)=>setOperator(e.target.value)} style={sx.select}>
								{Object.keys(EDGE_OPERATORS).map((key) => (
									<option key={key} value={key}>{EDGE_OPERATORS[key].icon} {EDGE_OPERATORS[key].label}</option>
								))}
							</select>
						</div>
						<div style={sx.row}>
							<label style={sx.label}>Condition (logic)</label>
							<select value={condition} onChange={(e)=>setCondition(e.target.value)} style={sx.select}>
								{Object.values(EDGE_CONDITIONS).map((c) => (
									<option key={c} value={c}>{c}</option>
								))}
							</select>
						</div>
						<div style={sx.row}>
							<label style={sx.label}>Label (override)</label>
							<input value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="Optional label" style={sx.input} />
						</div>
						<div style={sx.row}>
							<label style={sx.label}>Weight</label>
							<input type="number" step="0.1" min="0" max="1" value={weight} onChange={(e)=>setWeight(parseFloat(e.target.value)||0)} style={sx.input} />
						</div>
					</div>
				</div>
				<div style={sx.footer}>
					<div style={{ marginRight: 'auto', fontSize: 11 }}>Esc to close</div>
					<button style={sx.btn} onClick={onClose}>Cancel</button>
					<button style={{ ...sx.btn, ...sx.btnPrimary }} onClick={handleSave}>Save</button>
				</div>
			</div>
		</div>
	);
}

