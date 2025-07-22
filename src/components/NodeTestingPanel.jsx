// Node Testing Panel Component
// This component provides a testing interface for individual workflow nodes

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

export const NodeTestingPanel = ({ node, onTestResult }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const { toast } = useToast();
  // Import tRPC client
  const { trpcClient } = require('../lib/trpc-vanilla');

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter test input",
        variant: "destructive"
      });
      return;
    }
    if (!selectedProvider || !selectedModel) {
      toast({
        title: "Error",
        description: "Select provider and model",
        variant: "destructive"
      });
      return;
    }
    // Get API key from sessionStorage only (browser-safe)
    let apiKey = sessionStorage.getItem(`${selectedProvider}_api_key`);
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: `Please configure your ${selectedProvider} API key in settings.
        If you are self-hosting, set it in your .env and expose it to the frontend via window.ENV or a secure settings modal.`,
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await trpcClient.provider.testNode.mutate({
        userId: 'demo-user',
        nodeId: node?.id || 'test-node',
        nodeType: node?.data?.type || 'semantic',
        content: testInput,
        providerId: selectedProvider,
        model: selectedModel,
        apiKey: apiKey,
        parameters: {
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
        },
      });
      if (onTestResult) {
        onTestResult({
          success: true,
          output: result.result,
          provider: result.provider,
          model: result.model,
          usage: result.usage
        });
      }
      toast({
        title: "Test Completed",
        description: "Node test executed successfully"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message || 'Unknown error',
        variant: "destructive"
      });
      if (onTestResult) {
        onTestResult({ success: false, error: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Test Node</CardTitle>
        <CardDescription>
          Test this node with custom input
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Input</label>
          <Textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter test input..."
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={isLoading || !testInput.trim()}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Node'}
        </Button>
      </CardContent>
    </Card>
  );
};
