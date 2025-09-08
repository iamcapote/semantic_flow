Discourse × AI App — Architecture and Implementation
1) System model

Identity: DiscourseConnect SSO. Map {app_user_id ↔ discourse_username} at login.

Authority: One server-only admin API key. Impersonate with Api-Username=<discourse_username>.

Boundary: The server is the only caller of Discourse. Browsers never see keys or upstream URLs.

Surfaces: Topics, Posts, PMs, Chat, AI, Automation, Tags, Categories, Users, Badges, Groups, Search, Revisions, Data Explorer, Solved.

2) Hard isolation guarantees (single key)

Enforce all four:

Impersonation lock

Always set Api-Username = session.username. Never accept this from the client.

Username parity on user-scoped routes

Reject requests where any :username param ≠ session.username (e.g., PM inbox, bookmarks, user_status).

Resource access via Discourse ACLs

Rely on Discourse permission checks by impersonation. No admin bypass. Do not use system as Api-Username for user reads.

Proxy allowlist

Only expose the endpoints below. Deny by default. Validate required params. Strip unknown fields.

Recommended extras:

Per-user and global rate limits. Respect Retry-After.

Idempotency keys for create operations.

Full audit log: {when, who, route, resource_ids, result}.

Data Explorer: server-admin only, gated per-query allowlist and required user filters.

3) Service layout

auth/ SSO callback → create session {user_id, username}.

discourse/ proxy router → attaches headers {Api-Key, Api-Username} and enforces allowlist + parity rules.

events/ webhook receiver → verifies HMAC, emits SSE to clients.

ai/ helpers → PM with bot, Chat send, Automation trigger.

4) Endpoint allowlist (operations you may expose)

Below are the only upstream capabilities your proxy should call. For each, implement server handlers that validate inputs, set Api-Username=session.username, and pass through.

topics

write: create topic. Required: title, raw. Optional: category_id, tags[].
Params: topic_id (for special writes in workflows when applicable).

update: update topic attributes. Required: topic_id. Optional: category_id.

read: get topic. One of: topic_id or external_id.

read_lists: list topics. Optional: category_id.

status: set status (closed, pinned, archived). Required: topic_id, status, enabled. Optional: category_id.

posts

edit: update post. Required: id.

list: list posts in topic. Required: topic_id or equivalent.



tags

list: list tags.

tag_groups

list: list tag groups.

show: show tag group. Required: id.

categories

list: list categories.

show: show category. Required: id.

uploads

create: upload file (multipart). Then reference upload_id in posts.

users

bookmarks: list user bookmarks. Required: username (= session user).

sync_sso: admin SSO sync. Required: sso, sig.

show: show user. One of: username or external_id (+ optional external_provider).
Discourse × AI App — Architecture (Refactored w/ Confirmed Upstream Behaviors)

Version: 2025-09-08
Scope: Integrate Discourse (BIThub) SSO + AI personas streaming as a first‑party inference provider; enforce security isolation; supply internal provider fallback when no BYOK model key is configured.

## 1. System Model (Confirmed)
Identity: DiscourseConnect SSO (nonce + HMAC). We map { session.sub ↔ discourse_username } at login and sign a server‑HMAC session cookie (`sf_session`).
Authority: Single server admin API key (ENV: API_KEY) never leaves server. All upstream calls impersonate the session user via `Api-Username=<username>` (never accepted from client input).
Boundary: Browser only hits our Express `/api/*`. Server alone knows `DISCOURSE_BASE_URL` + `API_KEY`.
Surfaces (current & near‑term): Topics, Posts, PMs, AI Personas Streaming, AI Search (pending real endpoint), Seeds (context topics), Webhooks → SSE fanout, (future) Chat, Automations, Uploads.
Branding: Dynamic brand via env (`BITHUB` or `BITHUB_NAME`) exposed at `/api/config` → client picks up without rebuild.

## 2. Isolation & Security Guarantees
We enforce four invariants (all implemented / partially implemented):
1. Impersonation Lock: Always set `Api-Username=session.username` (fallback `system` only when NO user context & strictly read‑only). Do not trust any user‑supplied username fields.
2. Username Parity: Any route that scopes by username (`/pm/:username`, bookmarks, etc.) must match session username or 403.
3. Upstream ACL Reliance: No privilege escalation; Discourse permission model filters accessible resources.
4. Proxy Allowlist: Only implement explicit handlers; never forward arbitrary paths.

Additional hardening (to implement / expand):
- Rate limiting: token bucket per user + global concurrency caps; integrate Retry-After honoring for 429 responses.
- Structured audit log: `{ts, username, route, verb, upstreamPath, status, resourceIds}` persisted (file or DB) for 7–30 days.
- Idempotency: `idempotencyKey` supported on seed creation; extend to topic writes & automations.
- Input scrubbing: Reject unknown fields; whitelist exact JSON schema per handler.

