## AGENTS.md — Code interaction guide for automated agents

Purpose: exact contracts, data shapes, and invariants. Write and modify code safely; integrate without guessing.

---

## 1) Architecture and trust boundaries

- Client (React/Vite, `src/`): renders the canvas, manages workflows, and calls AI providers directly (BYOK).
- Server (Express, `server/`): Discourse SSO/webhooks/proxy and static serving. No provider-key handling.
- External: AI providers (OpenAI/OpenRouter/Venice) and Discourse.

Data flow
- Browser → Providers: POST /chat/completions with Bearer key from sessionStorage (never proxied).
- Browser ↔ Server → Discourse: REST, SSO redirects; events via SSE.
- Discourse → Server: webhooks (HMAC) → Server → Browser: SSE broadcast.

---

## 2) Module map (where to look)

- Canvas & nodes: `src/components/LabCanvas.jsx`, `src/components/SemanticNode.jsx`, `src/components/NodePalette.jsx`
- Provider setup: `src/components/ProviderSetup.jsx`, `src/components/ProviderSettings.jsx`
- Execute UI: `src/components/WorkflowExecutionModal.jsx`, `src/components/TextToWorkflow.jsx`
- Orchestration: `src/lib/promptingEngine.js`
- Execution engine: `src/lib/WorkflowExecutionEngine.js`
- Discourse client: `src/lib/discourseApi.js`
- Graph: `src/lib/graphSchema.js`
- Ontology: `src/lib/ontology.js`
- Export: `src/lib/exportUtils.js`
- Security: `src/lib/security.js`
- Server: `server/app.js`, `server/index.js`

---

## 3) Client-side contracts (APIs you can call)

Graph schema (`src/lib/graphSchema.js`)
- Constants: `GRAPH_SCHEMA_VERSION = "1.0.0"`, `PORT_TYPES`, `EDGE_CONDITIONS`, `EXECUTION_STATES`.
- Factories
  - `createNodeSchema() -> NodeSchema`
  - `createEdgeSchema() -> EdgeSchema`
  - `createWorkflowSchema() -> WorkflowSchema`
  - `createConfigSchema() -> ModelConfig`
  - `createExecutionResultSchema() -> ExecutionResult`
- Helpers
  - `generateId() -> string`
  - `createNode(type, position, content='') -> Node`
  - `createEdge(sourceId, targetId, condition=EDGE_CONDITIONS.FOLLOWS) -> Edge`
- Validators
  - `validateNode(node) -> { isValid:boolean, errors:string[] }`
  - `validateEdge(edge) -> { isValid:boolean, errors:string[] }`
  - `validateWorkflow(workflow) -> { isValid:boolean, errors:string[] }`

Ontology (`src/lib/ontology.js`)
- `ONTOLOGY_CLUSTERS`, `NODE_TYPES`, `CLUSTER_COLORS`
- `getNodesByCluster(clusterCode) -> Array<{code,label,...}>`
- `getClusterSummary() -> Array<{code,name,color,nodeCount}>`

Prompting engine (`src/lib/promptingEngine.js`)
- Class: `PromptingEngine(userId)`
- Methods
  - `callProvider(providerId, model, apiKey, messages) -> Promise<ChatCompletionJSON>`
  - `convertTextToWorkflow(text, apiKey, providerId='openai', model='gpt-4o') -> { success, workflow?, error?, metadata? }`
  - `executeWorkflowWithFormat(workflow, outputFormat='json', executionSettings) -> { success, execution?, error? }`
  - `enhanceNode(node, enhancementType='improve', context) -> { success, enhancement?, error? }`
  - `getAvailableProviders() -> Promise<Array<{providerId, name, baseURL, models, headers, isActive}>>`
  - `getRecommendedModels(taskType) -> string[]` (advisory only)
- Notes
  - `parseWorkflowFromAIResponse` extracts the first JSON block via regex; malformed JSON returns `{nodes:[],edges:[],error}`.
  - Provider lists include OpenAI/OpenRouter/Venice; headers for OpenRouter add Referer/X-Title.

Workflow execution (`src/lib/WorkflowExecutionEngine.js`)
- Class: `WorkflowExecutionEngine(userId, toast)`
- Methods
  - `executeWorkflow(workflow, onProgress?) -> Promise<{ success, results, nodeStates, totalNodes, completedNodes, provider }>`
    - Progress callbacks: emits `{type:'start'|'node_start'|'node_complete'|'node_error'|'complete', ...}`.
    - Active provider: from `sessionStorage.active_provider` or first from `getAvailableProviders()`; model = provider.models[0].
  - `testSingleNode(nodeId, nodeType, content, providerId, model, apiKey) -> { success, result?, error?, provider, model, usage }`
  - Internals: `prepareNodeInput(node, nodeStates, workflow)`, `getExecutionOrder(workflow)` (current: sequential order by nodes array).
