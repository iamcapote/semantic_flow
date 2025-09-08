import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleProviderSetup from '@/components/SimpleProviderSetup';
import { useAuth, fetchPublicConfig, getBrandName } from '@/lib/auth';

const win98 = {
  app: { minHeight: '100vh', background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  window: { width: 920, maxWidth: '95vw', background: '#c0c0c0', color: '#000', border: '2px solid #808080', boxShadow: '4px 4px 0 #000' },
  title: { height: 28, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontWeight: 700 },
  menu: { height: 24, display: 'flex', alignItems: 'stretch', gap: 2, padding: '0 4px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff', borderRight: '2px solid #6d6d6d', borderBottom: '2px solid #6d6d6d', background: '#c0c0c0', fontSize: 12 },
  menuItem: { padding: '0 10px', display: 'flex', alignItems: 'center', cursor: 'default', userSelect: 'none', border: '1px solid transparent' },
  menuItemHover: { border: '1px solid #808080', background: '#000080', color: '#fff' },
  body: { padding: 12, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' },
  panel: { background: '#fff', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 12, minHeight: 220 },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '6px 10px', cursor: 'pointer', fontSize: 13 },
  btnBlock: { width: '100%', fontWeight: 600, textAlign: 'center' },
  windowBtn: { width: 22, height: 20, lineHeight: '18px', padding: 0, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700, margin: '-12px -12px 12px -12px' },
  field: { display: 'grid', gap: 6 },
  foot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderTop: '1px solid #808080' }
};

function MenuItem({ label }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ ...(win98.menuItem), ...(hover ? win98.menuItemHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {label}
    </div>
  );
}

function WindowBtn({ children, aria }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      aria-label={aria}
      style={{ ...win98.btn, ...win98.windowBtn, boxShadow: pressed ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #FFF' : win98.btn.boxShadow }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

export default function LandingPage({ onApiKeySet }) {
  const [showProviderSetup, setShowProviderSetup] = useState(false);
  const { user, loading, login } = useAuth();
  const [brand, setBrand] = useState('Discourse');
  useEffect(() => { (async () => { try { await fetchPublicConfig(); setBrand(getBrandName()); } catch {} })(); }, []);
  const navigate = useNavigate();

  const handleProviderSetupComplete = () => {
    onApiKeySet && onApiKeySet();
    // Move user directly into the main suite after configuring a key
    navigate('/builder');
  };

  return (
    <div style={win98.app}>
      <div style={win98.window} role="dialog" aria-label="Semantic Flow Setup">
        <div style={win98.title}>
          <span>Semantic Flow — Windows 95 Setup</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <WindowBtn aria="min">_</WindowBtn>
            <WindowBtn aria="max">□</WindowBtn>
            <WindowBtn aria="close">X</WindowBtn>
          </div>
        </div>
        <div style={win98.menu}>
          <MenuItem label="File" />
          <MenuItem label="Edit" />
          <MenuItem label="View" />
          <MenuItem label="Help" />
          <div style={{ marginLeft: 'auto', display:'flex', alignItems:'center', padding:'0 4px', opacity:0.75 }}>{user ? `Signed in as ${user.username}` : 'Not signed in'}</div>
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
          {/* SSO (dynamic brand) */}
          <div style={win98.panel}>
            <div style={win98.head}>Connect to {brand}</div>
            <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8, marginBottom:10, fontSize:12, lineHeight:1.45 }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>Single sign‑on workspace sync</div>
              Use your {brand} account (<span style={{ fontFamily:'monospace' }}>hub.bitwiki.org</span>) to pull Personas, project Seeds, and {brand}‑linked threads into this session. Approval happens on {brand}, then you return with a scoped session. Secrets & SSO keys stay server‑side; nothing is persisted beyond the session.
              <div style={{ marginTop:6, fontSize:11, opacity:0.85 }}>Benefits: instant prefs • shared memory layer • identity continuity.</div>
            </div>
            <div style={win98.field}>
              <button style={{ ...win98.btn, ...win98.btnBlock }} onClick={login}>Login with {brand}</button>
            </div>
          </div>

          {/* BYOK */}
          <div style={win98.panel}>
            <div style={win98.head}>Bring Your Own Keys</div>
            {!showProviderSetup ? (
              <>
                <div style={{ background:'#f7f7f7', border:'1px solid #808080', padding:8, marginBottom:10, fontSize:12, lineHeight:1.45 }}>
                  <div style={{ fontWeight:700, marginBottom:4 }}>Local provider control</div>
                  Add API keys for OpenAI, OpenRouter, Venice, Nous, Morpheus (and more) to drive AI assist, conversions, and execution. Keys are encrypted & session‑only (cleared on refresh/logout). Mix SSO context with BYOK models—or run fully offline from local storage.
                  <div style={{ marginTop:6, fontSize:11, opacity:0.85 }}>Supports: multi‑provider switching • custom models • prompt templates.</div>
                </div>
                <div style={win98.field}>
                  <button style={{ ...win98.btn, ...win98.btnBlock }} onClick={() => setShowProviderSetup(true)}>Configure Providers…</button>
                </div>
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
            <button style={{ ...win98.btn, ...win98.btnBlock, minWidth:120 }}
              onClick={() => navigate('/builder')}>Enter App</button>
          </div>
        </div>
      </div>
    </div>
  );
}