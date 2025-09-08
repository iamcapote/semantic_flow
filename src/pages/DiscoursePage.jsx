import React from 'react';
import TopNav95Plus from '@/components/TopNav95Plus';
import DiscourseViewer from '@/components/DiscourseViewer';
import { useAuth, fetchPublicConfig, getBrandName } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function DiscoursePage() {
  const { user } = useAuth();
  const [brand, setBrand] = useState('Discourse');
  useEffect(() => { (async () => { try { await fetchPublicConfig(); setBrand(getBrandName()); } catch {} })(); }, []);
  return (
    <div className="w95-font min-h-screen flex flex-col" style={{ background: 'var(--w95-desk)' }}>
      <TopNav95Plus
        appTitle={`Semantic Flow — ${brand}`}
        sections={[
          { id: 'builder', label: 'Builder', href: '/builder' },
          { id: 'ide', label: 'IDE', href: '/ide' },
          { id: 'api', label: 'Router', href: '/api' },
          { id: 'chat', label: 'Chat', href: '/chat' },
          { id: 'console', label: 'Console', href: '/console' },
          { id: 'learn', label: 'Learn', href: '/learn' },
        ]}
        activeId={undefined}
        onSelect={(id) => { window.location.href = `/${id === 'api' ? 'api' : id}`; }}
      />
      <DiscourseViewer embedded={false} />
      {!user && <div className="pb-8" />}
    </div>
  );
}
