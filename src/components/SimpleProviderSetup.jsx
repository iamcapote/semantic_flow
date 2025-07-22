import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Settings, TestTube2, CheckCircle, AlertCircle, ArrowRight, Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SimpleProviderSetup = ({ userId, onComplete }) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [customModels, setCustomModels] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = false;

  // Default providers configuration with updated models
  const defaultProviders = [
    {
      providerId: 'openai',
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'o1-preview', 'o1-mini'],
      defaultModel: 'gpt-4o',
      apiKey: '',
      isActive: true,
      description: 'Original ChatGPT models with highest quality reasoning'
    },
    {
      providerId: 'openrouter',
      name: 'OpenRouter',
      baseURL: 'https://openrouter.ai/api/v1',
      models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-exp', 'meta-llama/llama-3.1-405b-instruct'],
      defaultModel: 'openai/gpt-4o',
      apiKey: '',
      isActive: false,
      description: 'Access to multiple AI models through one API'
    },
    {
      providerId: 'venice',
      name: 'Venice AI',
      baseURL: 'https://api.venice.ai/api/v1',
      models: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet'],
      defaultModel: 'gpt-4o',
      apiKey: '',
      isActive: false,
      description: 'Privacy-focused AI inference with no data retention'
    }
  ];

  useEffect(() => {
    // Initialize with default providers immediately
    setProviders(defaultProviders);
    
    // Optionally try to fetch from backend if available
    if (initialProviders && initialProviders.length > 0) {
      setProviders(initialProviders);
      const hasValidProvider = initialProviders.some(p => p.apiKey && p.apiKey.trim() !== '');
      setIsValid(hasValidProvider);
    }
  }, [initialProviders]);

  const handleProviderUpdate = (providerId, field, value) => {
    setProviders(prev => {
      const updated = prev.map(p => 
        p.providerId === providerId ? { ...p, [field]: value } : p
      );
      
      if (field === 'apiKey') {
        const hasValidProvider = updated.some(p => p.apiKey && p.apiKey.trim() !== '');
        setIsValid(hasValidProvider);
      }
      
      return updated;
    });
  };

  const handleAddCustomModel = (providerId) => {
    const customModel = customModels[providerId];
    if (customModel && customModel.trim() !== '') {
      setProviders(prev => prev.map(p => 
        p.providerId === providerId 
          ? { ...p, models: [...p.models, customModel.trim()] }
          : p
      ));
      setCustomModels(prev => ({ ...prev, [providerId]: '' }));
    }
  };

  const handleCustomModelChange = (providerId, value) => {
    setCustomModels(prev => ({ ...prev, [providerId]: value }));
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      
      // Always store the active provider's API key in session storage
      const activeProvider = providers.find(p => p.isActive && p.apiKey);
      if (activeProvider) {
        sessionStorage.setItem('openai_api_key', activeProvider.apiKey);
      }
      
      toast({ title: "Success", description: "Provider settings saved." });
      
      if (onComplete) onComplete();
    } catch (error) {
      // If backend fails, still save to session storage and continue
      const activeProvider = providers.find(p => p.isActive && p.apiKey);
      if (activeProvider) {
        sessionStorage.setItem('openai_api_key', activeProvider.apiKey);
        toast({ title: "Success", description: "Provider settings saved locally." });
        if (onComplete) onComplete();
      } else {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestProvider = async (providerId, model = null) => {
    const provider = providers.find(p => p.providerId === providerId);
    const testModel = model || provider?.defaultModel || provider?.models[0];
    
    try {
      toast({ title: "Test Feature", description: `Would test ${provider?.name} with model: ${testModel}` });
    } catch (error) {
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
    }
  };

  const toggleApiKeyVisibility = (providerId) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const handleActivateProvider = (providerId) => {
    setProviders(prev => prev.map(p => ({
      ...p,
      isActive: p.providerId === providerId
    })));
  };

  const getProviderStatus = (provider) => {
    if (provider.apiKey && provider.apiKey.trim() !== '') {
      return provider.isActive ? 'active' : 'configured';
    }
    return 'unconfigured';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  if (isLoading && providers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4">
          <Settings className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-white">Configure AI Providers</h2>
        <p className="text-blue-100 text-sm">
          Set up your AI providers to start building semantic workflows
        </p>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => {
          const status = getProviderStatus(provider);
          const isExpanded = expandedProvider === provider.providerId;
          
          return (
            <Card key={provider.providerId} className="bg-white/10 backdrop-blur-md border-white/20">
              <Collapsible
                open={isExpanded}
                onOpenChange={(open) => setExpandedProvider(open ? provider.providerId : null)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <CardTitle className="text-white text-lg">{provider.name}</CardTitle>
                          <p className="text-sm text-blue-100">{provider.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'active' && (
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            Active
                          </Badge>
                        )}
                        {status === 'configured' && (
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            Configured
                          </Badge>
                        )}
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4 text-white" /> : 
                          <ChevronDown className="h-4 w-4 text-white" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Base URL</Label>
                        <Input
                          className="bg-white/10 border-white/20 text-white placeholder-white/50"
                          value={provider.baseURL}
                          onChange={(e) => handleProviderUpdate(provider.providerId, 'baseURL', e.target.value)}
                          placeholder="https://api.example.com/v1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">API Key</Label>
                        <div className="relative">
                          <Input
                            className="bg-white/10 border-white/20 text-white placeholder-white/50 pr-10"
                            type={showApiKeys[provider.providerId] ? "text" : "password"}
                            value={provider.apiKey}
                            onChange={(e) => handleProviderUpdate(provider.providerId, 'apiKey', e.target.value)}
                            placeholder="Enter your API key..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                            onClick={() => toggleApiKeyVisibility(provider.providerId)}
                          >
                            {showApiKeys[provider.providerId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Default Model</Label>
                      <Select
                        value={provider.defaultModel}
                        onValueChange={(value) => handleProviderUpdate(provider.providerId, 'defaultModel', value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select default model" />
                        </SelectTrigger>
                        <SelectContent>
                          {provider.models.map(model => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white">Add Custom Model</Label>
                      <div className="flex gap-2">
                        <Input
                          className="bg-white/10 border-white/20 text-white placeholder-white/50"
                          value={customModels[provider.providerId] || ''}
                          onChange={(e) => handleCustomModelChange(provider.providerId, e.target.value)}
                          placeholder="e.g., gpt-4o-2024-08-06, claude-3-5-sonnet-20241022"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleAddCustomModel(provider.providerId)}
                          disabled={!customModels[provider.providerId]?.trim()}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      {provider.apiKey && (
                        <Button
                          variant="outline"
                          onClick={() => handleTestProvider(provider.providerId)}
                          disabled={isSaving}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <TestTube2 className="h-4 w-4 mr-2" />
                          Test with {provider.defaultModel || provider.models[0]}
                        </Button>
                      )}
                      
                      {provider.apiKey && !provider.isActive && (
                        <Button
                          onClick={() => handleActivateProvider(provider.providerId)}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          Set as Active
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <p className="text-blue-100 text-sm">
          {isValid ? "✓ Ready to proceed" : "Please configure at least one provider"}
        </p>
        <Button
          onClick={handleSaveAndContinue}
          disabled={!isValid || isSaving}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isSaving ? "Saving..." : "Save & Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleProviderSetup;
