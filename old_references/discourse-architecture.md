# Semantic Flow Discourse Integration Service

This document outlines the planned Node.js service used by Semantic Flow for Discourse-powered collaboration.

## Overview
- **System of record:** Discourse hosts conversations, context seeds, and persona data.
- **Service role:** Semantic Fow is an API layer that synchronises chats/PMs, manages persona metadata, and relays AI requests.
- **Storage:** Only cache and minimal app metadata are persisted in the service; Discourse retains all content.
- Essentially it uses Discourse API to send the AI calls instead of OpenAI or Open Router or Venice.

## Authentication
- Primary auth for users: Discourse Connect (SSO) via hub.bitwiki.org.
- Server signs/validates SSO payloads; client never sees the SSO secret.
- Session stored in httpOnly cookie `sf_session` (JWT signed with API_KEY). CSRF double-submit cookie `sf_csrf` for POST.
- Admin key optional, used only for read proxy in v1.

### SSO
- Start: GET /api/sso/login → server builds base64 payload `nonce` + `return_sso_url`, signs HMAC-SHA256 with secret. Redirects to Discourse `/session/sso_provider`.
- Callback: GET /api/sso/callback?sso&sig → server verifies signature and nonce, extracts user profile, sets cookies, redirects to `/discourse`.
- Cookies: `sf_session` (httpOnly), `sf_csrf` (readable). Logout requires `x-csrf-token` header matching cookie.
- Authenticated users see the Discourse tab; unauthenticated users see a login CTA.

## API Usage
- Uses Private messages with personas. 
- Posts into all possible categories and some are private categgories that activate ai workflows or can be used as contextual seeds.

Implemented server endpoints (v1.1, wired to unified Win95 UI tabs):
- Read-only proxies:
  - GET /api/discourse/latest?page=
  - GET /api/discourse/topic/:id
  - GET /api/discourse/pm/:username (user PM inbox)
- Seeds lifecycle:
  - POST /api/discourse/seed { title, category_id, tags[], raw?, idempotencyKey? }
  - POST /api/discourse/seed/:seedTopicId/attach { pm_topic_id }
  - GET /api/discourse/seeds?category_id=..&tags=a,b
- Webhooks:
  - POST /api/webhooks/discourse (HMAC verified via x-discourse-event-signature)

Status notes (2025-09-01):
- Unified UI: Discourse tab is SSO-gated inside Win95 Suite. Landing page offers SSO vs BYOK.
- Proxies for latest/topic/PM and AI personas/stream are active; seeds lifecycle create/attach/index implemented.
- SSE: /api/events broadcasts webhook projections; client auto-refreshes latest/PMs/topic when relevant.
- Next: add cache warmers, persona sync job, and minimal seed indexer cache with TTL.

## Context Seeds
- Seeds are reference topics located in dedicated private category; topic body contains JSON front‑matter and links.
- Endpoint sketch:
  - `createSeed(topic in Category X, tags Y)`
  - `attachSeedToPM(topic_id)`
  - `indexSeed(metadata cache)`
- Idempotency enforced via `external_id` and custom topic fields.
- Makes Discourse an API and contextual engine.

## Webhooks
- Subscriptions:
  - `post_created`
  - `topic_created`/`topic_updated`
  - `user_events`
  - `chat_message_created`
- Handler pipeline: validate → dedupe → update cache → emit SSE/WebSocket events to the web client.
  - Current: HMAC validation + logging stub; cache + SSE planned.

## Observability & Security
- Structured logs per request with request hash and Discourse response id.
- Metrics include API latency, rate limit hits and webhook lag.
- Keys are rotated regularly; every write is audited.

## Deployment
- Configured via environment variables for base URL, keys and webhook secrets.
- Blue/green deploy; cache warmers preload categories and tags on cold start.

Env vars (current):
- DISCOURSE_BASE_URL=https://hub.bitwiki.org
- DISCOURSE_SSO_SECRET=canvas_123
- APP_BASE_URL=http://localhost:8081
- API_KEY=optional_admin_key (enables seed write endpoints)
- DISCOURSE_WEBHOOK_SECRET=shared_webhook_secret
- PORT=3001


