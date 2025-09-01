## AGENTS.md — Semantic Flow Agent Reference (Frontend-only, BYOK)

Purpose: single-source, high-signal reference for anyone touching this repo. Read alongside `README.md`. No task checklists. No backend.

---

## 1) Core Tenets

- Frontend-only: all logic lives in `src`. No servers, DBs, or proxies.
- BYOK: users provide provider keys; keys never leave the browser.
- Direct fetch: call providers from the browser using official patterns only.
- React Flow + Ontology: workflows are graphs of typed semantic nodes.

---

## 2) Codebase Map (source of truth)

- Canvas & UX: `src/components/LabCanvas.jsx`, `src/components/SemanticNode.jsx`, `src/components/NodePalette.jsx`
- Providers (BYOK): `src/components/ProviderSetup.jsx`, `src/components/ProviderSettings.jsx`
- AI orchestration: `src/lib/promptingEngine.js` (text→workflow, execute workflow, enhance node)
- Graph contracts: `src/lib/graphSchema.js` (nodes/edges/workflow schemas, validators, helpers)
- Ontology: `src/lib/ontology.js` (clusters, node types, colors)
- Export: `src/lib/exportUtils.js` (JSON, Markdown, YAML, XML)
- Execution UI: `src/components/WorkflowExecutionModal.jsx`, `src/components/TextToWorkflow.jsx`
- Security (BYOK): `src/lib/security.js` (encrypted session storage via `SecureKeyManager`)
- App entry: `src/App.jsx`, `src/pages/*`, `src/main.jsx`
- Tests: `tests/unit/*.test.*` (frontend/provider logic only)

---

## 3) Provider Integration (BYOK, direct fetch)

- Keys live only in sessionStorage, encrypted by `SecureKeyManager` under `api_key_{provider}`.
- Active provider and base URLs are stored in sessionStorage (`active_provider`, `base_url_{provider}`).
- Do not proxy or transmit keys to any backend.

Examples reflected in the codebase:

- OpenRouter
```js
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'HTTP-Referer': window.location.origin, // optional
    'X-Title': 'Semantic Flow',             // optional
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'qwen/qwen3-235b-a22b-07-25:free',
    messages: [{ role: 'user', content: 'Hello' }]
  })
});
```

- Venice
```js
fetch('https://api.venice.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'venice-uncensored',
    messages: [{ role: 'user', content: 'Hello' }]
  })
});
```

- OpenAI
```js
fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
  })
});
```

Provider defaults and quick test hooks live in `ProviderSetup.jsx`. Models are selectable per provider.

---

## 4) Security & Data Handling

- Keys: store only in `sessionStorage`, encrypted (see `SecureKeyManager`). Never log keys.
- Session lifecycle: `SecureKeyManager.clearAllKeys()` wipes keys; optional auto-clear on unload in `SESSION_SECURITY`.
- Data: workflows and app state are local (browser). No remote persistence.

---

## 5) Graph & Ontology Contracts

- Schema version: `graphSchema.js` → `GRAPH_SCHEMA_VERSION = "1.0.0"`.
- Node/edge/workflow creators: `createNode`, `createEdge`, `createWorkflowSchema`.
- Validators: `validateNode`, `validateEdge`, `validateWorkflow` (return `{ isValid, errors }`).
- Edge semantics: `EDGE_CONDITIONS` (implies, supports, contradicts, ...).
- Execution states: `EXECUTION_STATES` (pending, running, completed, failed, paused).
- Ontology: `ontology.js` exposes clusters (`ONTOLOGY_CLUSTERS`), node types (`NODE_TYPES`), and palette helpers.

---

## 6) AI Operations (PromptingEngine)

`src/lib/promptingEngine.js` provides three high-level flows, all using direct fetch:

- Text→Workflow: `convertTextToWorkflow(text, apiKey, providerId, model)` → `{ success, workflow|error, metadata }`.
- Execute Workflow: `executeWorkflowWithFormat(workflow, format, settings)` → `{ success, execution|error }`.
- Enhance Node: `enhanceNode(node, type, context)` → `{ success, enhancement|error }`.

Result strings are provider outputs; formatting helpers live in `exportUtils.js`.

---

## 7) UI & Export

- Canvas: `LabCanvas.jsx` uses React Flow; React node type `semantic` wraps our ontology nodes.
- Execution UI: `WorkflowExecutionModal.jsx` handles provider/model selection and result display.
- Export: `exportWorkflow()` supports JSON, Markdown, YAML, XML; used from canvas and execution views.

---

## 8) Tests (scope)

- Keep: unit tests for React components and provider/BYOK logic only (`tests/unit/*.test.*`).
- Exclude: any test that imports servers, databases, or proxies.
- Jest + jsdom configured via `jest.config.cjs` and `tests/setup/jest.setup.js`.

---

## 9) Keep/Remove Policy

Keep
- `src/`, `public/`, `package.json`, `vite.config.js`, tailwind/postcss config, `jest.config.cjs`, `babel.config.cjs`, `.eslintrc.cjs`, `jsconfig.json`, `.env.example`, `README.md`.
- `tests/` (frontend-only tests).

Remove (if introduced)
- Any `server/`, `supabase/`, `prisma/`, or backend code.
- Proxies for provider calls, or anything that transmits user keys off-device.
- Committed test-output folders (e.g., `coverage/`, `test-results/`).

---

## 10) Troubleshooting (quick)

- Provider calls fail → Validate API key in session, base URL, and exact fetch headers/body; try a different known-good model.
- Dark mode palette issues → hard refresh to reload CSS.
- Landing/setup loops → clear `sessionStorage` and retry.
- Model deprecations → prefer the listed defaults (`gpt-4o`, `gpt-4o-mini`) or choose a supported custom model.

---

## 11) Deployment

Static frontend (Vercel/Netlify/etc.). No backend required. Do not store or reference real keys in env files.

---

This document is the informational base for agents working in this app. If something isn’t covered here, check `README.md` and the referenced source files.