- Error modes
  - Missing nodes → throws 'Workflow is empty'.
  - No active provider or missing key → throws user-facing error.
  - Provider HTTP error → caught; marks node error and continues.

Discourse client (`src/lib/discourseApi.js`)
- `getLatest(page=0) -> Promise<json>`
- `getTopic(id) -> Promise<json>`
- `getPMInbox(username) -> Promise<json>`
- `subscribeEvents(onMessage) -> unsubscribe()`; listens to SSE `/api/events`, event `webhook` with JSON payload.
- `aiSearch(payload) -> Promise<json>`
- `aiStream(payload, onEvent) -> cancel()`; streams raw server-sent chunks.

Export utilities (`src/lib/exportUtils.js`)
- `exportWorkflowAsJSON(workflow) -> { content, filename, mimeType }`
- `exportWorkflowAsMarkdown(workflow) -> { content, filename, mimeType }`
- `exportWorkflowAsYAML(workflow) -> { content, filename, mimeType }`
- `exportWorkflowAsXML(workflow) -> { content, filename, mimeType }`
- `exportWorkflow(workflow, format) -> { content, filename, mimeType }`

Security (`src/lib/security.js`)
- `SecureKeyManager`
  - `storeApiKey(provider, key)` stores `api_key_{provider}` in sessionStorage (AES via CryptoJS, static key `semantic-workflow-secure`).
  - `getApiKey(provider) -> key|null`
  - `clearAllKeys()` removes all `api_key_*` entries.
- `SESSION_SECURITY.setupSessionClearance()` clears keys on `beforeunload` (optional tab-hide hook present but disabled).

Provider setup (`src/components/ProviderSetup.jsx`)
- Defaults for OpenAI/OpenRouter/Venice; persists `base_url_{provider}`, sets `active_provider`, and stores keys via SecureKeyManager.
- Also sets `openai_api_key` for the active provider (legacy convenience key).

---

## 4) Server API contracts (Discourse integration)

Auth and cookies
- `sf_session` (HttpOnly): HMAC-signed token (header.payload.sig) using `API_KEY` env as secret, 7-day expiry.
- `sf_csrf` (readable): CSRF cookie for double-submit; echo as `x-csrf-token` on POST to `/api/logout`.
- `sf_sso_nonce` (HttpOnly, short-lived): SSO nonce during login.

Routes (method path → contract)
- GET `/api/health` → `{ ok:boolean, env:string }`
- GET `/api/config` → `{ discourseBaseUrl, ssoProvider:boolean, appBaseUrl }`
- GET `/api/sso/login` → 302 redirect to Discourse SSO; sets `sf_sso_nonce`.
- GET `/api/sso/callback?sso&sig` → verifies HMAC, validates nonce, sets `sf_session`+`sf_csrf`, 302 to `/discourse`.
- POST `/api/logout` headers: `x-csrf-token` must match `sf_csrf`. Clears cookies.
- GET `/api/me` (cookie: `sf_session`) → `{ user }` or 401.

Discourse proxies
- GET `/api/discourse/latest?page=` → passthrough of `/latest.json`.
- GET `/api/discourse/topic/:id` → passthrough of `/t/:id.json`.
- GET `/api/discourse/pm/:username` → passthrough of PM inbox.
- POST `/api/discourse/seed` body: `{ title, category_id, tags?, raw?, idempotencyKey? }` → creates topic; 501 when admin key missing.
- POST `/api/discourse/seed/:seedTopicId/attach` body: `{ pm_topic_id }` → replies into PM with link.
- GET `/api/discourse/seeds?category_id=&tags=a,b` → `{ topics }` filtered by tags.

Discourse AI plugin
- POST `/api/ai/search` body: any JSON → upstream JSON or 502 on failure.
- POST `/api/ai/stream` body: any JSON → SSE piping; emits upstream stream or `event:error` on failure.
- GET `/api/ai/personas` → `{ personas: [{id,name,description?}] }` best-effort from multiple endpoints; fallback list provided.

Webhooks and events
- POST `/api/webhooks/discourse` headers: `x-discourse-event`, `x-discourse-event-type`, `x-discourse-event-signature = sha256=<hmac>` with shared secret; body is raw JSON.
- Dedupe: body hash TTL ~2m. Success always `{ ok:true, deduped?:true }`.
- Broadcast to SSE `/api/events` as `event:webhook` with payload:
  `{ event, type, ts, postId?, topicId?, userId?, categoryId? }`.
