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

check_emails: list user emails. Required: username.


log_out: log user out (admin action).

anonymize: anonymize user (admin action).

delete: delete user (admin action).

list: list users (admin, restrict tightly).


badges

assign_badge_to_user: assign badge. Required: username.


groups

manage_groups: CRUD membership. Required: id.

administer_groups: admin group settings.

search

show: full-text search. Params: q, page.

query: quick search term. Param: term.

discourse_connect

SSO provider endpoints (login and sync).

logs

messages: read admin logs. Restrict to ops dashboards. Never expose raw to end users.

automations_trigger

post: trigger an Automation. Required: context object.

Use server allowlist per automation id. Do not expose a generic “run any automation”.

chat

create_message: post message to chat channel. Required: chat_channel_id, text.
Guard: verify membership for session.user before posting. Alternatively use incoming webhook per channel with server-side ACL.

Read helpers (optional): list channels for the user, read messages for a channel (respect membership).

discourse_ai

search: AI search features where enabled.

stream_completion: streaming completion where enabled.


5) High-value flows
A) User ↔ AI bot via PM

Create or reuse a PM topic with archetype=private_message, target_recipients=<bot_username>.

Append user turns with POST /posts → Discourse AI posts bot replies.

Store PM topic_id in your app for thread continuity.

Isolation: Api-Username=session.username. The bot sees the same data the user can see.

B) User ↔ AI via Chat

Validate channel membership for session.user.

Send with chat.create_message or per-channel webhook.

Stream updates to client via your SSE fed by Discourse webhooks.

C) Automation as tool calls

Create Automations with “API call” or relevant triggers.

Proxy endpoint: /automation/:id/trigger on your server → calls upstream automations_trigger.post with a strict context schema.

Use for tagging, triage, templated replies, status changes.

D) Knowledge posts with uploads

POST /uploads → upload_id.

POST /posts with raw referencing the upload.

Optionally tag and move topics via topics.update.

E) Solved workflow

When the user selects an answer, call solved.answer for the post.

6) Proxy design (Express pseudo)
// global headers
const H = (username: string) => ({
  'Api-Key': process.env.DISCOURSE_API_KEY!,
  'Api-Username': username,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

// parity guard
function requireUser(req, res, next) {
  const u = req.session?.username;
  if (!u) return res.status(401).end();
  req.actAs = u;
  next();
}

// username parity on user-scoped paths
function usernameParity(req, res, next) {
  const u = req.actAs;
  const p = req.params.username || req.body?.username;
  if (p && p !== u) return res.status(403).json({ error: 'username mismatch' });
  next();
}

// allowlist (example subset)
const ALLOW = new Set([
  'topics.write','topics.update','topics.delete','topics.recover','topics.read','topics.read_lists','topics.status',
  'posts.edit','posts.delete','posts.recover','posts.list',
  'revisions.read','revisions.modify','revisions.permanently_delete',
  'tags.list','tag_groups.list','tag_groups.show','tag_groups.create','tag_groups.update',
  'categories.list','categories.show',
  'uploads.create',
  'users.bookmarks','users.sync_sso','users.show','users.check_emails','users.update','users.log_out','users.anonymize','users.suspend','users.delete','users.list',
  'user_status.read','user_status.update',
  'email.receive_emails',
  'invites.create',
  'badges.create','badges.show','badges.update','badges.delete','badges.list_user_badges','badges.assign_badge_to_user','badges.revoke_badge_from_user',
  'groups.manage_groups','groups.administer_groups',
  'search.show','search.query',
  'discourse_connect.sso',
  'logs.messages',
  'automations_trigger.post',
  'chat.create_message',
  'discourse_ai.search','discourse_ai.stream_completion','discourse_ai.update_personas',
  'discourse_data_explorer.run_queries',
  'solved.answer'
]);

function requireAllowed(key: string) {
  return (req, res, next) => ALLOW.has(key) ? next() : res.status(403).end();
}

7) Webhooks → client

Enable post_created, topic_created/updated, chat_message_created, and any AI/Automation events your instance emits.

Verify HMAC. Push minimal projections over SSE: {type, topic_id, post_id, channel_id, actor, at}.

8) Config
DISCOURSE_BASE_URL=
DISCOURSE_API_KEY=        # admin key
APP_BASE_URL=
WEBHOOK_SECRET=
RATE_LIMITS_PER_USER=60/m

9) Test checklist

SSO login. Session has {username}.

Create PM with AI bot. Get bot reply.

Post to Chat channel user belongs to.

Trigger Automation with context. Observe side effects.

Update topic status.

Run whitelisted Data Explorer query with required params.

Webhooks received and streamed.

Attempt cross-user access → blocked by parity guard.