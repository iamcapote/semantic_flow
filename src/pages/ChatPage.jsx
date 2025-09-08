import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import SettingsModal from '@/components/SettingsModal';
import { Loader2, PlusCircle, ChevronLeft, ChevronRight, Search, Brackets, Workflow, Cog, Rocket, Trash2, Download, Edit3, XCircle, Layers, Eye, Plug } from 'lucide-react';
import { PROVIDER_CATALOG, getActiveProviderId, resolveModel } from '@/lib/providerCatalog';
import { getPersonas, aiStream } from '@/lib/discourseApi';
import { useAuth, fetchPublicConfig, getBrandName } from '@/lib/auth';
import { SecureKeyManager } from '@/lib/security';
import aiRouter, { fetchChatCompletionRaw } from '@/lib/aiRouter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { subscribeWorkflowUpdates } from '@/lib/workflowBus';
import { stringifyDSL } from '@/lib/dsl';
import { stripWorkflow } from '@/lib/sanitizer';
import ChatWorkflowPanel from '@/components/ChatWorkflowPanel';

// Local bevel token helper (aligns w/ win95-plus.css without extra imports)
const bevel = {
  out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
  in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
};

const ChatPage = ({ embedded = false }) => {
  const [apiKey, setApiKey] = useState(() => {
    const provider = sessionStorage.getItem('active_provider') || 'openai';
    return SecureKeyManager.getApiKey(provider) || '';
  });
  const [systemMessage, setSystemMessage] = useState(
    () => sessionStorage.getItem('system_message') || 'You are a helpful assistant.'
  );
  const [conversations, setConversations] = useState(() => {
    const saved = sessionStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [{ id: Date.now(), title: 'New Chat', messages: [], config: {} }];
  });
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const authCtx = useAuth?.() || {};
  const [providerId, setProviderId] = useState(() => getActiveProviderId());
  const [brand, setBrand] = useState('BIThub');
  const [personas, setPersonas] = useState([]);
  const [activePersona, setActivePersona] = useState('0-NULL');
  const [internalStreaming, setInternalStreaming] = useState(false);
  // Auto-switch to internal provider when SSO auth present and no BYOK key
  const [defaultPersonaId, setDefaultPersonaId] = useState(null);
  useEffect(() => {
    (async () => {
      try { const cfg = await fetchPublicConfig(); setBrand(getBrandName()); setDefaultPersonaId(cfg?.internalDefaultPersonaId || null); } catch {}
      const isAuthed = !!authCtx?.user;
      const hasKey = !!apiKey || !!SecureKeyManager.getApiKey(providerId);
      if (isAuthed && !hasKey) {
        setProviderId('internal');
        sessionStorage.setItem('active_provider', 'internal');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authCtx?.user]);

  // Load personas when internal provider active
  useEffect(() => {
    if (providerId !== 'internal') return;
    (async () => {
      try {
        const data = await getPersonas();
        let list = data?.personas || [];
        if (!list.length) list = [{ id: '0-NULL', name: '0-NULL' }];
        // Only inject 0-NULL placeholder if there are no real personas
        if (list.length && list[0].id !== '0-NULL' && !list.some(p => String(p.id) === '0-NULL')) {
          // leave list as-is (real personas available)
        } else if (!list.some(p => String(p.id) === '0-NULL')) {
          list.unshift({ id: '0-NULL', name: '0-NULL' });
        }
        setPersonas(list);
        // If current active persona is placeholder but numeric personas exist, auto-switch to first numeric id.
        if (String(activePersona) === '0-NULL') {
          const numeric = list.find(p => /^[0-9]+$/.test(String(p.id)));
          if (numeric) setActivePersona(String(numeric.id));
        }
        if (!list.find(p => String(p.id) === String(activePersona))) setActivePersona(String(list[0].id));
        // Derive internal model list dynamically from persona metadata default_llm.display_name if available
        try {
          const modelNames = Array.from(new Set(
            (list || []).map(p => p.default_llm?.display_name).filter(Boolean)
          ));
          if (modelNames.length) {
            PROVIDER_CATALOG.internal.models = modelNames;
            PROVIDER_CATALOG.internal.defaultModel = modelNames[0];
            const current = sessionStorage.getItem('chat_model');
            if (!current || !modelNames.includes(current)) {
              setModel(modelNames[0]);
            }
            try { sessionStorage.setItem('internal_models', JSON.stringify(modelNames)); } catch {}
          }
        } catch {}
      } catch {
        setPersonas([{ id: '0-NULL', name: '0-NULL' }]);
      }
    })();
  }, [providerId]);

  // Persist active persona so other AI feature modals (PromptingEngine internal provider) can reuse.
  useEffect(() => {
    if (providerId === 'internal') {
      try { sessionStorage.setItem('internal_active_persona', String(activePersona)); } catch {}
    }
  }, [activePersona, providerId]);
  const [model, setModel] = useState(() => resolveModel(getActiveProviderId(), sessionStorage.getItem('chat_model') || ''));
  const [temperature, setTemperature] = useState(() => parseFloat(sessionStorage.getItem('chat_temp') || '0.7'));
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [injectionMode, setInjectionMode] = useState(() => sessionStorage.getItem('wf_injection_mode') || 'none'); // none | system | assistant | first
  const [workflowSelectionMode, setWorkflowSelectionMode] = useState(() => sessionStorage.getItem('wf_selection_mode') || 'full'); // full | stripped
  const [workflow, setWorkflow] = useState(null);
  const [workflowDSL, setWorkflowDSL] = useState('');
  const [showWorkflowPreview, setShowWorkflowPreview] = useState(false);
  // Legacy two-stage fields retained for backward compat but we migrate to a flexible stagedMessages map keyed by role+index
  const [stagedFirst, setStagedFirst] = useState(() => sessionStorage.getItem('staged_first') || '');
  const [stagedSecond, setStagedSecond] = useState(() => sessionStorage.getItem('staged_second') || '');
  const [stagedMessages, setStagedMessages] = useState(() => {
    try {
      const raw = sessionStorage.getItem('staged_messages_v2');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      { id: 'sys-0', role: 'system', label: 'System Preface', content: '' },
      { id: 'user-0', role: 'user', label: 'User Stage 1', content: '' },
      { id: 'assistant-0', role: 'assistant', label: 'Assistant Seed', content: '' },
      { id: 'user-1', role: 'user', label: 'User Stage 2', content: '' },
    ];
  });
  const [showStaging, setShowStaging] = useState(true); // default open as requested
  const [editingStageId, setEditingStageId] = useState(null);
  const [expandedWorkflow, setExpandedWorkflow] = useState(false);
  const abortControllerRef = useRef(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [showPayload, setShowPayload] = useState(false);
  const [autoTitle, setAutoTitle] = useState(true);
  const scrollAreaRef = useRef(null);
  const navigate = useNavigate();

  const filteredConversations = conversations.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Allow chat access even without a local provider key (SSO-only sessions may rely on server-side Discourse AI)
  useEffect(() => { /* intentionally no redirect when apiKey missing */ }, [apiKey]);

  // When provider selection changes, load the provider-specific key from SecureKeyManager
  useEffect(() => {
    try {
      const k = SecureKeyManager.getApiKey(providerId) || '';
      setApiKey(k);
    } catch (e) {
      // ignore
    }
  }, [providerId]);

  useEffect(() => { scrollAreaRef.current && (scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight); }, [conversations]);

  useEffect(() => {
    const provider = sessionStorage.getItem('active_provider') || 'openai';
    SecureKeyManager.storeApiKey(provider, apiKey);
    sessionStorage.setItem('system_message', systemMessage);
    sessionStorage.setItem('conversations', JSON.stringify(conversations));
  sessionStorage.setItem('chat_model', model);
  sessionStorage.setItem('active_provider', providerId);
    sessionStorage.setItem('chat_temp', String(temperature));
  sessionStorage.setItem('wf_injection_mode', injectionMode);
  sessionStorage.setItem('wf_selection_mode', workflowSelectionMode);
    sessionStorage.setItem('staged_first', stagedFirst);
    sessionStorage.setItem('staged_second', stagedSecond);
    try { sessionStorage.setItem('staged_messages_v2', JSON.stringify(stagedMessages)); } catch {}
  }, [apiKey, systemMessage, conversations, model, providerId, temperature, injectionMode, stagedFirst, stagedSecond, stagedMessages]);

  // Workflow broadcast subscription + initial load from localStorage if available
  useEffect(() => {
    // initial load attempt
    try {
      const raw = localStorage.getItem('current-workflow');
      if (raw && !workflow) {
        const parsed = JSON.parse(raw);
        setWorkflow(parsed);
        try { if (parsed?.nodes && parsed?.edges) setWorkflowDSL(stringifyDSL(parsed.nodes, parsed.edges)); } catch {}
      }
    } catch {}
    const unsub = subscribeWorkflowUpdates((_src, wf) => {
      setWorkflow(wf);
      try { if (wf?.nodes && wf?.edges) setWorkflowDSL(stringifyDSL(wf.nodes, wf.edges)); } catch {}
    });
    return unsub;
  }, [workflow]);
  // Keyboard shortcuts (Esc to cancel stream, Ctrl+L focus input)
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === 'Escape' && isStreaming) { cancelStream(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { try { document.querySelector('input[aria-label="Message"]').focus(); e.preventDefault(); } catch {} }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [isStreaming]);

  const buildSystemPrompt = useCallback(() => {
    if (!workflow) return systemMessage;
    const safe = (() => { try { return stripWorkflow(workflow); } catch { return null; } })();
    const chosen = workflowSelectionMode === 'full' ? workflow : safe;
    if (injectionMode === 'system' && chosen) {
      return systemMessage + '\n\n[WORKFLOW CONTEXT]\n' + JSON.stringify(chosen, null, 2);
    }
    return systemMessage;
  }, [injectionMode, workflow, systemMessage, workflowSelectionMode]);

  const buildInitialUserContent = useCallback((raw) => {
    if (!workflow) return raw;
    const safe = (() => { try { return stripWorkflow(workflow); } catch { return null; } })();
    const chosen = workflowSelectionMode === 'full' ? workflow : safe;
    if (injectionMode === 'first' && chosen) {
      return '[WORKFLOW CONTEXT]\n' + JSON.stringify(chosen, null, 2) + (raw ? '\n\n' + raw : '');
    }
    return raw;
  }, [injectionMode, workflow, workflowSelectionMode]);

  const generateTitle = async (messages) => {
    try {
      const concatenatedMessages = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      const provider = sessionStorage.getItem('active_provider') || 'openai';
      if (provider === 'internal') {
        const firstUser = messages.find(m => m.role === 'user');
        return (firstUser?.content || 'New Chat').slice(0, 40).replace(/\s+/g, ' ').trim() || 'New Chat';
      }
      const key = SecureKeyManager.getApiKey(provider) || apiKey;
      const data = await aiRouter.chatCompletion(provider, key, {
        model: sessionStorage.getItem(`default_model_${provider}`) || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Generate a short, concise title (3-5 words) for this conversation based on its main topic.' },
          { role: 'user', content: concatenatedMessages }
        ],
        max_tokens: 15
      });
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  };

  const startNewConversation = () => {
    setConversations([...conversations, { id: Date.now(), title: 'New Chat', messages: [], config: { model, temperature, injectionMode } }]);
    setCurrentConversationIndex(conversations.length);
  };

  const switchConversation = (index) => {
    setCurrentConversationIndex(index);
  };

  const toggleSidebar = () => setIsSidebarOpen(v => !v);
  const toggleRightPanel = () => setIsRightPanelOpen(v => !v);

  const deleteConversation = (id) => {
    if (!window.confirm('Delete this conversation?')) return;
    setConversations(prev => {
      const remaining = prev.filter(c => c.id !== id);
      return remaining.length ? remaining : [{ id: Date.now(), title: 'New Chat', messages: [], config: {} }];
    });
    setCurrentConversationIndex(0);
  };

  const exportConversation = (id, format = 'json') => {
    const convo = conversations.find(c => c.id === id);
    if (!convo) return;
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(convo, null, 2);
    } else if (format === 'md') {
      content = `# Conversation: ${convo.title}\n\n` + convo.messages.map(m => `**${m.role.toUpperCase()}**: ${m.content}`).join('\n\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${convo.title.replace(/[^a-z0-9\-]+/gi,'_').toLowerCase()}.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const beginRename = (id) => setRenamingId(id);
  const applyRename = (id, val) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: val.trim() || c.title } : c));
    setRenamingId(null);
  };

  const coreSend = async (rawUserInput, { prependMessages = [] } = {}) => {
    if (!rawUserInput.trim()) return;
    if (providerId !== 'internal' && !apiKey) {
      toast({ title: 'API Key Missing', description: 'Set your API key in settings or use internal provider.', variant: 'destructive' });
      return;
    }
    const prepared = buildInitialUserContent(rawUserInput.trim());
    const userMessage = { role: 'user', content: prepared };
    setConversations(prev => { const upd = [...prev]; upd[currentConversationIndex].messages.push(userMessage); return upd; });
    setIsStreaming(true);

    try {
      const provider = providerId;
      if (provider === 'internal') {
        let assistantMessage = { role: 'assistant', content: '' };
        setConversations(prev => { const upd = [...prev]; upd[currentConversationIndex].messages.push(assistantMessage); return upd; });
        setInternalStreaming(true);
        const sys = buildSystemPrompt();
        const history = conversations[currentConversationIndex].messages;
        // Auto-switch off placeholder if real numeric persona exists
        if (String(activePersona) === '0-NULL') {
          const numeric = personas.find(p => /^[0-9]+$/.test(String(p.id)));
          if (numeric) setActivePersona(String(numeric.id));
          else if (defaultPersonaId && /^[0-9]+$/.test(String(defaultPersonaId))) setActivePersona(String(defaultPersonaId));
        }
        const assembled = [ { role:'system', content: sys }, ...prependMessages, ...history, userMessage ];
        const personaToSend = (/^[0-9]+$/.test(String(activePersona)) ? activePersona : (personas.find(p => /^[0-9]+$/.test(String(p.id)))?.id || activePersona));
    const internalPayload = { persona: personaToSend, topic_id: 0, query: assembled.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') };
    const stopper = aiStream(internalPayload, (ev) => {
          if (ev.type === 'token') {
            assistantMessage.content += ev.data.text || '';
            setConversations(prev => { const upd = [...prev]; const msgs = upd[currentConversationIndex].messages; msgs[msgs.length - 1] = { ...assistantMessage }; return upd; });
          } else if (ev.type === 'error') {
      const errTxt = ev.data.error || ev.data.message || ev.data.detail_first || ev.data.detail_second || ev.data.detail || (ev.data.status_first ? `status ${ev.data.status_first}` : ev.data.status ? `status ${ev.data.status}` : 'unknown');
      // Include structured JSON for deeper debugging
      let meta = '';
      try { meta = '\nDETAIL: ' + JSON.stringify({ ...ev.data, internalPayload }, null, 2).slice(0, 1200); } catch {}
      assistantMessage.content += `\n[error: ${errTxt}]${meta}`;
            setInternalStreaming(false); setIsStreaming(false);
          } else if (ev.type === 'done') {
            setInternalStreaming(false); setIsStreaming(false);
            if (autoTitle && conversations[currentConversationIndex].title === 'New Chat') {
              generateTitle([userMessage, assistantMessage]).then(t => setConversations(prev => { const upd = [...prev]; upd[currentConversationIndex].title = t; return upd; }));
            }
          }
        });
        abortControllerRef.current = { abort: () => { try { stopper(); } catch {} } };
        return;
      }
      const sys = buildSystemPrompt();
      const history = conversations[currentConversationIndex].messages;
      const assembledMessages = [ { role: 'system', content: sys }, ...prependMessages, ...history, userMessage ];
      const payload = {
        model: resolveModel(provider, model || sessionStorage.getItem(`default_model_${provider}`) || ''),
        temperature,
        messages: assembledMessages,
        stream: true
      };
      setLastPayload(payload);
      const controller = new AbortController();
      abortControllerRef.current = controller;
    const requestKey = SecureKeyManager.getApiKey(provider) || apiKey;
    const response = await fetchChatCompletionRaw(provider, requestKey, payload);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: 'assistant', content: '' };

      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        updatedConversations[currentConversationIndex].messages.push(assistantMessage);
        return updatedConversations;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        const parsedLines = lines
          .map((line) => line.replace(/^data: /, '').trim())
          .filter((line) => line !== '' && line !== '[DONE]')
          .map((line) => JSON.parse(line));

  for (const parsedLine of parsedLines) {
          const { choices } = parsedLine;
          const { delta } = choices[0];
          const { content } = delta;
          if (content) {
            assistantMessage.content += content;
            setConversations((prevConversations) => {
              const updatedConversations = [...prevConversations];
              const currentMessages = updatedConversations[currentConversationIndex].messages;
              currentMessages[currentMessages.length - 1] = { ...assistantMessage };
              return updatedConversations;
            });
          }
        }
      }

      // Generate title after the first message exchange
  if (autoTitle && conversations[currentConversationIndex].title === 'New Chat') {
        const newTitle = await generateTitle([userMessage, assistantMessage]);
        setConversations(prev => {
          const upd = [...prev];
          upd[currentConversationIndex].title = newTitle;
          return upd;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        updatedConversations[currentConversationIndex].messages.push({ role: 'assistant', content: 'Error: Unable to fetch response' });
        return updatedConversations;
      });
    } finally {
      setIsStreaming(false);
  abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e, override, options) => {
    e && e.preventDefault && e.preventDefault();
    const toSend = override !== undefined ? override : input;
    if (override === undefined) setInput('');
    coreSend(toSend, options);
  };

  const cancelStream = () => { try { abortControllerRef.current?.abort(); } catch {}; abortControllerRef.current = null; setIsStreaming(false); setInternalStreaming(false); };

  const retryLast = () => {
    if (!lastPayload) return;
    const userMsgs = [...lastPayload.messages].reverse().find(m => m.role === 'user');
    if (userMsgs) coreSend(userMsgs.content);
  };

  // Ordering helpers
  const roleOrder = ['system','assistant','user'];
  const normalizeOrder = useCallback((arr) => arr.slice().sort((a,b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)), []);
  const relabel = useCallback((arr) => {
    const counts = { system:0, assistant:0, user:0 };
    return arr.map(m => {
      counts[m.role] += 1;
      const idx = counts[m.role];
      let label;
      if (m.role === 'system') label = idx === 1 ? 'System Prompt' : `System Stage ${idx}`;
      else if (m.role === 'assistant') label = idx === 1 ? 'Assistant Seed' : `Assistant Stage ${idx}`;
      else label = `User Stage ${idx}`;
      return { ...m, label };
    });
  }, []);
  const enforce = useCallback((arr) => relabel(normalizeOrder(arr)), [normalizeOrder, relabel]);

  useEffect(() => { setStagedMessages(prev => enforce(prev)); }, []); // initial

  const sendStagedSequence = () => {
    const ordered = enforce(stagedMessages).filter(m => m.content.trim());
    const hasUser = ordered.some(m => m.role === 'user');
    if (!hasUser) {
      toast({ title: 'User message required', description: 'Cannot send staged context without a user message.', variant: 'destructive' });
      return;
    }
    const systemMsgs = ordered.filter(m => m.role === 'system').map(m => ({ role:'system', content:m.content }));
    const assistantMsgs = ordered.filter(m => m.role === 'assistant').map(m => ({ role:'assistant', content:m.content }));
    const userMsgs = ordered.filter(m => m.role === 'user');
    const lastUser = userMsgs[userMsgs.length - 1];
    const userPrepend = userMsgs.slice(0,-1).map(u => ({ role:'user', content: buildInitialUserContent(u.content) }));
    const prepend = [...systemMsgs, ...assistantMsgs, ...userPrepend];
    coreSend(lastUser.content, { prependMessages: prepend });
  };

  const updateStaged = (id, content) => {
    setStagedMessages(prev => enforce(prev.map(m => m.id === id ? { ...m, content } : m)));
  };

  const addStaged = (role) => {
    setStagedMessages(prev => enforce([...prev, { id: `${role}-${Date.now()}`, role, label: '', content: '' }]));
  };

  // Sync workflow content into staging area based on injection mode & selection
  useEffect(() => {
    if (!workflow) return;
    if (injectionMode === 'none') return; // do not auto-populate
    setStagedMessages(prev => {
      const safe = (() => { try { return stripWorkflow(workflow); } catch { return null; } })();
      const chosen = workflowSelectionMode === 'full' ? workflow : safe;
      if (!chosen) return prev;
      const json = JSON.stringify(chosen, null, 2);
      let out = [...prev];
      const ensure = (role, fallbackLabel) => {
        if (!out.some(m => m.role === role)) out.push({ id: `${role}-${Date.now()}`, role, label: fallbackLabel, content: '' });
      };
      if (injectionMode === 'system') ensure('system','System Prompt');
      if (injectionMode === 'assistant') ensure('assistant','Assistant Seed');
      if (injectionMode === 'first') ensure('user','User Stage 1');
      out = out.map(m => {
        if (injectionMode === 'system' && m.role === 'system') return { ...m, content: json };
        if (injectionMode === 'assistant' && m.role === 'assistant') return { ...m, content: json };
        if (injectionMode === 'first' && m.role === 'user') {
          const firstUser = out.filter(x => x.role==='user')[0];
          if (firstUser && m.id === firstUser.id) return { ...m, content: json };
        }
        return m;
      });
      return enforce(out);
    });
  }, [workflow, injectionMode, workflowSelectionMode, enforce]);

  const removeStaged = (id) => {
    setStagedMessages(prev => enforce(prev.filter(m => m.id !== id)));
  };

  const containerClass = embedded ? 'w95-chat-container w-full h-full flex overflow-hidden' : 'w95-chat-container w-full h-screen flex overflow-hidden';
  return (
    <div className={containerClass} style={{ background: 'var(--w95-background)' }}>
      {/* Sidebar */}
      <div className={`relative h-full ${bevel.out} bg-[var(--w95-face)] border-2 flex flex-col transition-all duration-300`} style={{ width: isSidebarOpen ? 260 : 0, minWidth: isSidebarOpen ? 260 : 0 }} aria-label="Conversation sidebar">
        {isSidebarOpen && (
          <div className="flex flex-col p-2 gap-2 h-full">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm" style={{ color: 'var(--w95-text)' }}>Chats</div>
              <button onClick={startNewConversation} className={`text-xs px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="New Chat">
                <PlusCircle className="inline-block w-4 h-4" />
              </button>
            </div>
            <div className={`bg-white ${bevel.in} border-2 flex items-center px-2 h-8`}>
              <Search className="w-4 h-4 text-gray-600" />
              <input aria-label="Search conversations" className="flex-1 bg-transparent outline-none text-sm ml-2" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportConversation(conversations[currentConversationIndex]?.id, 'json')} className={`flex-1 text-[11px] px-1 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="Export JSON"><Download className="w-3 h-3 inline" />JSON</button>
              <button onClick={() => exportConversation(conversations[currentConversationIndex]?.id, 'md')} className={`flex-1 text-[11px] px-1 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="Export Markdown">MD</button>
              <button onClick={() => deleteConversation(conversations[currentConversationIndex]?.id)} className={`flex-1 text-[11px] px-1 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="Delete"><Trash2 className="w-3 h-3 inline" /></button>
            </div>
            <div className={`flex-1 overflow-auto bg-white ${bevel.in} border-2 p-1`}>
              {filteredConversations.map((conversation, index) => (
                <div key={conversation.id} className={`group text-xs px-1 py-1 mb-1 border border-transparent ${index === currentConversationIndex ? 'bg-[#000080] text-white border-[#000080]' : 'hover:bg-[#E6E6E6] text-black'} transition-colors`}>
                  <div className="flex items-center gap-1" onClick={() => setCurrentConversationIndex(index)}>
                    {renamingId === conversation.id ? (
                      <input autoFocus defaultValue={conversation.title} onBlur={(e) => applyRename(conversation.id, e.target.value)} onKeyDown={(e) => { if (e.key==='Enter') { applyRename(conversation.id, e.currentTarget.value);} }} className={`flex-1 bg-white ${bevel.in} border-2 px-1 text-[11px] outline-none text-black`} />
                    ) : (
                      <span className="flex-1 truncate cursor-pointer" onDoubleClick={() => beginRename(conversation.id)}>{conversation.title}</span>
                    )}
                    <button onClick={() => exportConversation(conversation.id,'json')} className={`hidden group-hover:inline text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} title="Export">⤓</button>
                    <button onClick={() => deleteConversation(conversation.id)} className={`hidden group-hover:inline text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} title="Delete">×</button>
                    <button onClick={() => beginRename(conversation.id)} className={`hidden group-hover:inline text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} title="Rename"><Edit3 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] opacity-70 text-center text-black">{filteredConversations.length} chats</div>
          </div>
        )}
        <button onClick={toggleSidebar} className={`absolute top-2 -right-3 w-6 h-12 bg-[var(--w95-face)] ${bevel.out} border-2 flex items-center justify-center text-xs`} aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className={`h-8 flex items-center justify-between px-3 text-white`} style={{ background: 'var(--w95-title)' }}>
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            <span className="text-sm font-semibold">Chat — Win95(+☉∞)</span>
          </div>
          <SettingsModal apiKey={apiKey} setApiKey={setApiKey} systemMessage={systemMessage} setSystemMessage={setSystemMessage} />
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {!apiKey && providerId !== 'internal' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 mt-1 px-3 py-1 text-[11px] bg-[#fffbcc] text-black border border-yellow-700 shadow" role="alert" aria-live="polite">
              No local API key configured (BYOK). Operating in SSO / read-only mode; add a provider key for full chat.
            </div>
          )}
          <div className="flex flex-col flex-1 min-w-0 p-2 gap-2" aria-label="Chat messages panel">
            <div ref={scrollAreaRef} className={`flex-1 overflow-auto bg-white ${bevel.in} border-2 p-3 font-mono text-sm leading-6`}>
              {conversations[currentConversationIndex].messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-start gap-2">
                    <div className="text-[#00008b] w-4 text-right select-none">{message.role === 'user' ? 'U>' : message.role === 'assistant' ? 'A>' : 'S>'}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`w-full inline-block px-2 py-1 whitespace-pre-wrap w95-chat-bubble ${message.role === 'user' ? 'w95-chat-bubble-user' : 'w95-chat-bubble-assistant'}`}>
                        <ReactMarkdown className="prose max-w-none" components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter {...props} style={vscDarkPlus} language={match[1]} PreTag="div">{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                            ) : (
                              <code {...props} className={className}>{children}</code>
                            );
                          }
                        }}>
                          {message.content}
                        </ReactMarkdown>
                        {isStreaming && index === conversations[currentConversationIndex].messages.length - 1 && message.content === '' && (
                          <Loader2 className="h-4 w-4 animate-spin inline-block ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs opacity-70"><Loader2 className="w-3 h-3 animate-spin" /> streaming...</div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Message input form">
              <div className={`flex-1 bg-white ${bevel.in} border-2 flex items-center px-2`}>
                <input
                  aria-label="Message"
                  className="w-full outline-none bg-transparent text-sm py-1 text-black placeholder:text-gray-500 caret-black disabled:text-gray-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type message (Ctrl+Enter to send)"
                  disabled={isStreaming}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { handleSubmit(e); } }}
                />
              </div>
              <button type="submit" disabled={isStreaming} className={`px-4 text-sm bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-50`}>{isStreaming ? 'Sending' : 'Send'}</button>
              {isStreaming && (
                <button type="button" onClick={cancelStream} className={`px-3 text-sm bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="Cancel streaming"><XCircle className="w-4 h-4" /></button>
              )}
            </form>
            <div className="flex flex-wrap gap-2 mt-1">
              <button onClick={(e) => handleSubmit(e)} disabled={isStreaming || !input.trim()} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`}>Send</button>
              <button onClick={retryLast} disabled={isStreaming || !lastPayload} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`} aria-label="Retry last">Retry</button>
              <button onClick={() => setShowStaging(s => !s)} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`} aria-label="Toggle multi staging">{showStaging ? 'Hide Multi-Stage' : 'Show Multi-Stage'}</button>
              <button onClick={() => setShowPayload(s => !s)} disabled={!lastPayload} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40 flex items-center gap-1`} aria-label="Show last payload"><Eye className="w-3 h-3" />Payload</button>
            </div>
            {showStaging && (
              <div className={`mt-2 p-2 bg-[var(--w95-face)] ${bevel.out} border-2 flex flex-col gap-2`} aria-label="Multi-stage message composer">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span>Multi-Stage Composer</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => addStaged('system')} className={`text-[10px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>+Sys</button>
                    <button type="button" onClick={() => addStaged('assistant')} className={`text-[10px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>+Asst</button>
                    <button type="button" onClick={() => addStaged('user')} className={`text-[10px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>+User</button>
                  </div>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
                  {enforce(stagedMessages).map(sm => (
                    <div key={sm.id} className={`flex flex-col bg-[var(--w95-face)] ${bevel.out} border-2 p-1 text-black`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wide">{sm.label}</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setEditingStageId(sm.id)} className={`text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} aria-label="Edit staged">✎</button>
                          <button type="button" onClick={() => updateStaged(sm.id, '')} className={`text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} aria-label="Clear staged">⟳</button>
                          <button type="button" onClick={() => removeStaged(sm.id)} className={`text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`} aria-label="Remove staged">×</button>
                        </div>
                      </div>
                      <textarea value={sm.content} onChange={(e) => updateStaged(sm.id, e.target.value)} rows={4} className={`text-[11px] resize-y outline-none bg-white ${bevel.in} border-2 text-black p-1`} placeholder={`${sm.role} message...`} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] opacity-60">{sm.content.length} ch</span>
                        <button type="button" disabled={!sm.content.trim() || isStreaming} onClick={(e) => handleSubmit(e, sm.content, { prependMessages: enforce(stagedMessages).filter(s => s.id !== sm.id && s.content.trim()).map(s => ({ role: s.role, content: s.content })) })} className={`text-[10px] px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`}>Send Solo</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={sendStagedSequence} disabled={isStreaming || !stagedMessages.some(m => m.role === 'user' && m.content.trim())} className={`text-[11px] px-3 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40 self-start`}>Send Sequence</button>
              </div>
            )}
            {showPayload && lastPayload && (
              <div className={`mt-2 bg-white ${bevel.in} border-2 p-2 max-h-60 overflow-auto text-[10px] font-mono`} aria-label="Last request payload preview">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Request Payload</span>
                  <button onClick={() => navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2))} className={`text-[10px] px-2 py-0.5 bg-[var(--w95-face)] ${bevel.out} border-2`}>Copy</button>
                </div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(lastPayload, null, 2)}</pre>
              </div>
            )}
          </div>
          {isRightPanelOpen && (
          <div className="w-72 p-2 flex flex-col gap-2 bg-[var(--w95-face)] border-l-2 border-[var(--w95-shadow)] w95-right-panel" aria-label="Chat configuration panel">
            <div className={`p-2 bg-[var(--w95-face)] ${bevel.out} border-2 space-y-2`}>
              <div className="w95-subpanel-header"><Cog className="w-3 h-3" /> {providerId === 'internal' ? `${brand} Runtime` : 'Runtime'}</div>
              <label className="text-[11px]">Provider
                <div className={`mt-1 h-7 bg-white ${bevel.in} border-2 flex items-center px-1`}>
                  <select className="w-full bg-transparent text-xs outline-none" value={providerId} onChange={(e) => { const pid = e.target.value; setProviderId(pid); const next = resolveModel(pid, model); setModel(next); }} aria-label="Provider select">
                    {Object.entries(PROVIDER_CATALOG).map(([id, info]) => <option key={id} value={id}>{info.name}</option>)}
                  </select>
                </div>
              </label>
              {providerId === 'internal' && (
                <label className="text-[11px]">Persona
                  <div className={`mt-1 h-7 bg-white ${bevel.in} border-2 flex items-center px-1`}>
                    <select className="w-full bg-transparent text-xs outline-none" value={activePersona} onChange={(e) => setActivePersona(e.target.value)} aria-label="Persona select">
                      {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </label>
              )}
              <label className="text-[11px]">Model
                <div className={`mt-1 h-7 bg-white ${bevel.in} border-2 flex items-center px-1`}>
                  <select className="w-full bg-transparent text-xs outline-none" value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model select">
                    {(PROVIDER_CATALOG[providerId]?.models || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </label>
              <label className="text-[11px]">Temperature {temperature.toFixed(1)}
                <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full" aria-label="Temperature slider" />
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input type="checkbox" checked={autoTitle} onChange={(e) => setAutoTitle(e.target.checked)} aria-label="Auto title toggle" /> Auto Title
              </label>
            </div>
            <div className={`p-2 bg-[var(--w95-face)] ${bevel.out} border-2 space-y-2`}>
              <div className="w95-subpanel-header"><Workflow className="w-3 h-3" /> Workflow Context</div>
              <fieldset className="text-[11px]">
                <legend className="font-semibold">Injection Mode</legend>
                <div className="flex flex-col gap-1 mt-1">
                  {['none','system','assistant','first'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="wf-injection" value={mode} checked={injectionMode === mode} onChange={(e) => setInjectionMode(e.target.value)} aria-label={`Injection mode ${mode}`} />
                      <span className="capitalize">{mode === 'first' ? 'First User' : mode}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <ChatWorkflowPanel workflow={workflow} onCopy={txt => navigator.clipboard.writeText(txt)} onSelectionChange={setWorkflowSelectionMode} />
            </div>
            {/* Legacy single-stage inputs removed per request; multi-stage composer is default now */}
            <div className={`p-2 text-[10px] leading-4 bg-[var(--w95-face)] ${bevel.out} border-2`}>Workflow inject modes: None | System (system stage) | Assistant (assistant seed stage) | First (first user stage). Full/Stripped selection controls injected JSON content.</div>
          </div>
          )}
          <button onClick={toggleRightPanel} className={`absolute top-2 ${isRightPanelOpen ? 'right-[288px]' : 'right-0'} w-6 h-12 bg-[var(--w95-face)] ${bevel.out} border-2 flex items-center justify-center text-xs transition-all`} aria-label={isRightPanelOpen ? 'Collapse right panel' : 'Expand right panel'}>
            {isRightPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="h-6 flex items-center justify-between px-2 text-[10px] bg-[var(--w95-face)] border-t border-[var(--w95-shadow)] w95-statusline text-black" aria-label="Status bar">
          <span>{isStreaming ? 'Streaming… (Esc to cancel)' : 'Ready'}</span>
          <span>Msgs: {conversations[currentConversationIndex].messages.length}</span>
          <span className="flex items-center gap-2">WF: {workflow ? (workflow.nodes?.length || 0) + 'N/' + (workflow.edges?.length || 0) + 'E' : '—'} {workflow && (<button onClick={() => { try { const raw = localStorage.getItem('current-workflow'); if (raw) { const parsed = JSON.parse(raw); setWorkflow(parsed); if (parsed?.nodes && parsed?.edges) setWorkflowDSL(stringifyDSL(parsed.nodes, parsed.edges)); } } catch {} }} className={`text-[10px] px-1 bg-[var(--w95-face)] ${bevel.out} border`}>Refresh</button>)} </span>
        </div>
      </div>
      {expandedWorkflow && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Full workflow DSL viewer">
          <div className="absolute inset-0 bg-[#00000088]" onClick={() => setExpandedWorkflow(false)} />
          <div className={`relative w-[80vw] h-[70vh] flex flex-col bg-[var(--w95-face)] ${bevel.out} border-2 p-2`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm flex items-center gap-2"><Workflow className="w-4 h-4" /> Workflow DSL</div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(workflowDSL)} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>Copy</button>
                <button onClick={() => setExpandedWorkflow(false)} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>Close</button>
              </div>
            </div>
            <div className={`flex-1 overflow-auto bg-white ${bevel.in} border-2 p-2 text-[10px] whitespace-pre leading-4 font-mono`}>
              {workflowDSL || 'No workflow broadcast.'}
            </div>
          </div>
        </div>
      )}
      {editingStageId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Edit staged message modal">
          <div className="absolute inset-0 bg-[#00000088]" onClick={() => setEditingStageId(null)} />
          {(() => { const sm = stagedMessages.find(s => s.id === editingStageId); if (!sm) return null; return (
            <div className={`relative w-[70vw] h-[60vh] flex flex-col bg-[var(--w95-face)] ${bevel.out} border-2 p-2`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm">Edit: {sm.label}</div>
                <div className="flex gap-2">
                  <button onClick={() => { updateStaged(sm.id, ''); }} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>Clear</button>
                  <button onClick={() => setEditingStageId(null)} className={`text-[11px] px-2 py-1 bg-[var(--w95-face)] ${bevel.out} border-2`}>Close</button>
                </div>
              </div>
              <textarea value={sm.content} onChange={(e) => updateStaged(sm.id, e.target.value)} className={`flex-1 w-full resize-none outline-none bg-white ${bevel.in} border-2 p-2 text-[12px] font-mono`} />
              <div className="mt-2 flex gap-2">
                <button disabled={!sm.content.trim() || isStreaming} onClick={(e) => { handleSubmit(e, sm.content, { prependMessages: enforce(stagedMessages).filter(s => s.id !== sm.id && s.content.trim()).map(s => ({ role: s.role, content: s.content })) }); setEditingStageId(null); }} className={`text-[11px] px-3 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`}>Send Solo</button>
                <button disabled={isStreaming || !stagedMessages.some(m => m.role === 'user' && m.content.trim())} onClick={() => { sendStagedSequence(); setEditingStageId(null); }} className={`text-[11px] px-3 py-1 bg-[var(--w95-face)] ${bevel.out} border-2 disabled:opacity-40`}>Send Sequence</button>
              </div>
            </div>
          ); })()}
        </div>
      )}
    </div>
  );
};

export default ChatPage;