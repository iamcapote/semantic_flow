// @ts-nocheck
import React from 'react';
import TopNav95Plus from '@/components/TopNav95Plus';
import DocsPanel95 from '@/components/DocsPanel95';

export default function DocsPage() {
  const sections = [
    { id: 'builder', label: 'Builder', href: '/builder' },
    { id: 'ide', label: 'IDE', href: '/ide' },
    { id: 'api', label: 'Router', href: '/api' },
    { id: 'chat', label: 'Chat', href: '/chat' },
    { id: 'console', label: 'Console', href: '/console' },
    { id: 'learn', label: 'Learn', href: '/learn' },
  ];

  const bevel = {
    out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
    in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#008080]">
      <TopNav95Plus
        appTitle="Semantic Flow — Docs"
        iconSrc="/logo.svg"
        sections={sections}
        activeId="learn"
        onSelect={(id) => {
          const target = sections.find(s => s.id === id);
          if (target?.href) window.location.href = target.href;
        }}
      />
      <div className="flex-1 overflow-auto p-4 mx-auto w-full max-w-7xl">
        <div className={`mb-3 ${bevel.out} border-2`} style={{ background:'#c0c0c0' }}>
          <div className="flex items-center justify-between px-3 py-2 text-white" style={{ background:'#000080' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white" />
              <div className="font-semibold text-sm">Project Documentation</div>
            </div>
            <div className="text-[10px] opacity-70">Win95+ Nested /learn/docs</div>
          </div>
          <div className="p-3">
            <p className="text-xs mb-3 bg-[#fffbd1] border border-[#d0c86a] p-2 text-[#3b3b00]">
              This documentation set is generated from the live codebase and rendered inline. Use the left sidebar to navigate. The Learn overview remains at <code>/learn</code>.
            </p>
            <DocsPanel95 />
          </div>
        </div>
      </div>
    </div>
  );
}
