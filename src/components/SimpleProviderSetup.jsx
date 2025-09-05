import React, { useState, useEffect } from 'react';
import { Settings, TestTube2, CheckCircle, AlertCircle, ArrowRight, Eye, EyeOff, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SecureKeyManager } from '@/lib/security';

const SimpleProviderSetup = ({ userId, onComplete }) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [customModels, setCustomModels] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState('openai');

  const isLoading = false;

  // Win95 styles
  const win95 = {
    window: { background: '#c0c0c0', color: '#000', border: '2px solid #808080', boxShadow: '2px 2px 0 #000' },
    title: { height: 24, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', fontWeight: 700 },
    body: { padding: 10 },
    field: { display: 'grid', gap: 6, marginBottom: 8 },
    label: { fontSize: 12 },
    input: { background: '#fff', color: '#000', border: '2px solid #808080', padding: '6px 8px', width: '100%' },
    select: { background: '#fff', color: '#000', border: '2px solid #808080', padding: '4px 6px', width: '100%' },
    btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '4px 8px', cursor: 'pointer' },
    group: { border: '2px solid #808080', background: '#fff', padding: 8, marginTop: 8 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
    badge: (color) => ({ display:'inline-flex', alignItems:'center', gap:6, border:'1px solid #808080', padding:'2px 6px', background: color || '#EEE', fontSize: 12 }),
  };

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
        models: [
          'qwen/qwen3-235b-a22b-07-25:free',
          'moonshotai/kimi-k2:free',
          'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
          'qwen/qwen3-235b-a22b:free',
          'deepseek/deepseek-chat-v3-0324:free'
        ],
      defaultModel: 'qwen/qwen3-235b-a22b-07-25:free',
      apiKey: '',
      isActive: false,
      description: 'Access to multiple AI models through one API'
    },
    {
      providerId: 'venice',
      name: 'Venice AI',
      baseURL: 'https://api.venice.ai/api/v1',
      models: ['venice-uncensored', 'mistral-31-24b', 'llama-3.2-3b'],
      defaultModel: 'venice-uncensored',
      isActive: false,
      description: 'Privacy-focused AI inference with no data retention'
    },
    {
      providerId: 'nous',
      name: 'Nous Research',
      baseURL: 'https://inference-api.nousresearch.com/v1',
      models: [
        'Hermes-4-70B',
        'Hermes-4-405B',
        'Hermes-3-Llama-3.1-70B',
        'Hermes-3-Llama-3.1-405B',
        'DeepHermes-3-Llama-3-8B-Preview',
        'DeepHermes-3-Mistral-24B-Preview'
      ],
      defaultModel: 'Hermes-4-70B',
      apiKey: '',
      isActive: false,
      description: 'Open research lab producing Hermes reasoning model family'
    },
    {
      providerId: 'morpheus',
      name: 'Morpheus',
      baseURL: 'https://api.mor.org/api/v1',
      models: [
        'llama-3.3-70b',
        'llama-3.3-70b-web',
        'venice-uncensored-web',
        'qwen3-235b-web',
        'mistral-31-24b-web'
      ],
      defaultModel: 'llama-3.3-70b',
      apiKey: '',
      isActive: false,
      description: 'Gateway for fast chat/completions with popular open models'
    }
  ];

  useEffect(() => {
    const stored = defaultProviders.map(p => ({
      ...p,
      apiKey: SecureKeyManager.getApiKey(p.providerId) || '',
      baseURL: sessionStorage.getItem(`base_url_${p.providerId}`) || p.baseURL,
      isActive: sessionStorage.getItem('active_provider') === p.providerId ? true : p.isActive,
    }));
    setProviders(stored);
    const active = stored.find(p => p.isActive) || stored[0];
    setSelectedProviderId(active.providerId);
    const hasValidProvider = stored.some(p => p.apiKey && p.apiKey.trim() !== '');
    setIsValid(hasValidProvider);
  }, []);

  useEffect(() => {
    const hasValid = providers.some(p => p.apiKey && p.apiKey.trim() !== '');
    setIsValid(hasValid);
  }, [providers]);

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
      // Store all provider keys securely
      providers.forEach(p => {
        if (p.apiKey && p.apiKey.trim()) {
          SecureKeyManager.storeApiKey(p.providerId, p.apiKey);
        }
        if (p.baseURL && p.baseURL.trim()) {
          sessionStorage.setItem(`base_url_${p.providerId}`, p.baseURL);
        }
      });

      // Persist active provider choice
      const activeProvider = providers.find(p => p.isActive && p.apiKey);
      if (activeProvider) {
        sessionStorage.setItem('active_provider', activeProvider.providerId);
      }

      toast({ title: "Success", description: "Provider settings saved." });
      
      if (onComplete) onComplete();
    } catch (error) {
      const activeProvider = providers.find(p => p.isActive && p.apiKey);
      if (activeProvider) {
        SecureKeyManager.storeApiKey(activeProvider.providerId, activeProvider.apiKey);
        sessionStorage.setItem('active_provider', activeProvider.providerId);
        sessionStorage.setItem(`base_url_${activeProvider.providerId}`, activeProvider.baseURL);
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
    setProviders(prev => {
      const updated = prev.map(p => ({
        ...p,
        isActive: p.providerId === providerId
      }));
      sessionStorage.setItem('active_provider', providerId);
      return updated;
    });
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
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ ...win95.window }}>
        <div style={win95.title}>
          <Settings className="h-4 w-4" />
          <span>Configure AI Providers</span>
        </div>
        <div style={win95.body}>
          <div style={{ marginBottom: 8 }}>
            <div style={win95.label}>Select Provider</div>
            <select style={win95.select} value={selectedProviderId} onChange={(e)=>setSelectedProviderId(e.target.value)}>
              {providers.map(p => (<option key={p.providerId} value={p.providerId}>{p.name}</option>))}
            </select>
          </div>

          {(() => {
            const provider = providers.find(p => p.providerId === selectedProviderId);
            if (!provider) return null;
            const status = getProviderStatus(provider);
            return (
              <div style={{ ...win95.group }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {getStatusIcon(status)}
                    <div>
                      <div style={{ fontWeight: 700 }}>{provider.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>{provider.description}</div>
                    </div>
                  </div>
                  {status === 'active' && (
                    <div style={win95.badge('#CFF5CF')}>Active</div>
                  )}
                </div>

                <div style={win95.row}>
                  <div>
                    <div style={win95.label}>Base URL</div>
                    <input
                      style={win95.input}
                      value={provider.baseURL}
                      onChange={(e) => handleProviderUpdate(provider.providerId, 'baseURL', e.target.value)}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                  <div>
                    <div style={win95.label}>API Key</div>
                    <div style={{ position:'relative' }}>
                      <input
                        style={{ ...win95.input, paddingRight: 32 }}
                        type={showApiKeys[provider.providerId] ? 'text' : 'password'}
                        value={provider.apiKey}
                        onChange={(e) => handleProviderUpdate(provider.providerId, 'apiKey', e.target.value)}
                        placeholder="Enter your API key..."
                      />
                      <button type="button" onClick={() => toggleApiKeyVisibility(provider.providerId)} title="Toggle"
                        style={{ ...win95.btn, position:'absolute', right: 4, top: 4 }}>
                        {showApiKeys[provider.providerId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={win95.label}>Default Model</div>
                  <select style={win95.select} value={provider.defaultModel}
                    onChange={(e)=>handleProviderUpdate(provider.providerId, 'defaultModel', e.target.value)}>
                    {provider.models.map(model => (<option key={model} value={model}>{model}</option>))}
                  </select>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={win95.label}>Add Custom Model</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <input
                      style={win95.input}
                      value={customModels[provider.providerId] || ''}
                      onChange={(e) => handleCustomModelChange(provider.providerId, e.target.value)}
                      placeholder="e.g., gpt-4o-2024-08-06"
                    />
                    <button
                      style={win95.btn}
                      onClick={() => handleAddCustomModel(provider.providerId)}
                      disabled={!customModels[provider.providerId]?.trim()}
                      title="Add model"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginTop: 10, paddingTop: 8, borderTop: '1px solid #808080' }}>
                  {provider.apiKey && (
                    <button style={win95.btn} onClick={() => handleTestProvider(provider.providerId)} disabled={isSaving}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                        <TestTube2 className="h-4 w-4" /> Test with {provider.defaultModel || provider.models[0]}
                      </span>
                    </button>
                  )}

                  {provider.apiKey && !provider.isActive && (
                    <button style={win95.btn} onClick={() => handleActivateProvider(provider.providerId)}>
                      Set as Active
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 12, paddingTop: 8, borderTop: '1px solid #808080' }}>
            <div style={{ fontSize: 12 }}>{isValid ? '✓ Ready to proceed' : 'Please configure at least one provider'}</div>
            <button style={win95.btn} onClick={handleSaveAndContinue} disabled={!isValid || isSaving}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                {isSaving ? 'Saving…' : 'Save & Continue'} <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleProviderSetup;
