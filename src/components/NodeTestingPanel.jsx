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

  const handleTest = async () => {
    if (!testInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter test input",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = {
        success: true,
        output: `Test result for "${testInput}" using ${selectedProvider}/${selectedModel}`,
        executionTime: '1.2s',
        tokenUsage: { prompt: 10, completion: 25, total: 35 }
      };
      
      if (onTestResult) {
        onTestResult(result);
      }
      
      toast({
        title: "Test Completed",
        description: "Node test executed successfully"
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
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
