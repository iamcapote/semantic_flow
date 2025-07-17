import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Eye, EyeOff, Key } from 'lucide-react';
import { SecureKeyManager } from '../lib/security';

export function ApiKeyModal({ isOpen, onClose }) {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: ''
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false
  });
  const [saved, setSaved] = useState(false);

  // Load existing keys on open
  useEffect(() => {
    if (isOpen) {
      setApiKeys({
        openai: SecureKeyManager.getApiKey('openai') || '',
        anthropic: SecureKeyManager.getApiKey('anthropic') || '',
        google: SecureKeyManager.getApiKey('google') || ''
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    // Store keys securely in session storage only
    Object.entries(apiKeys).forEach(([provider, key]) => {
      if (key.trim()) {
        SecureKeyManager.storeApiKey(provider, key.trim());
      }
    });
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 2000);
  };

  const handleClearAll = () => {
    SecureKeyManager.clearAllKeys();
    setApiKeys({
      openai: '',
      anthropic: '',
      google: ''
    });
  };

  const toggleShowKey = (provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const providers = [
    { key: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
    { key: 'anthropic', name: 'Anthropic', placeholder: 'sk-ant-...' },
    { key: 'google', name: 'Google AI', placeholder: 'AIza...' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Key Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Your API keys are stored securely in your browser session only. 
              They are never sent to our servers or stored in our database.
            </AlertDescription>
          </Alert>

          {providers.map((provider) => (
            <div key={provider.key} className="space-y-2">
              <Label htmlFor={provider.key} className="text-sm font-medium">
                {provider.name} API Key
              </Label>
              <div className="relative">
                <Input
                  id={provider.key}
                  type={showKeys[provider.key] ? 'text' : 'password'}
                  placeholder={provider.placeholder}
                  value={apiKeys[provider.key]}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    [provider.key]: e.target.value
                  }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => toggleShowKey(provider.key)}
                >
                  {showKeys[provider.key] ? 
                    <EyeOff className="h-4 w-4" /> : 
                    <Eye className="h-4 w-4" />
                  }
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={handleClearAll}>
              Clear All
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saved}>
                {saved ? 'Saved!' : 'Save Keys'}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            • Keys are encrypted and stored in session storage only<br/>
            • Keys are automatically cleared when you close the browser<br/>
            • No keys are ever stored on our servers
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