## 3. Confirmed Upstream AI Endpoints & Behaviors
Probed endpoints (2025-09-08):
Working:
  - Streaming (personas): `POST /admin/plugins/discourse-ai/ai-personas/stream-reply`
    Payload accepted keys: `username` (required), one of `persona_id` or `persona_name`, `query`, optional `model`.
    Response protocol: newline-delimited JSON (NOT classic SSE) 
      First object: `{"topic_id":<id>,"bot_user_id":<id>,"persona_id":<id>}` 
      Subsequent: `{"partial":"<token_fragment>"}` per incremental token(s).
    Error (invalid persona): 422 + single JSON error object (no stream).
  - Personas list (admin variant): `GET /admin/plugins/discourse-ai/ai-personas.json` (note the exact path segment `ai-personas`)

Non-working / 404 (on current instance):
  - `GET /discourse_ai/personas`
  - `GET /admin/plugins/discourse-ai/personas.json` (missing `ai-` segment) 
  - `GET /discourse_ai/bot/personas`
  - `POST /discourse_ai/stream_completion`
  - `POST /discourse_ai/search` (returned 404; current server code still attempts this path via `/api/ai/search` proxy; needs adaptive fallback or removal until enabled upstream)

Implication: Our server wrapper must (a) target the confirmed working stream path, (b) implement a robust line parser converting newline JSON objects into a unified event stream for the client, (c) degrade gracefully when upstream returns a terminal JSON error.

## 4. Internal Inference Provider Design (BIThub / Discourse Personas)
Goal: When SSO is configured and API_KEY present, app provides a first‑party “Internal / BIThub” provider requiring zero user keys; chat + workflow features leverage personas streaming.

Abstraction:
`InternalProvider` capabilities:
  sendChat({ persona, query, topicId? }) → stream tokens
  listPersonas() → cached normalized list (id, name, description)
  search(opts) → (deferred until upstream search path confirmed; implement stub returning 501 or empty)

Client Changes (planned):
 1. Provider catalog adds entry `{ id: 'internal', name: <brand>, type: 'discourse-persona', managed: true }`.
 2. Auto-select `internal` after successful SSO if no BYOK provider selected.
 3. Chat component: if provider === 'internal', use new stream adapter instead of OpenAI-style adapter.
 4. Stream Parser: accumulate fragments by decoding each line → JSON → if `partial` append to buffer; ignore non-partial keys after first metadata object.
 5. Persona selection UI surfaced in chat (reuse list from `/api/ai/personas` proxy which normalizes working admin path).

Server Changes (planned):
 1. Replace existing `/api/ai/stream` proxy target from `/discourse_ai/stream_completion` → `/admin/plugins/discourse-ai/ai-personas/stream-reply`.
 2. Accept input: `{ persona, topic_id?, query, model? }` (internal canonical shape) and transform to upstream: `{ username: session.username, persona_id|persona_name, query }` choosing id vs name heuristically (numeric string → id, else persona_name). Include model if provided.
 3. Stream piping: current implementation treats upstream as SSE; adjust to treat as raw text; do not inject `event:` lines; pass through raw lines (client parser updated accordingly) OR optionally wrap into SSE by prefixing `data:` (preferred for consistency). Decision: Migrate to real SSE to align with rest of app.
 4. Error translation: if first line is not JSON header or upstream status !200, emit SSE `event:error` with detail.
 5. Persona list proxy: Expand `/api/ai/personas` to attempt `GET /admin/plugins/discourse-ai/ai-personas.json` first, parse, normalize; fallback to in-memory static defaults on failure.

## 5. Endpoint Allowlist (Refined Practical Subset)
Only implement what we actively use now + near term. All others remain deferred.
Active/Planned:
  - topics: read_lists, read, (write seeds via existing `/api/discourse/seed` abstraction), status (future)
  - posts: list (via topic read), create (for seeds / future PM bot), edit (future)
  - pm inbox (user scoped parity enforced)
  - ai: personas list, stream-reply (wrapped as `/api/ai/stream`), (search deferred)
  - seeds: create, attach, index (already implemented)
  - auth: sso login/callback/logout/me
  - events: SSE for webhooks
Deferred / not yet routed through proxy (keep out of surface until needed & audited): uploads, automations_trigger, chat.create_message, data explorer, badges, groups, user admin, solved.answer.

Allowlist Representation Example:
```
const ALLOW = new Set([
  'topics.read','topics.read_lists','topics.write_seed','topics.status',
  'posts.create','posts.list','pm.inbox',
  'ai.personas','ai.stream','ai.search',
  'auth.sso','auth.logout','auth.me',
  'seeds.create','seeds.attach','seeds.index',
  'events.sse'
]);
```

