// @ts-nocheck
import React, { useState, useMemo } from 'react';

// Raw imports of documentation markdown (Vite ?raw)
import readme from '../../docs/README.md?raw';
import gettingStarted from '../../docs/getting-started.md?raw';
import pagesOverview from '../../docs/pages/overview.md?raw';
import featText2Wf from '../../docs/features/text-to-workflow.md?raw';
import featExec from '../../docs/features/workflow-execution.md?raw';
import featEnhance from '../../docs/features/node-enhancement.md?raw';
import archOverview from '../../docs/architecture/overview.md?raw';
import archExecSeq from '../../docs/architecture/execution-sequence.md?raw';
import ontologyOverview from '../../docs/ontology/overview.md?raw';
import ontologyNodeContext from '../../docs/ontology/node-context.md?raw';
import providersDoc from '../../docs/providers.md?raw';
import executionDoc from '../../docs/execution.md?raw';
import exportImportDoc from '../../docs/export-import.md?raw';
import securityDoc from '../../docs/security.md?raw';
import faqDoc from '../../docs/faq.md?raw';

// Minimal, safe-ish markdown to HTML converter for internal docs (headings, code, lists, emphasis)
function mdToHtml(md) {
  if (!md) return '';
  const esc = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Code fences first
  let html = esc(md)
    .replace(/```([\s\S]*?)```/g, (m, p1) => `<pre class="code-block"><code>${p1.replace(/\n/g, '\n')}</code></pre>`);
  // Headings
  html = html.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
    .replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
    .replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s?(.*)$/gm, '<h1>$1</h1>');
  // Bold / italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
             .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Lists (unordered)
  html = html.replace(/(^|\n)\-\s+(.+)/g, (m, p1, p2) => `${p1}<li>${p2}</li>`)
             .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  // Ordered lists (simple)
  html = html.replace(/(^|\n)\d+\.\s+(.+)/g, (m, p1, p2) => `${p1}<li>${p2}</li>`)
             .replace(/(<li>.*<\/li>\n?)+/g, (m) => m.includes('<ul>') ? m : `<ul>${m}</ul>`);
  // Paragraphs: split by double newline
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = `<p>${html}</p>`
    .replace(/<p>(\s|<\/p>)*<\/p>/g, '') // remove empty
    .replace(/<p><h(\d)>/g, '<h$1>')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>');
  return html;
}

const DOC_TREE = [
  { id: 'intro', label: 'Overview', file: readme },
  { id: 'getting-started', label: 'Getting Started', file: gettingStarted },
  { id: 'pages', label: 'Pages', children: [
    { id: 'pages-overview', label: 'Pages Overview', file: pagesOverview },
  ]},
  { id: 'features', label: 'Features', children: [
    { id: 'feature-text2wf', label: 'Text → Workflow', file: featText2Wf },
    { id: 'feature-execution', label: 'Workflow Execution', file: featExec },
    { id: 'feature-node-enhance', label: 'Node Enhancement', file: featEnhance },
  ]},
  { id: 'architecture', label: 'Architecture', children: [
    { id: 'arch-overview', label: 'Overview', file: archOverview },
    { id: 'arch-exec-seq', label: 'Execution Sequence', file: archExecSeq },
  ]},
  { id: 'ontology', label: 'Ontology', children: [
    { id: 'ontology-overview', label: 'Overview', file: ontologyOverview },
    { id: 'ontology-node-context', label: 'Node Context', file: ontologyNodeContext },
  ]},
  { id: 'providers', label: 'Providers', file: providersDoc },
  { id: 'runtime-execution', label: 'Runtime Execution', file: executionDoc },
  { id: 'export-import', label: 'Export / Import', file: exportImportDoc },
  { id: 'security', label: 'Security', file: securityDoc },
  { id: 'faq', label: 'FAQ', file: faqDoc },
];

function flatten(tree) {
  const out = [];
  tree.forEach(node => {
    if (node.children) {
      out.push({ id: node.id, label: node.label, group: true });
      node.children.forEach(c => out.push(c));
    } else out.push(node);
  });
  return out;
}

export default function DocsPanel95({ styleVariant = 'win95' }) {
  const [activeId, setActiveId] = useState('getting-started');
  const [query, setQuery] = useState('');

  const flat = useMemo(() => flatten(DOC_TREE), []);
  const activeDoc = flat.find(d => d.id === activeId && d.file)?.file || gettingStarted;
  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOC_TREE;
    // Filter preserving group structure
    return DOC_TREE.map(group => {
      if (group.children) {
        const kids = group.children.filter(c => c.label.toLowerCase().includes(q));
        if (group.label.toLowerCase().includes(q) || kids.length) {
          return { ...group, children: kids };
        }
        return null;
      }
      return group.label.toLowerCase().includes(q) ? group : null;
    }).filter(Boolean);
  }, [query]);

  const bevel = {
    out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
    in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
  };

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3" id="docs-browser">
  <aside className={`h-full bg-[#1f1f2a] text-white ${bevel.out} border-2 flex flex-col`}>
    <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold" style={{ background:'#000080' }}>
          <span>Documentation</span>
        </div>
  <div className="p-2">
          <input
            placeholder="Filter..."
            value={query}
            onChange={e => setQuery(e.target.value)}
    className={`w-full text-xs px-2 py-1 mb-2 outline-none ${bevel.in} border-2 bg-white text-black`}
          />
      <nav className="space-y-2 pr-1 text-sm">
            {filteredTree.map(item => item.children ? (
              <div key={item.id}>
        <div className="font-bold text-[11px] text-[#d0d8ff] uppercase tracking-wide mt-2 mb-1">{item.label}</div>
                <div className="space-y-1">
                  {item.children.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
          className={`block w-full text-left px-2 py-1 text-[12px] transition-colors hover:bg-[#263d8b] hover:text-white ${activeId===c.id ? 'bg-[#000080] text-white' : 'bg-[#303548] text-[#f0f4ff]'} ${bevel.in} border-2`}
                    >{c.label}</button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => !item.group && setActiveId(item.id)}
                disabled={item.group}
        className={`block w-full text-left px-2 py-1 text-[12px] ${item.group ? 'cursor-default opacity-60 font-bold uppercase text-[#d0d8ff]' : 'transition-colors hover:bg-[#263d8b] hover:text-white'} ${activeId===item.id ? 'bg-[#000080] text-white' : 'bg-[#303548] text-[#f0f4ff]'} ${bevel.in} border-2`}
              >{item.label}</button>
            ))}
          </nav>
        </div>
      </aside>
      <div className={`bg-[#cfcfcf] ${bevel.out} border-2 flex flex-col`}>
        <header className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-white" style={{ background:'#000080' }}>
          <span>{flat.find(f => f.id === activeId)?.label || 'Document'}</span>
          <span className="opacity-60">Semantic Flow Docs</span>
        </header>
        <div className={`flex-1 m-2 p-3 overflow-auto bg-white text-sm leading-6 ${bevel.in} border-2 docs-body`}>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: mdToHtml(activeDoc) }}
          />
        </div>
      </div>
    </div>
  );
}
