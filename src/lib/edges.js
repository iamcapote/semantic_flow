// Semantic Edge Operators and UI metadata
// Default operator represents a generic relation between nodes

export const DEFAULT_EDGE_OPERATOR = 'related';

export const EDGE_OPERATORS = {
  related: {
    label: 'Related',
    description: 'Generic semantic relation between nodes.',
    color: '#3b82f6',
    icon: '🔗'
  },
  connected: {
    label: 'Connected',
    description: 'Nodes are connected in the workflow or ontology.',
    color: '#2563eb',
    icon: '🪢'
  },
  summarization: { label: 'Summarization', description: 'Captures or summarizes information.', color: '#64748B', icon: '📝' },
  clustering:   { label: 'Clustering',   description: 'Groups similar items or concepts.', color: '#a855f7', icon: '🧩' },
  chronology:   { label: 'Chronology',   description: 'Orders events by time.', color: '#22c55e', icon: '⏱️' },
  causality:    { label: 'Causality',    description: 'Cause-effect relationship.', color: '#ef4444', icon: '⚡' },
  anomalies:    { label: 'Anomalies',    description: 'Detects outliers or anomalies.', color: '#f97316', icon: '🧨' },
  forecasting:  { label: 'Forecasting',  description: 'Predicts future values.', color: '#0ea5e9', icon: '📈' },
  visualization:{ label: 'Visualization',description: 'Represents via charts/graphs.', color: '#14b8a6', icon: '📊' },
  correlation:  { label: 'Correlation',  description: 'Statistical correlation.', color: '#06b6d4', icon: '🔬' },
  outlining:    { label: 'Outlining',    description: 'Creates outline structure.', color: '#10b981', icon: '🧾' },
  arithmetic:   { label: 'Arithmetic',   description: 'Performs calculations.', color: '#71717a', icon: '➗' },
  filtering:    { label: 'Filtering',    description: 'Filters data by criteria.', color: '#22c55e', icon: '🧹' },
  tagging:      { label: 'Tagging',      description: 'Assigns tags/labels.', color: '#f59e0b', icon: '🏷️' },
  validation:   { label: 'Validation',   description: 'Validates content/logic.', color: '#84cc16', icon: '✅' },
  annotation:   { label: 'Annotation',   description: 'Adds notes/annotations.', color: '#f43f5e', icon: '🗒️' },
  indexing:     { label: 'Indexing',     description: 'Indexes content.', color: '#6b7280', icon: '🗂️' },
  extraction:   { label: 'Extraction',   description: 'Extracts entities or info.', color: '#8b5cf6', icon: '🧵' },
  sorting:      { label: 'Sorting',      description: 'Sorts data.', color: '#6366f1', icon: '🔢' },
  merging:      { label: 'Merging',      description: 'Merges streams or sets.', color: '#0ea5e9', icon: '🧬' },
  normalization:{ label: 'Normalization',description: 'Normalizes/standardizes.', color: '#0891b2', icon: '🧰' },
  hierarchy:    { label: 'Hierarchy',    description: 'Parent-child structure.', color: '#ef4444', icon: '🌲' }
};

export const getOperatorMeta = (op) => EDGE_OPERATORS[op] || EDGE_OPERATORS[DEFAULT_EDGE_OPERATOR];
