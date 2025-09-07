// Minimal node field model and contextual builder for Semantic Flow
// Keeps nodes as flat key→value maps (via existing data.fields array)
// and renders a context string in md/yaml/json/xml without a full compute layer.

import { detectFormat, toJSON, toYAML, toXML } from './formatUtils.js';

// Supported basic types for v1 (extend as needed)
// Field types are data types, not languages. Languages are per-node (serialization).
export const FIELD_TYPES = [
  'text',        // short text
  'longText',    // long/multiline text
  'number',
  'boolean',
  'enum',        // single select
  'multiEnum',   // multi select
  'date',
  'object',      // arbitrary JSON object (edited as JSON)
  'array',       // arbitrary JSON array (edited as JSON or CSV)
  'tags',        // array<string>
  'file',        // url list
  'fileFormat'   // special field to declare node's serialization: json, markdown, yaml, xml
];

// Normalize an array of { name,type,value } into a key→value record
export function fieldsToRecord(fields = []) {
  const rec = {};
  for (const f of fields) {
    if (!f || !f.name) continue;
    rec[f.name] = f.value ?? null;
  }
  return rec;
}

export function getFieldValue(fields = [], name, fallback = undefined) {
  const f = Array.isArray(fields) ? fields.find(x => x?.name === name) : null;
  return f ? (f.value ?? fallback) : fallback;
}

export function upsertField(fields = [], name, type = 'text', value = '') {
  const next = Array.isArray(fields) ? [...fields] : [];
  const idx = next.findIndex(f => f?.name === name);
  if (idx >= 0) next[idx] = { ...next[idx], name, type, value };
  else next.push({ name, type, value });
  return next;
}

// Lightweight validation: presence + primitive type sanity
export function validateFields(fields = []) {
  const errors = [];
  fields.forEach((f, i) => {
    if (!f?.name) errors.push(`Field[${i}] missing name`);
    if (!f?.type) errors.push(`Field[${i}] ${f?.name || ''} missing type`);
    if (f?.type && !FIELD_TYPES.includes(f.type)) {
      errors.push(`Field[${i}] ${f.name}: unsupported type '${f.type}'`);
    }
    // basic type checks
    if (f?.type === 'number' && f.value != null && typeof f.value !== 'number') {
      const n = Number(f.value);
      if (Number.isNaN(n)) errors.push(`Field[${i}] ${f.name} must be a number`);
    }
    if (f?.type === 'boolean' && f.value != null && typeof f.value !== 'boolean') {
      if (!['true','false',true,false].includes(f.value)) {
        errors.push(`Field[${i}] ${f.name} must be a boolean`);
      }
    }
    if (f?.type === 'enum' && f.options && Array.isArray(f.options) && f.value != null) {
      if (!f.options.includes(f.value)) errors.push(`Field[${i}] ${f.name} not in options`);
    }
    if (f?.type === 'multiEnum' && f.options && Array.isArray(f.options) && Array.isArray(f.value)) {
      const invalid = f.value.filter(v => !f.options.includes(v));
      if (invalid.length) errors.push(`Field[${i}] ${f.name} invalid values: ${invalid.join(', ')}`);
    }
    if (f?.type === 'object' && f.value != null && typeof f.value !== 'object') {
      try { JSON.parse(typeof f.value === 'string' ? f.value : String(f.value)); }
      catch { errors.push(`Field[${i}] ${f.name} must be a JSON object`); }
    }
    if (f?.type === 'array' && f.value != null && !Array.isArray(f.value)) {
      try {
        const arr = JSON.parse(typeof f.value === 'string' ? f.value : String(f.value));
        if (!Array.isArray(arr)) throw new Error('not array');
      } catch { errors.push(`Field[${i}] ${f.name} must be a JSON array`); }
    }
    if (f?.type === 'tags' && f.value != null && !Array.isArray(f.value)) {
      errors.push(`Field[${i}] ${f.name} must be an array of strings`);
    }
  });
  return { isValid: errors.length === 0, errors };
}

