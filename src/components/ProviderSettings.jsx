import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TestTube2, ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle, AlertCircle, Settings2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/ui/use-toast";

const ProviderSettings = ({ userId }) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: initialProviders, isLoading, refetch } = trpc.provider.getConfig.useQuery(
    { userId },
    { 
      enabled: !!userId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );
  
  const updateConfigMutation = trpc.provider.updateConfig.useMutation({
    onSuccess: () => {
      setHasChanges(false);
      refetch();
    }
  });
  
  const testNodeMutation = trpc.provider.testNode.useMutation();

  useEffect(() => {
    if (initialProviders && initialProviders.length > 0) {
      setProviders(initialProviders);
    }
  }, [initialProviders]);

  const handleProviderUpdate = (providerId, field, value) => {
    setProviders(prev => prev.map(p => 
      p.providerId === providerId ? { ...p, [field]: value } : p
    ));
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    if (!hasChanges) return;
    
    try {
      await updateConfigMutation.mutateAsync({
        userId,
        configs: providers.map(({ userId, ...rest }) => rest)
      });
      toast({ title: "Success", description: "Provider settings saved." });
      
      const activeProvider = providers.find(p => p.isActive);
      if (activeProvider && activeProvider.apiKey) {
        sessionStorage.setItem(`${activeProvider.providerId}_api_key`, activeProvider.apiKey);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const handleTestProvider = async (providerId, model) => {
    const providerToTest = providers.find(p => p.providerId === providerId);
    if (!providerToTest || !providerToTest.apiKey) {
      toast({ title: "API Key Missing", description: "Please enter an API key for this provider before testing.", variant: "destructive" });
      return;
    }

    try {
      const result = await testNodeMutation.mutateAsync({
        userId,
        nodeId: 'test-node',
        nodeType: 'Test',
        content: 'Hello! This is a test to verify the connection works.',
        providerId,
        model,
        apiKey: providerToTest.apiKey,
        parameters: { temperature: 0.7, max_tokens: 50, top_p: 1 },
      });
      toast({ 
        title: "Test Successful", 
        description: `${result.provider} is working correctly!` 
      });
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
    setHasChanges(true);
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
        <span className="ml-2 text-muted-foreground">Loading providers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">AI Provider Settings</h2>
        </div>
        <Button 
          onClick={handleSaveConfig} 
          disabled={!hasChanges || updateConfigMutation.isLoading}
          variant={hasChanges ? "default" : "outline"}
        >
          {updateConfigMutation.isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => {
          const status = getProviderStatus(provider);
          const isExpanded = expandedProvider === provider.providerId;
          
          return (
            <Card key={provider.providerId} className="transition-all duration-200 hover:shadow-md">
              <Collapsible
                open={isExpanded}
                onOpenChange={(open) => setExpandedProvider(open ? provider.providerId : null)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{provider.baseURL}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'active' && (
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        )}
                        {status === 'configured' && (
                          <Badge variant="secondary">
                            Configured
                          </Badge>
                        )}
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Base URL</Label>
                        <Input
                          value={provider.baseURL}
                          onChange={(e) => handleProviderUpdate(provider.providerId, 'baseURL', e.target.value)}
                          placeholder="https://api.example.com/v1"
                        />
                      </div>
                      
                      <div>
                        <Label>API Key</Label>
                        <div className="relative">
                          <Input
                            type={showApiKeys[provider.providerId] ? "text" : "password"}
                            value={provider.apiKey}
                            onChange={(e) => handleProviderUpdate(provider.providerId, 'apiKey', e.target.value)}
                            placeholder="Enter your API key..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => toggleApiKeyVisibility(provider.providerId)}
                          >
                            {showApiKeys[provider.providerId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Available Models</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {provider.models.map(model => (
                          <Badge key={model} variant="outline" className="flex items-center gap-1">
                            {model}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTestProvider(provider.providerId, model)}
                              disabled={!provider.apiKey || testNodeMutation.isLoading}
                              className="h-4 w-4 p-0 hover:bg-muted"
                            >
                              <TestTube2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      {provider.apiKey && (
                        <Button
                          variant="outline"
                          onClick={() => handleTestProvider(provider.providerId, provider.models[0])}
                          disabled={testNodeMutation.isLoading}
                        >
                          <TestTube2 className="h-4 w-4 mr-2" />
                          Test Connection
                        </Button>
                      )}
                      
                      {provider.apiKey && !provider.isActive && (
                        <Button
                          onClick={() => handleActivateProvider(provider.providerId)}
                          variant="default"
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

      {providers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No providers configured yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProviderSettings;
