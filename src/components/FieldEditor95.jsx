import React, { useState } from 'react';
import { Sparkles, Repeat } from 'lucide-react';
import { convertContent, detectFormat } from '@/lib/formatUtils';
import NodeEnhancementModal from './NodeEnhancementModal';

// Win95 look-and-feel helpers
const ui = {
	wrap: { background: '#FFF', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 6 },
	row: { display: 'grid', gridTemplateColumns: '120px 120px 1fr auto', gap: 6, alignItems: 'start', marginBottom: 6 },
	head: { background: '#000080', color: '#fff', padding: '3px 6px', fontWeight: 700, margin: '-6px -6px 6px -6px' },
	input: { padding: '4px 6px', border: '2px solid #808080', background: '#fff', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
	select: { padding: '4px 6px', border: '2px solid #808080', background: '#C0C0C0', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', fontSize: 12 },
	btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '2px 6px', cursor: 'pointer' },
	ta: { minHeight: 56, resize: 'vertical', width: '100%', padding: '6px 8px', border: '2px solid #808080', background: '#fff', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
	small: { fontSize: 10, opacity: 0.7 },
};

const FieldRow = ({ idx, field, onChange, onRemove }) => {
	const [aiOpen, setAiOpen] = useState(false);
	const fmt = field.type || detectFormat(field.value);

	const onConvert = (to) => {
		try {
			const converted = convertContent(field.value, fmt, to);
			onChange(idx, { ...field, value: converted, type: to });
		} catch (e) {
			// noop; conversion errors can be surfaced later via toast if desired
			console.error('convert failed', e);
		}
	};

	const onAiApply = (updatedNode) => {
		const content = updatedNode?.data?.content ?? '';
		onChange(idx, { ...field, value: content });
		setAiOpen(false);
	};

	return (
		<div style={ui.row}>
			<input
				aria-label={`Field ${idx} name`}
				value={field.name}
				onChange={(e)=>onChange(idx, { ...field, name: e.target.value })}
				placeholder="name"
				style={ui.input}
			/>
			<select
				aria-label={`Field ${idx} type`}
				value={field.type}
				onChange={(e)=>onChange(idx, { ...field, type: e.target.value })}
				style={ui.select}
			>
				{['text','markdown','json','yaml','xml','number','boolean'].map(t => (
					<option key={t} value={t}>{t}</option>
				))}
			</select>
			<div>
				{['json','yaml','xml','markdown','text'].includes(field.type) ? (
					<textarea
						aria-label={`Field ${idx} value`}
						value={field.value}
						onChange={(e)=>onChange(idx, { ...field, value: e.target.value })}
						placeholder="value"
						style={ui.ta}
					/>
				) : field.type === 'number' ? (
					<input type="number" value={field.value ?? ''} onChange={(e)=>onChange(idx, { ...field, value: e.target.value === '' ? '' : Number(e.target.value) })} style={ui.input} />
				) : field.type === 'boolean' ? (
					<select value={String(!!field.value)} onChange={(e)=>onChange(idx, { ...field, value: e.target.value === 'true' })} style={ui.select}>
						<option value="true">true</option>
						<option value="false">false</option>
					</select>
				) : (
					<input value={field.value ?? ''} onChange={(e)=>onChange(idx, { ...field, value: e.target.value })} style={ui.input} />
				)}
				<div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
					<span style={ui.small}>Convert:</span>
					{['text','markdown','json','yaml','xml'].filter(t => t !== field.type).map(t => (
						<button key={t} onClick={()=>onConvert(t)} title={`Convert to ${t}`} style={ui.btn}><Repeat size={12} /> {t}</button>
					))}
				</div>
			</div>
			<div style={{ display: 'grid', gap: 6 }}>
				<NodeEnhancementModal
					node={{ id: `field-${idx}`, data: { label: field.name || `Field ${idx+1}`, type: field.type || 'text', content: String(field.value ?? '') } }}
					onNodeUpdate={onAiApply}
					trigger={<button title="Enhance with AI" style={{ ...ui.btn, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Sparkles size={12} /> AI</button>}
				/>
				<button onClick={()=>onRemove(idx)} title="Remove field" style={ui.btn}>Remove</button>
			</div>
		</div>
	);
};

export default function FieldEditor95({ value, onChange }) {
	const [fields, setFields] = useState(() => Array.isArray(value) ? value : []);

	const push = () => {
		const next = [...fields, { name: '', type: 'text', value: '' }];
		setFields(next); onChange?.(next);
	};
	const remove = (idx) => {
		const next = fields.filter((_, i) => i !== idx);
		setFields(next); onChange?.(next);
	};
	const update = (idx, f) => {
		const next = fields.map((x, i) => (i === idx ? f : x));
		setFields(next); onChange?.(next);
	};

	return (
		<div style={ui.wrap}>
			<div style={ui.head}>Fields (Modular)</div>
			{fields.length === 0 && (
				<div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>No fields. Add one below.</div>
			)}
			{fields.map((f, i) => (
				<FieldRow key={i} idx={i} field={f} onChange={update} onRemove={remove} />
			))}
			<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
				<button onClick={push} style={ui.btn}>+ Add Field</button>
			</div>
		</div>
	);
}
