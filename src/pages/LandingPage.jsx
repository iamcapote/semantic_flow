import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleProviderSetup from '@/components/SimpleProviderSetup';
import { useAuth } from '@/lib/auth';

const win98 = {
  app: { minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  window: { width: 920, maxWidth: '95vw', background: '#c0c0c0', color: '#000', border: '2px solid #808080', boxShadow: '4px 4px 0 #000' },
  title: { height: 28, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontWeight: 700 },
  menu: { height: 28, display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff', borderRight: '2px solid #6d6d6d', borderBottom: '2px solid #6d6d6d', background: '#c0c0c0' },
  body: { padding: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' },
  panel: { background: '#fff', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 12, minHeight: 220 },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '6px 10px', cursor: 'pointer' },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700, margin: '-12px -12px 12px -12px' },
  field: { display: 'grid', gap: 6 },
  foot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderTop: '1px solid #808080' }
};

export default function LandingPage({ onApiKeySet }) {
  const [showProviderSetup, setShowProviderSetup] = useState(false);
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const handleProviderSetupComplete = () => {
    onApiKeySet && onApiKeySet();
    navigate('/');
  };

  return (
    <div style={win98.app}>
      <div style={win98.window} role="dialog" aria-label="Semantic Flow Setup">
        <div style={win98.title}>
          <span>Semantic Flow — Windows 95 Setup</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={win98.btn} aria-label="min">_</button>
            <button style={win98.btn} aria-label="max">□</button>
            <button style={win98.btn} aria-label="close">X</button>
          </div>
        </div>
        <div style={win98.menu}>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>{user ? `Signed in as ${user.username}` : 'Not signed in'}</span>
        </div>
        <div style={win98.body}>
          {/* Brand / App info (spans two columns) */}
          <div style={{ ...win98.panel, gridColumn: '1 / -1' }}>
            <div style={win98.head}>Semantic Flow — Win95+</div>
            <div style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 12, alignItems: 'center' }}>
              <img src="/logo.svg" alt="Semantic Flow" width={96} height={96} style={{ border: '2px solid #808080', background:'#fff' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>Design structured context your models can understand.</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>Semantic Canvas</div>
                    <div style={{ fontSize:13 }}>Lay out nodes with explicit fields. Add, link, and refine without hidden automation or opaque chains.</div>
                  </div>
                  <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>Multi‑Format</div>
                    <div style={{ fontSize:13 }}>Markdown narrative beside JSON, YAML, or XML structure. Convert inline; keep intent and schema aligned.</div>
                  </div>
                  <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>Inline AI Assist</div>
                    <div style={{ fontSize:13 }}>Generate a first pass, enhance any field, or execute sequentially with a provider key you supply.</div>
                  </div>
                  <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8 }}>
                    <div style={{ fontWeight:700, marginBottom:4 }}>Pluggable SSO Context</div>
                    <div style={{ fontSize:13 }}>Configure SSO apps (e.g. Discourse) to pull personas, seeds, or org context. Session data & provider keys stay local (session‑only, encrypted).</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Discourse SSO */}
          <div style={win98.panel}>
            <div style={win98.head}>Discourse SSO (Example)</div>
            <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 12 }}>
              Sign in via hub.bitwiki.org to unlock personas, seeds, and shared context. Additional SSO providers can be enabled server‑side.
            </div>
            <div style={win98.field}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Provider: https://hub.bitwiki.org</div>
              <button style={win98.btn} onClick={login}>Sign in with Discourse</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, opacity: 0.7 }}>Secret is configured on the server and never exposed to the client.</div>
          </div>

      {/* BYOK */}
          <div style={win98.panel}>
    <div style={win98.head}>Bring Your Own Keys</div>
            {!showProviderSetup ? (
              <>
                <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 12 }}>
      Configure model & tool providers (OpenAI, OpenRouter, Venice, etc.) to run the canvas without SSO. Keys are session-only and encrypted.
                </div>
        <button style={win98.btn} onClick={() => setShowProviderSetup(true)}>Configure Providers…</button>
              </>
            ) : (
              <div style={{ background: '#f5f5f5', border: '1px solid #808080', padding: 8 }}>
                <SimpleProviderSetup userId="demo-user" onComplete={handleProviderSetupComplete} />
              </div>
            )}
          </div>
        </div>
        <div style={win98.foot}>
          <div style={{ fontSize: 12 }}>Tip: You can switch between SSO and BYOK anytime from Router settings.</div>
          <div>
            <button style={win98.btn} onClick={() => navigate('/')}>Enter App</button>
          </div>
        </div>
      </div>
    </div>
  );
}