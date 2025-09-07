// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenTextIcon,
  InfoIcon,
  LightbulbIcon,
  BoxesIcon,
  FileCode2Icon,
  ShieldCheckIcon,
  ListTreeIcon,
  SearchIcon,
  Circle,
  Layers,
  SquareStack,
  Braces,
  Link2,
  PlayCircle,
  MessageSquare,
  UserCircle2,
  Terminal,
  Share2,
  Wand2,
  Bot
} from 'lucide-react';
// Additional icons for remaining headers
import { Home, Key, History, Database } from 'lucide-react';
import TopNav95Plus from '@/components/TopNav95Plus';

// Win94+ styled static Learn page for Semantic Flow
export default function LearnPage() {
  const navigate = useNavigate();
  const FONT_STACK = 'Tahoma, "MS Sans Serif", system-ui';

  // Keep sections consistent with Win95Suite
  const sections = [
    { id: 'builder', label: 'Builder', href: '/builder' },
    { id: 'ide', label: 'IDE', href: '/ide' },
    { id: 'api', label: 'Router', href: '/api' },
  { id: 'chat', label: 'Chat', href: '/chat' },
  { id: 'console', label: 'Console', href: '/console' },
    { id: 'learn', label: 'Learn', href: '/learn' },
  ];

  const onSelectTab = (id) => {
    const target = sections.find((s) => s.id === id);
    if (target?.href) navigate(target.href);
  };
  const bevel = {
    out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
    in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white'
  };

  const Section = ({ id, title, icon: Icon = InfoIcon, children }) => (
    <section id={id} className={`bg-[#cfcfcf] ${bevel.out} border-2 p-0 overflow-hidden`}> 
      <header className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-white" style={{ background: '#000080' }}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" aria-hidden />
          <h3 className="font-semibold tracking-wide flex items-center gap-2" style={{ fontFamily: FONT_STACK }}>
            {title}
          </h3>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[10px] opacity-70">
          <Circle className="h-2 w-2" />
          <Circle className="h-2 w-2" />
          <Circle className="h-2 w-2" />
        </div>
      </header>
      <div className={`bg-[#ffffff] ${bevel.in} border-2 m-2 p-3 text-sm leading-6 text-black`}>{children}</div>
    </section>
  );

  // Small UI primitives inspired by the template, tuned to current style
  const Button95 = ({ children, onClick, ariaLabel }) => (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm ${bevel.out} border-2 active:${bevel.in}`}
      style={{ background: '#c0c0c0' }}
    >
      {children}
    </button>
  );

  const FeatureChip = ({ icon: Icon = InfoIcon, text }) => (
    <div className={`inline-flex items-center gap-2 px-2 py-1 text-xs ${bevel.out} border-2`} style={{ background: '#c0c0c0' }}>
      <Icon className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  );

  const Card = ({ title, children, id, icon: Icon }) => (
    <div id={id} className={`bg-white ${bevel.out} border-2 p-3`}>
      {title ? (
        <h4 className="font-semibold mb-1 flex items-center gap-2" style={{ fontFamily: FONT_STACK }}>
          {Icon ? <Icon className="h-4 w-4 opacity-80" aria-hidden /> : null}
          <span>{title}</span>
        </h4>
      ) : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );

  const Step = ({ n, label, desc, icon: Icon }) => (
    <div className={`flex items-start gap-3 ${bevel.out} border-2 p-3 bg-white`}>
      <div className={`min-w-6 h-6 flex items-center justify-center text-xs font-bold ${bevel.in} border-2`} style={{ background: '#c0c0c0' }}>{n}</div>
      <div className="flex-1">
        <div className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: FONT_STACK }}>
          {Icon ? <Icon className="h-4 w-4 opacity-80" aria-hidden /> : null}
          {label}
        </div>
        <div className="text-sm leading-6">{desc}</div>
      </div>
    </div>
  );

  // TOC with icons and filter
  const tocItems = [
    { id: 'core', label: 'Core Concepts', icon: ListTreeIcon },
    { id: 'nav', label: 'How Navigation Works', icon: BookOpenTextIcon },
    { id: 'pages', label: 'Pages & Features', icon: BoxesIcon },
    { id: 'ai-features', label: 'AI Features', icon: LightbulbIcon },
  { id: 'providers', label: 'Providers', icon: Key },
    { id: 'export', label: 'Export & Interop', icon: FileCode2Icon },
    { id: 'security', label: 'Security & Access', icon: ShieldCheckIcon },
    { id: 'creative', label: 'Creative Uses', icon: LightbulbIcon },
  ];
  const [tocQuery, setTocQuery] = useState('');
  const filteredToc = useMemo(() => {
    const q = tocQuery.trim().toLowerCase();
    if (!q) return tocItems;
    return tocItems.filter((t) => t.label.toLowerCase().includes(q));
  }, [tocQuery]);

  // CTAs and highlights
  const CTA_DATA = [
    { id: 'cta-builder', label: 'Open Builder', href: '/builder' },
    { id: 'cta-chat', label: 'Try Chat', href: '/chat' },
  ];
  const HIGHLIGHTS = [
    { id: 'h1', text: 'Portable exports', icon: FileCode2Icon },
  { id: 'h2', text: 'Run inference on your canvas', icon: InfoIcon },
    { id: 'h3', text: 'BYOK + SSO', icon: ShieldCheckIcon },
  ];

  return (
    <div className="win95-learn-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#008080' }}>
      {/* Shared Top Navigation */}
      <TopNav95Plus
        appTitle="Semantic Flow — Learn"
        iconSrc="/logo.svg"
        sections={sections}
        activeId="learn"
        onSelect={onSelectTab}
      />

      <div className={`content-area mx-auto max-w-6xl p-4 select-none`} style={{ flex: 1, width: '100%', overflow: 'auto' }}>
        {/* HERO */}
        <div className={`mb-4 ${bevel.out} border-2`} style={{ background: '#c0c0c0', color: '#000' }}>
          <div className="flex items-center justify-between px-3 py-2 text-white" style={{ background: '#000080' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white" />
              <div className="font-semibold" style={{ fontFamily: FONT_STACK }}>Semantic Flow — Learn</div>
            </div>
            <div className="text-xs opacity-80">Win94+ Manifold UI · Visual Reasoning Engine</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3 p-3">
            {/* TOC */}
            <aside className={`md:sticky md:top-2 h-max bg-[#c0c0c0] ${bevel.in} border-2 p-2`}>
              <div className="flex items-center gap-1 text-xs font-semibold mb-2">
                <Circle className="h-3 w-3" /> On this page
              </div>
              <div className="mb-2 flex items-center gap-2">
                <SearchIcon className="h-4 w-4 opacity-70" />
                <input
                  aria-label="Filter sections"
                  value={tocQuery}
                  onChange={(e) => setTocQuery(e.target.value)}
                  placeholder="Filter"
                  className={`w-full text-xs px-2 py-1 ${bevel.in} border-2 outline-none`}
                  style={{ background: '#ffffff' }}
                />
              </div>
              <nav className="space-y-1 text-sm">
                {filteredToc.map(({ id, label, icon: Icon }) => (
                  <a key={id} href={`#${id}`} className="flex items-center gap-2 hover:underline">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </a>
                ))}
                {/* Anchor to hero-local NOT card */}
                <a href="#not" className="flex items-center gap-2 hover:underline">
                  <InfoIcon className="h-3.5 w-3.5" /> What It Is Not
                </a>
              </nav>
            </aside>

            {/* INTRO */}
            <div className={`space-y-3`}>
              <div className={`bg-[#ffffff] ${bevel.in} border-2 p-4`}>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: FONT_STACK }}>
                  <InfoIcon className="h-6 w-6 opacity-80" aria-hidden />
                  What this app is
                </h1>
                <div className="text-sm leading-6 mt-2">
                  Semantic Flow is a live canvas for building schemas and context. Build with nodes and fields, link them, then export your work
                  (JSON, YAML, Markdown, XML) for prompts, system messages, API shapes, documents, and code scaffolds.
                </div>
                <div className="text-[12px] mt-1 opacity-80" style={{ fontFamily: FONT_STACK }}>Design context like it's 1995, export it like it's today</div>

                <div className="mt-3 p-3 text-sm bg-[#fffbd1] text-[#3b3b00] border border-[#d0c86a]">
                  <strong>Important:</strong> "Execute" means send your current canvas context to an AI model for inference. This is not an agent pipeline or orchestrator. Edges indicate references, not control flow.
                </div>

                {/* What it is not moved under hero */}
                <div className="mt-3">
                  <Card id="not" title="What it is not" icon={InfoIcon}>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Not an agentic pipeline or orchestrator</li>
                      <li>Not a scheduler/queue or background job system</li>
                      <li>Not a datastore for your keys</li>
                      <li>Not a spreadsheet replacement</li>
                    </ul>
                  </Card>
                </div>

                {/* Quick steps */}
                <div className={`h-px my-3 bg-[#9a9a9a] ${bevel.out}`} />
                <div className="grid md:grid-cols-3 gap-3">
                  <Step n={1} label="Drop nodes" desc="Drag from palette. Give each a few fields." icon={SquareStack} />
                  <Step n={2} label="Link meaning" desc="Connect nodes to show references. Pick a format per node." icon={Link2} />
                  <Step n={3} label="Export" desc="Send to JSON/YAML/MD/XML. Use in routes, docs, or code." icon={FileCode2Icon} />
                </div>

                {/* Highlights */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {HIGHLIGHTS.map((h) => (
                    <FeatureChip key={h.id} icon={h.icon} text={h.text} />
                  ))}
                </div>

                {/* CTAs */}
                <div className="mt-3 flex items-center gap-2">
                  {CTA_DATA.map((c) => (
                    <Button95 key={c.id} onClick={() => navigate(c.href)} ariaLabel={c.label}>{c.label}</Button95>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* CONTENT SECTIONS */}
  <div className="grid grid-cols-1 gap-4">
          <Section id="core" title="Core Concepts" icon={ListTreeIcon}>
            <div className="grid md:grid-cols-2 gap-3">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Layers className="h-4 w-4 opacity-80" aria-hidden /> Schema</h4>
                <p>A structured representation of information you define. The canvas is where you build and edit schemas visually.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><SquareStack className="h-4 w-4 opacity-80" aria-hidden /> Node</h4>
                <p>A mini table or record with named fields. Represents part of your schema (e.g., Prompt, Persona, API Shape, Research Note, Constraint).</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Braces className="h-4 w-4 opacity-80" aria-hidden /> Field</h4>
                <p>A key-value inside a node. You edit fields to shape meaning and structure. Fields export to JSON or other formats.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><FileCode2Icon className="h-4 w-4 opacity-80" aria-hidden /> Language Mode</h4>
                <p>Per-node content format that signals role and downstream use. Common: JSON, YAML, XML, Markdown.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Link2 className="h-4 w-4 opacity-80" aria-hidden /> Edge</h4>
                <p>A relation between nodes. Edges express references or dependence—not execution order.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><PlayCircle className="h-4 w-4 opacity-80" aria-hidden /> Inference (Execute)</h4>
                <p>Send the current workflow context to an AI model with your BYOK credentials for a single inference pass. This does not orchestrate multi-step agents.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><ListTreeIcon className="h-4 w-4 opacity-80" aria-hidden /> Ontology</h4>
                <p>A library of node types grouped by clusters: Proposition, Inquiry, Reasoning, Evaluation, Cognitive, Creative, Utility, etc.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 opacity-80" aria-hidden /> Seed (Discourse)</h4>
                <p>A Seed is a Discourse Topic that anchors context and collaboration. Useful for PM workflows and shared briefs.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><UserCircle2 className="h-4 w-4 opacity-80" aria-hidden /> Persona</h4>
                <p>A configured AI role (often from Discourse AI) that bundles policies, constraints, and behavior; can be referenced by Router/Chat.</p>
              </div>
            </div>
          </Section>

          {/* Link out to nested docs route */}
          <Section id="developer-docs" title="Developer & User Documentation" icon={InfoIcon}>
            <p className="mb-3 text-sm">The full structured documentation now lives under <code>/learn/docs</code>. This page is an overview. Continue to the detailed docs browser:</p>
            <a href="/learn/docs" className="inline-block px-3 py-2 text-sm font-semibold bg-[#c0c0c0] border-2 border-white border-b-[#6d6d6d] border-r-[#6d6d6d] hover:brightness-105">Open Documentation Browser</a>
          </Section>

          <Section id="nav" title="How Navigation Works" icon={BookOpenTextIcon}>
            <div className="space-y-2">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Home className="h-4 w-4 opacity-80" aria-hidden /> Landing</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li>Sign in with Discourse SSO to unlock Discourse-powered features</li>
                  <li>Or use your own keys (BYOK) for standard AI providers</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><BoxesIcon className="h-4 w-4 opacity-80" aria-hidden /> Main Areas (Assembly-Line Order)</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Semantic Flow Builder</li>
                  <li>Semantic Flow IDE</li>
                  <li>Router</li>
                  <li>Chat</li>
                  <li>Console</li>
                  <li>Advanced settings live under Router</li>
                </ol>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Layers className="h-4 w-4 opacity-80" aria-hidden /> Shared State (Assembly-Line Model)</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Build and organize in Builder</li>
                  <li>Edit and export in IDE</li>
                  <li>Wire routes and bindings in Router</li>
                  <li>Test, refine, and finalize in Chat</li>
                  <li>Adjust fast and inspect in Console</li>
                  <li>Manage providers and site options in Router settings</li>
                </ol>
                <p className="mt-2 text-xs italic">Think of it as a small factory for context-building.</p>
              </div>
            </div>
          </Section>

          <Section id="pages" title="Pages and Features" icon={BoxesIcon}>
            <div className="space-y-3">
              {/* Builder */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><SquareStack className="h-4 w-4 opacity-80" aria-hidden /> A. Semantic Flow Builder (Visual Schema Canvas)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Drag nodes from the palette; connect to express references.</li>
                  <li>Each node is a compact form with fields: title, description, parameters, tags, examples, constraints, etc.</li>
                  <li>Assign a language per node: JSON/YAML/XML/Markdown. Exports respect content.</li>
                  <li>Color and background controls speed up scanning and organization.</li>
                  <li>Ontology-driven palette: rich clusters; crypto-inspired types exist but templates remain generic.</li>
                </ul>
                <div className="mt-2 p-2 bg-[#fffbd1] text-[#3b3b00] border border-[#d0c86a] text-xs">Not a workflow engine: connections indicate context/reference, not steps to run.</div>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Design system messages and prompt libraries</li>
                    <li>Author JSON shapes and API request/response schemas</li>
                    <li>Structure research notes, briefs, and content templates</li>
                    <li>Draft style guides, taxonomies, and knowledge maps</li>
                    <li>Sketch code scaffolds and data contracts</li>
                  </ul>
                </div>
              </div>

              {/* IDE */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><FileCode2Icon className="h-4 w-4 opacity-80" aria-hidden /> B. Semantic Flow IDE (Text-first Editing)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Work with the same schema in structured form.</li>
                  <li>Quickly revise fields and labels; edit workflow.json and workflow.dsl views.</li>
                  <li>Export and re-import for collaboration. Formats: JSON, YAML, Markdown, XML.</li>
                  <li>Execute modal: submit the current workflow context for inference using your provider.</li>
                </ul>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Keep a text source-of-record for your canvas</li>
                    <li>Bulk edit nodes/edges via JSON or DSL</li>
                    <li>Quickly export the entire workflow in multiple formats</li>
                  </ul>
                </div>
              </div>

              {/* Router */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Share2 className="h-4 w-4 opacity-80" aria-hidden /> C. Router (Routes, Bindings, Integrations)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Define how your schema is consumed and where it goes.</li>
                  <li>Configure role mapping, active context set, bindings (Personas, Policies, Memory, Seeds), tools/integrations, providers/models, export targets.</li>
                  <li>Preview the assembled system/first message before Chat.</li>
                  <li>AI Functions: Text → Workflow, Execute Workflow (choose JSON/Markdown/YAML/XML), Enhance Content with apply-to-workflow.</li>
                  <li>Keys management (BYOK in-session), presets/history, streaming toggle, copy cURL.</li>
                </ul>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Send the current canvas context to your AI provider for inference</li>
                    <li>Convert a plain-text spec into a starter workflow</li>
                    <li>Enhance node content and apply updates back to the canvas</li>
                  </ul>
                </div>
              </div>

              {/* Console */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Terminal className="h-4 w-4 opacity-80" aria-hidden /> D. Console (Quick Control Surface)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Runs a single inference on your saved workflow; prints progress inline.</li>
                  <li>Quick inspection: list nodes/edges, set fields, export current schema (JSON).</li>
                  <li>Basic toggles only; routing/bindings are managed in Router.</li>
                </ul>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Sanity-check an inference run against your canvas</li>
                    <li>Export a JSON snapshot for external tooling</li>
                    <li>Inspect node/edge counts and basic health</li>
                  </ul>
                </div>
              </div>

              {/* Chat */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 opacity-80" aria-hidden /> E. Chat (Context-Aware Messaging)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Win95-style demo chat surface for quick UX testing.</li>
                  <li>In this build, Chat is local; use Router to call real models.</li>
                  <li>Future: wire active route/context into Chat once provider backing is enabled.</li>
                </ul>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Prototype conversation flows and UI interactions</li>
                    <li>Demonstrate streaming and message rendering</li>
                  </ul>
                </div>
              </div>

              {/* Admin */}
              {/* Settings now live under Router */}

              {/* Discourse */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 opacity-80" aria-hidden /> G. Discourse-Powered Features (SSO)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Use topics/PMs/personas as context.</li>
                  <li>Browse latest topics and PM inbox (read-only views).</li>
                  <li>Stream sample responses with a selected persona. Replies are read-only in this version.</li>
                  <li>All actions respect permissions and rate limits.</li>
                </ul>
                <div className="mt-2">
                  <div className="text-xs font-semibold mb-1">Use cases</div>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Anchor a Seed (Discourse Topic) for a project</li>
                    <li>Reference personas/policies defined in Discourse AI</li>
                    <li>Review PM context to inform prompts and routes</li>
                  </ul>
                </div>
              </div>

              {/* Agentic constructs */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Bot className="h-4 w-4 opacity-80" aria-hidden /> H. Agentic Constructs (Schemas that act like agents)</h4>
                <p className="text-sm">Design a bundle: Persona/Role + Policies/Constraints + Tools + Memory/Seed references. This is a schema patternnot an orchestrated agent runner.</p>
                <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
                  <li>Build in Builder (Persona, Policy, Examples, Tools, Seed links)</li>
                  <li>Inspect/edit in IDE; export if needed</li>
                  <li>In Router, pick role, tools, seeds (Console can override)</li>
                  <li>Open Chat to test, iterate, finalize</li>
                </ol>
              </div>
            </div>
          </Section>

          {/* AI Features — placed after Pages & Features */}
    <Section id="ai-features" title="AI Features (How it works)" icon={LightbulbIcon}>
            <div className="space-y-3">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Wand2 className="h-4 w-4 opacity-80" aria-hidden /> Text → Workflow</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Router → AI Functions → Text → Workflow</li>
      <li>Converts free text into workflow JSON (nodes + edges) with your selected model.</li>
      <li>Type your spec, pick a model, Convert. Copy the JSON. In IDE: paste into workflow.json → Edit → Apply JSON.</li>
      <li>Get a fast first draft from a brief, outline, or checklist.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><PlayCircle className="h-4 w-4 opacity-80" aria-hidden /> Execute (Inference)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Router → AI Functions → Execute · IDE → Execute · Console → run</li>
      <li>Sends your saved workflow context to a model and returns JSON/Markdown/YAML/XML.</li>
      <li>Builder: save workflow → Router: Refresh from Builder → choose format → Execute. Or in IDE: Execute. Or in Console: type <code>run</code>.</li>
      <li>Produce outputs directly from your canvas without custom glue.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Wand2 className="h-4 w-4 opacity-80" aria-hidden /> Enhance Content</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Builder (node modal) · IDE (Inspector → Enhance Content) · Router → AI Functions → Enhance</li>
      <li>Improves a node’s description/content or a specific field using your model.</li>
      <li>Select node/field → Enhance → Apply to Workflow (IDE/Router) to persist changes.</li>
      <li>Iterate wording and structure in-place.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><SquareStack className="h-4 w-4 opacity-80" aria-hidden /> AI Node Generation</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Builder toolbar</li>
      <li>Creates a node from a short prompt; pre-fills fields/content.</li>
      <li>Click AI Generate Node → describe the node → insert → edit fields if needed.</li>
      <li>Add new parts fast without manual typing.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Key className="h-4 w-4 opacity-80" aria-hidden /> Keys & Provider Management</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Router → Providers / Keys</li>
      <li>Stores BYOK encrypted in session; lets you test providers and choose models/streaming.</li>
      <li>Enter key → Save → Test. Settings auto-apply to other pages.</li>
      <li>Keep credentials client-side with no server storage.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><History className="h-4 w-4 opacity-80" aria-hidden /> Presets, History, cURL, Streaming</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Router → Request Builder / Response / Saved Requests</li>
      <li>Saves/replays requests; copies cURL; shows streaming output and token/cost estimates.</li>
      <li>Build → Save → Load; toggle Streaming; Copy cURL; inspect Response and Limits.</li>
      <li>Repeat experiments and debug quickly.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><MessageSquare className="h-4 w-4 opacity-80" aria-hidden /> Discourse Persona Stream (Sample)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
      <li>Discourse tab</li>
      <li>Streams a sample response with a selected persona for the current topic (read-only).</li>
      <li>Sign in with SSO → select a topic → choose a persona → Stream sample.</li>
      <li>Preview persona behavior against real context.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="providers" title="Providers (BYOK Options)" icon={Key}>
            <div className="grid md:grid-cols-3 gap-3">
              {[{
                name:'OpenAI', href:'https://openai.com/', bullets:[
                  'GPT‑4o & o1 reasoning + multimodal',
                  'Structured outputs & tool calls',
                  'Stable latency ecosystem',
                  'Auto endpoint adapt (/chat vs /responses)'
                ]
              },{
                name:'OpenRouter', href:'https://openrouter.ai/', bullets:[
                  'Multi‑model marketplace gateway',
                  'Vendor‑prefixed model names',
                  'Custom headers auto‑applied',
                  'Easy A/B across families'
                ]
              },{
                name:'Venice AI', href:'https://venice.ai/chat', bullets:[
                  'Client‑side encrypted / private',
                  'Uncensored exploration focus',
                  'Latest OSS (DeepSeek, Llama, Qwen...)',
                  'Fast no‑account onboarding'
                ]
              },{
                name:'Nous Research', href:'https://nousresearch.com/', bullets:[
                  'Hermes reasoning model family',
                  'Test‑time scaling research',
                  'Transparent open blog updates',
                  'Focus on instruction quality'
                ]
              },{
                name:'Morpheus', href:'https://mor.org/', bullets:[
                  'Decentralized peer‑to‑peer network',
                  'MOR token aligned incentives',
                  'Lumerin‑style privacy routing',
                  'Permissionless agent infra'
                ]
              }].map(p => (
                <div key={p.name} className={`bg-white ${bevel.out} border-2 p-3 md:col-span-1`}>
                  <h4 className="font-semibold mb-1" style={{fontFamily: FONT_STACK}}>{p.name}</h4>
                  <ul className="list-disc pl-4 text-[11px] leading-5 space-y-1">
                    {p.bullets.map(b => <li key={b}>{b}</li>)}
                  </ul>
                  <a className="text-[10px] underline mt-2 inline-block" href={p.href} target="_blank" rel="noreferrer">Visit →</a>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs opacity-80">BYOK only: keys encrypted in sessionStorage, never sent to server.</div>
            <div className="mt-2 text-[10px] opacity-60 leading-4">Summaries are derived from public marketing material; check official docs for current terms & usage limits.</div>
          </Section>

          <Section id="export" title="Export and Interop" icon={FileCode2Icon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Export to JSON, YAML, Markdown, XML for downstream tooling and docs.</li>
              <li>Portable by design: commit to repos, paste into docs, feed pipelines.</li>
              <li>Note: CSV/Table export is not currently supported.</li>
            </ul>
          </Section>

          <Section id="security" title="Security and Access" icon={ShieldCheckIcon}>
            <div className="grid md:grid-cols-2 gap-3">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Key className="h-4 w-4 opacity-80" aria-hidden /> BYOK</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Keys live only in browser session storage (encrypted).</li>
                  <li>No server-side persistence of user keys.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><ShieldCheckIcon className="h-4 w-4 opacity-80" aria-hidden /> SSO (Discourse)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Sign in to unlock Discourse-backed features and personas.</li>
                  <li>Server keeps SSO secret server-side and proxies requests.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3 md:col-span-2`}>
                <h4 className="font-semibold mb-1 flex items-center gap-2"><Database className="h-4 w-4 opacity-80" aria-hidden /> Storage model</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Minimal app storage. Discourse is system-of-record when using SSO.</li>
                  <li>Your local schema work stays with you unless you export or sync.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="creative" title="Creative Ways to Use Semantic Flow" icon={LightbulbIcon}>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { title: 'Prompt & System Message Library', desc: 'Build a catalog of reusable system messages, role prompts, and guardrails; link examples and constraints; export Markdown/JSON.', icon: MessageSquare },
                { title: 'API Contracts & Data Shapes', desc: 'Define request/response schemas and validation rules; export to feed generators or validators.', icon: Braces },
                { title: 'Research Dossiers', desc: 'Organize questions, sources, notes, evidence, and summaries; export Markdown briefs and JSON indexes.', icon: BookOpenTextIcon },
                { title: 'Content & Style Kits', desc: 'Compose editorial rules, tone guides, templates, and example packs; export Markdown and JSON.', icon: LightbulbIcon },
                { title: 'Product Strategy Maps', desc: 'Model goals, criteria, risks, evaluation gates; export Markdown tables and JSON scorecards.', icon: ListTreeIcon },
                { title: 'Worldbuilding Bibles', desc: 'Create characters, locations, rules, timelines; use Markdown for narrative, JSON for attributes.', icon: Layers },
                { title: 'Design System Packs', desc: 'Keep tokens (JSON), guidance (Markdown), rules; export per format for tooling.', icon: BoxesIcon },
                { title: 'Localization Kits', desc: 'Store i18n keys (YAML/JSON), tone guidance (Markdown), examples; export per locale.', icon: Share2 },
                { title: 'CI/CD & Ops Specs', desc: 'Model pipelines/manifests/policies; export by consumer.', icon: Terminal },
                { title: 'Governance & Policy Cards', desc: 'Encode principles, constraints, exceptions; export JSON/Markdown.', icon: ShieldCheckIcon },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className={`bg-white ${bevel.out} border-2 p-3`}>
                  <h4 className="font-semibold mb-1 flex items-center gap-2"><Icon className="h-4 w-4 opacity-80" aria-hidden /> {title}</h4>
                  <p className="text-sm">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold mb-1">Patterns with mixed languages</div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { title: 'API Gateway Route', desc: 'JSON (contract) + YAML (gateway route) + Markdown (usage guide)', icon: Share2 },
                  { title: 'GitHub Actions Generator', desc: 'YAML (workflow) + Markdown (runbook) + JSON (inputs schema)', icon: FileCode2Icon },
                  { title: 'Agent Persona Pack', desc: 'Markdown (persona/system) + JSON (tool registry) + YAML (routing config)', icon: Bot },
                  { title: 'Deep Research Kit', desc: 'JSON (sources index) + Markdown (brief) + YAML (fetch policy)', icon: BookOpenTextIcon },
                  { title: 'App Config Bundle', desc: 'YAML (env config) + JSON (feature flags) + Markdown (release notes)', icon: Layers },
                ].map(({ title, desc, icon: Icon }) => (
                  <div key={title} className={`bg-white ${bevel.out} border-2 p-3`}>
                    <h4 className="font-semibold mb-1 flex items-center gap-2"><Icon className="h-4 w-4 opacity-80" aria-hidden /> {title}</h4>
                    <p className="text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-white opacity-80">© {new Date().getFullYear()} Semantic Flow</div>
      </div>
    </div>
  );
}
