// Export format definitions for workflow data
// This file defines the available export formats and their configurations

export const EXPORT_FORMATS = {
  JSON: {
    id: 'json',
    name: 'JSON',
    description: 'Technical format for API integration',
    extension: '.json',
    mimeType: 'application/json',
    icon: '{}',
    category: 'technical'
  },
  MARKDOWN: {
    id: 'markdown',
    name: 'Markdown',
    description: 'Documentation format for sharing and collaboration',
    extension: '.md',
    mimeType: 'text/markdown',
    icon: 'M↓',
    category: 'documentation'
  },
  YAML: {
    id: 'yaml',
    name: 'YAML',
    description: 'Configuration format for DevOps and automation',
    extension: '.yml',
    mimeType: 'application/x-yaml',
    icon: 'Y:',
    category: 'configuration'
  },
  XML: {
    id: 'xml',
    name: 'XML',
    description: 'Enterprise format for system integration',
    extension: '.xml',
    mimeType: 'application/xml',
    icon: '<>',
    category: 'enterprise'
  },
  CSV: {
    id: 'csv',
    name: 'CSV',
    description: 'Spreadsheet format for data analysis',
    extension: '.csv',
    mimeType: 'text/csv',
    icon: '⚏',
    category: 'data'
  }
};

export const getFormatById = (id) => {
  return Object.values(EXPORT_FORMATS).find(format => format.id === id);
};

export const getFormatsByCategory = (category) => {
  return Object.values(EXPORT_FORMATS).filter(format => format.category === category);
};

export const getAllFormats = () => {
  return Object.values(EXPORT_FORMATS);
};

export const getDefaultFormat = () => {
  return EXPORT_FORMATS.JSON;
};
