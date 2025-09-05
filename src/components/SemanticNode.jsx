import React, { memo, useState } from 'react';
import { Handle, Position, useStoreApi } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import '@reactflow/node-resizer/dist/style.css';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit3, Save, X, Play, Pause, Sparkles } from "lucide-react";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import NodeEnhancementModal from './NodeEnhancementModal95';

const SafeNodeResizer = (props) => {
  const isTest = typeof process !== 'undefined' && (process.env?.JEST_WORKER_ID || process.env?.NODE_ENV === 'test');
  if (isTest) return null;
  try {
    useStoreApi();
    return <NodeResizer {...props} />;
  } catch {
    return null;
  }
};

const SemanticNode = ({ id, data, isConnectable, selected, onNodeUpdate }) => {
  const [isEditing, setIsEditing] = useState(!!data.isNew); // Open editor for new nodes
  const [editContent, setEditContent] = useState(data.content || '');
  
  // Blank Node edit state
  const isBlankNode = data.type === 'UTIL-BLANK';
  const [editLabel, setEditLabel] = useState(data.label || 'Blank Node');
  const [editTags, setEditTags] = useState(Array.isArray(data.metadata?.tags) ? data.metadata.tags : []);
  const [editType, setEditType] = useState(data.type);
  
  const nodeType = NODE_TYPES[data.type];
  const clusterColor = CLUSTER_COLORS[data.metadata?.cluster] || '#6B7280';
  
  const handleSaveEdit = () => {
    // Update node content and editable fields for Blank Node
    data.content = editContent;
    if (isBlankNode) {
      data.label = editLabel;
      data.type = editType;
      data.metadata.tags = editTags;
    }
    data.metadata.updatedAt = new Date().toISOString();
    delete data.isNew; // Remove new flag after first edit
    setIsEditing(false);
    // Call parent update if provided
    if (onNodeUpdate) {
      onNodeUpdate(id, {
        content: editContent,
        ...(isBlankNode && {
          label: editLabel,
          type: editType,
          tags: editTags,
        })
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditContent(data.content || '');
    setIsEditing(false);
  };
  
  const handleExecute = () => {
    // Trigger node execution - this will be connected to the execution engine
    console.log(`Executing node ${id} of type ${data.type}`);
  };

  const handleNodeEnhancementUpdate = (updatedNode) => {
    // Update local state
    setEditContent(updatedNode.data.content);
    data.content = updatedNode.data.content;
    data.metadata.updatedAt = new Date().toISOString();
    
    // Call parent update if provided
    if (onNodeUpdate) {
      onNodeUpdate(id, { content: updatedNode.data.content });
    }
  };
  
  return (
    <Card 
      data-testid="semantic-node"
      className="w-full h-full min-w-[280px] min-h-[180px] transition-all duration-200"
      style={{ 
        borderLeftColor: clusterColor,
        borderLeftWidth: '4px',
        background: '#C0C0C0',
        border: '2px outset #C0C0C0',
        boxShadow: selected ? '0 0 0 2px #FF69B4, 2px 2px 4px rgba(0,0,0,0.3)' : '2px 2px 4px rgba(0,0,0,0.3)',
        fontFamily: '"MS Sans Serif", Tahoma, Arial, sans-serif',
        fontSize: '11px',
        borderRadius: 0
      }}
    >
  <SafeNodeResizer
        color={clusterColor}
        minWidth={280}
        minHeight={180}
        handleStyle={{ 
          width: 10, 
          height: 10, 
          borderRadius: 0,
          background: '#C0C0C0',
          border: '1px outset #C0C0C0'
        }}
        lineStyle={{ 
          strokeWidth: 1,
          stroke: '#808080'
        }}
      />
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: clusterColor,
          width: '12px',
          height: '12px',
          left: '-6px'
        }}
        isConnectable={isConnectable}
      />
      
      <CardHeader className="pb-2" style={{ 
        background: 'linear-gradient(90deg, #000080 0%, #0000FF 100%)', 
        color: '#FFFFFF',
        padding: '6px 8px',
        margin: 0,
        borderBottom: '1px solid #404040'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm">{nodeType?.icon || '📦'}</span>
            <div 
              className="w-2 h-2 border border-white"
              style={{ backgroundColor: clusterColor }}
            />
            <h3 className="text-xs font-bold text-white truncate flex-1">
              {data.label}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {data.config?.isExecutable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExecute}
                className="h-4 w-4 p-0"
                style={{
                  background: '#C0C0C0',
                  border: '1px outset #C0C0C0',
                  borderRadius: 0
                }}
              >
                <Play className="h-2.5 w-2.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-4 w-4 p-0"
              style={{
                background: '#C0C0C0',
                border: '1px outset #C0C0C0',
                borderRadius: 0
              }}
            >
              <Edit3 className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>
        
        {/* Node type and tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-xs border-0" style={{
            background: '#E0E0E0',
            color: '#000080',
            fontSize: '9px',
            padding: '1px 4px',
            border: '1px inset #C0C0C0'
          }}>
            {data.type}
          </Badge>
          {data.metadata?.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs border-0" style={{
              background: '#E0E0E0',
              color: '#000080',
              fontSize: '9px',
              padding: '1px 4px',
              border: '1px inset #C0C0C0'
            }}>
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" style={{
        background: '#F0F0F0',
        padding: '8px',
        borderTop: '1px inset #C0C0C0'
      }}>
        {/* Inline description (replaces tooltip) */}
        {(data.metadata?.description || nodeType?.description) && (
          <div className="mb-2" style={{
            fontSize: '10px',
            color: '#000080',
            fontStyle: 'italic',
            padding: '4px 6px',
            background: '#FFFBF0',
            border: '1px solid #E0E0E0',
            borderRadius: '2px'
          }}>
            💡 {data.metadata?.description || nodeType?.description}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2" style={{
            background: '#FFFFFF',
            border: '1px inset #C0C0C0',
            padding: '6px',
            borderRadius: '2px'
          }}>
            {isBlankNode && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  placeholder="Node name"
                  className="w-full border-0"
                  style={{
                    padding: '4px 6px',
                    border: '1px inset #C0C0C0',
                    background: '#FFFFFF',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '11px'
                  }}
                />
                <input
                  type="text"
                  value={editType}
                  onChange={e => setEditType(e.target.value)}
                  placeholder="Node type (e.g. UTIL-BLANK)"
                  className="w-full border-0"
                  style={{
                    padding: '4px 6px',
                    border: '1px inset #C0C0C0',
                    background: '#FFFFFF',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '11px'
                  }}
                />
                <input
                  type="text"
                  value={Array.isArray(editTags) ? editTags.join(', ') : ''}
                  onChange={e => setEditTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                  placeholder="Tags (comma separated)"
                  className="w-full border-0"
                  style={{
                    padding: '4px 6px',
                    border: '1px inset #C0C0C0',
                    background: '#FFFFFF',
                    fontFamily: '"MS Sans Serif", sans-serif',
                    fontSize: '11px'
                  }}
                />
              </div>
            )}
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter node content..."
              className="w-full border-0 resize"
              style={{
                minHeight: '100px',
                fontSize: '11px',
                fontFamily: '"MS Sans Serif", Consolas, monospace',
                background: '#FFFFFF',
                color: '#000000',
                border: '1px inset #C0C0C0',
                padding: '6px',
                resize: 'both'
              }}
              autoFocus
            />
            <div className="flex justify-between gap-2">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-6 px-2 border-0"
                  style={{
                    background: '#C0C0C0',
                    border: '1px outset #C0C0C0',
                    borderRadius: 0
                  }}
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-6 px-2 border-0"
                  style={{
                    background: '#90EE90',
                    border: '1px outset #C0C0C0',
                    borderRadius: 0,
                    color: '#000000'
                  }}
                >
                  <Save className="h-2.5 w-2.5" />
                </Button>
              </div>
              
              <NodeEnhancementModal
                node={{ id, data }}
                onNodeUpdate={handleNodeEnhancementUpdate}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 border-0"
                    style={{
                      background: '#FFE4B5',
                      border: '1px outset #C0C0C0',
                      borderRadius: 0,
                      color: '#000000'
                    }}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="min-h-[60px]">
            {data.content ? (
              <div style={{
                fontSize: '11px',
                color: '#000000',
                whiteSpace: 'pre-wrap',
                background: '#FFFFFF',
                border: '1px inset #C0C0C0',
                padding: '6px',
                borderRadius: '2px',
                fontFamily: 'Consolas, "Courier New", monospace'
              }}>
                {data.content}
              </div>
            ) : (
              <div style={{
                fontSize: '11px',
                color: '#808080',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px',
                border: '1px dashed #C0C0C0'
              }}>
                {data.metadata?.description || 'Double-click to edit...'}
              </div>
            )}
          </div>
        )}
        
        {/* Execution status indicator */}
        {data.executionState && (
          <div className="mt-2 pt-2" style={{
            borderTop: '1px inset #C0C0C0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '10px',
            color: '#000080',
            background: '#F8F8F8',
            padding: '4px 6px',
            borderRadius: '2px'
          }}>
            <div 
              className={`w-2 h-2 rounded-full border border-black`}
              style={{
                backgroundColor:
                  data.executionState === 'completed' ? '#00FF00' :
                  data.executionState === 'running' ? '#0000FF' :
                  data.executionState === 'failed' ? '#FF0000' :
                  '#808080'
              }}
            />
            <span className="capitalize font-bold">
              {data.executionState}
            </span>
          </div>
        )}
      </CardContent>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: clusterColor,
          width: '12px',
          height: '12px',
          right: '-6px'
        }}
        isConnectable={isConnectable}
      />
    </Card>
  );
};

export default memo(SemanticNode);
