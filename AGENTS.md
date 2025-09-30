# AGENTS

Pragmatic guidance for building, extending, and maintaining the semantic_flow workspace. Keep changes safe, explicit, and easy to verify.

## Core principles

- Contract first: define inputs, outputs, error modes, and performance budgets before coding.
- One intent per change: keep slices small, cohesive, and reversible; wire new capabilities behind clear seams.
- Start with the simplest viable step, then climb the complexity stack only when needed.
- Separate concerns: isolate UI, orchestration, data shaping, and IO so that one module owns one role.
- Favor composition over inheritance: build small pieces and wire them for new behavior.
- Guard boundaries: validate early, normalize data, and treat external input as immutable on entry and exit.
- Verify behavior: test observable outcomes (happy path, boundary, failure) instead of implementation details.
- Immutability at boundaries: copy on input/output; prevent cross-module mutation leaks.
- Improve code health with every change: better names, docs, tests, and structure.
- Story-first code: read top-down (Guard → Do → Verify) so the flow is obvious.
- Scalability by design: leave room for future growth without rewrites; lean on configuration and feature flags.
- Keep files lean: target 300–500 LOC per file (soft ceiling 500) and split earlier if clarity improves.
- Agents should stay auto-poietic, independent, and self-evolving; always hunt for min-max opportunities within safety rails.

## Architecture & trust boundaries

- Client (`src/`, React + Vite): renders the workflow canvas, manages nodes, and calls AI providers directly from the browser (bring-your-own-key).
- Server (`server/`, Express): handles Discourse SSO, proxies Discourse REST/SSE traffic, and serves the SPA. Provider keys never transit the server.
- External systems: AI providers (OpenAI, OpenRouter, Venice, etc.) and Discourse.
- External agents: treat remote collaborators as expert partners with limited visibility. Assume they cannot read workspace files or execution results unless explicitly shared, and that their knowledge may lag current dates. Provide full, current context with every request and emphasize verification of fast-changing facts.

Data flow
- Browser → Providers: `POST /chat/completions` with `Authorization: Bearer <key>` pulled from `sessionStorage`.
- Browser ↔ Server ↔ Discourse: Discourse REST/SSO via fetch with `credentials: 'include'`; server forwards data and SSE events.
- Discourse → Server → Browser: Webhooks arrive with HMAC signatures; server dedupes and rebroadcasts as SSE `webhook` events.

## Composition over inheritance

- Prefer small functions and pipelines (e.g., execution pipeline = prepare → call provider → verify → persist).
- Use higher-order helpers to inject logging, caching, throttling, or retries without coupling core logic to infrastructure.
- Separate side-effectful wiring from pure logic; pure modules live in `src/lib/*` and stay lean for testing.

## Modularity & file size

- 300–500 LOC per file is the comfortable zone; if a file creeps past ~400 lines, split by responsibility.
- Keep public surfaces tight: export only what downstream callers need.
- Compose features from `controller → service → adapter → schema` seams when functionality grows.
- Pure helpers live in `src/lib` or `src/utils`; components handle rendering only, and server files wire HTTP + adapters.

## Repository conventions

- Tooling: Vite for the client, Express for the server, Jest + jsdom for unit/integration tests, Playwright for E2E, TailwindCSS for styling.
- Directory roles:
  - `src/components/*`: UI components; keep them focused and reusable.
  - `src/lib/*`: orchestration, graph schema, execution engine, providers, utilities.
  - `server/*`: Express app wiring, Discourse adapters, SSE hub.
  - `docs/*`: end-user and contributor documentation.
  - `tests/*`: Jest unit/integration tests; `tests/e2e` for Playwright flows.
- Preferred module style: use ES modules where supported; configuration files may remain CommonJS (`*.cjs`). Avoid default exports in new code.
- Assets: keep static files under `public/`; import via Vite when needed.

## Contract-first design

Describe the contract at the top of each module and in tests before implementation. Capture types, invariants, and performance budgets.

