import React, { useEffect, useRef, useState } from 'react';

/**
 * Small floating notification indicating a new server build is available.
 * Listens to /api/meta/version/stream (SSE). First received version becomes baseline.
 * Subsequent version events that differ (by startedAt, version, or commit) trigger the UI.
 */
export default function UpdateNotifier() {
  const baselineRef = useRef(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const dismissedVersionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return; // test/jsdom guard
    let es;
    const connect = () => {
      try { es = new EventSource('/api/meta/version/stream'); } catch { return; }
      es.addEventListener('version', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!baselineRef.current) {
            baselineRef.current = data;
            return;
          }
          const changed =
            data.startedAt !== baselineRef.current.startedAt ||
            data.version !== baselineRef.current.version ||
            data.commit !== baselineRef.current.commit;
          if (changed && dismissedVersionRef.current !== data.startedAt) {
            setUpdateInfo(data);
          }
        } catch (_) { /* noop */ }
      });
      es.onerror = () => {
        try { es.close(); } catch {}
        setTimeout(connect, 5000);
      };
    };
    connect();
    return () => { try { es && es.close(); } catch {} };
  }, []);

  if (!updateInfo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2000,
        background: '#000080',
        color: '#fff',
        padding: '12px 14px',
        width: 260,
        fontSize: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        border: '2px solid #ffffff',
        display: 'grid',
        gap: 8,
        fontFamily: 'var(--font-sans, system-ui, Arial, sans-serif)'
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ fontWeight: 700, fontSize: 13 }}>Update Available</div>
      <div style={{ lineHeight: 1.4 }}>
        A new server build is live.
        {updateInfo.version && (<><br/>Version: {updateInfo.version}</>)}
        {updateInfo.commit && (<><br/>Commit: {String(updateInfo.commit).slice(0,7)}</>)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            flex: 1,
            background: '#fff',
            color: '#000',
            border: '1px solid #000',
            cursor: 'pointer',
            padding: '4px 6px',
            fontWeight: 600
          }}
        >
          Reload
        </button>
        <button
          onClick={() => { dismissedVersionRef.current = updateInfo.startedAt; setUpdateInfo(null); }}
          style={{
            background: '#c0c0c0',
            color: '#000',
            border: '1px solid #000',
            cursor: 'pointer',
            padding: '4px 6px'
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
