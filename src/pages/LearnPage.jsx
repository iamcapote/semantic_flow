// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenTextIcon, InfoIcon, LightbulbIcon, BoxesIcon, FileCode2Icon, ShieldCheckIcon, RocketIcon, ListTreeIcon } from 'lucide-react';
import TopNav95Plus from '@/components/TopNav95Plus';

// Win94+ styled static Learn page for Semantic Flow
export default function LearnPage() {
  const navigate = useNavigate();

  // Keep sections consistent with Win95Suite and place Learn after Admin
  const sections = [
    { id: 'builder', label: 'Builder', href: '/builder' },
    { id: 'ide', label: 'IDE', href: '/ide' },
    { id: 'api', label: 'Router', href: '/api' },
    { id: 'console', label: 'Console', href: '/console' },
    { id: 'chat', label: 'Chat', href: '/chat' },
    { id: 'admin', label: 'Admin', href: '/admin' },
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
        <h3 className="font-semibold tracking-wide" style={{ fontFamily: 'Tahoma, "MS Sans Serif", system-ui' }}>{title}</h3>
      </header>
      <div className={`bg-[#ffffff] ${bevel.in} border-2 m-2 p-3 text-sm leading-6 text-black`}>{children}</div>
    </section>
  );

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
              <div className="font-semibold" style={{ fontFamily: 'Tahoma, "MS Sans Serif", system-ui' }}>Semantic Flow — Learn</div>
            </div>
            <div className="text-xs opacity-80">Win94+ Manifold UI</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 p-3">
            {/* TOC */}
            <aside className={`md:sticky md:top-2 h-max bg-[#c0c0c0] ${bevel.in} border-2 p-2`}>
              <div className="text-xs font-semibold mb-2">On this page</div>
              <nav className="space-y-1 text-sm">
                {[ 
                  ['core', 'Core Concepts'],
                  ['nav', 'How Navigation Works'],
                  ['pages', 'Pages & Features'],
                  ['export', 'Export & Interop'],
                  ['security', 'Security & Access'],
                  ['not', 'What It Is Not'],
                  ['creative', 'Creative Uses'],
                  ['glossary', 'Quick Glossary'],
                ].map(([id, label]) => (
                  <a key={id} href={`#${id}`} className="block hover:underline">{label}</a>
                ))}
              </nav>
            </aside>

            {/* INTRO */}
            <div className={`space-y-3`}>
              <div className={`bg-[#ffffff] ${bevel.in} border-2 p-3`}>
                <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'Tahoma, "MS Sans Serif", system-ui' }}>What this app is and what it does</h1>
                <p className="text-sm leading-6">
                  Semantic Flow is a live canvas for building schemas and context. Compose information as connected nodes with fields, then export your work (JSON, YAML, Markdown, XML, CSV) for prompts, system messages, API shapes, documents, and code scaffolds.
                </p>
                <div className="mt-2 p-2 bg-[#fffbd1] text-[#3b3b00] border border-[#d0c86a]">
                  <strong>Important:</strong> Semantic Flow is not an automation runner. It does not execute flows; it helps you design, structure, and manage context.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="grid grid-cols-1 gap-4">
          <Section id="core" title="1) Core Concepts" icon={ListTreeIcon}>
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
            </div>
          </Section>

          <Section id="nav" title="2) How Navigation Works" icon={BookOpenTextIcon}>
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
                  <li>Admin</li>
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
                  <li>Manage providers, SSO, and site options in Admin</li>
                </ol>
                <p className="mt-2 text-xs italic">Think of it as a small factory for context-building.</p>
              </div>
            </div>
          </Section>

          <Section id="pages" title="3) Pages and Features" icon={BoxesIcon}>
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
              <div className={`bg-white ${bevel.out} border-2 p-3`}>
                <h4 className="font-semibold mb-1">F. Admin (Settings & Configuration)</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Provider setup, appearance/theme controls, Discourse SSO, app-site toggles.</li>
                  <li>BYOK keys live in session storage (encrypted); never stored server-side.</li>
                </ul>
              </div>

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

          <Section id="export" title="4) Export and Interop" icon={FileCode2Icon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Export to JSON, YAML, Markdown, XML for downstream tooling and docs.</li>
              <li>CSV/Table for quick audits and spreadsheet workflows.</li>
              <li>Portable by design: commit to repos, paste into docs, feed pipelines.</li>
            </ul>
          </Section>

          <Section id="security" title="5) Security and Access" icon={ShieldCheckIcon}>
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

          <Section id="not" title="6) What Semantic Flow Is Not" icon={InfoIcon}>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Not a workflow runner or automation engine</li>
              <li>Not a queue or job system</li>
              <li>Not a datastore for your keys</li>
              <li>Not a spreadsheet replacement</li>
            </ul>
          </Section>

          <Section id="creative" title="7) Creative Ways to Use Semantic Flow" icon={LightbulbIcon}>
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

          <Section id="glossary" title="8) Quick Glossary" icon={RocketIcon}>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                ['Node', 'A mini table with fields; a unit of meaning'],
                ['Field', 'A key-value inside a node'],
                ['Language Mode', 'The chosen content format of a node (JSON/YAML/XML/Markdown)'],
                ['Edge', 'A reference from one node to another'],
                ['Schema', 'Your whole connected structure'],
                ['Ontology', 'The library of node types and clusters'],
                ['Seed', 'A Discourse topic used as a contextual anchor'],
                ['Persona', 'A configured AI role in Discourse AI'],
                ['Provider', 'AI source (OpenAI, OpenRouter, Venice) or Discourse via SSO'],
              ].map(([term, desc]) => (
                <div key={term} className={`bg-white ${bevel.out} border-2 p-3`}>
                  <div className="font-semibold">{term}</div>
                  <div className="text-sm">{desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs">
              For Discourse API reference, see: <a className="underline" href="https://docs.discourse.org/" target="_blank" rel="noreferrer">https://docs.discourse.org/</a>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-white opacity-80">© {new Date().getFullYear()} Semantic Flow</div>
      </div>
    </div>
  );
}
