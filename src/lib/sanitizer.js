// Centralized sanitizer utilities for workflows and nodes
// Reuses existing strip logic and provides format-safe serialization
import { serializeFields, fieldsToRecord } from './nodeModel.js';

export function cleanObject(obj) {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(cleanObject).filter(v => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0) && !(typeof v === 'object' && v && Object.keys(v).length === 0));
  if (typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      const v = cleanObject(obj[k]);
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;
      if (Array.isArray(v) && v.length === 0) continue;
      if (typeof v === 'object' && Object.keys(v).length === 0) continue;
      out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return obj;
}

export function stripWorkflow(workflow) {
  if (!workflow) return null;
  const meta = workflow.metadata || {};
  const header = cleanObject({ title: meta.title, description: meta.description, tags: meta.tags });

  const nodes = (workflow.nodes || []).map(node => {
    const d = node.data || {};
    // convert fields array to map excluding promoted core fields
    let fieldMap = {};
    if (Array.isArray(d.fields)) {
      for (const f of d.fields) {
        if (!f || !f.name) continue;
        if (f.value === undefined || f.value === null) continue;
        if (typeof f.value === 'string' && f.value.trim() === '') continue;
        if (['title','description','tags','content','icon','fileFormat'].includes(f.name)) continue;
        fieldMap[f.name] = f.value;
      }
    }
    if (!Object.keys(fieldMap).length) fieldMap = undefined;
    return cleanObject({
      title: d.title || d.label,
      description: d.description || d.metadata?.description,
      tags: d.tags || d.metadata?.tags,
      ontology: d['ontology-type'] || d.type,
      icon: d.icon,
      content: d.content,
      fileFormat: d.fileFormat || d.language || undefined,
      fields: fieldMap,
    });
  }).filter(Boolean);

  return cleanObject({ ...header, nodes });
}

// Ensure node content is safe for AI by serializing node's fields and respecting declared fileFormat
export function serializeNodeForAI(node) {
  if (!node || !node.data) return '';
  const d = node.data;
  const fields = Array.isArray(d.fields) ? d.fields : [];
  const fileFormat = (d.fileFormat || d.language || 'markdown').toLowerCase();

  // If fileFormat is xml, ensure content is wrapped and no executable code present (we only return text)
  try {
    switch (fileFormat) {
      case 'json':
        return JSON.stringify(fieldsToRecord(fields), null, 2);
      case 'yaml':
      case 'yml':
        return serializeFields(fields, 'yaml');
      case 'xml':
        // Return safe XML serialization (fields under <node>)
        return serializeFields(fields, 'xml');
      case 'markdown':
      default:
        return serializeFields(fields, 'markdown');
    }
  } catch (e) {
    return JSON.stringify(fieldsToRecord(fields));
  }
}

export default {
  cleanObject,
  stripWorkflow,
  serializeNodeForAI
};
