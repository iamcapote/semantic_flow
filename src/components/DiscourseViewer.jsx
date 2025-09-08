import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth, fetchPublicConfig, getBrandName } from '@/lib/auth';
import { getLatest, getTopic, getPMInbox, subscribeEvents, aiStream, getPersonas } from '@/lib/discourseApi';

/**
 * DiscourseViewer
 * Core read-only Discourse browsing surface (topics, PMs, personas, sample AI stream).
 * Props:
 *  - embedded: when true, suppresses outer full-screen styling; consumer controls layout
 */
export default function DiscourseViewer({ embedded = false }) {
  const { user, loading, login, logout } = useAuth();
  const [brand, setBrand] = useState('Discourse');
  useEffect(() => { (async () => { try { await fetchPublicConfig(); setBrand(getBrandName()); } catch {} })(); }, []);
  const [page, setPage] = useState(0);
  const [topicId, setTopicId] = useState(null);
  const [eventsOn, setEventsOn] = useState(false);
  const [persona, setPersona] = useState('default');
  const [personas, setPersonas] = useState([]);
  const [personasError, setPersonasError] = useState(null);

  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamError, setStreamError] = useState(null);
  const stopRef = useRef(null);

  const latestQuery = useQuery({
    queryKey: ['discourse-latest', page],
    queryFn: () => getLatest(page),
    enabled: !!user && topicId == null,
    staleTime: 15_000,
  });
  const topicQuery = useQuery({
    queryKey: ['discourse-topic', topicId],
    queryFn: () => getTopic(topicId),
    enabled: !!user && topicId != null,
  });
  const pmQuery = useQuery({
    queryKey: ['discourse-pm', user?.username],
    queryFn: () => getPMInbox(user.username),
    enabled: !!user,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEvents((evt) => {
      if (evt?.event === 'post_created' || evt?.event === 'topic_created' || evt?.event === 'topic_updated') {
        if (evt.topicId && topicId && evt.topicId === topicId) topicQuery.refetch?.();
        pmQuery.refetch?.();
        latestQuery.refetch?.();
      }
    });
    setEventsOn(true);
    return () => { unsub?.(); setEventsOn(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user, topicId]);

  async function loadPersonas() {
    if (!user) return;
    setPersonasError(null);
    try {
      const data = await getPersonas();
      const list = data?.personas || [];
      setPersonas(list);
      if (list.length && !list.find(p => String(p.id) === String(persona))) setPersona(String(list[0].id));
    } catch (e) { setPersonasError(e?.message || 'failed'); }
  }
  useEffect(() => { loadPersonas(); /* eslint-disable-next-line */ }, [user]);

  function startStream() {
    if (!topicId) return;
    setStreaming(true); setStreamText(''); setStreamError(null);
    const stopper = aiStream({ persona, topic_id: topicId, query: 'Summarize this topic.' }, (ev) => {
      if (!ev) return;
      if (ev.type === 'meta') {
        setStreamText(prev => prev + `[meta topic_id=${ev.data.topic_id} persona_id=${ev.data.persona_id}]\n`);
      } else if (ev.type === 'token') {
        setStreamText(prev => prev + (ev.data.text || ''));
      } else if (ev.type === 'error') {
        setStreamError(ev.data.error || ev.data.message || 'stream_error');
      } else if (ev.type === 'done') {
        setStreamText(prev => prev + '\n[done]');
        setStreaming(false);
      }
    });
    stopRef.current = () => { stopper(); setStreaming(false); };
  }
  function stopStream() { if (stopRef.current) stopRef.current(); }

  if (loading) return <div className="p-4 text-sm">Loading…</div>;

  if (!user) {
    return (
      <div className={`w95-font ${embedded ? '' : 'mt-8'} max-w-xl mx-auto p-4`} style={{ background: 'var(--w95-face)', boxShadow: embedded ? 'none' : '3px 3px 0 #000', border: '2px solid var(--w95-shadow)' }}>
  <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--w95-text)' }}>{brand} (Read‑Only)</h1>
  <p className="mb-3 text-[13px]">Sign in with {brand} SSO to view topics, PMs, and AI personas. Posting is disabled.</p>
  <button className="px-4 py-1 text-sm" style={{ background: '#000080', color: '#fff', border: '2px solid #000', boxShadow: 'inset -1px -1px 0 #fff, inset 1px 1px 0 #000' }} onClick={login}>Sign in with {brand}</button>
      </div>
    );
  }

  const bevel = {
    out: 'shadow-[inset_-1px_-1px_0_#fff,inset_1px_1px_0_#000] border border-[var(--w95-shadow)]',
    in: 'shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000] border border-[var(--w95-shadow)]'
  };

  return (
    <div className={`w95-font ${embedded ? '' : 'min-h-screen'} flex flex-col`} style={{ background: embedded ? 'transparent' : 'var(--w95-desk)' }}>
      <div className="flex-1 grid md:grid-cols-[2fr_3fr] gap-3 p-3 overflow-hidden">
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className={`flex flex-col h-[55%] bg-[var(--w95-face)] p-2 ${bevel.out}`}>
            <div className="flex items-center justify-between mb-1 text-sm font-bold">
              <span>Latest Topics {latestQuery.isFetching && <span className="opacity-60 font-normal">(refresh)</span>}</span>
              <div className="flex items-center gap-2 text-[11px]">
                <span>{user.username}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border border-[var(--w95-shadow)]" title="Webhook live updates"><span className={`w-2 h-2 rounded-full ${eventsOn ? 'bg-green-600' : 'bg-gray-500'}`} />live</span>
                <button onClick={logout} className={`px-2 py-0.5 text-[10px] bg-[var(--w95-face)] ${bevel.out}`}>Logout</button>
              </div>
            </div>
            <div className={`flex-1 overflow-auto bg-white text-[12px] ${bevel.in}`}>
              {latestQuery.isLoading && <div className="p-2">Loading…</div>}
              {latestQuery.isError && <div className="p-2 text-red-700">Failed to load topics.</div>}
              {latestQuery.data && (
                <ul>
                  {latestQuery.data?.topic_list?.topics?.map(t => (
                    <li key={t.id} className="px-2 py-1 cursor-pointer hover:bg-[#d8d8d8]" onClick={() => setTopicId(t.id)}>
                      <div className="truncate font-semibold">{t.title}</div>
                      <div className="text-[10px] opacity-70">{t.posts_count} posts · {t.views} views</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-2 mt-2 text-[11px]">
              <button className={`px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`} disabled={page<=0} onClick={() => setPage(p => Math.max(0,p-1))}>Prev</button>
              <button className={`px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`} onClick={() => setPage(p => p+1)}>Next</button>
              <button className={`ml-auto px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`} onClick={()=>latestQuery.refetch?.()}>Refresh</button>
            </div>
          </div>
          <div className={`flex flex-col flex-1 bg-[var(--w95-face)] p-2 ${bevel.out}`}>
            <div className="flex items-center justify-between mb-1 text-sm font-bold">
              <span>Your PMs {pmQuery.isFetching && <span className="opacity-60 font-normal">(refresh)</span>}</span>
              <button onClick={()=>pmQuery.refetch?.()} className={`text-[10px] px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`}>Reload</button>
            </div>
            <div className={`flex-1 overflow-auto bg-white text-[12px] ${bevel.in}`}>
              {pmQuery.isError && (
                <div className="p-2 text-red-700 space-y-1">
                  <div>Failed to load PMs.</div>
                  {pmQuery.error?.message?.includes('discourse_api_key_missing') && (
                    <div className="text-[10px] text-red-800/80">Server missing Discourse API key; PMs unavailable.</div>
                  )}
                  {pmQuery.error?.status === 401 && <div className="text-[10px]">You are not authenticated.</div>}
                  {pmQuery.error?.status === 403 && <div className="text-[10px]">Username mismatch.</div>}
                </div>
              )}
              {pmQuery.data && (
                <ul>
                  {pmQuery.data?.topic_list?.topics?.slice(0,12).map(t => (
                    <li key={t.id} className="px-2 py-1 cursor-pointer hover:bg-[#d8d8d8]" onClick={() => setTopicId(t.id)}>
                      <div className="truncate font-semibold">{t.title}</div>
                      <div className="text-[10px] opacity-70">{t.posts_count} msgs · {new Date(t.last_posted_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className={`flex flex-col flex-1 bg-[var(--w95-face)] p-2 ${bevel.out} overflow-hidden`}>
            <div className="flex items-center justify-between mb-1 text-sm font-bold">
              <span>Topic Viewer</span>
              {topicId && <button onClick={()=>setTopicId(null)} className={`text-[10px] px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`}>Back</button>}
            </div>
            {!topicId && <div className="text-[11px] opacity-70">Select a topic or PM. Replies disabled.</div>}
            {topicId && topicQuery.isLoading && <div className="p-2 text-[12px]">Loading…</div>}
            {topicId && topicQuery.isError && <div className="p-2 text-red-700">Failed to load topic.</div>}
            {topicQuery.data && (
              <div className={`flex-1 overflow-auto bg-white text-[12px] space-y-2 pr-1 ${bevel.in}`}>
                <h3 className="text-sm font-bold mt-2 px-2">{topicQuery.data.title}</h3>
                <div className="text-[10px] opacity-70 px-2">Created {new Date(topicQuery.data.created_at).toLocaleString()}</div>
                <div className="divide-y">
                  {topicQuery.data.post_stream?.posts?.map(p => (
                    <div key={p.id} className="px-2 py-1">
                      <div className="text-[11px] font-semibold">@{p.username} <span className="opacity-60 font-normal">{new Date(p.created_at).toLocaleString()}</span></div>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.cooked }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={`bg-[var(--w95-face)] p-2 ${bevel.out} text-[12px]`}>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <label className="font-bold">Persona</label>
              <select className={`bg-white px-1 py-0.5 ${bevel.in}`} value={persona} onChange={(e)=>setPersona(e.target.value)}>
                {personas.length === 0 && <option value="default">default</option>}
                {personas.map(p => (<option key={String(p.id)} value={String(p.id)}>{p.name || p.id}</option>))}
              </select>
              <button onClick={loadPersonas} className={`px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`} title="Reload personas">Reload</button>
              <button disabled={!topicId || streaming} onClick={startStream} className={`px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out} disabled:opacity-40`}>{streaming ? 'Streaming…' : 'Stream Sample'}</button>
              {streaming && <button onClick={stopStream} className={`px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out}`}>Stop</button>}
              <span className="ml-auto opacity-60 text-[10px]">{personas.length} personas</span>
            </div>
            {personasError && <div className="text-red-700 mb-1">Personas error: {personasError}</div>}
            <div className={`h-24 overflow-auto bg-black text-green-400 font-mono text-[11px] p-1 whitespace-pre-wrap ${bevel.in}`}>{streamText || (!streaming && 'Stream output…')}</div>
            {streamError && <div className="text-red-700 mt-1">{streamError}</div>}
            <div className="mt-2 opacity-60 text-[10px]">Read‑only surface; Discourse is source of truth.</div>
          </div>
        </div>
      </div>
      {!embedded && (
        <div className="h-6 flex items-center justify-between px-3 text-[10px] bg-[var(--w95-face)] border-t border-[var(--w95-shadow)] text-black">
          <span>{brand} Read‑Only Mode</span>
          <span>Topics: {latestQuery.data?.topic_list?.topics?.length || 0}</span>
        </div>
      )}
    </div>
  );
}