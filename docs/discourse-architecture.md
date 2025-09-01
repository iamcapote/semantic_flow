# Discourse Integration Service

This document outlines the planned Node.js service used by Semantic Flow for Discourse-powered collaboration.

## Overview
- **System of record:** Discourse hosts conversations, context seeds, and persona data.
- **Service role:** Thin Node.js layer that synchronises chats/PMs, manages persona metadata, and relays AI requests.
- **Storage:** Only cache and minimal app metadata are persisted in the service; Discourse retains all content.

## Authentication
- Primary auth uses per-user API keys obtained through Discourse's user key flow.
- Optional admin key supports bootstrap tasks such as persona or seed synchronisation.
- Keys are stored encrypted and scoped per user.

### SSO
- Users can sign in via SSO provided by `https://hub.bitwiki.org/` using secret `canvas_123`.
- When authenticated through SSO, requests are executed against the Discourse API hosted at `canvas.bitwiki.org`.

## API Usage
- Typed REST client covers topics, posts, users, categories, tags and uploads.
- Private messages are mapped to topics with `archetype=private_message`.
- Chat plugin (if enabled) uses `/chat/api/channels/:id/messages.json` for reads and webhooks `/hooks/:key` for writes.

## Context Seeds
- Seeds are reference topics located in a dedicated category; topic body contains JSON front‑matter and links.
- Endpoint sketch:
  - `createSeed(topic in Category X, tags Y)`
  - `attachSeedToPM(topic_id)`
  - `indexSeed(metadata cache)`
- Idempotency enforced via `external_id` and custom topic fields.

## Webhooks
- Subscriptions:
  - `post_created`
  - `topic_created`/`topic_updated`
  - `user_events`
  - `chat_message_created`
- Handler pipeline: validate → dedupe → update cache → emit SSE/WebSocket events to the web client.

## Observability & Security
- Structured logs per request with request hash and Discourse response id.
- Metrics include API latency, rate limit hits and webhook lag.
- Keys are rotated regularly; every write is audited.

## Deployment
- Configured via environment variables for base URL, keys and webhook secrets.
- Blue/green deploy; cache warmers preload categories and tags on cold start.
