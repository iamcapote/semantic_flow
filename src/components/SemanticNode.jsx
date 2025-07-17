import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3, Save, X, Play, Pause, Info } from "lucide-react";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";

const SemanticNode = ({ id, data, isConnectable, selected }) => {
  const [isEditing, setIsEditing] = useState(!!data.isNew); // Open editor for new nodes
  const [editContent, setEditContent] = useState(data.content || '');
  
  const nodeType = NODE_TYPES[data.type];
  const clusterColor = CLUSTER_COLORS[data.metadata?.cluster] || '#6B7280';
  
  const handleSaveEdit = () => {
    // Update node content - this should be connected to state management
    data.content = editContent;
    data.metadata.updatedAt = new Date().toISOString();
    delete data.isNew; // Remove new flag after first edit
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditContent(data.content || '');
    setIsEditing(false);
  };
  
  const handleExecute = () => {
    // Trigger node execution - this will be connected to the execution engine
    console.log(`Executing node ${id} of type ${data.type}`);
  };
  
  return (
    <Card 
      className={`min-w-[200px] max-w-[300px] transition-all duration-200 bg-white dark:bg-gray-800 ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{ 
        borderLeftColor: clusterColor,
        borderLeftWidth: '4px'
      }}
    >
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
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{nodeType?.icon || '📦'}</span>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: clusterColor }}
            />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {data.label}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
                  >
                    <Info className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium">{nodeType?.label || data.label}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {nodeType?.description || 'Semantic node description'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">Cluster:</span>
                      <span className="text-xs font-mono">{data.metadata?.cluster}</span>
                    </div>
                    {nodeType?.tags && nodeType.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Tags:</span>
                        <span className="text-xs">{nodeType.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-1">
            {data.config?.isExecutable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExecute}
                className="h-6 w-6 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Node type and tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
            {data.type}
          </Badge>
          {data.metadata?.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter node content..."
              className="min-h-[60px] text-sm bg-white dark:bg-gray-700 dark:text-gray-200"
              autoFocus
            />
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelEdit}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="h-6 px-2"
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-[60px]">
            {data.content ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {data.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                {data.metadata?.description || 'Click edit to add content...'}
              </p>
            )}
          </div>
        )}
        
        {/* Execution status indicator */}
        {data.executionState && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  data.executionState === 'completed' ? 'bg-green-500' :
                  data.executionState === 'running' ? 'bg-blue-500 animate-pulse' :
                  data.executionState === 'failed' ? 'bg-red-500' :
                  'bg-gray-400 dark:bg-gray-600'
                }`}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {data.executionState}
              </span>
            </div>
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
