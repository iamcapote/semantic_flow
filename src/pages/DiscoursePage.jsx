import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { getLatest, getTopic, getPMInbox, subscribeEvents, aiStream, getPersonas } from '@/lib/discourseApi';

export default function DiscoursePage() {
  const { user, loading, login, logout } = useAuth();
  const [page, setPage] = useState(0);
  const [topicId, setTopicId] = useState(null);
  const [eventsOn, setEventsOn] = useState(false);
  const [persona, setPersona] = useState('default');
  const [streaming, setStreaming] = useState(false);
  const streamRef = useRef('');
  const [personas, setPersonas] = useState([]);

  const latestQuery = useQuery({
    queryKey: ['discourse-latest', page],
    queryFn: () => getLatest(page),
    enabled: !!user && topicId == null,
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
  });

  // Subscribe to webhook events for live updates (e.g., refresh PM list)
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEvents((evt) => {
      if (evt?.event === 'post_created' || evt?.event === 'topic_updated') {
        // If webhook includes topicId, selectively refresh
        if (evt.topicId && topicId && evt.topicId === topicId) {
          topicQuery.refetch?.();
        }
        pmQuery.refetch?.();
        latestQuery.refetch?.();
      }
    });
    setEventsOn(true);
    return () => { unsub?.(); setEventsOn(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  // Load personas once signed-in
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await getPersonas();
        const list = data?.personas || [];
        setPersonas(list);
        if (list.length && !list.find(p => String(p.id) === String(persona))) {
          setPersona(String(list[0].id));
        }
      } catch {}
    })();
  }, [user]);

  if (loading) return <div className="p-6">Loading…</div>;

  if (!user) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Discourse</h1>
        <p className="text-muted-foreground mb-4">Sign in with Discourse SSO to view topics.</p>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={login}>Sign in with Discourse</button>
      </div>
    );
  }

  return (
  <div className="p-4 grid md:grid-cols-[2fr_3fr] gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Latest Topics</h2>
          <div className="text-sm flex items-center gap-2">Signed in as {user.username}
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border rounded" title="Webhook live updates">
              <span className={`w-2 h-2 rounded-full ${eventsOn ? 'bg-green-600' : 'bg-gray-400'}`} /> live
            </span>
            <button className="ml-2 underline" onClick={logout}>Logout</button>
          </div>
        </div>
        {latestQuery.isLoading && <div>Loading…</div>}
        {latestQuery.isError && <div className="text-red-600">Failed to load topics.</div>}
        {latestQuery.data && (
          <ul className="divide-y border rounded bg-white">
            {latestQuery.data?.topic_list?.topics?.map((t) => (
              <li key={t.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setTopicId(t.id)}>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">{t.posts_count} posts • {t.views} views</div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 mt-2">
          <button className="px-2 py-1 border rounded" disabled={page<=0} onClick={() => setPage((p)=>Math.max(0,p-1))}>Prev</button>
          <button className="px-2 py-1 border rounded" onClick={() => setPage((p)=>p+1)}>Next</button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-1">Your PMs</h3>
          {pmQuery.isFetching && <div>Loading…</div>}
          {pmQuery.isError && <div className="text-red-600">Failed to load PMs.</div>}
          {pmQuery.data && (
            <ul className="divide-y border rounded bg-white">
              {pmQuery.data?.topic_list?.topics?.slice(0,10).map((t) => (
                <li key={t.id} className="p-3 hover:bg-gray-50 cursor-pointer" onClick={() => setTopicId(t.id)}>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.posts_count} msgs • updated {new Date(t.last_posted_at).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Topic</h2>
          {topicId && <button className="text-sm underline" onClick={() => setTopicId(null)}>Back to list</button>}
        </div>
        {!topicId && <div className="text-sm text-gray-600">Select a topic to view. Replies are read-only for now.</div>}
        {topicId && topicQuery.isLoading && <div>Loading topic…</div>}
        {topicId && topicQuery.isError && <div className="text-red-600">Failed to load topic.</div>}
        {topicQuery.data && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{topicQuery.data.title}</h3>
            <div className="text-xs text-gray-500">Created: {new Date(topicQuery.data.created_at).toLocaleString()}</div>
            <div className="border rounded divide-y bg-white">
              {topicQuery.data.post_stream?.posts?.map((p) => (
                <div key={p.id} className="p-3">
                  <div className="text-sm font-medium">@{p.username} <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span></div>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: p.cooked }} />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm">Persona</label>
                <select className="border rounded p-1 text-sm" value={persona} onChange={(e)=>setPersona(e.target.value)}>
                  {personas.length === 0 && <option value="default">Default</option>}
                  {personas.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>{p.name || p.id}</option>
                  ))}
                </select>
                <button
                  className="px-2 py-1 border rounded text-sm"
                  disabled={streaming}
                  onClick={() => {
                    setStreaming(true); streamRef.current = '';
                    const stop = aiStream({ persona, topic_id: topicId }, (chunk) => { streamRef.current += chunk; });
                    setTimeout(() => { stop(); setStreaming(false); alert('Stream sample complete (check network).'); }, 2000);
                  }}
                >{streaming ? 'Streaming…' : 'Stream sample'}</button>
              </div>
              <div className="opacity-60">
                <div className="text-sm font-medium">Reply (disabled)</div>
                <textarea className="w-full border rounded p-2" placeholder="Replies are read-only in v1" disabled />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