// Serialize fields into a string in the requested language
export function serializeFields(fields = [], language = 'markdown') {
  const rec = fieldsToRecord(fields);
  const lang = language || 'markdown';
  try {
    switch (lang) {
      case 'json': {
        const json = JSON.stringify(rec, null, 2);
        return json;
      }
      case 'yaml': {
        return toYAML(rec, 'json');
      }
      case 'xml': {
        // wrap record under <node> root for a stable XML
        const xml = toXML({ node: rec }, 'json');
        return xml;
      }
      case 'markdown':
      default: {
        // Simple markdown key/value list
        const lines = Object.entries(rec).map(([k, v]) => `- ${k}: ${formatValue(v)}`);
        return lines.join('\n');
      }
    }
  } catch (e) {
    // Fallback to JSON string if conversion fails
    try { return JSON.stringify(rec, null, 2); } catch { return String(rec); }
  }
}

function formatValue(v) {
  if (v == null) return 'null';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return '`' + JSON.stringify(v) + '`'; } catch { return String(v); }
}

// Build a full node context string from label/type/description + fields and freeform content
export function buildNodeContext(node, opts = {}) {
  const data = node?.data || {};
  const fields = Array.isArray(data.fields) ? data.fields : [];
  const all = fieldsToRecord(fields);
  // Core values come from fields as canonical; fall back to top-level mirrors
  const title = all.title ?? data.title ?? data.label ?? 'Node';
  const desc = all.description ?? data.description ?? data.metadata?.description ?? '';
  const freeform = String(all.content ?? data.content ?? '');
  const lang = (data.language || opts.language || detectFormat(freeform) || 'markdown');
  const header = `${title} (${data.type || node?.type || 'unknown'})`;
  // Exclude core keys from field serialization for display/context
  const customFields = fields.filter(f => !['title','tags','description','content','icon'].includes(f?.name));
  const fieldBlock = customFields.length ? serializeFields(customFields, lang) : '';

  // Compose per language for nicer formatting
  if (lang === 'markdown') {
    return [
      `# ${header}`,
      desc && `> ${desc}`,
      fields.length ? '## Fields' : '',
      fieldBlock,
      freeform && '## Notes',
      freeform,
    ].filter(Boolean).join('\n\n');
  }
  if (lang === 'yaml') {
    const payload = { header, description: desc || undefined, fields: fieldsToRecord(customFields), content: freeform || undefined };
    return serializeFields([
      { name: 'header', type: 'text', value: header },
      { name: 'description', type: 'text', value: desc || undefined },
      { name: 'fields', type: 'object', value: fieldsToRecord(customFields) },
      { name: 'content', type: 'longText', value: freeform || undefined },
    ], 'yaml');
  }
  if (lang === 'json') {
    const obj = { header, description: desc || undefined, fields: fieldsToRecord(customFields), content: freeform || undefined };
    return JSON.stringify(obj, null, 2);
  }
  if (lang === 'xml') {
    const obj = { node: { header, description: desc || undefined, fields: fieldsToRecord(customFields), content: freeform || undefined } };
    return toXML(obj, 'json');
  }
  // default plain text
  return [header, desc, fieldBlock, freeform].filter(Boolean).join('\n\n');
}

// Ontology helpers (lightweight). Always ensures a description field exists.
export function createOntology({ id, name, fields = [] }) {
  // Ontologies now only define custom fields. Core keys are top-level.
  return { id, name, fields: fields || [] };
}

export function instantiateNodeFromOntology(ontology, nodeBase = {}) {
  const initialFields = (ontology.fields || []).map(f => ({ name: f.key || f.name, type: normalizeType(f.type), value: f.default ?? '' }));
  return {
    ...nodeBase,
    data: {
      ...(nodeBase.data || {}),
      fields: initialFields,
      language: nodeBase.data?.language || 'markdown',
    }
  };
}

function normalizeType(t) {
  if (!t) return 'text';
  // map legacy language-like types to longText
  if (['markdown', 'yaml', 'xml', 'json'].includes(t)) return t === 'json' ? 'object' : 'longText';
  return FIELD_TYPES.includes(t) ? t : 'text';
}
