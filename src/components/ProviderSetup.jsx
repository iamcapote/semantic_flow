// ...existing code...
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestTube2, Plus, Trash2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SecureKeyManager } from '@/lib/security';

const defaultProviders = [
  {
    providerId: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'o1-preview', 'o1-mini'],
    isActive: true,
  },
  {
    providerId: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      'qwen/qwen3-235b-a22b-07-25:free',
      'moonshotai/kimi-k2:free',
      'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      'qwen/qwen3-235b-a22b:free',
      'deepseek/deepseek-chat-v3-0324:free',
    ],
    isActive: false,
  },
  {
    providerId: 'venice',
    name: 'Venice AI',
    baseURL: 'https://api.venice.ai/api/v1',
    models: ['venice-uncensored', 'mistral-31-24b', 'llama-3.2-3b'],
    isActive: false,
  },
];

const ProviderSetup = ({ userId, onComplete }) => {
  const isLoading = false;
  const error = null;
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [apiKeys, setApiKeys] = useState({});
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [showApiKeys, setShowApiKeys] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProviders(defaultProviders);
    const initialApiKeys = {};
    const hasValidProvider = defaultProviders.some(p => {
      const key = SecureKeyManager.getApiKey(p.providerId);
      if (key) {
        initialApiKeys[p.providerId] = key;
        return true;
      }
      return false;
    });
    setApiKeys(initialApiKeys);
    setIsValid(hasValidProvider);
  }, []);

  const handleProviderUpdate = (providerId, field, value) => {
    setProviders(prev => {
      const updated = prev.map(p => 
        p.providerId === providerId ? { ...p, [field]: value } : p
      );
      return updated;
    });
  };

  const handleApiKeyChange = (providerId, value) => {
    setApiKeys(prev => ({ ...prev, [providerId]: value }));
    const hasValidProvider = providers.some(p => apiKeys[p.providerId] && apiKeys[p.providerId].trim() !== '');
    setIsValid(hasValidProvider);
  };

  const handleSaveAndContinue = async () => {
    setIsSaving(true);
    try {
      // Store keys in session storage
      Object.entries(apiKeys).forEach(([providerId, key]) => {
        if (key && key.trim()) {
          SecureKeyManager.storeApiKey(providerId, key);
        }
      });
      providers.forEach(p => {
        if (p.baseURL) {
          sessionStorage.setItem(`base_url_${p.providerId}`, p.baseURL);
        }
      });

      // Store the active provider's API key in session storage for immediate use
      const activeProvider = providers.find(p => p.isActive);
      if (activeProvider && apiKeys[activeProvider.providerId]) {
        sessionStorage.setItem('openai_api_key', apiKeys[activeProvider.providerId]);
        sessionStorage.setItem('active_provider', activeProvider.providerId);
      }
      
      toast({ title: "Success", description: "Provider settings saved." });
      
      if (onComplete) onComplete();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestProvider = async (providerId, model) => {
    try {
      const apiKey = apiKeys[providerId];
      if (!apiKey) {
        toast({ title: "API Key Missing", description: "Please enter an API key for this provider.", variant: "destructive" });
        return;
      }
      let response, data;
      if (providerId === 'openrouter') {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Semantic Canvas',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'user', content: 'Hello, this is a test prompt to verify the connection.' }
            ]
          })
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || response.statusText);
        toast({
          title: "Test Successful",
          description: `OpenRouter responded: "${data.choices?.[0]?.message?.content?.substring(0, 50) || 'No response'}..."`
        });
        // eslint-disable-next-line no-console
        console.log('[ProviderSetup][OpenRouter] Response:', data);
        return;
      }
      if (providerId === 'venice') {
        response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'user', content: 'Hello, this is a test prompt to verify the connection.' }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || response.statusText);
        toast({
          title: "Test Successful",
          description: `Venice responded: "${data.choices?.[0]?.message?.content?.substring(0, 50) || 'No response'}..."`
        });
        // eslint-disable-next-line no-console
        console.log('[ProviderSetup][Venice] Response:', data);
        return;
      }
      if (providerId === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'user', content: 'Hello, this is a test prompt to verify the connection.' }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || response.statusText);
        toast({
          title: "Test Successful",
          description: `OpenAI responded: "${data.choices?.[0]?.message?.content?.substring(0, 50) || 'No response'}..."`
        });
        return;
      }
      toast({ title: 'Unsupported provider', description: providerId });
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

  if (isLoading) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[ProviderSetup] Still loading provider config...');
    }
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  if (error) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[ProviderSetup] Error loading provider config:', error);
    }
    return <div className="text-red-500">Error loading provider config: {error.message}</div>;
  }

  if (Array.isArray(initialProviders) && initialProviders.length === 0) {
    return (
      <div className="text-red-500">No providers available. Please contact support.</div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Configure AI Providers</h2>
          <p className="text-blue-100">Choose and configure your AI providers to get started with Semantic Canvas</p>
        </div>

        <Tabs value={selectedProvider} onValueChange={setSelectedProvider} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {providers.map(provider => (
              <TabsTrigger key={provider.providerId} value={provider.providerId} className="flex items-center gap-2">
                {provider.name}
                {provider.isActive && <Badge variant="secondary" className="text-xs">Active</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>

          {providers.map(provider => (
            <TabsContent key={provider.providerId} value={provider.providerId}>
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">{provider.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={provider.isActive}
                        onCheckedChange={() => handleActivateProvider(provider.providerId)}
                      />
                      <Label className="text-white">Active</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Base URL</Label>
                    <Input
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      value={provider.baseURL}
                      onChange={(e) => handleProviderUpdate(provider.providerId, 'baseURL', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">API Key</Label>
                    <div className="relative">
                    <Input
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 pr-10"
                      type={showApiKeys[provider.providerId] ? "text" : "password"}
                      value={apiKeys[provider.providerId] || ''}
                      onChange={(e) => handleApiKeyChange(provider.providerId, e.target.value)}
                      placeholder="Enter your API key"
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

                  <div>
                    <Label className="text-white">Available Models</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {provider.models.map(model => (
                        <Badge key={model} variant="outline" className="flex items-center gap-1 text-white border-white/20">
                          {model}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTestProvider(provider.providerId, model)}
                            disabled={!provider.apiKey || isSaving}
                            className="h-4 w-4 p-0 text-white/70 hover:text-white"
                          >
                            <TestTube2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {provider.apiKey && (
                    <div className="pt-4 border-t border-white/10">
                      <Button
                        variant="outline"
                        onClick={() => handleTestProvider(provider.providerId, provider.models[0])}
                        disabled={isSaving}
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        <TestTube2 className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-8 flex justify-between items-center">
          <p className="text-blue-100 text-sm">
            {isValid ? "✓ Ready to proceed" : "Please configure at least one provider with an API key"}
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
    </div>
  );
};

export default ProviderSetup;
