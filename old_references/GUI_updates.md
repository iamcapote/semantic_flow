SEMANTIC FLOW update.

formal plan:

* update GUI with provided codebase and redesign plan. 

* after doing so, verify #codebase.


* these files need to be organized carefully and adequately and modularly into the appropriate organization and folder structure. extract from here bit by bit to organize carefully.


---


0. Objectives

Use Discourse as system-of-record for PMs, chat, AI personas, and “context seeds.”

Act as users when needed. Avoid global keys where per-user access is required. 
docs.discourse.org
Discourse Meta

1. Architecture

Node.js service + thin web client.

Modules: Auth, API client, Chat/PM sync, AI, Seed Manager, Webhooks, Cache, Audit.

Storage: minimal. Cache + app metadata only. Discourse holds content.

2. Authentication

Primary: User API Keys flow for per-user actions (PMs, chat). Store tokens encrypted, scoped. 
Discourse Meta

Optional admin key for service tasks (seed bootstrap, persona sync). 
Discourse Meta

3. API Client (Discourse REST)

Build typed client for: topics, posts, users, categories, tags, uploads. Respect rate limits. 
docs.discourse.org

PMs: map “conversation” ⇄ Discourse topic with archetype=private_message. Use topics/private-messages/:username.json for lists. 
Discourse Meta
Postman

Posts: create, edit, delete for both PMs and public categories. 
docs.discourse.org

4. Chat Integration

Prefer PMs for reliability. If using Discourse Chat plugin, implement:

Read: /chat/api/channels/:id.json and /chat/api/channels/:id/messages.json with params fetch_from_last_read, page_size, target_message_id, direction. 
Discourse Meta

Write (bot-style): incoming chat webhooks /hooks/:key with text. Use per-channel keys. 
Discourse Meta

Fall back to PMs where chat API lacks coverage.

5. AI + Personas

Mirror Persona definitions from Discourse AI. Maintain persona IDs and settings. 
Discourse Meta
+1

Expose AI actions: persona selection, completion stream proxy, search proxy. Respect Discourse AI configuration and quotas. 
Discourse Meta

6. Context “Seeds”

Seed = reference Topic in a controlled Category. Body contains JSON front-matter + links. Tags mark scope.

Seed lifecycle API:

createSeed(topic in Category X, tags Y)

attachSeedToPM(topic_id)

indexSeed(metadata cache)

Enforce idempotency via external_id and custom fields on topic. 
docs.discourse.org

7. Webhooks and Sync

Register webhooks for: post_created, topic_created/updated, user_events, chat_message_created (if chat enabled).

Handler pipeline: validate → dedupe → project into app cache → emit SSE/WebSocket to client. 
Discourse Meta
+1

8. Rate Limits, Caching, and Batching

Honor Discourse rate limits. Batch reads with list endpoints. Cache user, category, tag maps with TTL. Backoff on 429. 
Discourse Meta

9. Security

Store keys with envelope encryption. Rotate admin key. Per-user scopes only as needed. Least privilege. Audit every write with request hash and Discourse response id.

10. Observability

Structured logs per request. Metrics: API latency, 429 count, webhook lag, AI cost per persona. Traces around write paths.

11. Testing

Local Discourse via docker dev. Seed fixture data. Contract tests for endpoints used. Replay webhook payloads.

12. Deployment

Environment vars for base URL, keys, webhook secrets.

Blue/green deploy. Migrate cache cold-start via background warmers for categories/tags.

13. Minimal Endpoint Map (initial)

PM list: GET /topics/private-messages/:username.json (read). 
Postman

Create post: POST /posts (PM or category topic/post). 
docs.discourse.org

Topic show/update/status, category list/show, tags list. 
docs.discourse.org

Chat read: /chat/api/channels/:id(.json), /chat/api/channels/:id/messages.json (if used). 
Discourse Meta

Chat write bot: POST /hooks/:key with text. 
Discourse Meta

Personas/AI: configure in Discourse, call plugin endpoints as documented; keep server as proxy. 
Discourse Meta
+1

Webhooks: Admin → API → Webhooks. Subscribe to needed events. 
Discourse Meta

14. Milestones

Skeleton service, typed API client, health checks.

Auth: user key exchange + admin key wiring. Basic PM list/send.

Categories/tags/uploads support. Seed create/attach.

Webhooks + live client updates. Cache + backoff.

AI persona proxy + completion stream. Persona sync.

Optional Chat plugin read/write path.

Hardening: security, rate-limit strategy, audits.

Launch and monitor. Iterate on seeds and persona UX.---

New tabs: Flow Builder, Flow IDE, Console, Win95 Chat.

DSL↔Flow two-way sync.

--




---

Ignore DEX/crypto labels. Templates are generic nodes.
we need to add crypto as its own node types but shown as example.
meaning we need to update our ontology with new nodes based on crypto.


---

login we need to use the same byok standard with configuring ai provdiers.
* add and additional way of login in via SSO . include all settings foor SSO. should include the link to receive the login information from (sso provider) which in this case is https://hub.bitwiki.org/ and the provider secret is canvas_123. semantic flow (the codebase) is hosted at canvas.bitwiki.org 


missing:
Consolidated settings hub under Router (/api). Ensure the GUI is interconnected with all site settings and acts as the main control panel. Use the Advanced features toggle to reveal expert options.

think of these as API calls to agents we are literally building the API calls to send to the agents and systems . 

missing => when using SSO login via bithub you make api calls to discourse forum using the forum as the base for inference instead of the normal providers. 

the added benefit is the CONTEXTUAL engine of discourse that adds a layer of value for the users accessing it viaa this gui.

this additional tab can only get accessed via sso login . and the idea is that it is optimized for discourse api interaction . 




https://docs.discourse.org/

we are building an nodejs app that all it does is interact with discourse api. imagine its like a realchat system that uses discourse as a source of reference for private messages , discourse ai and personas, posting into categories generate ai workflows that create a contextual seed in discourse that can be accessed via this system. 






Im planning to build a Node.js app that will interact deeply with Discourse as a backend for chat-like experiences, leveraging private messages, Discourse AI, personas, posting to categories, and creating references or "seeds" for contextual workflows. Here’s a focused set of resources and best practices to help you design and build this integration. 

