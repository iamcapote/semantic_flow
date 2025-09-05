import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, MessageSquare, GitBranch, Play, Loader2, Download, FileJson, FileText, FileCode, FileX2, FolderOpen, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SecureKeyManager } from '@/lib/security';

import NodePalette from "../components/NodePalette";
import LabCanvas from "../components/LabCanvas";
import ConfigurationModal from "../components/ConfigurationModal";
import ThemeToggle from "../components/ThemeToggle";
import ClearSessionButton from "../components/ClearSessionButton";
import { createWorkflowSchema, generateId } from "../lib/graphSchema";
import { exportWorkflowAsJSON as exportAsJson, exportWorkflowAsYAML as exportAsYaml, exportWorkflowAsMarkdown as exportAsMarkdown, exportWorkflowAsXML as exportAsXml } from "../lib/exportUtils";
import { toast } from "@/components/ui/use-toast";
import WorkflowExecutionEngine from "../lib/WorkflowExecutionEngine";
import PromptingEngine from "../lib/promptingEngine";

const WorkflowBuilderPage = () => {
  const [workflows, setWorkflows] = useState([]);

  const [workflow, setWorkflow] = useState(() => {
    // Try to load saved workflow from localStorage
    const saved = localStorage.getItem('current-workflow');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved workflow:', error);
      }
    }
    
    // Create new workflow
    const newWorkflow = createWorkflowSchema();
    newWorkflow.id = generateId();
    newWorkflow.metadata.title = 'Untitled Workflow';
    newWorkflow.metadata.createdAt = new Date().toISOString();
    newWorkflow.metadata.updatedAt = new Date().toISOString();
    return newWorkflow;
  });
  
  const [activeTab, setActiveTab] = useState('canvas');
  const [isExecuting, setIsExecuting] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  
  // Settings state (inherited from original ChatPage)
  const [apiKey, setApiKey] = useState(() => {
    const provider = sessionStorage.getItem('active_provider') || 'openai';
    return SecureKeyManager.getApiKey(provider) || '';
  });
  const [systemMessage, setSystemMessage] = useState(() => 
    sessionStorage.getItem('system_message') || 'You are processing a semantic logic workflow.'
  );
  
  // Save workflow to localStorage when it changes
  useEffect(() => {
    if (workflow) {
      localStorage.setItem('current-workflow', JSON.stringify(workflow));
    }
  }, [workflow]);
  
  // Save settings to sessionStorage
  useEffect(() => {
    const provider = sessionStorage.getItem('active_provider') || 'openai';
    SecureKeyManager.storeApiKey(provider, apiKey);
    sessionStorage.setItem('system_message', systemMessage);
  }, [apiKey, systemMessage]);
  
  // Workflow management functions
  const createNewWorkflow = () => {
    const newWorkflow = createWorkflowSchema();
    newWorkflow.id = generateId();
    newWorkflow.metadata.title = 'Untitled Workflow';
    newWorkflow.metadata.createdAt = new Date().toISOString();
    newWorkflow.metadata.updatedAt = new Date().toISOString();
    setWorkflow(newWorkflow);
    toast({
      title: "New Workflow Created",
      description: "Started with a fresh workflow canvas.",
    });
  };

  const loadWorkflow = async (workflowId) => {
    try {
      const saved = localStorage.getItem(`workflow-${workflowId}`);
      if (saved) {
        setWorkflow(JSON.parse(saved));
        toast({
          title: 'Workflow Loaded',
          description: `Loaded ${workflowId} from local storage.`,
        });
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };
  
  const handleWorkflowChange = (updatedWorkflow) => {
    setWorkflow(updatedWorkflow);
  };

  const handleWorkflowGenerated = (generated) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...generated.nodes],
      edges: [...prev.edges, ...generated.edges],
    }));
  };
  
  const handleExecuteWorkflow = async () => {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      toast({
        title: "Empty Workflow",
        description: "Add some nodes to your workflow before executing.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    setActiveTab('test');
    
    try {
      const executionEngine = new WorkflowExecutionEngine("demo-user", toast);
      
      // Clear previous chat messages
      setChatMessages([{
        role: 'system',
        content: `🚀 Starting workflow execution: ${workflow.metadata.title}\n\nNodes: ${workflow.nodes.length}\nConnections: ${workflow.edges.length}`
      }]);
      
      // Execute workflow with progress updates
      const result = await executionEngine.executeWorkflow(workflow, (progress) => {
        let message = '';
        
        switch (progress.type) {
          case 'start':
            message = `🔄 ${progress.message}`;
            break;
          case 'node_start':
            message = `⚡ ${progress.message}`;
            break;
          case 'node_complete':
            message = `✅ ${progress.message}\n\n**Result:** ${progress.result}`;
            break;
          case 'node_error':
            message = `❌ ${progress.message}`;
            break;
          case 'complete':
            message = `🎉 ${progress.message}\n\n**Summary:**\n- Provider: ${result.provider}\n- Completed: ${result.completedNodes}/${result.totalNodes} nodes`;
            break;
        }
        
        setChatMessages(prev => [...prev, {
          role: progress.type.includes('error') ? 'system' : 'assistant',
          content: message
        }]);
      });
      
      toast({
        title: "Workflow Executed",
        description: `Successfully processed ${result.completedNodes}/${result.totalNodes} nodes using ${result.provider}`,
      });
      
    } catch (error) {
      console.error('Execution error:', error);
      
      const errorMessage = {
        role: 'system',
        content: `❌ Execution failed: ${error.message}`
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Execution Failed", 
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isExecuting) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      setIsExecuting(true);
      const providerId = sessionStorage.getItem('active_provider') || 'openai';
      const apiKey = SecureKeyManager.getApiKey(providerId);
  const promptingEngine = new PromptingEngine('demo-user');
  const model = sessionStorage.getItem(`default_model_${providerId}`) || 'gpt-4o';
  const response = await promptingEngine.callProvider(providerId, model, apiKey, [
        { role: 'user', content: chatInput },
      ]);
      const assistantMessage = {
        role: 'assistant',
        content: response.choices?.[0]?.message?.content || '',
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Chat failed: ${error.message}`
      }]);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="currentColor"/>
                <path d="M2 16.5L12 22L22 16.5L12 11L2 16.5Z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Semantic Logic AI Workflow Builder
            </h1>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30">Beta</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'canvas' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('canvas')}
            className="text-xs"
          >
            <GitBranch className="h-3 w-3 mr-1" />
            Canvas
          </Button>
          <Button
            variant={activeTab === 'test' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('test')}
            className="text-xs relative"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Test
            {chatMessages.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background border-border">
                <FolderOpen className="h-4 w-4 mr-2" />
                Workflows
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" sideOffset={5}>
              <DropdownMenuItem onClick={createNewWorkflow}>
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </DropdownMenuItem>
              {workflows && workflows.length > 0 && (
                <>
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground">Recent Workflows:</span>
                  </DropdownMenuItem>
                  {workflows.slice(0, 5).map((wf) => (
                    <DropdownMenuItem
                      key={wf.id}
                      onClick={() => loadWorkflow(wf.id)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">{wf.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            value={workflow.metadata.title}
            onChange={(e) => setWorkflow(prev => ({
              ...prev,
              metadata: { ...prev.metadata, title: e.target.value }
            }))}
            className="w-64 bg-background border-border"
            placeholder="Workflow title..."
          />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-background border-border">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={5}>
              <DropdownMenuItem onClick={() => exportAsJson(workflow)}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsYaml(workflow)}>
                <FileCode className="h-4 w-4 mr-2" />
                Export as YAML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsMarkdown(workflow)}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAsXml(workflow)}>
                <FileX2 className="h-4 w-4 mr-2" />
                Export as XML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ConfigurationModal
            apiKey={apiKey}
            setApiKey={setApiKey}
            systemMessage={systemMessage}
            setSystemMessage={setSystemMessage}
          />
          <ClearSessionButton />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel - Node Palette */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full flex flex-col bg-card border-r border-border">
              <div className="flex-1 min-h-0">
                <NodePalette />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Main Canvas Area */}
          <ResizablePanel defaultSize={75}>
            <div className="h-full">
              {activeTab === 'canvas' ? (
                <LabCanvas
                  workflow={workflow}
                  onWorkflowChange={handleWorkflowChange}
                  onExecuteWorkflow={handleExecuteWorkflow}
                  isExecuting={isExecuting}
                />
              ) : (
              <ResizablePanelGroup direction="vertical">
                {/* Canvas (always visible) */}
                <ResizablePanel defaultSize={chatMessages.length === 0 ? 80 : 55} minSize={40}>
                  <LabCanvas
                    workflow={workflow}
                    onWorkflowChange={handleWorkflowChange}
                    onExecuteWorkflow={handleExecuteWorkflow}
                    isExecuting={isExecuting}
                  />
                </ResizablePanel>
                
                {/* Test Panel (only when there are messages or when executing) */}
                {(chatMessages.length > 0 || isExecuting) && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={chatMessages.length === 0 ? 20 : 45} minSize={18} maxSize={70}>
                      <div className="h-full flex flex-col bg-muted/20">
                        <div className="border-b border-border bg-card px-4 py-2">
                          <h3 className="font-medium text-sm">Execution Results</h3>
                        </div>
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                              {chatMessages.map((message, index) => (
                                <Card key={index} className={
                                  message.role === 'user' ? 'ml-12 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' :
                                  message.role === 'system' ? 'mx-4 bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700' :
                                  'mr-12 bg-white dark:bg-gray-900'
                                }>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                      {message.role === 'user' ? 'User Input' :
                                       message.role === 'system' ? 'System' : 'AI Response'}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                                      {message.content}
                                    </pre>
                                  </CardContent>
                                </Card>
                              ))}
                              {isExecuting && (
                                <Card className="mr-12 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Processing workflow...
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </ScrollArea>
                          
                          <div className="border-t border-border bg-card p-4 shrink-0">
                            <form onSubmit={handleChatSubmit} className="flex gap-2">
                              <Input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Test your workflow or ask questions..."
                                className="flex-1"
                                disabled={isExecuting}
                              />
                              <Button type="submit" disabled={isExecuting || !chatInput.trim()}>
                                {isExecuting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkflowBuilderPage;
