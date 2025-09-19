# Semantic Flow User Guide

> Semantic Flow is a visual workspace for composing structured semantic context as linked nodes with explicit fields. You shape the information, trace how it connects, and deliver clean, model‑ready context to the AI provider you control.

This guide shows you how to use every part of the app directly and efficiently—plain language, no roadmap fluff. Skim the map, read Getting Started once, then jump to what you need.

## Quick Map
- [Getting Started](getting-started.md)
- Core Concepts: [Workflow & Nodes](ontology/overview.md) · [Fields & Context](ontology/node-context.md)
- Pages & Screens: [Page Overview](pages/overview.md)
- Feature Guides: [Text → Workflow](features/text-to-workflow.md) · [Run a Workflow](features/workflow-execution.md) · [Enhance a Node](features/node-enhancement.md)
- Working With Providers & Keys: [Providers](providers.md)
- Running & Monitoring: [Execution Details](execution.md)
- Saving & Sharing: [Export / Import](export-import.md)
- Privacy & Safety: [Security](security.md)
- Reference & Answers: [FAQ](faq.md)

All links above are local files rendered inside the in‑app Documentation Browser (`/learn/docs`).

## If You Read Only One Page
Read [Getting Started](getting-started.md) to: add a key, place nodes, link them, export, and execute.

## Scope At A Glance
What it does:
- Lets you build layered context (nodes + fields) you can run or export.
- Keeps structure explicit so models get cleaner grounding.
- Converts and exports instantly (JSON / YAML / Markdown / XML).

What it does not do:
- Does not schedule or orchestrate long jobs.
- Does not store provider keys server‑side.
- Does not claim to “think” for you.

## Conventions Used Here
- “Canvas” = Builder surface where nodes live.
- “Workflow” = The entire set of nodes + edges + metadata.
- “Execute” = Send current workflow context node-by-node to the selected provider.
- “Enhance” = Ask the model to rewrite a node’s content with a chosen style (improve, simplify, etc.).

Proceed to [Getting Started →](getting-started.md)

---

## Developer Notes

- Run locally: `npm install && npm run dev` then open `http://localhost:8081`.
- Docs render in-app at `/learn/docs`; external viewers can read this folder directly on GitHub.
- Contracts and data shapes live in `AGENTS.md` (root). Architecture overviews: `docs/architecture/*`.
- BYOK only for AI providers: keys are stored encrypted in `sessionStorage` client-side.

### Quick Links

- Graph contracts: `src/lib/graphSchema.js`
- Execution engine: `src/lib/WorkflowExecutionEngine.js`
- Prompting: `src/lib/promptingEngine.js`
- Providers (UI): `src/components/ProviderSetup.jsx`
- Security helpers: `src/lib/security.js`
- Server (SSO/proxy/SSE): `server/app.js`
