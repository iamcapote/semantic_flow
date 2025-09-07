import React, { useMemo, useState } from 'react';
import { Layers, Eye, Download } from 'lucide-react';
import { stripWorkflow } from '@/lib/sanitizer';


const ChatWorkflowPanel = ({ workflow, onCopy, onSelectionChange }) => {
	const stripped = useMemo(() => stripWorkflow(workflow), [workflow]);
	const [selected, setSelected] = useState('full');
	const handleSelect = (type) => {
		setSelected(type);
		if (type === 'full') {
			onCopy(JSON.stringify(workflow, null, 2));
		} else {
			onCopy(JSON.stringify(stripped, null, 2));
		}
		if (onSelectionChange) onSelectionChange(type);
	};
	const selectedData = selected === 'full' ? workflow : stripped;
	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2 flex-wrap">
				<button
					type="button"
					onClick={() => handleSelect('full')}
					disabled={!workflow}
					className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] border-2 flex items-center gap-1 ${selected === 'full' ? 'border-blue-500 bg-blue-50' : ''}`}
				>
					<Layers className="w-3 h-3" />Full Workflow
				</button>
				<button
					type="button"
					onClick={() => handleSelect('stripped')}
					disabled={!stripped}
					className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] border-2 flex items-center gap-1 ${selected === 'stripped' ? 'border-blue-500 bg-blue-50' : ''}`}
				>
					<Eye className="w-3 h-3" />Stripped Workflow
				</button>
			</div>
			<div className="text-[10px] opacity-70 leading-4">Full = everything. Stripped = minimal semantic corpus (title, description, tags, ontology, content, icon, distilled fields, nodes only).</div>
			<div className="bg-white border mt-2 p-1 text-[10px] max-h-40 overflow-auto whitespace-pre" aria-label="Selected workflow preview">
				{selectedData ? JSON.stringify(selectedData, null, 2) : 'No workflow loaded.'}
			</div>
		</div>
	);
};

export default ChatWorkflowPanel;