- GET `/api/events` (SSE): emits `open`, `ping` every 15s, and `webhook` events as above.

Dev/prod serving
- Dev: Vite middleware mounted on Express; HTML transformed for SPA routing.
- Prod: serves `dist/` and falls back to `index.html` for SPA routes; API under `/api/*`.

---

## 5) Storage, headers, and keys (ground truth)

sessionStorage
- `api_key_{provider}`: encrypted key via `SecureKeyManager`.
- `base_url_{provider}`: provider base URL override.
- `active_provider`: currently selected providerId.
- `openai_api_key`: legacy convenience for active provider (used by some components).

Cookies
- `sf_session` (HttpOnly), `sf_csrf` (readable), `sf_sso_nonce` (short-lived).

Headers
- Provider calls: `Authorization: Bearer <key>`, `Content-Type: application/json`.
- OpenRouter extras: `HTTP-Referer`, `X-Title`.
- CSRF: `x-csrf-token: <sf_csrf>` on `/api/logout` (only endpoint enforcing CSRF today).

---

## 6) Execution flow (end-to-end)

1) User configures providers in `ProviderSetup.jsx` → keys stored with `SecureKeyManager`, base URLs and `active_provider` set.
2) Orchestration uses `PromptingEngine.callProvider(...)` with the active provider and chosen model.
3) `WorkflowExecutionEngine.executeWorkflow(...)` iterates nodes sequentially, composes input from upstream node outputs, and records results.
4) UI exports via `exportWorkflow(...)` in desired format.
5) If Discourse features are used, UI fetches `/api/me`, lists content via `/api/discourse/*`, subscribes to `/api/events` for webhook-driven updates.

---

## 7) Edge cases and error modes

Providers
- 401/403/429 from providers → surface message; do not retry automatically on client.
- Model missing/unsupported → provider returns error; ensure model exists in ProviderSetup defaults.
- `convertTextToWorkflow` JSON parsing fails → returns empty graph with `error` string.

Graph/Execution
- Invalid nodes/edges → `validate*` returns errors; enforce before export/execute.
- Execution order is naive (nodes array). No topological sort yet; data dependencies may be out-of-order.
- Node execution continues after failures; errors recorded per node.

Server/Discourse
- `/api/discourse/*` retries upstream 3x with exponential backoff on 429/5xx.
- `/api/discourse/seed*` returns 501 when `API_KEY` not configured; client must handle.
- Webhook dedupe prevents duplicate SSE within ~2m TTL.
- `/api/logout` requires CSRF header; others do not enforce CSRF today.

Security
- AES key for browser encryption is static; protects against casual inspection, not XSS or a fully compromised client.
- Keys cleared on unload if `SESSION_SECURITY` is initialized.

---

## 8) Extension playbooks

Add a provider
- ProviderSetup: add to `defaultProviders` (id, baseURL, models). Save base URL under `base_url_{id}`. Store key via `SecureKeyManager.storeApiKey(id, key)`.
- PromptingEngine: ensure provider entry with headers if needed; reuse `callProvider` (expects `/chat/completions`).
- UI: allow selection and testing; never proxy keys.

Improve execution ordering
- Implement topological sort in `WorkflowExecutionEngine.getExecutionOrder` using edges; ensure cycles handled (detect/report).

Streamed execution
- For streamed models, add a streaming path alongside `callProvider`; consider using `ReadableStream` to accumulate partials.

Ontology
- Add types/clusters in `ontology.js`; update palette rendering if new clusters or colors introduced.

---

## 9) Tests (scope)

- Unit/integration (Jest + jsdom): components, lib logic, BYOK behavior. Avoid importing `server/*` in jsdom environment.
- E2E (Playwright): user flows (provider config, canvas render, discourse tabs, basic execution).
- Do not check real keys into tests or fixtures.

---

## 10) Invariants (do/don't)

- Do: keep provider keys in sessionStorage (encrypted). Do not log secrets.
- Do: include `credentials: 'include'` for Discourse endpoints that rely on cookies.
- Do: validate workflows before execution/export.
- Don’t: send provider keys to `/api/*` or introduce proxies for provider calls.
- Don’t: persist workflows server-side.

---

Run context
- Dev: `npm run dev` (SPA + API on one port, default 8081).
- Build/preview: `npm run build` then `npm run preview` (served by Node server).

Use this file as the contract index when reading or changing code. The sections above are sourced directly from the current modules and server routes.


