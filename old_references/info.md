# Semantic Flow — What This App Is and What It Does

A live canvas for building schemas and context. You compose information as connected “nodes” with fields, then export what you made (JSON, YAML, Markdown, XML, CSV) for prompts, system messages, API shapes, documents, and code scaffolds.

Important: Semantic Flow is not an automation runner. It does not execute flows. It helps you design, structure, and manage context.

## 1) Core Concepts

- Schema
  A structured representation of information you define. The canvas is where you build and edit schemas visually.

- Node
  A node is like a mini table or spreadsheet row with named fields. It represents a part of your schema (e.g., Prompt, Persona, API Shape, Research Note, Constraint).

- Field
  A key-value in a node. You edit fields to shape meaning and structure. Fields export as JSON or other formats.

- Language Mode
  A per-node content format you choose to signal role and downstream use. Common modes: JSON (strict schemas/contracts), YAML (configs/manifests), XML (interop/config), Markdown (narrative docs, prompts, examples).

- Edge
  A relation between nodes. Edges express “references” (this node uses or depends on that node). They do not imply execution order.

- Ontology
  A library of node types grouped by clusters (e.g., Proposition, Inquiry, Reasoning, Evaluation, Cognitive, Creative, Utility, etc.). Additional examples include crypto-oriented nodes, but templates remain generic.

- Seed (Discourse)
  A “reference topic” created in Discourse that anchors context. Seeds can be attached to private messages for context-rich collaboration.

- Provider
  An AI or data source you use inside the app. Supported: OpenAI, OpenRouter, Venice AI. Discourse via SSO can power context and personas.

## 2) How Navigation Works 
- Landing
  Choose how you’ll work:
  - Sign in with Discourse SSO to unlock AI with Discourse-powered features and personas
  - Use your own keys (BYOK) for standard AI providers

- Main Areas (Assembly-Line Order)
  1) Semantic Flow Builder
  2) Semantic Flow IDE
  3) Router
  4) Console
  5) Chat

- Shared State (Assembly-Line Model)
  All tabs operate on the same schema:
  1) Build and organize in Builder
  2) Edit and export in IDE
  3) Wire routes and bindings in Router
  4) Adjust fast and inspect in Console
  5) Test, refine, and finalize in Chat
  Manage providers and site options in Router settings (Advanced)
  Think of it as a small factory for context-building.

## 3) Pages and Features

### A. Semantic Flow Builder (Visual Schema Canvas)
- Drag nodes from the palette onto the canvas and connect them to express references.
- Each node is a compact form with fields (think “mini Airtable”): title, description, parameters, tags, examples, constraints, etc.
- Language per node: assign JSON/YAML/XML/Markdown to a node to clarify its role (e.g., JSON for an API contract, YAML for a deploy manifest, Markdown for a system prompt or guide). Exports respect the content.
- Color and background controls help you organize and spot relationships quickly.
- Ontology-driven palette:
  - Core clusters: Proposition, Inquiry, Reasoning, Evaluation, Modal/Mental-State, Discourse Meta, Control/Meta, Error/Exception, Creative, Mathematical, Cognitive, Non-Classical Logic, Dynamic Semantics, Utility.
  - Crypto-inspired node types exist as examples; templates stay generic.
- Use cases:
  - Design system messages and prompt libraries
  - Author canonical JSON shapes and API request/response schemas
  - Structure research notes, briefs, and content templates
  - Draft style guides, taxonomies, and knowledge maps
  - Sketch code scaffolds and data contracts you will consume in your apps

What it is not: an automation or workflow engine. Connections indicate context and references, not steps to run.

### B. Semantic Flow IDE (Text-first Editing)
- A text editor for working with the same schema in structured form.
- Practical uses:
  - Quickly revise fields and labels
  - Keep a text source of record (e.g., JSON, Markdown)
  - Export and re-import content for collaboration
- Exports available: JSON, YAML, Markdown, XML, and CSV (tabular summaries). Table views help audit nodes/edges at a glance.

### C. Router (Routes, Bindings, and Integrations)
- Purpose: define how your schema is used by consumers and where it goes.
- Configure:
  - Message role mapping: use schema as system message or as the first message
  - Active context set: select which nodes/edges form the current route
  - Bindings: attach Persona/Policy/Memory nodes, Seeds (Discourse), and examples
  - Tools and integrations: MCP tools, deep-research modules, swarms, connectors, and app links
  - Providers and models: choose per-route provider (OpenAI, OpenRouter, Venice) and settings
  - Export targets: copy/export JSON; optional push to external services you connect
- Preview: confirm the assembled system/first message before sending to Chat.
- Note: Router maps schema to context and connectors; it does not execute workflows.

### D. Console (Quick Control Surface)
- Fast overrides and inspection:
  - List nodes/edges, set a node field by id or index, export current schema
  - Choose whether the active schema is used as system or first message (per-session override)
  - Select the active context set and quickly toggle tools/seeds
- Configure on the fly:
  - Attach Seeds, MCP tools, deep-research modules, swarms, connectors, characters/personas
  - Optional copy/export to external targets (e.g., JSON for GitHub commits or other services)
- Result flows to Chat: Console choices apply immediately to Chat.
- Tip: Use Router for persistent routes/bindings; use Console for rapid changes.

