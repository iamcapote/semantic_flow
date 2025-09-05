// @ts-nocheck
// WinGPT 95 — Unified Suite (Builder, IDE, Router, Console, Chat)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Builder95 from '@/components/Builder95';
import SemanticFlowBuilder from '@/components/SemanticFlowBuilder';
import IDE95 from '@/components/IDE95';
import Console95 from '@/components/Console95';
import APIConsolePage from './APIConsolePage';
import TopNav95Plus from '@/components/TopNav95Plus';
import ChatPage from './ChatPage';

// Legacy inline Win95Chat removed in favor of unified advanced ChatPage.

export default function Win95Suite({ initialTab }) {
  const [tab, setTab] = useState(initialTab || 'builder'); // builder | ide | console | chat | api
  const navigate = useNavigate();

  useEffect(() => {
    if (initialTab && initialTab !== tab) setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);
  
  // Ensure tab reflects route changes

  const tabBtn = (t, label) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '4px 10px',
        border: '2px solid #808080',
        boxShadow: tab === t ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff' : 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000',
        background: tab === t ? '#E6E6E6' : '#C0C0C0',
        cursor: 'pointer'
      }}
    >{label}</button>
  );

  const sections = [
    { id: 'builder', label: 'Builder', href: '/builder' },
    { id: 'ide', label: 'IDE', href: '/ide' },
    { id: 'api', label: 'Router', href: '/api' },
  { id: 'chat', label: 'Chat', href: '/chat' },
  { id: 'console', label: 'Console', href: '/console' },
  { id: 'learn', label: 'Learn', href: '/learn' },
  ];

  const onSelectTab = (id) => {
    setTab(id);
    const target = sections.find((s) => s.id === id);
    if (target?.href) navigate(target.href);
  };
  
  return (
    <div className="win95-suite-container" style={{ 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top navigation (single source of truth) */}
      <TopNav95Plus
        appTitle="Semantic Flow — The Core Layer for Composable Inference"
        iconSrc="/logo.svg"
        sections={sections}
        activeId={tab}
        onSelect={onSelectTab}
      />
      
      <div 
        className="content-area"
        style={{ 
          minHeight: 0,
          position: 'relative',
          zIndex: 995,
          flex: '1 1 auto',
          overflow: 'auto'
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {tab === 'builder' && (
            <div style={{ height: '100%' }}>
              <SemanticFlowBuilder />
            </div>
          )}
          {tab === 'ide' && (<IDE95 />)}
          {tab === 'console' && (<Console95 />)}
          {tab === 'api' && (
            <div style={{ height: '100%', overflow: 'auto' }}>
              <APIConsolePage />
            </div>
          )}
          {tab === 'chat' && <ChatPage embedded />}
        </div>
      </div>
    </div>
  );
}