```
/**
 * Contract
 * Inputs:
 *   - input: TextToWorkflowRequest { text: string; providerId?: string; model?: string }
 *   - execution?: ExecutionSettings { format?: 'json'|'markdown'; signal?: AbortSignal }
 * Outputs:
 *   - WorkflowResponse { success: boolean; workflow?: WorkflowSchema; error?: string; metadata?: object }
 * Error modes:
 *   - ValidationError, MissingProviderError, ProviderRateLimitError, UpstreamError
 * Performance:
 *   - time: soft 2s, hard 5s; memory: <50 MB peak
 * Side effects:
 *   - Calls PromptingEngine.callProvider; may emit toast notifications; logs via console.warn/error
 */
```

Contracts should cover inputs/outputs, error discriminants, time/memory budgets, side effects (IO, storage, SSE), and telemetry (logs, metrics, correlation IDs).

## Guard → Do → Verify pattern

Write public functions so the execution path reads clearly:

```
export async function executeWorkflow(workflow, options = {}) {
  // Guard
  const normalized = requireValidWorkflow(workflow);
  const { signal, onProgress } = normalizeOptions(options);

  // Do
  const result = await runSequentialExecution(normalized, { signal, onProgress });

  // Verify
  assertExecutionResult(result);
  return Object.freeze(result);
}
```

- Guard: validate inputs, apply defaults, set up context (signals, loggers, correlation IDs).
- Do: perform the core logic with composable helpers; keep side-effect boundaries explicit.
- Verify: assert invariants before returning; freeze or clone outputs that cross module boundaries.

## Client module contracts

### Graph schema (`src/lib/graphSchema.js`)
- Factories: `createNodeSchema`, `createEdgeSchema`, `createWorkflowSchema`, `createConfigSchema`, `createExecutionResultSchema`.
- Helpers: `generateId`, `createNode`, `createEdge` (defaults to `EDGE_CONDITIONS.FOLLOWS`).
- Validators: `validateNode`, `validateEdge`, `validateWorkflow` returning `{ isValid, errors }`.
- Constants: `GRAPH_SCHEMA_VERSION`, `PORT_TYPES`, `EDGE_CONDITIONS`, `EXECUTION_STATES`.

### Ontology (`src/lib/ontology.js`)
- Data: `ONTOLOGY_CLUSTERS`, `NODE_TYPES`, `CLUSTER_COLORS`.
- Queries: `getNodesByCluster(clusterCode)`, `getClusterSummary()`.

### Prompting engine (`src/lib/promptingEngine.js`)
- Class `PromptingEngine(userId)` with methods:
  - `callProvider(providerId, model, apiKey, messages)` → `Promise<ChatCompletionJSON>`.
  - `convertTextToWorkflow(text, apiKey, providerId = 'openai', model = 'gpt-4o')` → `{ success, workflow?, error?, metadata? }`.
  - `executeWorkflowWithFormat(workflow, outputFormat = 'json', executionSettings)` → execution result discriminant.
  - `enhanceNode(node, enhancementType = 'improve', context)` → enhancement discriminant.
  - `getAvailableProviders()` → active provider list with base URLs, headers, models.
  - `getRecommendedModels(taskType)` → advisory model names.
- Notes: `parseWorkflowFromAIResponse` extracts the first JSON block; malformed JSON yields empty graphs with error strings. OpenRouter requires `Referer` + `X-Title` headers.

### Workflow execution (`src/lib/WorkflowExecutionEngine.js`)
- Class `WorkflowExecutionEngine(userId, toast)`:
  - `executeWorkflow(workflow, onProgress?)` → `{ success, results, nodeStates, totalNodes, completedNodes, provider }` with progress events `start`, `node_start`, `node_complete`, `node_error`, `complete`.
  - `testSingleNode(nodeId, nodeType, content, providerId, model, apiKey)` → `{ success, result?, error?, provider, model, usage }`.
- Internals: `prepareNodeInput`, `getExecutionOrder` (current order = array order; no topological sort).
- Error modes: empty workflow, missing provider/key, provider HTTP failures continue execution but mark node errors.

