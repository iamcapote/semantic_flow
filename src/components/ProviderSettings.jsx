import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Eye, EyeOff, Plus } from 'lucide-react';
import { SecureKeyManager } from '@/lib/security';

// ProviderSettings manages the configuration and testing of AI providers for the semantic flow canvas.
const defaultProviders = [
  {
    providerId: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['venice-uncensored', 'mistral-31-24b', 'llama-3.2-3b'],
    defaultModel: 'venice-uncensored',
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
      'deepseek/deepseek-chat-v3-0324:free',
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
    apiKey: '',
    isActive: false,
    description: 'Privacy-focused AI inference with no data retention'
  }
];

const bevel = {
  out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
  in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
};

const ProviderSettings = () => {
  const [providers, setProviders] = useState(defaultProviders);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [customModels, setCustomModels] = useState({});

  // Load persisted keys, base URLs and active provider from session on mount
  useEffect(() => {
    try {
      const mapped = defaultProviders.map(p => ({
        ...p,
        apiKey: SecureKeyManager.getApiKey(p.providerId) || p.apiKey,
        baseURL: sessionStorage.getItem(`base_url_${p.providerId}`) || p.baseURL,
        isActive: sessionStorage.getItem('active_provider') === p.providerId ? true : p.isActive,
      }));
      setProviders(mapped);
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist API keys and base URLs to session when providers change
  useEffect(() => {
    try {
      providers.forEach(p => {
        if (p.apiKey && p.apiKey.trim()) {
          SecureKeyManager.storeApiKey(p.providerId, p.apiKey);
        } else {
          SecureKeyManager.clearApiKey(p.providerId);
        }
        if (p.baseURL && p.baseURL.trim()) sessionStorage.setItem(`base_url_${p.providerId}`, p.baseURL);
      });
    } catch (e) {
      // ignore
    }
  }, [providers]);

  // No initialProviders logic needed; defaultProviders is always used.
  const handleProviderUpdate = (providerId, field, value) => {
    setProviders(prev => prev.map(p =>
      p.providerId === providerId ? { ...p, [field]: value } : p
    ));
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
    // persist active provider selection
    try { sessionStorage.setItem('active_provider', providerId); } catch {}
  };

  const clearProviderKey = (providerId) => {
    try {
  SecureKeyManager.clearApiKey(providerId);
      setProviders(prev => prev.map(p => p.providerId === providerId ? { ...p, apiKey: '' } : p));
    } catch (e) {}
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

  return (
    <div className="flex flex-col gap-3">
      {providers.map(provider => {
        const status = getProviderStatus(provider);
        const isExpanded = expandedProvider === provider.providerId;
        return (
          <div key={provider.providerId} className="w95-provider-group">
            <button onClick={() => setExpandedProvider(isExpanded ? null : provider.providerId)} className="w95-provider-header">
              <span>{provider.name}<span className="status">{status}</span></span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isExpanded && (
              <div className="w95-provider-body text-[11px] space-y-3">
                <div className="text-[10px] leading-4 italic opacity-80">{provider.description}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">Base URL
                    <input value={provider.baseURL} onChange={(e)=>handleProviderUpdate(provider.providerId,'baseURL',e.target.value)} className={`text-xs px-2 py-1 bg-white ${bevel.in} border-2 outline-none`} />
                  </label>
                  <label className="flex flex-col gap-1">API Key
                    <div className="flex items-center gap-2">
                      <input type={showApiKeys[provider.providerId] ? 'text':'password'} value={provider.apiKey} onChange={(e)=>handleProviderUpdate(provider.providerId,'apiKey',e.target.value)} className={`flex-1 text-xs px-2 py-1 bg-white ${bevel.in} border-2 outline-none`} />
                      <button type="button" onClick={()=>toggleApiKeyVisibility(provider.providerId)} className={`px-2 py-1 text-[10px] bg-[var(--w95-face)] ${bevel.out} border-2`}>{showApiKeys[provider.providerId] ? 'Hide' : 'Show'}</button>
                    </div>
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-2">Default Model
                    <select value={provider.defaultModel} onChange={(e)=>handleProviderUpdate(provider.providerId,'defaultModel',e.target.value)} className={`text-xs px-2 py-1 bg-white ${bevel.in} border-2 outline-none`}>
                      {provider.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-2">Add Custom Model
                    <div className="flex gap-2">
                      <input value={customModels[provider.providerId] || ''} onChange={(e)=>handleCustomModelChange(provider.providerId,e.target.value)} className={`flex-1 text-xs px-2 py-1 bg-white ${bevel.in} border-2 outline-none`} placeholder="model-id" />
                      <button disabled={!customModels[provider.providerId]?.trim()} onClick={()=>handleAddCustomModel(provider.providerId)} className={`px-2 py-1 text-[10px] bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`}><Plus className="w-3 h-3" /></button>
                    </div>
                  </label>
                </div>
                {provider.apiKey && !provider.isActive && (
                  <div className="flex gap-2">
                    <button onClick={()=>handleActivateProvider(provider.providerId)} className={`px-3 py-1 text-[11px] bg-[var(--w95-face)] ${bevel.out} border-2`}>Set Active</button>
                    <button onClick={()=>clearProviderKey(provider.providerId)} className={`px-3 py-1 text-[11px] bg-[var(--w95-face)] ${bevel.out} border-2`}>Clear Key</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProviderSettings;