---

## 1. Discourse API Basics

Start with the official API documentation for understanding endpoints, authentication, and request structure:  
- [Discourse REST API Documentation](https://docs.discourse.org/)
- Community guide: [Discourse REST API Documentation (meta)](https://meta.discourse.org/t/discourse-rest-api-documentation/22706)

There are practical examples and code samples here:  
- [Comprehensive API examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)

You’ll need API keys; global or user-scoped keys are available:  
- [User API keys specification](https://meta.discourse.org/t/user-api-keys-specification/48536)
- [Integration index: Key creation and scopes](https://meta.discourse.org/t/integrations-index/308033)

If you want your app to act as individual users (e.g., for private messages), prefer user API keys.

---

## 2. Working with Private Messages & Categories

You can create, list, and fetch private messages (PMs) through standard topic and post endpoints. Use the `archetype=private_message` parameter:

- [Sending and receiving private messages by API](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354#how-do-i-send-or-receive-private-messages-7)
- [API endpoint for posting to categories](https://docs.discourse.org/#tag/Posts/operation/createPost)

---

## 3. Discourse AI and Personas

- Enabling and managing AI features:  
  - [Discourse AI - AI bot guide](https://meta.discourse.org/t/discourse-ai-ai-bot/266012)
- Setting up and using Personas:  
  - [AI bot Personas](https://meta.discourse.org/t/ai-bot-personas/306099)
- Creating or interacting with AI workflows and tools (custom tools):  
  - [AI bot - Custom Tools (JavaScript)](https://meta.discourse.org/t/ai-bot-custom-tools/314103)
- “Seed” contextual workflows may leverage [AI Artifacts](https://meta.discourse.org/t/discourse-ai-web-artifacts/339972) or simply link to “reference topics” you create programmatically.

---

## 4. Real-time and Workflow Integrations

If your application needs real-time notifications, consider using Discourse’s webhooks:

- [Using webhooks for event-driven integrations](https://meta.discourse.org/t/using-discourse-webhooks/49045)

For workflow automation, review tools like Zapier or Monkedo, which can sometimes fill integration gaps or automate certain processes:

- [Making requests to Discourse using Monkedo (no-code)](https://meta.discourse.org/t/making-requests-to-discourse-using-monkedo/367819)
- [Make requests with Zapier](https://meta.discourse.org/t/make-requests-to-the-discourse-api-with-zapier/122126)

---

## 5. Rate Limits and Performance

Be aware of rate limits to avoid throttling:

- [API rate limits and best practice discussion](https://meta.discourse.org/t/discourse-rest-api-documentation/22706#api-rate-limits-and-best-practice-discussion-13)
- It’s best to batch actions and cache responses wherever possible.

---

## 6. Further Considerations

- Discourse Chat and its API are generally distinct from private messages. For DM-like chat with real-time experience, confirm whether "Discourse Chat" (separate plugin) is relevant or if PMs suffice.
- For structured referencing and “contextual seeds”, programmatically create and tag/folder Topics, use custom fields, or leverage links and artifacts within Posts.

---

**If you hit any roadblocks with API usage, authentication, or rate limits, reach out to Discourse support at [team@discourse.org](mailto:team@discourse.org).**

---

**Relevant links summary:**
- [Discourse API docs](https://docs.discourse.org/)
- [API usage examples](https://meta.discourse.org/t/discourse-rest-api-comprehensive-examples/274354)
- [User API keys](https://meta.discourse.org/t/user-api-keys-specification/48536)
- [Discourse AI bot](https://meta.discourse.org/t/discourse-ai-ai-bot/266012)
- [Personas setup](https://meta.discourse.org/t/ai-bot-personas/306099)
- [Webhooks](https://meta.discourse.org/t/using-discourse-webhooks/49045)

Let me know if you need example Node.js requests for any specific workflow or want guidance on API authentication flow!
</details>

---


exammple of all fields for api calls:


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

​		

---



---
New Tabs:

# Flow Builder
* sematic flow original flow. but more modular and customizable. original version is clean and should use as the base. there should be color customization for background to ensure there is a visual way of changing this. think of this as microsoft paint windows 5 style of constructing WORKFLOWS. nodes could use an update to fix he visual make it more visible that the nodes are connected, also backgroud colors and node colors etc.


# Flow IDE
text editor that works with the canvas flow directly. it is the text form code of the connections. can be markdow/yml/xml/json . automatically changes in flow canvas and ide. make it colorful and organize it into nodes seamlessly to make it visual even if an ide. 

# Console
quick test of the commands in the ide/canvas

# Win95 Chat
long term format of the context flow engine you have built. 

---

do NOT delete features simply reorganize them. update the entire app.

---

refactor as a surgery where you can kill he patient by adding the wrong code. make sure its all error free and that you test it.

ensure that the site's functionality is fully restored.

optimize what we have and update the branding to windows style. use as little placeholder code as possible since we are making a LIVE service app. 
 



----

CODE REDESIGN TEMPLATE:
```



// @ts-nocheck
// WinGPT 95 — Unified Suite (single file, single React import, single default export)
// Adds: Console CLI Master Control Center tab, Flow IDE tab with DSL↔Flow sync + JSON/CSV/Table export.
// Keeps: embedded Chat UI, Flow Builder, smoke tests, single default export.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

/*********************************
 * Shared Win9x styling helpers  *
 *********************************/
const win98 = {
  app: {
    height: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr 320px', gridTemplateRows: '36px 1fr 28px', gridTemplateAreas: `'bar bar bar' 'left center right' 'task task task'`, gap: 8, background: '#E0E0E0', color: '#000', fontFamily: 'JetBrains Mono, monospace'
  },
  topbar: { gridArea: 'bar', display: 'flex', alignItems: 'center', gap: 8, background: '#C0C0C0', borderBottom: '1px solid #808080', padding: '4px 6px' },
  chip: { fontSize: 11, border: '1px solid #808080', background: '#C0C0C0', padding: '2px 6px' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '2px 8px', cursor: 'pointer' },
  panel: { background: '#FFF', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', display: 'flex', flexDirection: 'column', minHeight: 0 },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700 },
  body: { padding: 8, overflow: 'auto' },
  left: { gridArea: 'left' },
  center: { gridArea: 'center', display: 'grid', gridTemplateRows: '32px 1fr' },
  right: { gridArea: 'right' },
  toolbar: { display: 'flex', gap: 6, padding: 6, borderBottom: '1px solid #808080', background: '#C0C0C0' },
  task: { gridArea: 'task', display: 'flex', alignItems: 'center', gap: 8, background: '#C0C0C0', borderTop: '1px solid #808080', padding: '2px 4px' },
  led: (on)=>({ width: 8, height: 8, borderRadius: '50%', background: on ? '#00AA00' : '#B00000', marginLeft: 4, animation: on ? 'pulse 1.6s infinite' : 'none' }),
  paletteItem: { display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #808080', padding:'6px', marginBottom:6, cursor:'grab', background:'#C0C0C0' },
  kvRow: { display:'flex', justifyContent:'space-between', gap:6, margin:'2px 0' },
  log: { fontSize: 12, background:'#000', color:'#0f0', padding:6, height:200, overflow:'auto', border:'1px solid #808080' },
};
const ridge = '4px ridge #fff';
const numOrStr = (v) => (isFinite(Number(v)) ? Number(v) : v);

/*********************************
 * Flow Builder (NEXUS ULTRA‑DEX) *
 *********************************/
function DexNode({ id, data }) {
  const { label, color = '#000080', params = {}, onChange } = data || {};
  const onParamChange = (k) => (e) => onChange && onChange(id, k, numOrStr(e.target.value));
  return (
    <div style={{ minWidth: 200, maxWidth: 300, background: '#C0C0C0', border: '2px solid #808080', boxShadow: '2px 2px 0 #000' }}>
      <div style={{ ...win98.head, background: color }}>{label}</div>
      <div style={{ background: '#fff', padding: 6, fontSize: 12 }}>
        {Object.keys(params).length === 0 && <div style={{ opacity: 0.6 }}>no params</div>}
        {Object.entries(params).map(([k, v]) => (
          <div key={k} style={win98.kvRow}>
            <span>{k}</span>
            <input style={win98.btn} value={String(v)} onChange={onParamChange(k)} />
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', background:'#EEE', borderTop:'1px solid #808080', padding:4 }}>
        <span>in</span><span>out</span>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: '#333', border: '1px solid #fff' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#000', border: '1px solid #fff' }} />
    </div>
  );
}
const nodeTypes = { dex: DexNode };

const TEMPLATES = {
  borrowUSDC: { label: 'Borrow USDC (Lending Market)', kind: 'borrow', color: '#000080', params: { amountUSDC: 1000, ltv: 0.75, liqThreshold: 0.85 } },
  swapUSDCtoETH: { label: 'Swap USDC→ETH (Uniswap v4)', kind: 'swap', color: '#111111', params: { priceETH: 3000, feeBps: 5 } },
  depositETH: { label: 'Deposit ETH as Collateral', kind: 'deposit', color: '#2D2D2D', params: {} },
  borrowMore: { label: 'Borrow More USDC (Leverage)', kind: 'borrowMore', color: '#000080', params: { factor: 0.5 } },
  riskGuard: { label: 'Risk Guard', kind: 'risk', color: '#8A2BE2', params: { minHealth: 1.40 } },
  repayExit: { label: 'Repay & Exit', kind: 'repay', color: '#0052FF', params: {} },
  sink: { label: 'Sink / Terminal', kind: 'sink', color: '#444444', params: {} },
};

function sampleWorkflow(makeId, onChange) {
  const withTpl = (tplKey, x, y) => ({ id: makeId(), type: 'dex', position: { x, y }, data: { ...TEMPLATES[tplKey], tplKey, onChange } });
  const n1 = withTpl('borrowUSDC', 40, 160);
  const n2 = withTpl('swapUSDCtoETH', 300, 160);
  const n3 = withTpl('depositETH', 560, 160);
  const n4 = withTpl('borrowMore', 820, 160);
  const n5 = withTpl('riskGuard', 1080, 160);
  const n6 = withTpl('repayExit', 1340, 160);
  const nodes = [n1, n2, n3, n4, n5, n6];
  const edges = [
    { id: 'e1-2', source: n1.id, target: n2.id, animated: true },
    { id: 'e2-3', source: n2.id, target: n3.id, animated: true },
    { id: 'e3-4', source: n3.id, target: n4.id, animated: true },
    { id: 'e4-5', source: n4.id, target: n5.id, animated: true },
    { id: 'e5-2', source: n5.id, target: n2.id, animated: true, label: 'loop', style: { strokeDasharray: '6 3' } },
    { id: 'e5-6', source: n5.id, target: n6.id, animated: true, label: 'exit' },
  ];
  return { nodes, edges };
}

// Pure simulation for testing and UI use
function simulateLeverage(nodes, edges, maxLoops = 5) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const outs = nodes.reduce((acc, n) => { acc[n.id] = edges.filter((e) => e.source === n.id).map((e) => e.target); return acc; }, {});

  const start = nodes.find((n) => n.data?.kind === 'borrow');
  if (!start) return { logs: ['No entry node (borrow) found.'], end: null };

  let debtUSDC = start.data.params.amountUSDC || 0;
  let collateralETH = 0;
  const priceETH = (nodes.find((n) => n.data?.kind === 'swap')?.data?.params?.priceETH) || 3000;
  const feeBps = (nodes.find((n) => n.data?.kind === 'swap')?.data?.params?.feeBps) || 5;
  const liqThreshold = start.data.params.liqThreshold || 0.85;
  const minHealth = (nodes.find((n) => n.data?.kind === 'risk')?.data?.params?.minHealth) || 1.4;
  const factor = (nodes.find((n) => n.data?.kind === 'borrowMore')?.data?.params?.factor) || 0.5;

  const logs = [];
  logs.push(`INIT debt=${debtUSDC.toFixed(2)} USDC, collateral=${collateralETH.toFixed(4)} ETH, priceETH=${priceETH}`);

  let currentId = start.id;
  let token = 'USDC';
  let amount = debtUSDC;
  let loops = 0;

  while (loops < maxLoops) {
    const node = byId[currentId];
    if (!node) break;
    const kind = node.data.kind;

    if (kind === 'borrow') {
      logs.push(`Borrow: +${amount.toFixed(2)} USDC`);
      currentId = outs[currentId]?.[0];
      if (!currentId) break;
    } else if (kind === 'swap') {
      if (token !== 'USDC') { logs.push('Swap expected USDC, got ' + token); break; }
      const receivedETH = (amount / priceETH) * (1 - feeBps / 10000);
      logs.push(`Swap USDC→ETH: ${amount.toFixed(2)} USDC → ${receivedETH.toFixed(6)} ETH`);
      token = 'ETH'; amount = receivedETH; currentId = outs[currentId]?.[0];
    } else if (kind === 'deposit') {
      collateralETH += amount; logs.push(`Deposit: +${amount.toFixed(6)} ETH collateral (total ${collateralETH.toFixed(6)} ETH)`);
      amount = 0; token = 'ETH'; currentId = outs[currentId]?.[0];
    } else if (kind === 'borrowMore') {
      const borrowUSD = collateralETH * priceETH * factor; debtUSDC += borrowUSD; logs.push(`BorrowMore: +${borrowUSD.toFixed(2)} USDC debt (total debt ${debtUSDC.toFixed(2)} USDC)`);
      token = 'USDC'; amount = borrowUSD; currentId = outs[currentId]?.[0];
    } else if (kind === 'risk') {
      const health = (collateralETH * priceETH * liqThreshold) / Math.max(debtUSDC, 1e-9);
      logs.push(`RiskGuard: health=${health.toFixed(3)} (min ${minHealth})`);
      const nexts = outs[currentId] || [];
      if (health >= minHealth && nexts.length) {
        const loopEdge = edges.find((e) => e.source === currentId && e.label === 'loop');
        currentId = (loopEdge?.target) || nexts[0];
        loops += 1;
        logs.push(`→ loop #${loops}`);
      } else {
        const exitEdge = edges.find((e) => e.source === currentId && e.label === 'exit');
        currentId = (exitEdge?.target) || nexts[0] || null;
        logs.push('→ exit');
      }
    } else if (kind === 'repay') {
      const repayUSD = Math.min(debtUSDC, collateralETH * priceETH * 0.2);
      debtUSDC -= repayUSD; logs.push(`Repay: -${repayUSD.toFixed(2)} USDC (remaining ${debtUSDC.toFixed(2)})`);
      break;
    } else if (kind === 'sink') { logs.push('Sink: done'); break; }
    else { logs.push(`Unknown node kind: ${kind}`); break; }
  }

  logs.push(`END debt=${debtUSDC.toFixed(2)} USDC, collateral=${collateralETH.toFixed(6)} ETH, loops=${loops}`);
  return { logs, end: { debtUSDC, collateralETH, loops } };
}

/**************************
 * DSL + Transform helpers *
 **************************/
function toSimpleJSON(nodes, edges) {
  return {
    nodes: nodes.map(n => ({ id: n.id, tplKey: n.data?.tplKey, kind: n.data?.kind, label: n.data?.label, params: n.data?.params, position: n.position })),
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label || '', animated: !!e.animated }))
  };
}

function stringifyDSL(nodes, edges) {
  const nodeLines = nodes.map((n, i) => {
    const key = n.data?.tplKey || n.data?.kind || `node${i+1}`;
    const params = n.data?.params || {};
    const paramStr = Object.keys(params).length ? ' ' + Object.entries(params).map(([k,v]) => `${k}=${JSON.stringify(v)}`).join(' ') : '';
    return `${key}${paramStr}`;
  });
  const edgeLines = edges.map(e => {
    const src = nodes.find(n => n.id === e.source);
    const dst = nodes.find(n => n.id === e.target);
    const a = src?.data?.tplKey || src?.data?.kind || src?.id;
    const b = dst?.data?.tplKey || dst?.data?.kind || dst?.id;
    const tag = e.label ? `(${e.label})` : '';
    return `${a} ${tag}-> ${b}`.replace('  ', ' ');
  });
  return [
    '# nodes',
    ...nodeLines,
    '',
    '# edges',
    ...edgeLines,
  ].join('\n');
}

function parseDSL(text, makeId, onChange) {
  const lines = (text || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const nodeMap = new Map(); // tplKey -> node
  const nodes = [];
  const edges = [];
  let inEdges = false;

  const posFor = (idx) => ({ x: 40 + 260*idx, y: 160 });

  for (const raw of lines) {
    const line = raw.replace(/^#.*$/, '').trim();
    if (!line) continue;
    if (/^#\s*edges/i.test(raw)) { inEdges = true; continue; }
    if (/^#\s*nodes/i.test(raw)) { inEdges = false; continue; }

    if (!inEdges && !/->/.test(line)) {
      // node line: tplKey [k=v]*
      const parts = line.match(/([^\s]+)|([\w-]+\s*=\s*"[^"]*"|[\w-]+\s*=\s*'[^']*'|[\w-]+\s*=\s*[^\s]+)/g) || [];
      const tplKey = parts.shift();
      const tpl = TEMPLATES[tplKey];
      if (!tpl) throw new Error(`Unknown template: ${tplKey}`);
      const params = { ...(tpl.params || {}) };
      for (const kv of parts) {
        const [k, vRaw] = kv.split('=');
        let v = vRaw?.trim();
        try { v = JSON.parse(v); } catch { v = numOrStr(v); }
        params[k.trim()] = v;
      }
      const id = makeId();
      const node = { id, type: 'dex', position: posFor(nodes.length), data: { ...tpl, tplKey, params, onChange } };
      nodes.push(node);
      nodeMap.set(tplKey, node);
    } else {
      // edge line: A (label)?-> B
      const m = line.match(/^(.*?)\s*(?:\(([^\)]*)\))?\s*->\s*(.*)$/);
      if (!m) continue;
      const [, aKey, lbl, bKey] = m;
      const A = nodeMap.get(aKey.trim());
      const B = nodeMap.get(bKey.trim());
      if (!A || !B) continue;
      edges.push({ id: `e-${A.id}-${B.id}-${edges.length+1}` , source: A.id, target: B.id, animated: true, ...(lbl ? { label: lbl } : {}) });
    }
  }
  return { nodes, edges };
}

/***********************
 * Flow Builder (view) *
 ***********************/
function FlowInner({ nodes, setNodes, edges, setEdges, makeId, updateParam, onLoadSample }) {
  const [logLines, setLogLines] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);

  const onDragStart = (e, tplKey) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ tplKey }));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = (e) => {
    e.preventDefault();
    if (!rfInstance) return;
    const data = JSON.parse(e.dataTransfer.getData('application/reactflow') || '{}');
    const tpl = TEMPLATES[data.tplKey];
    if (!tpl) return;
    const pos = rfInstance.project({ x: e.clientX - 260 - 8, y: e.clientY - 36 - 8 });
    const id = makeId();
    const node = { id, type: 'dex', position: pos, data: { ...tpl, tplKey: data.tplKey, onChange: updateParam } };
    setNodes((nds) => nds.concat(node));
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#000080' } }, eds)), [setEdges]);
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

  const runSim = useCallback(() => {
    const { logs } = simulateLeverage(nodes, edges);
    setLogLines((l) => l.concat(logs));
  }, [nodes, edges]);

  const runSmokeTests = useCallback(() => {
    const logs = [];
    const make = (() => { let i = 1; return () => String(i++); })();
    const noop = () => {};
    const { nodes: ns, edges: es } = sampleWorkflow(make, noop);
    if (ns.length === 6) logs.push('TEST nodes count: PASS'); else logs.push(`TEST nodes count: FAIL got ${ns.length}`);
    if (es.length === 6) logs.push('TEST edges count: PASS'); else logs.push(`TEST edges count: FAIL got ${es.length}`);
    const sim = simulateLeverage(ns, es, 3);
    if (sim.logs[0]?.startsWith('INIT')) logs.push('TEST sim INIT log: PASS'); else logs.push('TEST sim INIT log: FAIL');
    if (sim.logs.some((l) => l.includes('END'))) logs.push('TEST sim END log: PASS'); else logs.push('TEST sim END log: FAIL');
    setLogLines((l) => l.concat(['— Smoke Tests —', ...logs]));
    console.log('[WinGPT95 Tests]', logs);
  }, []);

  useEffect(() => { if (nodes.length === 0) { onLoadSample(); setLogLines((l)=>l.concat(['Sample leverage loop loaded.'])); } }, [onLoadSample, nodes.length]);

  // LEDs
  const [led, setLed] = useState({ eth: false, base: false, arb: false });
  useEffect(() => {
    const t1 = setTimeout(() => setLed((s) => ({ ...s, eth: true })), 600);
    const t2 = setTimeout(() => setLed((s) => ({ ...s, base: true })), 1200);
    const t3 = setInterval(() => setLed((s) => ({ ...s, arb: !s.arb })), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(t3); };
  }, []);

  return (
    <div style={win98.app}>
      {/* TOP BAR */}
      <div style={win98.topbar}>
        <div style={{ fontWeight: 700 }}>NEXUS AZATHOTH ULTRA‑DEX</div>
        <div style={win98.chip}>Win98 Flow</div>
        <div style={win98.chip}>Uniswap v4 Hooks</div>
        <div style={win98.chip}>Balancer v3 Pools</div>
        <div style={{ flex: 1 }} />
        <button style={win98.btn} onClick={onLoadSample}>Load Sample</button>
        <button style={win98.btn} onClick={runSim}>Run Simulation</button>
        <button style={win98.btn} onClick={runSmokeTests}>Run Smoke Tests</button>
      </div>

      {/* LEFT: PALETTE */}
      <div style={{ ...win98.panel, ...win98.left }}>
        <div style={win98.head}>Palette</div>
        <div style={win98.body}>
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <div key={key} style={win98.paletteItem} draggable onDragStart={(e) => onDragStart(e, key)} title={tpl.kind}>
              <span>{tpl.label}</span>
              <span style={{ width: 8, height: 8, background: tpl.color, display: 'inline-block' }} />
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Drag onto canvas → connect → edit params.
          </div>
        </div>
      </div>

      {/* CENTER: CANVAS */}
      <div style={{ ...win98.panel, ...win98.center }}>
        <div style={win98.toolbar}>
          <span>Canvas</span>
          <span style={{ marginLeft: 8 }}>• Pan: right/middle mouse • Zoom: wheel • Connect: drag nodes</span>
        </div>
        <div style={{ height: '100%', borderTop: '1px solid #808080', background: '#C0C0C0', padding: 4 }}>
          <div style={{ height: '100%', border: ridge }} onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onInit={setRfInstance}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <MiniMap pannable zoomable />
              <Controls showInteractive={false} />
              <Background variant={BackgroundVariant.Dots} gap={16} color="#999" />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* RIGHT: INSPECTOR / LOG */}
      <div style={{ ...win98.panel, ...win98.right }}>
        <div style={win98.head}>Inspector — Logs</div>
        <div style={win98.body}>
          <div style={win98.log}>
            {logLines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            • Edit node params inline. <br />
            • "Run Simulation" executes bounded leverage loop with simple math.
          </div>
        </div>
      </div>

      {/* TASKBAR */}
      <div style={win98.task}>
        <div>Start ▸ Nexus</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>ETH<div style={win98.led(led.eth)} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>BASE<div style={win98.led(led.base)} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>ARB<div style={win98.led(led.arb)} /></div>
        </div>
      </div>
    </div>
  );
}

/****************
 * Flow IDE tab *
 ****************/
function FlowIDE({ nodes, edges, setNodes, setEdges, makeId, updateParam }) {
  const [dsl, setDsl] = useState('');
  const [out, setOut] = useState({ mode: 'none', content: '' }); // mode: none|json|csv|table

  const syncFromFlow = useCallback(() => {
    setDsl(stringifyDSL(nodes, edges));
    setOut({ mode: 'none', content: '' });
  }, [nodes, edges]);

  const applyToFlow = useCallback(() => {
    try {
      const { nodes: ns, edges: es } = parseDSL(dsl, makeId, updateParam);
      setNodes(ns);
      setEdges(es);
      setOut({ mode: 'none', content: '' });
    } catch (e) {
      setOut({ mode: 'table', content: `Parse error: ${e.message}` });
    }
  }, [dsl, makeId, updateParam, setNodes, setEdges]);

  const toJSON = () => setOut({ mode: 'json', content: JSON.stringify(toSimpleJSON(nodes, edges), null, 2) });

  const toCSV = () => {
    const nrows = ['id,tplKey,kind,label,params'];
    for (const n of nodes) nrows.push(`${n.id},${n.data?.tplKey||''},${n.data?.kind||''},"${(n.data?.label||'').replace(/"/g,'""')}","${JSON.stringify(n.data?.params||{}).replace(/"/g,'""')}"`);
    const erows = ['id,source,target,label'];
    for (const e of edges) erows.push(`${e.id},${e.source},${e.target},${e.label||''}`);
    setOut({ mode: 'csv', content: `# nodes\n${nrows.join('\n')}\n\n# edges\n${erows.join('\n')}` });
  };

  const copyOut = async () => {
    try { await navigator.clipboard.writeText(out.content || dsl || ''); } catch {}
  };

  useEffect(() => { if (!dsl) syncFromFlow(); }, []); // initial sync

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: '36px 1fr', background: '#E0E0E0', fontFamily: 'JetBrains Mono, monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#C0C0C0', borderBottom: '1px solid #808080', padding: '4px 6px' }}>
        <strong>Flow IDE</strong>
        <button style={win98.btn} onClick={syncFromFlow}>Sync ← Flow</button>
        <button style={win98.btn} onClick={applyToFlow}>Apply → Flow</button>
        <span style={{ marginLeft: 12 }}>Export:</span>
        <button style={win98.btn} onClick={toJSON}>JSON</button>
        <button style={win98.btn} onClick={toCSV}>CSV</button>
        <button style={win98.btn} onClick={() => setOut({ mode: 'table', content: 'table' })}>Table</button>
        <button style={win98.btn} onClick={copyOut}>Copy</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>DSL mirrors Flow graph</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 8 }}>
        <div style={{ ...win98.panel }}>
          <div style={win98.head}>Flow DSL</div>
          <textarea value={dsl} onChange={(e)=>setDsl(e.target.value)} style={{ flex:1, minHeight:0, padding:8, fontFamily:'JetBrains Mono, monospace', fontSize:12, border:'none', outline:'none' }} />
        </div>
        <div style={{ ...win98.panel }}>
          <div style={win98.head}>Output</div>
          <div style={{ ...win98.body }}>
            {out.mode === 'json' && (
              <pre style={{ whiteSpace:'pre-wrap' }}>{out.content}</pre>
            )}
            {out.mode === 'csv' && (
              <pre style={{ whiteSpace:'pre-wrap' }}>{out.content}</pre>
            )}
            {out.mode === 'table' && (
              <div style={{ display:'grid', gridTemplateRows:'auto 1fr', gap:8 }}>
                <div style={{ fontSize:12, opacity:0.7 }}>Nodes</div>
                <div style={{ overflow:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead><tr>{['id','tplKey','kind','label','params'].map(h=>(<th key={h} style={{ border:'1px solid #808080', padding:4, background:'#EEE' }}>{h}</th>))}</tr></thead>
                    <tbody>
                      {nodes.map(n => (
                        <tr key={n.id}>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{n.id}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{n.data?.tplKey}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{n.data?.kind}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{n.data?.label}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}><code>{JSON.stringify(n.data?.params||{})}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize:12, opacity:0.7, marginTop:8 }}>Edges</div>
                <div style={{ overflow:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead><tr>{['id','source','target','label'].map(h=>(<th key={h} style={{ border:'1px solid #808080', padding:4, background:'#EEE' }}>{h}</th>))}</tr></thead>
                    <tbody>
                      {edges.map(e => (
                        <tr key={e.id}>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{e.id}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{e.source}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{e.target}</td>
                          <td style={{ border:'1px solid #808080', padding:4 }}>{e.label||''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*********************************
 * Console Master Control Center *
 *********************************/
function ConsoleMaster({ nodes, edges, setNodes, setEdges, makeId, updateParam, setTab }) {
  const [lines, setLines] = useState(['WinGPT 95 Console ready. Type "help".']);
  const [cmd, setCmd] = useState('');
  const viewRef = useRef(null);
  useEffect(() => { viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight }); }, [lines]);

  const print = (s) => setLines((L) => L.concat(String(s).split('\n')));
  const clear = () => setLines([]);

  const run = () => {
    const { logs } = simulateLeverage(nodes, edges);
    print(logs.join('\n'));
  };

  const exportJSON = () => print(JSON.stringify(toSimpleJSON(nodes, edges), null, 2));
  const exportDSL = () => print(stringifyDSL(nodes, edges));

  const loadSample = () => {
    const { nodes: ns, edges: es } = sampleWorkflow(makeId, updateParam);
    setNodes(ns); setEdges(es); print('Sample loaded.');
  };

  const setParam = (idOrIdx, key, val) => {
    setNodes((nds) => nds.map((n, idx) => {
      const match = (n.id === idOrIdx) || (String(idx) === String(idOrIdx));
      if (!match) return n;
      return { ...n, data: { ...n.data, params: { ...n.data.params, [key]: numOrStr(val) } } };
    }));
  };

  const handle = (raw) => {
    const input = raw.trim();
    if (!input) return;
    setLines((L)=>L.concat([`C> ${input}`]));
    const [cmd, ...rest] = input.split(' ');
    try {
      switch (cmd.toLowerCase()) {
        case 'help':
          print([
            'help                       # this list',
            'status                     # counts',
            'sample                     # load sample flow',
            'run                        # simulate leverage loop',
            'nodes                      # list nodes',
            'edges                      # list edges',
            'set <id|idx> <k> <v>      # set node param',
            'export json|dsl            # export format',
            'clear                      # clear screen',
            'tab flow|ide|chat|console  # switch tab'
          ].join('\n'));
          break;
        case 'status':
          print(`nodes=${nodes.length} edges=${edges.length}`);
          break;
        case 'sample':
          loadSample();
          break;
        case 'run':
          run();
          break;
        case 'nodes':
          nodes.forEach((n,i)=> print(`${i}: id=${n.id} tpl=${n.data?.tplKey} kind=${n.data?.kind} label="${n.data?.label}" params=${JSON.stringify(n.data?.params)}`));
          break;
        case 'edges':
          edges.forEach((e,i)=> print(`${i}: id=${e.id} ${e.source} -> ${e.target} ${e.label?`label=${e.label}`:''}`));
          break;
        case 'set': {
          const [id, k, ...vParts] = rest; const v = vParts.join(' ');
          if (!id || !k || v === undefined) { print('ERR usage: set <id|idx> <key> <value>'); break; }
          setParam(id, k, v); print('OK');
          break; }
        case 'export': {
          const fmt = (rest[0]||'').toLowerCase();
          if (fmt === 'json') exportJSON(); else if (fmt === 'dsl') exportDSL(); else print('ERR expected json|dsl');
          break; }
        case 'clear':
          clear();
          break;
        case 'tab': {
          const t = (rest[0]||'').toLowerCase();
          if (['flow','ide','chat','console'].includes(t)) setTab(t === 'ide' ? 'ide' : t);
          else print('ERR unknown tab');
          break; }
        default:
          print('ERR unknown command');
      }
    } catch (e) { print('ERR ' + e.message); }
  };

  const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); const v = cmd; setCmd(''); handle(v); } };

  return (
    <div style={{ height:'100vh', display:'grid', gridTemplateRows:'36px 1fr', background:'#E0E0E0', fontFamily:'JetBrains Mono, monospace' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, background:'#C0C0C0', borderBottom:'1px solid #808080', padding:'4px 6px' }}>
        <strong>Console Master Control Center</strong>
        <div style={win98.chip}>Win95 Terminal</div>
        <div style={win98.chip}>Flow Control</div>
        <span style={{ marginLeft:'auto', fontSize:12, opacity:0.8 }}>Type "help"</span>
      </div>
      <div style={{ display:'grid', gridTemplateRows:'1fr auto', gap:8, padding:8 }}>
        <div style={{ ...win98.panel }}>
          <div style={win98.head}>Terminal</div>
          <div ref={viewRef} style={{ background:'#000', color:'#0f0', padding:8, height:'60vh', overflow:'auto', fontSize:12, lineHeight:1.4, borderTop:'1px solid #808080' }}>
            {lines.map((l,i)=>(<div key={i} style={{ whiteSpace:'pre-wrap' }}>{l}</div>))}
          </div>
          <div style={{ display:'flex', gap:6, padding:6, background:'#111', color:'#0f0' }}>
            <span style={{ color:'#0ff' }}>C&gt;</span>
            <input value={cmd} onChange={(e)=>setCmd(e.target.value)} onKeyDown={onKey} style={{ flex:1, background:'#000', color:'#0f0', border:'1px solid #0f0', padding:'4px 6px', fontFamily:'inherit' }} autoFocus />
            <button style={win98.btn} onClick={()=>{ const v=cmd; setCmd(''); handle(v); }}>Run</button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ ...win98.panel }}>
            <div style={win98.head}>Quick Actions</div>
            <div style={win98.body}>
              <button style={win98.btn} onClick={loadSample}>Load Sample</button>
              <button style={win98.btn} onClick={run}>Run Simulation</button>
              <button style={win98.btn} onClick={exportJSON}>Export JSON</button>
              <button style={win98.btn} onClick={exportDSL}>Export DSL</button>
            </div>
          </div>
          <div style={{ ...win98.panel }}>
            <div style={win98.head}>Hints</div>
            <div style={{ ...win98.body, fontSize:12 }}>
              set 0 amountUSDC 1500<br/>
              set nodeId minHealth 1.6<br/>
              export json | dsl
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*************************
 * Win95 Chat (embedded) *
 *************************/
function Win95Chat({ embedded = false }) {
  const [msgs, setMsgs] = useState([
    { id: uid(), role: 'system', text: 'WinGPT 95 booted.' },
    { id: uid(), role: 'assistant', text: 'Hello. Ask anything.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState('gpt-5');
  const [temp, setTemp] = useState(0.2);
  const viewRef = useRef(null);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, busy]);

  async function respond(prompt) {
    setBusy(true);
    const base = `You said: ${prompt}`;
    const tokens = base.split(' ');
    const id = uid();
    let acc = '';
    setMsgs((m) => [...m, { id, role: 'assistant', text: '' }]);
    for (const t of tokens) {
      await new Promise((r) => setTimeout(r, 20));
      acc += (acc ? ' ' : '') + t;
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: acc } : x)));
    }
    setBusy(false);
  }

  function onSend() {
    const v = input.trim();
    if (!v || busy) return;
    setMsgs((m) => [...m, { id: uid(), role: 'user', text: v }]);
    setInput('');
    respond(v);
  }

  function onKey(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSend(); }
  }

  const bevel = { out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]', in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white' };
  const containerStyle = embedded ? { height: '100%', width: '100%' } : { minHeight: '100vh', width: '100%' };

  return (
    <div className="w-full flex items-center justify-center p-4" style={{ background: '#008080', ...containerStyle }}>
      <div className={`w-full max-w-4xl select-none shadow-2xl ${bevel.out} border-2`} role="application" aria-label="WinGPT 95" style={{ background: '#c0c0c0', color: '#000' }}>
        <div className="h-8 flex items-center justify-between px-2 text-white" style={{ background: '#000080' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white" />
            <div className="font-semibold" style={{ fontFamily: 'Tahoma, \"MS Sans Serif\", system-ui' }}>WinGPT 95</div>
          </div>
          <div className="flex items-center gap-1">
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Minimize">[ _ ]</button>
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Maximize">[ □ ]</button>
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Close">[ X ]</button>
          </div>
        </div>
        <div className={`h-7 bg-[#c0c0c0] px-2 flex items-center gap-3 ${bevel.in} border-b-2`}>
          {['File','Edit','View','Help'].map((m) => (
            <span key={m} className="text-sm tracking-tight cursor-default select-none">{m}</span>
          ))}
        </div>
        <div className="grid grid-rows-[1fr_auto] gap-2 p-2 bg-[#c0c0c0]" style={{ height: embedded ? 'calc(100% - 3.5rem)' : undefined }}>
          <div className={`h-[52vh] md:h-[58vh] overflow-auto bg-[#ffffff] ${bevel.in} border-2`} ref={viewRef}>
            <div className="font-mono text-sm leading-6 p-3">
              {msgs.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap"><span className="text-[#00008b] mr-2">{m.role === 'user' ? 'C>' : m.role === 'assistant' ? 'A>' : 'S>'}</span><span>{m.text}</span></div>
              ))}
              {busy && (
                <div className="whitespace-pre"><span className="text-[#00008b] mr-2">A&gt;</span><span className="animate-pulse">▮</span></div>
              )}
            </div>
          </div>
          <div className={`p-2 bg-[#c0c0c0] ${bevel.in} border-2`}>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs mb-1">Prompt</label>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} rows={3} className={`w-full resize-y bg-[#ffffff] text-black px-2 py-1 outline-none ${bevel.in} border-2 font-mono`} aria-label="Prompt input" />
                <div className="mt-1 text-[10px] opacity-80">Ctrl+Enter to send</div>
              </div>
              <div className="w-56">
                <label className="block text-xs mb-1">Settings</label>
                <div className={`p-2 bg-[#c0c0c0] ${bevel.out} border-2 space-y-2`}>
                  <div>
                    <div className="text-xs mb-1">Model</div>
                    <div className={`bg-white ${bevel.in} border-2 h-8 flex items-center px-2`}>
                      <select className="w-full bg-transparent outline-none" value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
                        {['gpt-5','gpt-4o','local-llm'].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1">{`Temp ${temp.toFixed(1)}`}</div>
                    <div className={`bg-[#c0c0c0] ${bevel.out} border-2 p-2`}>
                      <input type="range" min={0} max={1} step={0.1} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full" aria-label="Temperature" />
                    </div>
                  </div>
                  <button onClick={onSend} disabled={busy} className={`w-full h-8 bg-[#c0c0c0] ${bevel.out} border-2 disabled:opacity-50`} aria-label="Send">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`h-7 bg-[#c0c0c0] px-2 flex items-center justify-between border-t-2`}>
          <div className="text-xs">{busy ? 'Thinking' : 'Ready'}</div>
          <div className="text-xs">Msgs: {msgs.length}</div>
        </div>
      </div>
    </div>
  );
}

/************************
 * Unified default view *
 ************************/
export default function WinGPT95Suite() {
  const [tab, setTab] = useState('flow'); // 'flow' | 'ide' | 'console' | 'chat'

  // Shared graph state for Flow, IDE, Console
  const idRef = useRef(1);
  const makeId = useCallback(() => String(idRef.current++), []);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const updateParam = useCallback((id, key, value) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, params: { ...n.data.params, [key]: value } } } : n)));
  }, []);

  const onLoadSample = useCallback(() => {
    const { nodes: ns, edges: es } = sampleWorkflow(makeId, updateParam);
    setNodes(ns); setEdges(es);
  }, [makeId, updateParam]);

  const TopBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#C0C0C0', borderBottom: '1px solid #808080', padding: '4px 6px', fontFamily: 'JetBrains Mono, monospace' }}>
      <strong>WinGPT 95 Suite</strong>
      <button style={{ ...win98.btn, background: tab === 'flow' ? '#E8E8E8' : '#C0C0C0' }} onClick={() => setTab('flow')}>Flow Builder</button>
      <button style={{ ...win98.btn, background: tab === 'ide' ? '#E8E8E8' : '#C0C0C0' }} onClick={() => setTab('ide')}>Flow IDE</button>
      <button style={{ ...win98.btn, background: tab === 'console' ? '#E8E8E8' : '#C0C0C0' }} onClick={() => setTab('console')}>Console</button>
      <button style={{ ...win98.btn, background: tab === 'chat' ? '#E8E8E8' : '#C0C0C0' }} onClick={() => setTab('chat')}>Win95 Chat</button>
      <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.8 }}>Single import • Graph shared across tabs</span>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'grid', gridTemplateRows: '36px 1fr' }}>
      {TopBar}
      <div style={{ minHeight: 0 }}>
        {tab === 'flow' && (
          <ReactFlowProvider>
            <FlowInner
              nodes={nodes}
              setNodes={setNodes}
              edges={edges}
              setEdges={setEdges}
              makeId={makeId}
              updateParam={updateParam}
              onLoadSample={onLoadSample}
            />
          </ReactFlowProvider>
        )}
        {tab === 'ide' && (
          <FlowIDE
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            makeId={makeId}
            updateParam={updateParam}
          />
        )}
        {tab === 'console' && (
          <ConsoleMaster
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            makeId={makeId}
            updateParam={updateParam}
            setTab={setTab}
          />
        )}
        {tab === 'chat' && <Win95Chat embedded />}
      </div>
    </div>
  );
}

/*****************
 * Util: IDs     *
 *****************/
function uid() { return Math.random().toString(36).slice(2); }
```

END of CODE Redesign TEMPLATE. 

---

Implemented (v1) UI notes

- Navigation
  - Added Discourse (SSO‑gated) tab to the main nav; settings consolidated under Router.
  - Routes: /discourse (read‑only latest/topics), /api (Router: BYOK/provider config, feature toggles, import/export JSON).

- Auth & Security
  - Discourse SSO (Discourse Connect) via hub.bitwiki.org; secret remains server‑side only.
  - Session cookie sf_session is httpOnly; sf_csrf is readable for double‑submit CSRF. Logout requires x‑csrf‑token.
  - BYOK preserved: user keys are encrypted in sessionStorage only; none stored server‑side.

- Styling & Build
  - Tailwind v3 pinned; PostCSS .cjs retained; Vite css.postcss uses inline plugins to avoid ESM/CJS conflicts.
  - No postinstall patching; dependencies stabilized.

- Testing
  - Unit tests cover SSO/proxy/logout; e2e smokes use Vite preview web server on 8081 and role‑based selectors.