### E. Chat (Context-Aware Messaging Surface)
- Test and refine with live feedback using the active route/context.
- BYOK: chat with your selected provider (OpenAI, OpenRouter, Venice).
- SSO: when signed in via Discourse, your chat can leverage Discourse personas and content as the foundation for responses.
- Use Chat to validate schema intent, tone, constraints, and examples before publishing/exporting.

### F. Advanced Features & Settings
- Settings now live under Router.
- Toggle "Advanced features" to reveal expert panels (Endpoints, Conveyor, Gauge Board) and additional options.
- Provider setup (BYOK), appearance/theme, and site options remain available; keys are stored only in session storage (encrypted).

### G. Discourse-Powered Features (SSO Only)
- When you sign in via Discourse SSO:
  - Use Discourse as a context engine: topics, PMs, and personas enrich your work
  - Browse latest topics and PM inbox (read-only views)
  - Create “seeds” (reference topics) and attach them to PMs
  - Use personas configured in Discourse AI (as available)
- All Discourse actions respect permissions and rate limits.

### H. Agentic Constructs (Schemas that act like agents)
- An “agentic construct” is a schema bundle you design:
  - Persona/Role + Policies/Constraints + Tools + Memory/Seed references
  - Links define what this agent knows, how it should act, and which tools it can invoke
- How to use:
  1) Build the construct in Builder (nodes for Persona, Policy, Examples, Tools, Seed links)
  2) Inspect/edit in IDE; export if needed
  3) In Router, pick message role, tools, and seeds (Console can override)
  4) Open Chat to test, iterate, and finalize
- With SSO, you can align constructs with Discourse Personas and Seeds for shared context.

## 4) Export and Interop

- Export your schema to:
  - JSON: for programmatic use, APIs, and automation you build elsewhere
  - YAML / Markdown / XML: for docs and content pipelines
  - CSV / Table: for quick audits and spreadsheet workflows
- Portable by design: commit to your repos, paste into docs, or feed into your own pipelines.

## 5) Security and Access

- BYOK
  - Your AI keys live only in browser session storage (encrypted).
  - No server-side persistence of user keys.

- SSO (Discourse)
  - Sign in with Discourse to unlock Discourse-backed features and personas.
  - Server keeps the SSO secret server-side only and proxies requests safely.

- Storage model
  - Minimal app storage. Discourse is the system-of-record for content when using SSO.
  - Your local schema work stays with you unless you choose to export or sync.

## 6) What Semantic Flow Is Not

- Not a workflow runner or automation engine
- Not a queue or job system
- Not a datastore for your keys
- Not a spreadsheet replacement (nodes feel familiar, but the goal is structured context)

## 7) Creative Ways to Use Semantic Flow

- Prompt & System Message Library
  Build a catalog of reusable system messages, role prompts, and guardrails; link examples and constraints; export Markdown/JSON to use in your apps.

- API Contracts & Data Shapes
  Define request/response schemas (JSON) and validation rules; attach examples and error maps; export to feed code generators or validators.

- Research Dossiers
  Organize questions, sources, notes, evidence, and summaries; keep citations as fields; export Markdown briefs and JSON indexes.

- Content & Style Kits
  Compose editorial rules, tone guides, templates, and example packs; export Markdown for docs and JSON for linters/checkers.

- Product Strategy Maps
  Model goals, decision criteria, risks, and evaluation gates; attach acceptance checklists; export CSV tables and JSON scorecards.

- Worldbuilding Bibles
  Create characters, locations, rules, timelines, and artifacts; use Markdown for narrative, JSON for canonical attributes; wire to Chat for in‑character testing.

- Design System Packs
  Keep tokens (JSON), component guidance (Markdown), and usage rules; export per format for tooling, docs, and linters.

- Localization Kits
  Store i18n keys (YAML/JSON), tone guidance (Markdown), and examples; export bundles per locale.

- CI/CD & Ops Specs
  Model pipelines and policies; keep manifests as YAML, policy gates as JSON, docs as Markdown; export by consumer.

- Governance & Policy Cards
  Encode principles, constraints, exception handling, and audit notes; export JSON policies and Markdown summaries.

Patterns with mixed languages (build anything by composing formats):

- API Gateway Route
  JSON (contract) + YAML (gateway route) + Markdown (usage guide)
- GitHub Actions Generator
  YAML (workflow) + Markdown (runbook) + JSON (inputs schema)
- Agent Persona Pack
  Markdown (persona/system message) + JSON (tool registry) + YAML (routing config)
- Deep Research Kit
  JSON (sources index) + Markdown (brief) + YAML (fetch policy)
- App Config Bundle
  YAML (env config) + JSON (feature flags) + Markdown (release notes)

## 8) Quick Glossary

- Node: a mini table with fields; a unit of meaning
- Field: a key-value inside a node
- Language Mode: the chosen content format of a node (JSON/YAML/XML/Markdown)
- Edge: a reference from one node to another
- Schema: your whole connected structure
- Ontology: the library of node types and clusters
- Seed: a Discourse topic used as a contextual anchor
- Persona: a configured AI role in Discourse AI
- Provider: AI source (OpenAI, OpenRouter, Venice) or Discourse via SSO

For Discourse API reference, see: https://docs.discourse.org/
