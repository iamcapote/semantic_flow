import React, { useMemo, useState } from 'react';
import { getClusterSummary, getNodesByCluster, NODE_TYPES, ONTOLOGY_CLUSTERS } from '@/lib/ontology';

const win95 = {
  panel: { background:'#fff', border:'2px solid #808080', boxShadow:'2px 2px 0 #000', display:'flex', flexDirection:'column', minHeight:0 },
  head: { background:'#000080', color:'#fff', padding:'4px 6px', fontWeight:700 },
  body: { padding:6, overflow:'auto' },
  search: { width:'100%', padding:'6px 8px', border:'2px solid #808080', marginBottom:6 },
  sectionBtn: (active) => ({ width:'100%', textAlign:'left', padding:'6px 8px', background:'#C0C0C0', border:'1px solid #808080', boxShadow:'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', cursor:'pointer', marginBottom:4, ...(active ? { background:'#E6E6E6' } : {}) }),
  nodeItem: { display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #808080', padding:'6px', marginBottom:4, background:'#F6F6F6', cursor:'grab' },
  tag: { fontSize:10, border:'1px solid #808080', padding:'0 4px', background:'#EEE', marginLeft:4 },
};

export default function NodePalette95() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState({});

  const clusters = useMemo(() => getClusterSummary().sort((a,b)=>a.name.localeCompare(b.name)), []);

  const filtered = useMemo(() => {
    if (!query) return NODE_TYPES;
    const q = query.toLowerCase();
    return Object.fromEntries(
      Object.entries(NODE_TYPES).filter(([code, n]) =>
        code.toLowerCase().includes(q) ||
        (n.label||'').toLowerCase().includes(q) ||
        (n.description||'').toLowerCase().includes(q) ||
        (n.tags||[]).some(t => t.toLowerCase().includes(q))
      )
    );
  }, [query]);

  const onDragStart = (e, code) => {
    e.dataTransfer.setData('application/reactflow', code);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={win95.panel}>
      <div style={win95.head}>Node Palette (Win95+)</div>
      <div style={win95.body}>
        <input placeholder="Search nodes…" value={query} onChange={(e)=>setQuery(e.target.value)} style={win95.search} />
        {clusters.map((c) => {
          const list = getNodesByCluster(c.code).filter(n => filtered[n.code]);
          if (query && list.length === 0) return null;
          const isOpen = !!open[c.code];
          return (
            <div key={c.code}>
              <button style={win95.sectionBtn(isOpen)} onClick={()=>setOpen(o=>({ ...o, [c.code]: !o[c.code] }))}>
                {isOpen ? '▾' : '▸'} {ONTOLOGY_CLUSTERS[c.code]?.icon || '■'} {c.name} <span style={{ fontSize:11, marginLeft:6 }}>({list.length})</span>
              </button>
              {isOpen && (
                <div style={{ marginLeft:6 }}>
                  {list.sort((a,b)=>a.label.localeCompare(b.label)).map((n) => (
                    <div
                      key={n.code}
                      draggable
                      onDragStart={(e)=>onDragStart(e, n.code)}
                      title={n.description}
                      style={{ ...win95.nodeItem, borderColor: (c.color||'#808080') }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span>{n.icon || '□'}</span>
                        <span style={{ fontSize:12 }}>{n.label}</span>
                      </div>
                      <div style={{ display:'flex' }}>
                        {(n.tags||[]).slice(0,2).map((t,i)=>(<span key={i} style={win95.tag}>{t}</span>))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
