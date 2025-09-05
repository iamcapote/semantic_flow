// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenTextIcon, InfoIcon, LightbulbIcon, BoxesIcon, FileCode2Icon, ShieldCheckIcon, ListTreeIcon, SearchIcon, Circle } from 'lucide-react';
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
      <header className="flex items-center gap-2 px-3 py-2 text-sm text-white" style={{ background: '#000080' }}>
        <Icon className="h-4 w-4" />
        <h3 className="font-semibold tracking-wide" style={{ fontFamily: FONT_STACK }}>{title}</h3>
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

  const Card = ({ title, children, id }) => (
    <div id={id} className={`bg-white ${bevel.out} border-2 p-3`}>
      {title ? <h4 className="font-semibold mb-1" style={{ fontFamily: FONT_STACK }}>{title}</h4> : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );

  const Step = ({ n, label, desc }) => (
    <div className={`flex items-start gap-3 ${bevel.out} border-2 p-3 bg-white`}>
      <div className={`min-w-6 h-6 flex items-center justify-center text-xs font-bold ${bevel.in} border-2`} style={{ background: '#c0c0c0' }}>{n}</div>
      <div>
        <div className="text-sm font-semibold" style={{ fontFamily: FONT_STACK }}>{label}</div>
        <div className="text-sm leading-6">{desc}</div>
      </div>
    </div>
  );

  // TOC with icons and filter
  const tocItems = [
    { id: 'core', label: 'Core Concepts', icon: ListTreeIcon },
    { id: 'nav', label: 'How Navigation Works', icon: BookOpenTextIcon },
    { id: 'pages', label: 'Pages & Features', icon: BoxesIcon },
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
    { id: 'h2', text: 'No workflow runner', icon: InfoIcon },
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
            <div className="text-xs opacity-80">Win94+ Manifold UI</div>
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
                <h1 className="text-2xl font-bold" style={{ fontFamily: FONT_STACK }}>What this app is</h1>
                <div className="text-sm leading-6 mt-2">
                  Semantic Flow is a live canvas for building schemas and context. Build with nodes and fields, link them, then export your work
                  (JSON, YAML, Markdown, XML, CSV) for prompts, system messages, API shapes, documents, and code scaffolds.
                </div>
                <div className="text-[12px] mt-1 opacity-80" style={{ fontFamily: FONT_STACK }}>Design context like it's 1995, export it like it's today</div>

                <div className="mt-3 p-3 text-sm bg-[#fffbd1] text-[#3b3b00] border border-[#d0c86a]">
                  <strong>Important:</strong> Semantic Flow is not an automation runner. It does not execute flows. It helps you design, structure, and manage context.
                </div>

                {/* What it is not moved under hero */}
                <div className="mt-3">
                  <Card id="not" title="What it is not">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Not a workflow runner or automation engine</li>
                      <li>Not a queue or job system</li>
                      <li>Not a datastore for your keys</li>
                      <li>Not a spreadsheet replacement</li>
                    </ul>
                  </Card>
                </div>

                {/* Quick steps */}
                <div className={`h-px my-3 bg-[#9a9a9a] ${bevel.out}`} />
                <div className="grid md:grid-cols-3 gap-3">
                  <Step n={1} label="Drop nodes" desc="Drag from palette. Give each a few fields." />
                  <Step n={2} label="Link meaning" desc="Connect nodes to show references. Pick a format per node." />
                  <Step n={3} label="Export" desc="Send to JSON/YAML/MD/XML/CSV. Use in routes, docs, or code." />
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
                <h4 className="font-semibold mb-1">Schema</h4>
                <p>A structured representation of information you define. The canvas is where you build and edit schemas visually.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Node</h4>
                <p>A mini table or record with named fields. Represents part of your schema (e.g., Prompt, Persona, API Shape, Research Note, Constraint).</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Field</h4>
                <p>A key-value inside a node. You edit fields to shape meaning and structure. Fields export to JSON or other formats.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Language Mode</h4>
                <p>Per-node content format that signals role and downstream use. Common: JSON, YAML, XML, Markdown.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Edge</h4>
                <p>A relation between nodes. Edges express references or dependence—not execution order.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Ontology</h4>
                <p>A library of node types grouped by clusters: Proposition, Inquiry, Reasoning, Evaluation, Cognitive, Creative, Utility, etc.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Seed (Discourse)</h4>
                <p>A reference topic created in Discourse that anchors context. Useful for PM collaboration with rich context.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Provider</h4>
                <p>AI or data source used in the app. Supported: OpenAI, OpenRouter, Venice AI. Discourse via SSO can power context and personas.</p>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Persona</h4>
                <p>A configured AI role (often from Discourse AI) that bundles policies, constraints, and behavior; can be referenced by Router/Chat.</p>
              </div>
            </div>
          </Section>

          <Section id="nav" title="How Navigation Works" icon={BookOpenTextIcon}>
            <div className="space-y-2">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Landing</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li>Sign in with Discourse SSO to unlock Discourse-powered features</li>
                  <li>Or use your own keys (BYOK) for standard AI providers</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Main Areas (Assembly-Line Order)</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Semantic Flow Builder</li>
                  <li>Semantic Flow IDE</li>
                  <li>Router</li>
                  <li>Console</li>
                  <li>Chat</li>
                  <li>Advanced settings live under Router</li>
                </ol>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">Shared State (Assembly-Line Model)</h4>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Build and organize in Builder</li>
                  <li>Edit and export in IDE</li>
                  <li>Wire routes and bindings in Router</li>
                  <li>Adjust fast and inspect in Console</li>
                  <li>Test, refine, and finalize in Chat</li>
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
                <h4 className="font-semibold mb-1">A. Semantic Flow Builder (Visual Schema Canvas)</h4>
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
                <h4 className="font-semibold mb-1">B. Semantic Flow IDE (Text-first Editing)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Work with the same schema in structured form.</li>
                  <li>Quickly revise fields and labels; keep a text source of record.</li>
                  <li>Export and re-import for collaboration. Formats: JSON, YAML, Markdown, XML, CSV.</li>
                </ul>
              </div>

              {/* Router */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">C. Router (Routes, Bindings, Integrations)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Define how your schema is consumed and where it goes.</li>
                  <li>Configure role mapping, active context set, bindings (Personas, Policies, Memory, Seeds), tools/integrations, providers/models, export targets.</li>
                  <li>Preview the assembled system/first message before Chat.</li>
                  <li>Note: maps schema to context/connectors; does not execute workflows.</li>
                </ul>
              </div>

              {/* Console */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">D. Console (Quick Control Surface)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Fast overrides and inspection: list nodes/edges, set fields, export current schema.</li>
                  <li>Toggle system vs first-message usage; pick active context set.</li>
                  <li>Attach Seeds, tools, swarms, connectors, characters/personas.</li>
                  <li>Feed results to Chat or export to external targets.</li>
                </ul>
              </div>

              {/* Chat */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">E. Chat (Context-Aware Messaging)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Test and refine with the active route/context.</li>
                  <li>BYOK: chat with your provider (OpenAI, OpenRouter, Venice).</li>
                  <li>SSO: leverage Discourse personas/content when signed in.</li>
                </ul>
              </div>

              {/* Admin */}
              {/* Settings now live under Router */}

              {/* Discourse */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">G. Discourse-Powered Features (SSO)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Use topics/PMs/personas as context.</li>
                  <li>Browse latest topics and PM inbox (read-only views).</li>
                  <li>Create seeds and attach them to PMs.</li>
                  <li>All actions respect permissions and rate limits.</li>
                </ul>
              </div>

              {/* Agentic constructs */}
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">H. Agentic Constructs (Schemas that act like agents)</h4>
                <p className="text-sm">Design a bundle: Persona/Role + Policies/Constraints + Tools + Memory/Seed references. Links define knowledge, behavior, and tool access.</p>
                <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
                  <li>Build in Builder (Persona, Policy, Examples, Tools, Seed links)</li>
                  <li>Inspect/edit in IDE; export if needed</li>
                  <li>In Router, pick role, tools, seeds (Console can override)</li>
                  <li>Open Chat to test, iterate, finalize</li>
                </ol>
              </div>
            </div>
          </Section>

          <Section id="export" title="Export and Interop" icon={FileCode2Icon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Export to JSON, YAML, Markdown, XML for downstream tooling and docs.</li>
              <li>CSV/Table for quick audits and spreadsheet workflows.</li>
              <li>Portable by design: commit to repos, paste into docs, feed pipelines.</li>
            </ul>
          </Section>

          <Section id="security" title="Security and Access" icon={ShieldCheckIcon}>
            <div className="grid md:grid-cols-2 gap-3">
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">BYOK</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Keys live only in browser session storage (encrypted).</li>
                  <li>No server-side persistence of user keys.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">SSO (Discourse)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Sign in to unlock Discourse-backed features and personas.</li>
                  <li>Server keeps SSO secret server-side and proxies requests.</li>
                </ul>
              </div>
              <div className={`bg-white ${bevel.out} border-2 p-3 md:col-span-2`}>
                <h4 className="font-semibold mb-1">Storage model</h4>
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
                ['Prompt & System Message Library', 'Build a catalog of reusable system messages, role prompts, and guardrails; link examples and constraints; export Markdown/JSON.'],
                ['API Contracts & Data Shapes', 'Define request/response schemas and validation rules; export to feed generators or validators.'],
                ['Research Dossiers', 'Organize questions, sources, notes, evidence, and summaries; export Markdown briefs and JSON indexes.'],
                ['Content & Style Kits', 'Compose editorial rules, tone guides, templates, and example packs; export Markdown and JSON.'],
                ['Product Strategy Maps', 'Model goals, criteria, risks, evaluation gates; export CSV tables and JSON scorecards.'],
                ['Worldbuilding Bibles', 'Create characters, locations, rules, timelines; use Markdown for narrative, JSON for attributes.'],
                ['Design System Packs', 'Keep tokens (JSON), guidance (Markdown), rules; export per format for tooling.'],
                ['Localization Kits', 'Store i18n keys (YAML/JSON), tone guidance (Markdown), examples; export per locale.'],
                ['CI/CD & Ops Specs', 'Model pipelines/manifests/policies; export by consumer.'],
                ['Governance & Policy Cards', 'Encode principles, constraints, exceptions; export JSON/Markdown.'],
              ].map(([title, desc]) => (
                <div key={title} className={`bg-white ${bevel.out} border-2 p-3`}>
                  <h4 className="font-semibold mb-1">{title}</h4>
                  <p className="text-sm">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold mb-1">Patterns with mixed languages</div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  ['API Gateway Route', 'JSON (contract) + YAML (gateway route) + Markdown (usage guide)'],
                  ['GitHub Actions Generator', 'YAML (workflow) + Markdown (runbook) + JSON (inputs schema)'],
                  ['Agent Persona Pack', 'Markdown (persona/system) + JSON (tool registry) + YAML (routing config)'],
                  ['Deep Research Kit', 'JSON (sources index) + Markdown (brief) + YAML (fetch policy)'],
                  ['App Config Bundle', 'YAML (env config) + JSON (feature flags) + Markdown (release notes)'],
                ].map(([title, desc]) => (
                  <div key={title} className={`bg-white ${bevel.out} border-2 p-3`}>
                    <h4 className="font-semibold mb-1">{title}</h4>
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
