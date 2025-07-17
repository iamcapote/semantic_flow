import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { getClusterSummary, getNodesByCluster, NODE_TYPES, ONTOLOGY_CLUSTERS } from "@/lib/ontology";

const NodePalette = ({ onNodeDragStart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClusters, setExpandedClusters] = useState(['PROP', 'INQ']); // Start with basic clusters expanded
  
  const clusters = getClusterSummary();
  
  // Filter nodes based on search query
  const filteredNodeTypes = useMemo(() => {
    if (!searchQuery) return NODE_TYPES;
    
    const query = searchQuery.toLowerCase();
    return Object.fromEntries(
      Object.entries(NODE_TYPES).filter(([code, nodeType]) =>
        nodeType.label.toLowerCase().includes(query) ||
        nodeType.description.toLowerCase().includes(query) ||
        nodeType.tags.some(tag => tag.toLowerCase().includes(query)) ||
        code.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);
  
  const toggleCluster = (clusterCode) => {
    setExpandedClusters(prev => 
      prev.includes(clusterCode) 
        ? prev.filter(c => c !== clusterCode)
        : [...prev, clusterCode]
    );
  };
  
  const handleDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart?.(nodeType);
  };
  
  return (
    <div className="bg-card dark:bg-gray-900/90 flex flex-col h-full backdrop-blur-sm">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground mb-3">Node Palette</h2>
        <div className="relative">
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm bg-background/50 border-border focus:border-primary/50 transition-colors"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-2">
          {clusters.map((cluster) => {
            const filteredClusterNodes = getNodesByCluster(cluster.code).filter(node => 
              filteredNodeTypes[node.code]
            );
            
            // Skip empty clusters when filtering
            if (searchQuery && filteredClusterNodes.length === 0) {
              return null; // Hide empty clusters when filtering
            }
            
            const isExpanded = expandedClusters.includes(cluster.code);
            
            return (
              <Collapsible
                key={cluster.code}
                open={isExpanded}
                onOpenChange={() => toggleCluster(cluster.code)}
                className="mb-2"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-2 h-auto hover:bg-accent/50 dark:hover:bg-gray-800/60 transition-all duration-200"
                    style={{ borderLeft: `4px solid ${cluster.color}` }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="text-lg">{ONTOLOGY_CLUSTERS[cluster.code]?.icon || '📦'}</span>
                        <span className="font-medium text-foreground">{cluster.name}</span>
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-border">
                          {filteredClusterNodes.length}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pl-4 pt-1">
                  <div className="space-y-1">
                    {filteredClusterNodes.map((node) => (
                      <div
                        key={node.code}
                        draggable
                        onDragStart={(e) => handleDragStart(e, node.code)}
                        className="p-3 border border-border rounded-lg cursor-move bg-card/80 hover:bg-accent/30 dark:bg-gray-800/40 dark:hover:bg-gray-700/60 transition-all duration-200 backdrop-blur-sm"
                        style={{ borderColor: cluster.color + '40' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{node.icon || '📦'}</span>
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {node.label}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {node.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-2">
                            {node.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs px-1 py-0 h-auto border-border text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          {Object.keys(filteredNodeTypes).length} nodes available
        </p>
      </div>
    </div>
  );
};

export default NodePalette;
