import React, { useEffect, useState } from 'react';
import { SecureKeyManager } from '@/lib/security';
import { fetchPublicConfig } from '@/lib/auth';

const LOCAL_KEY = 'sf_local_settings_v1';

// Win95 tokens for consistent styling
const win95 = {
  outset: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
  inset: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white',
  title: 'bg-[#000080] text-white font-semibold px-2 py-1',
  panel: 'bg-[#c0c0c0] border-2',
  button: 'bg-[#c0c0c0] border-2 px-2 py-1 cursor-pointer',
  inputField: 'bg-white text-black border-2 px-2 py-1 focus:outline-none',
};

export default function AdminPanel() {
  const [config, setConfig] = useState(null);
  const [provider, setProvider] = useState(sessionStorage.getItem('active_provider') || 'openai');
  const [apiKey, setApiKey] = useState('');
  const [features, setFeatures] = useState({ discourseTab: true, experimental: false });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPublicConfig().then(setConfig).catch(() => setConfig(null));
    const stored = SecureKeyManager.getApiKey(provider);
    setApiKey(stored || '');
    try {
      const json = localStorage.getItem(LOCAL_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        if (parsed.features) setFeatures(parsed.features);
        if (parsed.notes) setNotes(parsed.notes);
      }
    } catch {}
  }, []);

  const saveProvider = () => {
    if (apiKey) SecureKeyManager.storeApiKey(provider, apiKey);
    sessionStorage.setItem('active_provider', provider);
    alert('Provider settings saved (BYOK).');
  };

  const saveLocal = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ features, notes }));
    alert('Local settings saved');
  };

  const onExport = () => {
    const payload = { features, notes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'semantic_flow_settings.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.features) setFeatures(parsed.features);
        if (parsed.notes) setNotes(parsed.notes);
        alert('Imported settings. Click Save to persist.');
      } catch {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full overflow-auto bg-[#008080] text-black flex items-start justify-center">
      <div className="w-full max-w-5xl p-4">
        <div className={`${win95.panel} ${win95.outset} w-full`}>
          <div className={win95.title}>
            <h1 className="text-base font-semibold" aria-level={1} role="heading">Admin Panel</h1>
          </div>
          <div className="p-4 bg-[#c0c0c0] grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Providers */}
            <div className={`${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Providers (BYOK)</div>
              <div className={`${win95.inset} p-3 m-2 space-y-3`}>
                <div className="text-sm">Active Provider</div>
                <select
                  className={`${win95.inset} ${win95.inputField} w-full text-sm`}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="venice">Venice AI</option>
                </select>
                <div className="text-sm">API Key (session-only, encrypted)</div>
                <input
                  className={`${win95.inset} ${win95.inputField} w-full text-sm`}
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <div className="flex gap-2 pt-1">
                  <button
                    className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white hover:brightness-110`}
                    onClick={saveProvider}
                  >
                    Save Provider Settings
                  </button>
                </div>
              </div>
            </div>

            {/* SSO & Discourse */}
            <div className={`${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>SSO & Discourse</div>
              <div className={`${win95.inset} p-3 m-2`}>
                {!config && <div className="text-sm">Loading…</div>}
                {config && (
                  <div className="text-[12px] grid gap-1">
                    <div>
                      Discourse Base URL: <code>{config.discourseBaseUrl}</code>
                    </div>
                    <div>
                      SSO Provider Enabled: <strong>{config.ssoProvider ? 'yes' : 'no'}</strong>
                    </div>
                    <div>
                      App Base URL: <code>{config.appBaseUrl}</code>
                    </div>
                  </div>
                )}
                <div className="text-[11px] opacity-70 mt-2">
                  Server-only secrets are not shown. Session uses httpOnly cookie + CSRF.
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className={`${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Feature Toggles</div>
              <div className={`${win95.inset} p-3 m-2 space-y-2`}>
                <label className="flex items-center gap-2 text-[12px]">
                  <input
                    type="checkbox"
                    checked={features.discourseTab}
                    onChange={(e) => setFeatures({ ...features, discourseTab: e.target.checked })}
                  />
                  Enable Discourse tab
                </label>
                <label className="flex items-center gap-2 text-[12px]">
                  <input
                    type="checkbox"
                    checked={features.experimental}
                    onChange={(e) => setFeatures({ ...features, experimental: e.target.checked })}
                  />
                  Experimental features
                </label>
                <div className="pt-1">
                  <button className={`${win95.button} ${win95.outset} text-sm`} onClick={saveLocal}>
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Import / Export */}
            <div className={`${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Import / Export</div>
              <div className={`${win95.inset} p-3 m-2 space-y-3`}>
                <div className="flex flex-wrap gap-2 items-center">
                  <button className={`${win95.button} ${win95.outset} text-sm`} onClick={onExport}>
                    Export JSON
                  </button>
                  <label className="text-[12px] cursor-pointer">
                    <span className={`${win95.button} ${win95.outset} inline-block`}>Import JSON</span>
                    <input type="file" accept="application/json" className="hidden" onChange={onImport} />
                  </label>
                </div>
                <div className="text-sm">Notes</div>
                <textarea
                  className={`${win95.inset} ${win95.inputField} w-full min-h-[120px]`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for this config"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
