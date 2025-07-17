import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Brain, Zap, Target } from "lucide-react";

const ConfigurationModal = ({ 
  apiKey, 
  setApiKey, 
  systemMessage, 
  setSystemMessage,
  configs = [],
  onConfigChange,
  activeConfigId = null 
}) => {
  const [open, setOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({
    id: 'default',
    name: 'Default Configuration',
    model: 'gpt-4o-mini',
    parameters: {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    },
    systemPrompt: systemMessage || 'You are processing a semantic logic workflow. Analyze each node carefully and provide relevant responses based on the semantic type and content.',
    isDefault: true
  });

  const handleSave = () => {
    setSystemMessage(currentConfig.systemPrompt);
    if (onConfigChange) {
      onConfigChange(currentConfig);
    }
    setOpen(false);
  };

  const modelOptions = [
    { value: 'gpt-4o', label: 'GPT-4 Omni', description: 'Most capable model' },
    { value: 'gpt-4o-mini', label: 'GPT-4 Omni Mini', description: 'Fast and efficient' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High performance' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Balanced performance' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configuration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Configuration & Settings
          </DialogTitle>
          <DialogDescription>
            Configure AI models and system prompts for your semantic workflow execution
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Your OpenAI API key and connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stored locally in your browser. Never sent to our servers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Model Configuration
              </CardTitle>
              <CardDescription>
                Select and tune the AI model for workflow execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Configuration Name</Label>
                <Input
                  value={currentConfig.name}
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Configuration name..."
                />
              </div>

              <div>
                <Label>AI Model</Label>
                <Select 
                  value={currentConfig.model} 
                  onValueChange={(value) => setCurrentConfig(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div>
                          <div className="font-medium">{model.label}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Parameters */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Temperature</Label>
                    <Badge variant="outline">{currentConfig.parameters.temperature}</Badge>
                  </div>
                  <Slider
                    value={[currentConfig.parameters.temperature]}
                    onValueChange={([value]) => setCurrentConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, temperature: value }
                    }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Controls randomness: 0 = focused, 2 = creative
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Max Tokens</Label>
                    <Badge variant="outline">{currentConfig.parameters.maxTokens}</Badge>
                  </div>
                  <Slider
                    value={[currentConfig.parameters.maxTokens]}
                    onValueChange={([value]) => setCurrentConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, maxTokens: value }
                    }))}
                    max={8192}
                    min={256}
                    step={256}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum response length
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Top P</Label>
                    <Badge variant="outline">{currentConfig.parameters.topP}</Badge>
                  </div>
                  <Slider
                    value={[currentConfig.parameters.topP]}
                    onValueChange={([value]) => setCurrentConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, topP: value }
                    }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nucleus sampling parameter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Prompt</CardTitle>
              <CardDescription>
                Instructions for the AI when processing semantic workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentConfig.systemPrompt}
                onChange={(e) => setCurrentConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Enter system prompt for workflow execution..."
                className="min-h-[120px]"
              />
              <div className="mt-2 text-xs text-gray-500">
                <p>This prompt guides how the AI interprets and processes semantic nodes in your workflows.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationModal;