### Discourse client (`src/lib/discourseApi.js`)
- REST: `getLatest(page)`, `getTopic(id)`, `getPMInbox(username)`.
- SSE: `subscribeEvents(onMessage)` returning `unsubscribe()`; events under `event:webhook`.
- AI proxy: `aiSearch(payload)` and `aiStream(payload, onEvent)` with cancel handle.

### Export utilities (`src/lib/exportUtils.js`)
- `exportWorkflow(workflow, format)` dispatches to JSON/Markdown/YAML/XML exporters returning `{ content, filename, mimeType }`.

### Security (`src/lib/security.js`)
- `SecureKeyManager`: encrypts provider keys in `sessionStorage` using AES (key `semantic-workflow-secure`).
- `SESSION_SECURITY.setupSessionClearance()`: optional tab lifecycle hook to clear stored keys on unload.

## Server API contracts (`server/app.js`)

Auth & cookies
- `sf_session` (HttpOnly) signed with `API_KEY`; 7-day expiry.
- `sf_csrf` (readable) paired with double-submit header `x-csrf-token` on logout.
- `sf_sso_nonce` (HttpOnly) for SSO round-trips.

Routes
- `GET /api/health` → `{ ok, env }`.
- `GET /api/config` → `{ discourseBaseUrl, ssoProvider, appBaseUrl }`.
- `GET /api/sso/login` → redirect + sets `sf_sso_nonce`.
- `GET /api/sso/callback?sso&sig` → validates HMAC + nonce, sets session cookies, redirects to `/discourse`.
- `POST /api/logout` (requires `x-csrf-token`) → clears cookies.
- `GET /api/me` (requires `sf_session`) → `{ user }` or 401.
- Discourse proxies: `/api/discourse/latest`, `/api/discourse/topic/:id`, `/api/discourse/pm/:username` pass through JSON.
- Seed endpoints: `POST /api/discourse/seed`, `POST /api/discourse/seed/:seedTopicId/attach`; return 501 if admin key missing.
- Lists: `GET /api/discourse/seeds?category_id=&tags=` → `{ topics }`.
- AI plugin: `POST /api/ai/search`, `POST /api/ai/stream`, `GET /api/ai/personas`.
- Webhooks: `POST /api/webhooks/discourse` expects HMAC header `x-discourse-event-signature = sha256=<hmac>`; dedupes bodies for ~2 minutes and emits SSE `webhook` payloads `{ event, type, ts, postId?, topicId?, userId?, categoryId? }`.
- SSE hub: `GET /api/events` emits `open`, `ping` every 15s, and `webhook` events.

Serving
- Dev mode: Express mounts Vite middleware; SPA served with live transformations.
- Production: Express serves `dist/` assets, falling back to `index.html` for SPA routes; API stays under `/api/*`.

## Storage & security

- `sessionStorage` keys: `api_key_{provider}` (encrypted), `base_url_{provider}`, `active_provider`, `openai_api_key` (legacy convenience).
- Cookies: `sf_session`, `sf_csrf`, `sf_sso_nonce`.
- Headers: provider calls require `Authorization` + `Content-Type: application/json`; OpenRouter also needs `Referer` + `X-Title`.
- Never proxy provider keys through the server or log them. Clear keys on logout or unload when possible.

## Execution flow (end to end)

1. User configures providers in `ProviderSetup.jsx`; keys stored via `SecureKeyManager`, base URLs tracked per provider, `active_provider` set.
2. `PromptingEngine.callProvider` uses the active provider/model to fulfill conversions, enhancements, or execution requests.
3. `WorkflowExecutionEngine.executeWorkflow` runs nodes sequentially, composes inputs from prior outputs, and streams progress events to the UI.
4. Results can be exported through `exportWorkflow(...)` in JSON/Markdown/YAML/XML.
5. Discourse integrations fetch `/api/me`, list content via `/api/discourse/*`, and subscribe to `/api/events` for webhook updates.

## Edge cases & error modes