---

https://docs.discourse.org/

example of all fields for api calls:


Allowed URLs	Allowed parameters (optional)
topics			

write 

​	
topic_id

update 

​	
topic_id
category_id

delete 

​	

recover 

​	

read 

​	
topic_id
external_id

read_lists 

​	
category_id

status 

​	
topic_id
category_id
status
enabled
posts			

edit 

​	
id

delete 

​	

recover 

​	

list 

​	
revisions			

read 

​	
post_id

modify 

​	
post_id

permanently_delete 

​	
post_id
tags			

list 

​	
tag_groups			

list 

​	

show 

​	
id

create 

​	

update 

​	
id
categories			

list 

​	

show 

​	
id
uploads			

create 

​	
users			

bookmarks 

​	
username

sync_sso 

​	
sso
sig

show 

​	
username
external_id
external_provider

check_emails 

​	
username

update 

​	
username

log_out 

​	

anonymize 

​	

suspend 

​	

delete 

​	

list 

​	
user_status			

read 

​	

update 

​	
email			

receive_emails 

​	
invites			

create 

​	
badges			

create 

​	

show 

​	

update 

​	

delete 

​	

list_user_badges 

​	
username

assign_badge_to_user 

​	
username

revoke_badge_from_user 

​	
groups			

manage_groups 

​	
id

administer_groups 

​	
search			

show 

​	
q
page

query 

​	
term
wordpress			

publishing 

​	

commenting 

​	

discourse_connect 

​	

utilities 

​	
logs			

messages 

​	
automations_trigger			

post 

​	
context
chat			

create_message 

​	
chat_channel_id
discourse_ai			

search 

​	

stream_completion 

​	

update_personas 

​	
discourse_data_explorer			

run_queries 

​	
id
solved			

answer 

​

**DiscourseHelper:**

<details>
  <summary>Searching</summary>
  <p>Searching for: Provide a comprehensive list of all Discourse REST API endpoints, including their required and optional parameters, broken down by core features such as topics, posts, user management, chat, tags, badges, and categories. Detailed documentation and usage examples for every endpoint, ideally with sample payloads and best practices for building an integration with an external Node.js application acting as a chat system. Include any guides on authentication, rate limits, and handling AI-specific features such as Discourse AI bots, personas, and workflow context artifacts.</p>
</details>
<span></span>

Here’s how to approach a comprehensive Node.js/Discourse API integration for your “realchat” context, along with reference material for endpoints, authentication, best practices, and leveraging Discourse AI features.

---

## 1. Discourse REST API Documentation