## 6. Streaming Protocol Adapter
Upstream: newline JSON objects.
We standardize client consumption as pseudo-SSE events:
```
event: meta
data: {"topic_id":...,"persona_id":...}

event: token
data: {"text":"fragment"}

event: done
data: {}
```
Server adapter logic:
  - Read upstream line buffer → try JSON.parse
  - If object has `partial`, emit `token` with accumulated raw fragment
  - First non-partial line containing `topic_id` → emit `meta`
  - Detect end via upstream close → emit `done`
  - On error (HTTP != 200 OR JSON parse fail on first line) emit `error`

Client Chat logic (internal provider):
  - Maintain incremental text state
  - Provide cancel function (AbortController)
  - If `error` event received, surface UI banner

## 7. Error Handling & Resilience
Upstream statuses observed: 200 (stream), 404 (unknown endpoint), 422 (invalid persona), 5xx (potential; not yet observed). Strategy:
  - 404 at proxy bind-time → fast fail & static capability downgrade (hide personas UI until healthy).
  - 422 mid-call → stop streaming, surface persona selection error.
  - 5xx / network: retries with exponential backoff for persona list; NO automatic retry for a single user stream (user re-triggers).
  - Circuit breaker: track consecutive upstream failures; after threshold hide internal provider & show maintenance banner.

## 8. Observability
Metrics (in-memory w/ periodic log flush):
  - ai_stream_requests_total{persona}
  - ai_stream_tokens_total (count of `partial` objects)
  - ai_stream_failures_total{reason}
  - personas_list_latency_ms (histogram)
Log sampling: full payloads omitted except on error (redact query after debug phase; store length only).

## 9. Performance Considerations
Streaming backpressure: use Node stream pipe; avoid buffering entire response. Flush tokens immediately; throttle UI updates (batch per animation frame) for large outputs.
Persona list cache TTL: 60s in-memory with background refresh on expiry.
Seed indexing: apply pagination limit; optionally prefetch categories asynchronously.

## 10. Future Extensions
1. Chat channel integration: map internal provider responses into Discourse Chat via `chat.create_message` creating a mirrored user-bot thread (webhook to reflect). Security requires channel membership parity.
2. Automations as tools: Provide server toolkit registry with schema validation; unify with internal provider for multi-step workflows.
3. Knowledge ingestion: Background job to classify & tag new topics; leverage persona or summarizer persona.
4. Hybrid search: Once `/discourse_ai/search` becomes available, implement unified `semantic + lexical` ranking; fallback gracefully when 404.
5. Multi-persona conversation: Support per-turn persona switching with explicit persona_id tagging in message metadata.

## 11. Test Matrix (Updated)
Auth: SSO login success, invalid nonce rejection, session expiry.
Personas: list success, list 404 fallback, invalid persona 422 path.
Streaming: normal stream, cancel mid-stream, upstream error injection, large output (>100 partial objects) performance.
Security: username parity (PM, seeds attach), blocked cross-user, missing API_KEY -> graceful feature degradation.
Resilience: simulate consecutive upstream 404 for stream-reply -> circuit breaker triggers.
Branding: brand change reflected without rebuild via `/api/config`.

## 12. Implementation Delta vs Current Codebase
Current issues:
  - `/api/ai/stream` proxy targets non-working `/discourse_ai/stream_completion`.
  - Personas proxy attempts several paths; only `ai-personas.json` variant is valid; add it first & log outcome.
  - Client `aiStream` treats stream as raw bytes (not structured) and expects SSE markers; must adapt JSON line parsing OR server conversion.
Planned remediation order:
  1. Server: retarget stream proxy & wrap JSON lines as SSE tokens.
  2. Server: strengthen `/api/ai/personas` path attempt order; cache + TTL.
  3. Client: internal provider + parser; migrate DiscourseViewer & Chat to provider abstraction.
  4. Remove warning banner about missing BYOK when internal provider active.

## 13. Configuration Keys Recap
```
DISCOURSE_BASE_URL=https://hub.bitwiki.org
DISCOURSE_SSO_SECRET=...
DISCOURSE_WEBHOOK_SECRET=...
APP_BASE_URL=... (codespace / deployed origin)
API_KEY=<admin key>
BITHUB / BITHUB_NAME=<brand override>
PORT=8081
```

## 14. Open Questions / Validation Needed
- Confirm eventual availability & payload schema for `/discourse_ai/search` (currently 404) to finalize AI search integration.
- Determine canonical persona identifier strategy (preferring numeric `persona_id`, fallback to `persona_name`).
- Decide on server SSE wrapping vs direct JSON lines (current plan: wrap for uniformity).
- Choose persistence for audit + metrics (file rotate vs lightweight sqlite).

