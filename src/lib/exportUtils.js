// Export utilities for Semantic-Logic AI Workflow Builder
// Supports JSON, Markdown, YAML, and XML formats for different integration needs

import { NODE_TYPES } from './ontology.js';

// JSON Export (Technical/API format)
export const exportWorkflowAsJSON = (workflow) => {
  const exportData = {
    ...workflow,
    exportMetadata: {
      format: 'json',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      description: 'Technical workflow data for API integration'
    }
  };
  
  return {
    content: JSON.stringify(exportData, null, 2),
    filename: `${workflow.metadata.title.replace(/\s+/g, '-').toLowerCase()}-workflow.json`,
    mimeType: 'application/json'
  };
};

// Markdown Export (Documentation format)
export const exportWorkflowAsMarkdown = (workflow) => {
  const { nodes, edges, metadata } = workflow;
  
  let content = `# ${metadata.title}\n\n`;
  content += `**Created:** ${new Date(metadata.createdAt).toLocaleDateString()}\n`;
  content += `**Description:** ${metadata.description || 'No description provided'}\n\n`;
  
  // Workflow Statistics
  const nodesByCluster = nodes.reduce((acc, node) => {
    const cluster = node.data?.metadata?.cluster || 'unknown';
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});
  
  content += `## Workflow Overview\n\n`;
  content += `- **Nodes:** ${nodes.length}\n`;
  content += `- **Connections:** ${edges.length}\n`;
  content += `- **Semantic Clusters:** ${Object.keys(nodesByCluster).length}\n\n`;
  
  // Cluster Summary
  content += `## Semantic Composition\n\n`;
  Object.entries(nodesByCluster).forEach(([cluster, count]) => {
    content += `- **${cluster}:** ${count} nodes\n`;
  });
  content += `\n`;
  
  // Node Details
  content += `## Workflow Nodes\n\n`;
  nodes.forEach((node, index) => {
    const nodeType = NODE_TYPES[node.data.type] || { label: 'Unknown', description: 'Unknown node type' };
    content += `### ${index + 1}. ${node.data.label} (${nodeType.label})\n\n`;
    content += `**Type:** \`${node.data.type}\`\n`;
    content += `**Cluster:** ${node.data.metadata?.cluster}\n`;
    if (node.data.content) {
      content += `**Content:**\n\n\`\`\`\n${node.data.content}\n\`\`\`\n\n`;
    }
    content += `**Description:** ${nodeType.description}\n\n`;
  });
  
  // Connections
  if (edges.length > 0) {
    content += `## Logical Connections\n\n`;
    edges.forEach((edge, index) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      content += `${index + 1}. **${sourceNode?.data.label}** → **${targetNode?.data.label}**\n`;
      content += `   - Relation: ${edge.data?.condition || 'follows'}\n\n`;
    });
  }
  
  content += `---\n*Exported from Semantic-Logic AI Workflow Builder*\n`;
  
  return {
    content,
    filename: `${workflow.metadata.title.replace(/\s+/g, '-').toLowerCase()}-workflow.md`,
    mimeType: 'text/markdown'
  };
};

// YAML Export (Configuration format)
export const exportWorkflowAsYAML = (workflow) => {
  const yamlData = {
    workflow: {
      metadata: {
        title: workflow.metadata.title,
        description: workflow.metadata.description,
        created: workflow.metadata.createdAt,
        version: workflow.version
      },
      nodes: workflow.nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        cluster: node.data.metadata?.cluster,
        content: node.data.content || null,
        position: node.position
      })),
      edges: workflow.edges.map(edge => ({
        from: edge.source,
        to: edge.target,
        relation: edge.data?.condition || 'follows'
      }))
    }
  };
  
  // Simple YAML serialization (basic implementation)
  const yamlContent = `# Semantic Logic Workflow Configuration
# ${workflow.metadata.title}

workflow:
  metadata:
    title: "${yamlData.workflow.metadata.title}"
    description: "${yamlData.workflow.metadata.description || ''}"
    created: "${yamlData.workflow.metadata.created}"
    version: "${yamlData.workflow.metadata.version}"
  
  nodes:
${yamlData.workflow.nodes.map(node => `    - id: "${node.id}"
      type: "${node.type}"
      label: "${node.label}"
      cluster: "${node.cluster}"
      content: ${node.content ? `"${node.content.replace(/"/g, '\\"')}"` : 'null'}
      position:
        x: ${node.position.x}
        y: ${node.position.y}`).join('\n\n')}

  edges:
${yamlData.workflow.edges.map(edge => `    - from: "${edge.from}"
      to: "${edge.to}"
      relation: "${edge.relation}"`).join('\n')}
`;

  return {
    content: yamlContent,
    filename: `${workflow.metadata.title.replace(/\s+/g, '-').toLowerCase()}-workflow.yml`,
    mimeType: 'application/x-yaml'
  };
};

// XML Export (Enterprise/Legacy format)
export const exportWorkflowAsXML = (workflow) => {
  const escapeXml = (str) => {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
  };
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<semanticWorkflow version="${workflow.version}" xmlns="http://semantic-logic-ai.com/workflow/v1">
  <metadata>
    <title>${escapeXml(workflow.metadata.title)}</title>
    <description>${escapeXml(workflow.metadata.description || '')}</description>
    <created>${workflow.metadata.createdAt}</created>
    <updated>${workflow.metadata.updatedAt}</updated>
  </metadata>
  
  <nodes count="${workflow.nodes.length}">
`;

  workflow.nodes.forEach(node => {
    xml += `    <node id="${node.id}" type="${node.data.type}" cluster="${node.data.metadata?.cluster}">
      <label>${escapeXml(node.data.label)}</label>
      <content>${escapeXml(node.data.content || '')}</content>
      <position x="${node.position.x}" y="${node.position.y}" />
      <metadata>
        <created>${node.data.metadata?.createdAt || ''}</created>
        <tags>${node.data.metadata?.tags?.join(',') || ''}</tags>
      </metadata>
    </node>
`;
  });

  xml += `  </nodes>
  
  <edges count="${workflow.edges.length}">
`;

  workflow.edges.forEach(edge => {
    xml += `    <edge id="${edge.id}" source="${edge.source}" target="${edge.target}">
      <relation>${edge.data?.condition || 'follows'}</relation>
    </edge>
`;
  });

  xml += `  </edges>
</semanticWorkflow>`;

  return {
    content: xml,
    filename: `${workflow.metadata.title.replace(/\s+/g, '-').toLowerCase()}-workflow.xml`,
    mimeType: 'application/xml'
  };
};

// Main export function that handles format selection
export const exportWorkflow = (workflow, format = 'json') => {
  switch (format.toLowerCase()) {
    case 'json':
      return exportWorkflowAsJSON(workflow);
    case 'markdown':
    case 'md':
      return exportWorkflowAsMarkdown(workflow);
    case 'yaml':
    case 'yml':
      return exportWorkflowAsYAML(workflow);
    case 'xml':
      return exportWorkflowAsXML(workflow);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