- Provider errors: surface 401/403/429 with actionable messages; no automatic retries client-side.
- Model availability: ensure provider defaults list supported models; handle unsupported-model responses gracefully.
- Parsing: `convertTextToWorkflow` returns empty graphs with an error when AI output lacks valid JSON.
- Execution ordering: current engine respects array order only; document and guard against missing dependencies until topological sort is implemented.
- Server retries: Discourse proxy routes retry up to three times on 429/5xx with exponential backoff.
- Logout: only endpoint enforcing CSRF header; calling without `x-csrf-token` returns 403.
- Webhook dedupe: repeated payloads within TTL set `deduped: true` in SSE events.
- Encryption: AES key is static; protects against casual inspection but not XSS. Treat client as semi-trusted.

## Testing

- Jest unit/integration tests (jsdom): focus on components, BYOK workflows, lib logic. Avoid importing `server/*` in jsdom suites.
- Playwright E2E: cover provider setup, canvas rendering, Discourse tabs, workflow execution smoke.
- Add tests alongside features; include fixtures or mocks for provider responses without real keys.
- Test contract coverage: valid input, boundary case, representative failure.
- After material changes, run the pertinent tests or builds yourself, note pass/fail status succinctly, and map each explicit requirement to Done or Deferred before handoff.

## Observability & logging

- Use structured logs (`{ level, module, msg, correlationId, ...context }`) where logging is necessary.
- Never log secrets or full provider payloads without redaction; prefer summarizing metadata.
- Thread correlation IDs through async flows when possible (especially across PromptingEngine and WorkflowExecutionEngine hooks).

## Execution playbook

- Preparation: trace the call graph (UI → lib → server) and confirm contracts before editing.
- Principle: first, do no harm—identify the smallest viable change, keep it reversible, and prefer isolation over rewrites.
- Operation: ship one intent per change, prefer additive wiring, and apply Guard → Do → Verify in every public function.
- Safety nets: wrap new capabilities behind feature flags or toggles, respect AbortSignal timeouts, cap retries with jitter, maintain idempotency for external side effects, and add backpressure/rate limits where needed.
- Logging: emit structured, non-sensitive context (`{ module, level, correlationId, ... }`) and avoid drive-by logs.
- Blast radius: isolate risky work behind well-defined seams; keep a reversible path (feature flag, revertible commit, or clear rollback steps).
- Tool discipline: request external research only for rapidly evolving topics, require multiple distinct searches when deep investigation is unavoidable, and prefer local repository context before consulting outside sources.
- Communication cues: open with a concise acknowledgement tied to the task, avoid flattery, keep responses skimmable, and ask only one focused clarification question at a time while mirroring user emoji usage rather than initiating it.


## Change management

- Keep pull requests scoped to a single concern; update docs/tests alongside code.
- Preferred commit prefixes: `feat(scope):`, `fix(scope):`, `refactor(scope):` with motivation, approach, and risks.
- Review checklist: contract documented, tests cover success/boundary/failure, logs redacted, file size within guidance, no circular dependencies.
- Rollback plan: default toggles off until validated, document kill switches, and ensure new data writes are reversible.

## Documentation & comments

- Keep examples and fixtures updated and runnable alongside the code they illustrate.
- Summarize architecture and behavior in comments; keep them concise, precise, and timeless.
- Never leave TODOs or meta-notes in production paths; track follow-ups in issues or docs instead.

## Performance budgets

- Define soft/hard timeouts for provider and Discourse requests; honor `AbortSignal` for cancellation.
- Prefer streaming or incremental processing over buffering large payloads; keep peak memory under 50 MB for typical workflows.
- Aim for O(n) execution with respect to workflow nodes; document hotspots if higher complexity is unavoidable.

## Run context

- Development: `npm run dev` (default port 8081, SPA + API).
- Build: `npm run build` followed by `npm run preview` for production-like serving.
- Tests: `npm run test` (Jest), `npm run test:e2e` (Playwright). Run fast smoke tests before shipping.
