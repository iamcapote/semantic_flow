import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getLatest, getPMInbox, getPersonas, aiStream } from '@/lib/discourseApi';

const styles = {
  window: { background: '#c0c0c0', color: '#000', border: '2px solid #808080', boxShadow: '2px 2px 0 #000' },
  title: { height: 24, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', fontWeight: 700 },
  body: { padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  panel: { background: '#fff', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 8, minHeight: 180, display: 'flex', flexDirection: 'column' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '4px 8px', cursor: 'pointer' },
  input: { background: '#fff', color: '#000', border: '2px solid #808080', padding: '4px 6px' },
  log: { background: '#000', color: '#0f0', border: '1px solid #808080', padding: 6, fontSize: 12, height: 220, overflow: 'auto' },
  label: { fontSize: 12, marginBottom: 4 },
};

export default function DiscourseConfig() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [persona, setPersona] = useState('default');
  const [personas, setPersonas] = useState([]);
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const [lines, setLines] = useState([
    'Discourse API Config. This tab configures API usage, not SSO.',
    'SSO lives on Landing. Signed in: ' + (!!user),
  ]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [lines]);

  useEffect(() => {
    (async () => {
      try { const data = await getPersonas(); const list = data?.personas || []; setPersonas(list); if (list.length) setPersona(String(list[0].id)); }
      catch (e) { /* ignore */ }
    })();
  }, []);

  const print = (...msgs) => setLines(l => l.concat(msgs));

  async function refreshLatest() {
    try { setBusy(true); const data = await getLatest(page); print('Latest topics page ' + page + ': ' + (data?.topic_list?.topics?.length || 0)); }
    catch (e) { print('ERR latest: ' + (e?.message || 'failed')); }
    finally { setBusy(false); }
  }

  async function refreshPMs() {
    try { setBusy(true); const data = await getPMInbox(user?.username || 'self'); print('PM inbox: ' + (data?.topic_list?.topics?.length || 0)); }
    catch (e) { print('ERR pm: ' + (e?.message || 'failed')); }
    finally { setBusy(false); }
  }

  async function listPersonas() {
    try { setBusy(true); const data = await getPersonas(); const names = (data?.personas || []).map(p => p.name || p.id).join(', '); print('Personas: ' + (names || 'none')); }
    catch (e) { print('ERR personas: ' + (e?.message || 'failed')); }
    finally { setBusy(false); }
  }

  function streamSample() {
    setBusy(true); let acc = ''; const stop = aiStream({ persona, topic_id: 0, query: 'Say hello.' }, (ev) => {
      if (ev.type === 'token') acc += ev.data.text || '';
      if (ev.type === 'done') { stop(); setBusy(false); print('Streamed sample chars: ' + acc.length); }
      if (ev.type === 'error') { stop(); setBusy(false); print('ERR stream: ' + (ev.data.error || ev.data.message)); }
    });
    // Safety timeout
    setTimeout(() => { if (busy) { stop(); setBusy(false); print('Stream timeout chars: ' + acc.length); } }, 4000);
  }

  return (
    <div style={{ padding: 8 }}>
      <div style={styles.window}>
        <div style={styles.title}>Discourse API Configuration</div>
        <div style={styles.body}>
          <div style={styles.panel}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Endpoints</div>
            <div style={{ fontSize: 12 }}>
              <div>/api/discourse/latest?page=</div>
              <div>/api/discourse/topic/:id</div>
              <div>/api/discourse/pm</div>
              <div>/api/discourse/personas</div>
              <div>/api/discourse/ai/stream</div>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={styles.btn} onClick={refreshLatest} disabled={busy || !user}>Refresh Latest</button>
              <button style={styles.btn} onClick={refreshPMs} disabled={busy || !user}>Refresh PMs</button>
              <button style={styles.btn} onClick={listPersonas} disabled={busy}>List Personas</button>
            </div>
            {!user && <div style={{ marginTop: 6, fontSize: 12, color: '#800' }}>Sign in from Landing to access protected endpoints.</div>}
          </div>
          <div style={styles.panel}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div>
                <div style={styles.label}>Persona</div>
                <select style={styles.input} value={persona} onChange={(e)=>setPersona(e.target.value)}>
                  {personas.length === 0 && <option value="default">default</option>}
                  {personas.map(p => (<option key={String(p.id)} value={String(p.id)}>{p.name || p.id}</option>))}
                </select>
              </div>
              <button style={styles.btn} onClick={streamSample} disabled={busy}>Stream sample</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={styles.label}>Log</div>
              <div ref={logRef} style={styles.log}>
                {lines.map((l,i)=>(<div key={i}>{l}</div>))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
