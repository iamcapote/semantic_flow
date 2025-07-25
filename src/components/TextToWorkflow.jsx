import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import PromptingEngine from '@/lib/promptingEngine';
import { SecureKeyManager } from '@/lib/security';

const TextToWorkflow = ({ onWorkflowGenerated, apiKey }) => {
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [promptingEngine] = useState(() => new PromptingEngine('demo-user'));

  // Load available providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await promptingEngine.getAvailableProviders();
        setAvailableProviders(providers);
        if (providers.length > 0) {
          const storedId = sessionStorage.getItem('active_provider');
          const activeProvider = providers.find(p => p.providerId === storedId) || providers.find(p => p.isActive) || providers[0];
          setSelectedProvider(activeProvider.providerId);
          setSelectedModel(activeProvider.models[0]);
        }
      } catch (error) {
        console.error('Failed to load providers:', error);
      }
    };
    loadProviders();
  }, [promptingEngine]);

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to generate a workflow.",
        variant: "destructive",
      });
      return;
    }
    
    // Get API key from session storage for selected provider
    const providerApiKey = SecureKeyManager.getApiKey(selectedProvider) || apiKey;
    if (!providerApiKey) {
      toast({
        title: "API Key Missing",
        description: `Please configure your ${selectedProvider} API key in settings.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await promptingEngine.convertTextToWorkflow(
        textInput,
        providerApiKey,
        selectedProvider,
        selectedModel
      );

      if (result.success) {
        onWorkflowGenerated(result.workflow);
        
        toast({
          title: "Workflow Generated",
          description: `Successfully converted text to workflow using ${result.metadata.generatedBy}`,
        });
        
        // Clear input after successful generation
        setTextInput('');
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error("Error generating workflow:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate workflow from text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left hover:bg-accent/50"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="font-medium">AI Text-to-Workflow</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 pt-0 space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Input Text</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Convert text, research abstracts, or complex ideas into workflow nodes.
              </p>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your text here..."
                className="min-h-[120px]"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">AI Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map(provider => (
                      <SelectItem key={provider.providerId} value={provider.providerId}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders
                      .find(p => p.providerId === selectedProvider)?.models
                      .map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isLoading || !textInput.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TextToWorkflow;