- **All endpoints and parameters:**  
  The official docs have detailed sections for each resource (topics, posts, categories, users, uploads, chat, badges, tags, groups, etc.), with required/optional fields, URLs, and method details:  
  [Discourse REST API Documentation](https://docs.discourse.org/)  
  - Also see: [Discourse REST API Documentation (meta guide)](https://meta.discourse.org/t/discourse-rest-api-documentation/22706)

- **Comprehensive practical API examples, including creating, updating, and interacting with PMs, topics, posts, etc.:**  
  [Discourse REST API comprehensive examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)

---

## 2. Authentication, API Key Scopes, and Rate Limits

- **API keys:**
  - Global/admin and user-scoped API keys are available depending on your integration needs.
  - For acting "on behalf of users" (e.g., real chat), use user API keys:  
    [User API keys specification](https://meta.discourse.org/t/user-api-keys-specification/48536)
  - Index of integration/auth guides:  
    [Integrations Index (key creation and scopes)](https://meta.discourse.org/t/integrations-index/308033)

- **Rate limits and recommendations:**  
  [API Rate Limits and Best Practices](https://meta.discourse.org/t/discourse-rest-api-documentation/22706#api-rate-limits-and-best-practice-discussion-13)

---

## 3. Working with Topics, Posts, Private Messages, Categories

- **Private messages:**  
  Use the `archetype=private_message` parameter or appropriate topic endpoints to send/fetch PMs.  
  [How to send/receive private messages via API (examples)](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354#how-do-i-send-or-receive-private-messages-7)

- **Categories, tags, topics, posts:**  
  - [Posts: creating, updating, reading, deleting](https://docs.discourse.org/#tag/Posts)
  - [Categories: listing and creating](https://docs.discourse.org/#tag/Categories)
  - [Tags: listing and managing](https://docs.discourse.org/#tag/Tags)
  - [Uploads (media)](https://docs.discourse.org/#tag/Uploads)

---

## 4. Chat and Real-time Features

- **Discourse Chat** (distinct from PMs):  
  [Exploring features in Discourse Chat](https://meta.discourse.org/t/exploring-features-in-discourse-chat/239695)

- **Webhooks for real-time/event-driven workflows:**  
  [Using webhooks for integrations](https://meta.discourse.org/t/using-discourse-webhooks/49045)

---

## 5. Discourse AI, Personas, Workflows, and Artifacts

- **Enable/configure Discourse AI bot:**  
  [Discourse AI - AI bot](https://meta.discourse.org/t/discourse-ai-ai-bot/266012)

- **AI Personas for bot interactions:**  
  [AI bot Personas guide](https://meta.discourse.org/t/ai-bot-personas/306099)

- **Custom AI bot tools (extension via JavaScript, e.g., custom workflows):**  
  [AI bot Custom Tools (JavaScript)](https://meta.discourse.org/t/ai-bot-custom-tools/314103)


---

## 6. Special Considerations

- **Badge, group, and user management via API:**  
  - [Grant a custom badge through the API](https://meta.discourse.org/t/grant-a-custom-badge-through-the-api/103270)
  - [User management endpoints](https://docs.discourse.org/#tag/Users)

- **Reverse engineering for undocumented endpoints:**  
  [Reverse engineer the Discourse API](https://meta.discourse.org/t/reverse-engineer-the-discourse-api/20576)

---

## 7. Examples and Best Practices

- Full payload/field examples (including PMs, chat, topics, etc.):  
  [Discourse REST API comprehensive examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)

---


---

### **Relevant Reading - Quick Links**

- [Discourse API docs](https://docs.discourse.org/)
- [Comprehensive API examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)
- [User API keys](https://meta.discourse.org/t/user-api-keys-specification/48536)
- [Discourse AI bot](https://meta.discourse.org/t/discourse-ai-ai-bot/266012)
- [AI Personas](https://meta.discourse.org/t/ai-bot-personas/306099)
- [Webhooks/events](https://meta.discourse.org/t/using-discourse-webhooks/49045)
- [Discourse Chat features](https://meta.discourse.org/t/exploring-features-in-discourse-chat/239695)
- [API authentication and integration master index](https://meta.discourse.org/t/integrations-index/308033)

---


## Implemented (v1) specifics

- Routes (server):
  - GET /api/sso/login → Discourse Connect redirect
  - GET /api/sso/callback → validate sig + nonce, set cookies, redirect to /discourse
  - POST /api/logout → requires header x-csrf-token equal to cookie sf_csrf
  - GET /api/me → current session
  - GET /api/discourse/latest?page= → proxy to Discourse latest
  - GET /api/discourse/topic/:id → proxy to Discourse topic

- Cookies:
  - sf_session: httpOnly JWT, SameSite=Lax; Secure in production
  - sf_csrf: readable CSRF token for double‑submit defense

- Client routes & nav:
  - /discourse (SSO‑gated read‑only view)
  - /api (Router: provider settings + feature toggles)
  - Settings live under Router. Use the Advanced features toggle to show/hide expert panels.

- Environment variables
  - DISCOURSE_BASE_URL=https://hub.bitwiki.org
  - DISCOURSE_SSO_SECRET=canvas_123
  - APP_BASE_URL=http://localhost:8081 (dev) / production origin
  - API_KEY=optional_service_key (optional; enables seed write endpoints in early v1)
  - PORT=3001

- Dev/E2E notes
  - E2E runs via Vite preview server (8081) for stability
  - PostCSS configured inline in Vite to avoid ESM/CJS conflicts

