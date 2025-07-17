import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Code, Settings, FileX } from "lucide-react";
import { exportWorkflow } from "@/lib/exportUtils";

const ExportModal = ({ workflow, trigger }) => {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      value: 'json',
      label: 'JSON',
      description: 'Technical data format for API integration',
      icon: <Code className="h-4 w-4" />,
      mimeType: 'application/json',
      useCase: 'Backup, API integration, technical sharing'
    },
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Human-readable documentation format',
      icon: <FileText className="h-4 w-4" />,
      mimeType: 'text/markdown',
      useCase: 'Documentation, README files, GitHub'
    },
    {
      value: 'yaml',
      label: 'YAML',
      description: 'Configuration-friendly structured format',
      icon: <Settings className="h-4 w-4" />,
      mimeType: 'application/x-yaml',
      useCase: 'Configuration files, CI/CD, automation'
    },
    {
      value: 'xml',
      label: 'XML',
      description: 'Enterprise and legacy system format',
      icon: <FileX className="h-4 w-4" />,
      mimeType: 'application/xml',
      useCase: 'Enterprise systems, legacy integration'
    }
  ];

  const selectedFormatInfo = exportFormats.find(f => f.value === selectedFormat);

  const handleExport = async () => {
    if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = exportWorkflow(workflow, selectedFormat);
      
      // Create and trigger download
      const blob = new Blob([exportData.content], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const workflowStats = workflow ? {
    nodes: workflow.nodes?.length || 0,
    edges: workflow.edges?.length || 0,
    clusters: [...new Set(workflow.nodes?.map(n => n.data?.metadata?.cluster).filter(Boolean))].length
  } : { nodes: 0, edges: 0, clusters: 0 };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Workflow
          </DialogTitle>
          <DialogDescription>
            Choose a format to export your semantic logic workflow for different use cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Workflow Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workflow Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{workflowStats.nodes}</div>
                  <div className="text-xs text-gray-500">Nodes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{workflowStats.edges}</div>
                  <div className="text-xs text-gray-500">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{workflowStats.clusters}</div>
                  <div className="text-xs text-gray-500">Clusters</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium text-sm mb-1">{workflow?.metadata?.title || 'Untitled Workflow'}</h4>
                <p className="text-xs text-gray-600">{workflow?.metadata?.description || 'No description'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      {format.icon}
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Format Details */}
          {selectedFormatInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {selectedFormatInfo.icon}
                  {selectedFormatInfo.label} Export
                </CardTitle>
                <CardDescription>
                  {selectedFormatInfo.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedFormatInfo.mimeType}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Best for:</strong> {selectedFormatInfo.useCase}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || workflowStats.nodes === 0}
          >
            {isExporting ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export as {selectedFormatInfo?.label}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
