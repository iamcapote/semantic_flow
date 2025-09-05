// Pragmatic DSL for workflows: nodes/edges with attributes
// Format:
// # nodes
// Key title="Prompt" type="PROMPT" lang=markdown color=#FFCC00
// ...
// # edges
// A -> B

function esc(s = '') {
  return String(s).replace(/"/g, '\\"');
}

function parseAttrs(parts) {
  const data = {};
  for (const p of parts) {
    const m = p.match(/^([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4];
    data[key] = val;
  }
  return data;
}

export function stringifyDSL(nodes = [], edges = []) {
  const idFor = (n) => n.data?.key || n.key || n.id;
  const lines = ['# nodes'];
  for (const n of nodes) {
    const attrs = [];
    if (n.data?.title) attrs.push(`title="${esc(n.data.title)}"`);
    if (n.type) attrs.push(`type="${esc(n.type)}"`);
    if (n.data?.lang) attrs.push(`lang=${n.data.lang}`);
    if (n.data?.color) attrs.push(`color=${n.data.color}`);
    if (n.data?.bgColor) attrs.push(`bgColor=${n.data.bgColor}`);
    if (n.data?.tags && Array.isArray(n.data.tags) && n.data.tags.length) {
      attrs.push(`tags="${esc(n.data.tags.join(','))}"`);
    }
    const key = idFor(n);
    lines.push([key, ...attrs].join(' '));
  }
  lines.push('# edges');
  for (const e of edges) {
    lines.push(`${e.source} -> ${e.target}`);
  }
  return lines.join('\n');
}

export function parseDSL(text = '', opts = {}) {
  const makeId = opts.makeId || (() => Math.random().toString(36).slice(2, 10));
  const lines = text.split(/\r?\n/);
  let inEdges = false;
  const nodes = [];
  const edges = [];
  const keyToId = new Map();

  const posFor = (idx) => ({ x: 60 + 280 * (idx % 3), y: 100 + 160 * Math.floor(idx / 3) });

  for (const raw of lines) {
    const isHeader = /^#\s*(nodes|edges)\b/i.test(raw);
    if (isHeader) {
      inEdges = /edges/i.test(raw);
      continue;
    }
    const line = raw.replace(/^#.*$/, '').trim();
    if (!line) continue;

    if (!inEdges && !/->/.test(line)) {
      // node: Key k=v k="v" ...
      const parts = line.match(/([^\s]+)|([\w-]+\s*=\s*"[^"]*"|[\w-]+\s*=\s*'[^']*'|[\w-]+\s*=\s*[^\s]+)/g) || [];
      const key = parts.shift();
      const attrs = parseAttrs(parts);
      const id = makeId();
      keyToId.set(key, id);
      const idx = nodes.length;
      const node = {
        id,
        type: attrs.type || 'semantic',
        position: posFor(idx),
        data: {
          title: attrs.title || key,
          lang: attrs.lang || 'markdown',
          color: attrs.color,
          bgColor: attrs.bgColor,
          tags: attrs.tags ? String(attrs.tags).split(',').map((s) => s.trim()).filter(Boolean) : [],
          key,
        },
      };
      nodes.push(node);
    } else if (inEdges || /->/.test(line)) {
      const m = line.match(/^(.*?)\s*(?:\(([^\)]*)\))?\s*->\s*(.*)$/);
      if (!m) continue;
      const [, aKeyRaw, label, bKeyRaw] = m;
      const aKey = aKeyRaw.trim();
      const bKey = bKeyRaw.trim();
      const A = keyToId.get(aKey) || aKey;
      const B = keyToId.get(bKey) || bKey;
      edges.push({
        id: `e-${A}-${B}-${edges.length + 1}`,
        source: A,
        target: B,
        ...(label ? { label } : {}),
      });
    }
  }

  return { nodes, edges };
}
