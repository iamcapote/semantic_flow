// Content format helpers for nodes and IDE (JSON, YAML, XML, Markdown, Text)
import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export function detectFormat(value) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (typeof v !== 'string') return Array.isArray(v) || typeof v === 'object' ? 'json' : typeof v;
  if (v.startsWith('{') || v.startsWith('[')) return 'json';
  if (/^<\w+[\s\S]*>/.test(v)) return 'xml';
  if (/^[\-\w]+\s*:\s*/.test(v)) return 'yaml';
  if (/^#{1,6}\s+/.test(v)) return 'markdown';
  return 'text';
}

export function toJSON(value, from) {
  if (from === 'json') {
    if (typeof value === 'string') return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(value, null, 2);
  }
  if (from === 'yaml') {
    const obj = yaml.load(String(value));
    return JSON.stringify(obj, null, 2);
  }
  if (from === 'xml') {
    try {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
      const obj = parser.parse(String(value));
      return JSON.stringify(obj, null, 2);
    } catch {
      // fall back to string-wrapped JSON
      return JSON.stringify({ content: String(value) }, null, 2);
    }
  }
  // markdown/text -> wrap as JSON string
  return JSON.stringify({ content: String(value) }, null, 2);
}

export function toYAML(value, from) {
  if (from === 'yaml') return String(value);
  const jsonStr = from === 'json' ? (typeof value === 'string' ? value : JSON.stringify(value)) : toJSON(value, from);
  const obj = JSON.parse(jsonStr);
  return yaml.dump(obj, { noRefs: true });
}

export function toXML(value, from) {
  if (from === 'xml') return String(value);
  const jsonStr = from === 'json' ? (typeof value === 'string' ? value : JSON.stringify(value)) : toJSON(value, from);
  const obj = JSON.parse(jsonStr);
  const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true, indentBy: '  ' });
  return builder.build(obj);
}

export function toMarkdown(value, from) {
  if (from === 'markdown') return String(value);
  // Simple: serialize JSON/YAML/XML into fenced code blocks for now
  if (from === 'json') return '```json\n' + (typeof value === 'string' ? value : JSON.stringify(value, null, 2)) + '\n```';
  if (from === 'yaml') return '```yaml\n' + toYAML(value, 'yaml') + '\n```';
  if (from === 'xml') return '```xml\n' + toXML(value, 'xml') + '\n```';
  return String(value);
}

export function convertContent(value, from, to) {
  if (from === to) return String(value);
  switch (to) {
    case 'json': return toJSON(value, from);
    case 'yaml': return toYAML(value, from);
    case 'xml': return toXML(value, from);
    case 'markdown': return toMarkdown(value, from);
    case 'text': default: return String(value);
  }
}
