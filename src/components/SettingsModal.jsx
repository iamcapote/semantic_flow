import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import ProviderSettings from './ProviderSettings';

// Minimal Win95 modal implementation (no dependency on shadcn) to unify style
// Re-uses global win95-plus tokens.

const bevel = {
  out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
  in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
};

const SettingsModal = ({ apiKey, setApiKey, systemMessage, setSystemMessage, userId }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('providers');
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        className={`w-7 h-7 flex items-center justify-center bg-[var(--w95-face)] ${bevel.out} border-2 cursor-pointer`}
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[1000]" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-[#00000066]" onClick={() => setOpen(false)} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] max-w-[95vw] max-h-[80vh] flex flex-col bg-[var(--w95-face)] ${bevel.out} border-2 shadow-xl`}>
            <div className="flex items-center justify-between px-3 h-8" style={{ background: 'var(--w95-title)', color: 'var(--w95-highlight)' }}>
              <span className="font-bold text-sm">Settings</span>
              <button onClick={() => setOpen(false)} className={`w-6 h-6 flex items-center justify-center bg-[var(--w95-face)] ${bevel.out} border-2 text-xs`} aria-label="Close settings">×</button>
            </div>
            <div className="flex border-b border-[var(--w95-shadow)]">
              {['providers','general'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 text-xs ${tab===t ? 'bg-white' : 'bg-[var(--w95-face)]'} ${bevel.out} border-2 border-b-0 -mb-[1px]`}>{t === 'providers' ? 'AI Providers' : 'General'}</button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-3 text-sm bg-[var(--w95-face)] w95-modal">
              {tab === 'providers' && (
                <div className="space-y-3">
                  <ProviderSettings userId={userId} />
                  <p className="text-[11px] leading-4 opacity-80">Configure multiple providers. Stored securely in session/local storage via key manager.</p>
                </div>
              )}
              {tab === 'general' && (
                <div className="space-y-3 text-[11px]">
                  <div className="w95-panel-info p-3">
                    <h4>Chat Behavior</h4>
                    <ul>
                      <li>System Message edited directly in right panel (Prompts).</li>
                      <li>Workflow injection modes configure DSL placement (None/System/First Message).</li>
                      <li>Multi-Stage Composer manages any number of role-sequenced prefills.</li>
                    </ul>
                  </div>
                  <div className="w95-panel-info p-3">
                    <h4>Keys & Providers</h4>
                    <p>Use the AI Providers tab to set or activate provider keys. Legacy single OpenAI key input removed.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 flex items-center justify-end gap-2 px-3 border-t border-[var(--w95-shadow)] bg-[var(--w95-face)]">
              <button onClick={() => setOpen(false)} className={`px-3 py-1 text-xs bg-[var(--w95-face)] ${bevel.out} border-2`}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;