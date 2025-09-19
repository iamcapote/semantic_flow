<div align="center"><a name="readme-top"></a>

[![][image-banner]][repo-link]

# 🧠 Semantic Flow
### An open‑source, production‑ready **Context Engineering Canvas** for AI. 
<strong>Composable Structured Context. Under Your Control.</strong><br/>
Semantic Flow is a visual workspace for composing precise, interlinked semantic nodes with explicit fields and formats. <br/>
You design the context; the model consumes a clean, inspectable structure you can export or execute—never a hidden chain. <br/>
Bring your own keys (BYOK). Nothing sensitive is persisted server‑side.

<div align="center">
  <strong>Live App:</strong> <a href="http://canvas.bitwiki.org/">http://canvas.bitwiki.org/</a>
</div>

<div align="center"><em>A compact canvas for deliberate context design.</em></div>

**English** · **[Docs][docs]** · **[Changelog][changelog]** · **[Issues][issues]** · **[Releases][github-release-link]**

<!-- SHIELD GROUP -->

\[![][status-shield]]\[status-link]
[![][version-shield]][github-release-link]
[![][license-shield]][license-link]
[![][deployable-shield]][deploy-section]
[![][discourse-shield]][discourse-link]
[![][ci-shield]][ci-link]
[![][coverage-shield]][coverage-link]
[![][stars-shield]][stars-link]
[![][forks-shield]][forks-link]<br/>
[![][twitter-share]][twitter-share-link]
[![][reddit-share]][reddit-share-link]
[![][telegram-share]][telegram-share-link]
[![][linkedin-share]][linkedin-share-link]

<sup>Pioneering the new age of thinking and creating. Built for you, the Super Individual.</sup>

![][image-overview]

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

* [👋🏻 Getting Started](#-getting-started)
* [✨ Highlights](#-highlights)
* [🎨 Screens & Win95 Suite](#-screens--win95-suite)
* [🧠 Semantic Ontology](#-semantic-ontology)
* [🤝 Agentic Constructs](#-agentic-constructs)
* [🔌 Providers, BYOK, and Discourse](#-providers-byok-and-discourse)
* [🧪 Usage Examples](#-usage-examples)
* [📤 Export & Interop](#-export--interop)
* [📦 Ecosystem](#-ecosystem)
* [🧩 Extensions & Integrations](#-extensions--integrations)
* [⚙️ Architecture](#️-architecture)
* [🗺️ Codebase Overview](#-codebase-overview)
* [🏗️ Project Structure](#-project-structure)
* [🚀 Quick Start](#-quick-start)
* [🛳️ Self Hosting](#-self-hosting)

  * [A. One‑Click Deploy](#a-oneclick-deploy)
  * [B. Docker](#b-docker)
  * [C. Manual / Node](#c-manual--node)
  * [Environment Variables](#environment-variables)
* [🔐 Security & Privacy](#-security--privacy)
* [🧯 Troubleshooting](#-troubleshooting)
* [🧭 Roadmap](#-roadmap)
* [📈 Performance](#-performance)
* [🧑‍⚖️ Governance](#-governance)
* [🤝 Contributing](#-contributing)
* [💖 Sponsor](#-sponsor)
* [📝 License](#-license)
* [🔗 Link Group](#-link-group)

<br/>

</details>

## 👋🏻 Getting Started

Compose knowledge as linked, typed nodes. Each node can carry different formats (Markdown, JSON, YAML, XML) so you keep structure and narrative side by side. Export anytime, or run execution to send node context sequentially to a provider you configure. This is a design surface—*not* a background automation runner.

> \[!IMPORTANT]
> **Star** the repo to receive release notifications on GitHub.

---

## ✨ Highlights

* **Win95 Suite**: Builder, IDE, Router/API Console, Admin, Chat, Learn — unified retro‑modern UI (a visual reasoning engine for context design).
* **Rich Ontology**: 16+ clusters, 100+ node types for logic, reasoning, cognition, discourse, and control.
* **Agentic Constructs**: Compose Persona + Policies + Tools + Memory/Seeds → route into Chat.
* **Five AI Providers**: OpenAI · OpenRouter · Venice AI · Nous · Morpheus. **BYOK** with session‑only storage.
* **Discourse SSO**: Read topics/PMs, create and attach **Seeds**, leverage personas via server proxy.
* **Multi‑Format Export**: JSON · YAML · Markdown · XML. Portable by design.
* **Router/API Console**: Build and send provider requests, inspect streaming, and proxy Discourse AI personas.
* **Security‑First**: BYOK, HttpOnly session cookies, double‑submit CSRF, webhook HMAC verification.

> \[!NOTE]
> Connections/edges **express reference**, not execution order. Semantic Flow is a *canvas for meaning*.

---

## 🎨 Screens & Win95 Suite

* **Builder**: Visual schema canvas (React Flow). Drag nodes, colorize, connect, annotate.
* **IDE**: Text‑first editing for the same schema; import/export round‑trips.
* **Router/API Console**: Build requests for providers, stream responses, inspect payloads.
* **Console**: Fast overrides, inspection, and export surface.
* **Chat**: Prototype chat (local mock).
* **Admin**: Providers, themes, SSO, and site options.
* **Learn**: Built‑in guide mirroring the Win95 aesthetic.

> The **Learn** page explains core concepts, navigation, pages, export, security, guardrails, creative uses, and glossary.

---

## 🧠 Semantic Ontology

At the core is a typed ontology spanning reasoning and discourse. Clusters include:

| Cluster                              | Purpose                                  |
| :----------------------------------- | :--------------------------------------- |
| **Proposition (PROP)**               | Assertions and statements                |
| **Inquiry (INQ)**                    | Question, information seeking            |
| **Hypothesis/Evidence/Method (HEM)** | Scientific method nodes                  |
| **Reasoning (RSN)**                  | Deduction, induction, abduction, analogy |
| **Evaluation Gates (EVL)**           | Consistency, validity, quality checks    |
| **Modal & Mental‑State (MOD)**       | Beliefs, intentions, modalities          |
| **Speech‑Act (SPA)**                 | Communicative intents and actions        |
| **Discourse Meta (DSC)**             | Threading, annotation, discourse control |
| **Control & Meta Engines (CTL)**     | Branching, merging, flow control         |
| **Error/Exception (ERR)**            | Contradictions, recovery                 |
| **Creative Ops (CRT)**               | Divergence, remix, synthesis             |
| **Mathematical Reasoning (MTH)**     | Proof, conjecture, derivation            |
| **Cognitive Mechanics (COG)**        | Planning, goals, evaluation, schema      |
| **Mind Constructs (MND)**            | Mental and philosophical objects         |
| **Non‑Classical Logic (NCL)**        | Alt logics and semantics                 |
| **Dynamic Semantics (DYN)**          | Context shift and adaptation             |
| **Utility (UTIL)**                   | Scaffolding, metadata, blanks            |

Each node is a compact, typed form with fields (title, description, parameters, tags, examples, constraints, …). Assign a **Language Mode** per node: JSON/YAML/XML/Markdown.

---

## 🤝 Agentic Constructs

Build **schemas that act like agents** by composing:

1. **Persona/Role**
2. **Policies/Constraints**
3. **Tools/Integrations**
4. **Memory & Seeds** (Discourse topics)

**Flow**: Build in *Builder* → inspect in *IDE* → bind in *Router* → adjust in *Console* → test in *Chat*.

> \[!TIP]
> Edges define knowledge and reference, not execution. Use Router to assemble runtime context.

---

## 🔌 Providers, BYOK, and Discourse

* **Providers**: OpenAI, OpenRouter, Venice AI, Nous, Morpheus. Switch easily; per‑session keys.
* **BYOK**: Keys live **only** in browser sessionStorage (encrypted). No server‑side persistence.
* **Discourse SSO**: Sign‑in unlocks topic/PM browse, seed creation, and persona leverage via secure proxy.

> **Storage model**: Minimal app storage. When SSO is enabled, Discourse is the system of record. Local schema work remains local unless exported or synced.

---

## 🧪 Usage Examples

```
[Research Question] → [Hypothesis] → [Evidence Collection]
     ↓                    ↓               ↓
[Literature Review] → [Experimental Design] → [Data Analysis]
     ↓                    ↓               ↓
[Peer Review] → [Publication] → [Replication Studies]
```

```
[Legal Claim] → [Precedent Evidence] → [Statutory Analysis]
     ↓               ↓                    ↓
[Counterarguments] → [Rebuttal] → [Judicial Decision]
```

```
[Problem Definition] → [Stakeholder Analysis] → [Option Generation]
     ↓                    ↓                      ↓
[Risk Assessment] → [Cost‑Benefit Analysis] → [Implementation Plan]
```

```
[Character Creation] → [World Setting] → [Rule Definition]
     ↓                    ↓               ↓
[Dynamic Events] → [Player Choices] → [Consequence Engine]
     ↓                    ↓               ↓
[Feedback Loops] → [Narrative Arcs] → [Endgame Scenarios]
```

> \[!TIP]
> Mix formats across a schema: e.g. **Markdown** narrative + **JSON** attributes + **YAML** routing.

---

## 📤 Export & Interop

* Export to **JSON, YAML, Markdown, XML** for downstream tools and docs.
* Designed for **portability**: commit to repos, paste into docs, feed CI/CD.

---

## 📦 Ecosystem

* **Win95 Suite UI**: unified application shell with TopNav95Plus.
* **Discourse Integration Service**: SSO, proxy, seeds, webhook verification.
* **Agents Reference**: BYOK, frontend‑only packs for rapid prototyping (see `AGENTS.md`).

> \[!NOTE]
> The on‑site **Learn** page complements this README with task‑oriented guidance.

---

## 🧩 Extensions & Integrations

* **Tools & Connectors**: Register external tools and bind them in the **Router**.
* **Models**: Select provider models per route; override in **Console**.
* **Seeds**: Attach Discourse topic anchors for persistent context.

Planned items are tracked in Docs → [`docs/to-do.md`](./docs/to-do.md).

---

## ⚙️ Architecture

**Tech Stack**

* **Frontend**: React 18 · Vite · Tailwind CSS · React Flow · shadcn/ui · Radix UI
* **State**: React Query (TanStack Query)
* **Security**: BYOK, session‑only storage, HttpOnly session cookies, CSRF double‑submit
* **SSO**: Discourse SSO + webhook HMAC verification

**Conceptual Flow**

1. **Builder** creates typed nodes/edges →
2. **IDE** refines text form →
3. **Router** assembles context, roles, tools, models →
4. **Console** provides quick overrides →
5. **Chat** exercises the active route/context.

---

## 🗺️ Codebase Overview

Authoritative map of key modules:

* **Canvas & UX**

  * `src/components/LabCanvas.jsx` — React Flow canvas (builder)
  * `src/components/SemanticNode.jsx` — custom node renderer
  * `src/components/NodePalette.jsx` — node palette
* **Providers (BYOK)**

  * `src/components/ProviderSetup.jsx`, `ProviderSettings.jsx` — provider selection and configuration
* **AI orchestration**

  * `src/lib/promptingEngine.js` — text→workflow, execute workflow, node enhancement
* **Graph contracts**

  * `src/lib/graphSchema.js` — node/edge/workflow schemas, creators, validators
* **Ontology**

  * `src/lib/ontology.js` — clusters, node types, colors
* **Export**

  * `src/lib/exportUtils.js` — JSON, Markdown, YAML, XML
* **Execution UI**

  * `src/components/WorkflowExecutionModal.jsx` (and 95 variant), `src/components/TextToWorkflow.jsx`
* **Security (BYOK)**

  * `src/lib/security.js` — session‑only encrypted storage via `SecureKeyManager`
* **App entry**

  * `src/App.jsx`, `src/pages/*`, `src/main.jsx`
* **Tests**

  * `tests/unit/*.test.*` — frontend/provider logic

> **Tip**: Provider keys are stored only in **sessionStorage** (encrypted). Active provider/base URLs live under: `active_provider`, `base_url_{provider}`.

---

## 🏗️ Project Structure

```
semantic_flow/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn base components
│   │   ├── NodePalette.jsx
│   │   ├── LabCanvas.jsx
│   │   └── SemanticNode.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── WorkflowBuilderPage.jsx
│   │   └── ChatPage.jsx
│   ├── lib/
│   │   ├── ontology.js
│   │   ├── graphSchema.js
│   │   ├── exportUtils.js
│   │   ├── promptingEngine.js
│   │   └── security.js
│   └── integrations/           # external integrations (if any)
├── docs/
│   ├── discourse-architecture.md
│   ├── GUI_updates.md
│   └── to-do.md
└── public/
```

---

## 🚀 Quick Start

```bash
# 1) Clone and install
git clone https://github.com/iamcapote/semantic_flow.git
cd semantic_flow
npm install

# 2) Configure environment
cp .env.example .env
# Edit .env as needed; defaults work for local preview

# 3) Run in development (single port)
npm run dev
# → http://localhost:8081 (Node + Vite middleware)

# 4) Build and preview
npm run build:dev
npm run preview
# → http://localhost:8081
```

---

## 🛳️ Self Hosting

Semantic Flow is designed to be self‑hosted on any modern Node host.

### A. One‑Click Deploy

<div align="center">

|          Deploy with RepoCloud          |
| :-------------------------------------: |
| [![][repocloud-button]][repocloud-link] |

</div>

> \[!TIP]
> Add your **BYOK** in the running instance. Keys are never persisted server‑side.

### B. Docker

```bash
# WIP: Example compose for reverse proxy + Node app
# version: '3.9'
# services:
#   semantic-flow:
#     image: ghcr.io/bitwikiorg/semantic_flow:latest
#     container_name: semantic-flow
#     environment:
#       - APP_BASE_URL=http://localhost:8081
#       - DISCOURSE_BASE_URL=https://hub.bitwiki.org
#       - DISCOURSE_SSO_SECRET=change-me
#       - DISCOURSE_WEBHOOK_SECRET=change-me
#     ports:
#       - "8081:8081"
#     restart: unless-stopped
```

### C. Manual / Node

Use the Quick Start above.

### Environment Variables

| Variable                   | Required | Description                                            | Example                   |
| -------------------------- | :------: | ------------------------------------------------------ | ------------------------- |
| `DISCOURSE_BASE_URL`       |    Yes   | Base URL of your Discourse instance                    | `https://hub.bitwiki.org` |
| `DISCOURSE_SSO_SECRET`     |    Yes   | Discourse SSO secret                                   | `test_123`              |
| `DISCOURSE_WEBHOOK_SECRET` |    Yes   | Shared secret to verify Discourse webhooks             | `shared_webhook_secret`   |
| `APP_BASE_URL`             |    Yes   | Base URL for this app                                  | `http://localhost:8081`   |
| `API_KEY`                  |    No    | Optional API key to enable write endpoints for seeding | `change-me`               |
| `PORT`                     |    No    | Server port                                            | `8081`                    |

---

## 🔐 Security & Privacy

* **BYOK**: Keys stay in browser **sessionStorage** (encrypted). No server‑side key storage.
* **Sessions**: HttpOnly cookies, double‑submit CSRF protection.
* **Webhooks**: HMAC signature verification for Discourse.
* **Least Storage**: Minimal app storage; Discourse becomes the record system when SSO is active.

> \[!CAUTION]
> Semantic Flow is **not** a workflow runner, job queue, or datastore for your keys.

---

## 🧯 Troubleshooting

* **Landing title truncated on mobile** → Fixed with responsive typography (`text-4xl sm:text-5xl md:text-6xl lg:text-7xl`).
* **Infinite loading during provider setup** → Resolved in provider configuration.
* **Landing page not appearing** → Clear session: `sessionStorage.clear(); location.reload()`.
* **Node palette white in dark mode** → Hard refresh (`Ctrl+F5`).
* **Workflow execution fails** → Verify provider key validity and credits.
* **Deprecated models (e.g., `gpt-4-turbo`)** → Use `gpt-4o`, `gpt-4o-mini`, or custom model names.

---

## 🧭 Roadmap

See Docs → [`docs/to-do.md`](docs/to-do.md) for the active roadmap and task list.

---

## 📈 Performance

Semantic Flow targets a lightweight client with Vite and React. Formal Lighthouse snapshots will be posted in `docs/`.

---

## 🧑‍⚖️ Governance

* **License**: AGPL‑3.0
* **CLA**: Not required for now; contributions are accepted under the project license.
* **Security Reports**: Please open a private issue with minimal reproduction details.

---

## 🤝 Contributing

Contributions of all types are welcome. See **Issues** to get started.

```bash
npm run dev          # Start Vite development server (port 8081)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # ESLint checks
npm run test         # Unit/integration tests (Jest)
npm run test:e2e     # End‑to‑end tests (Playwright)
```

> Please follow conventional commits and include tests where reasonable.

---

## 💖 Sponsor

If this project helps you, consider sponsorship to accelerate feature delivery and maintenance.

---

## 📝 License

Copyright © 2025 [iamcapote][author-link].

This project is licensed under **[AGPL‑3.0][license-link]**.

---

Built with ∞❤️∞ for the future of context engineering and AI reasoning

---

## 🔗 Link Group

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[repo-link]: https://github.com/iamcapote/semantic_flow
[docs]: ./docs/README.md
[changelog]: ./CHANGELOG.md
[issues]: https://github.com/iamcapote/semantic_flow/issues
[license-link]: ./LICENSE
[author-link]: https://github.com/iamcapote
[image-banner]: ./public/og-image.svg
[image-overview]: ./public/og-image.svg
[status-shield]: https://img.shields.io/badge/Status-Live%20Product-55b467?labelColor=000000&style=flat-square
[version-shield]: https://img.shields.io/github/v/release/iamcapote/semantic_flow?color=369eff&labelColor=000000&logo=github&style=flat-square
[license-shield]: https://img.shields.io/badge/license-AGPL--3.0-white?labelColor=000000&style=flat-square
[deployable-shield]: https://img.shields.io/badge/deploy-one--click-00bcd4?labelColor=000000&style=flat-square
[discourse-shield]: https://img.shields.io/badge/SSO-Discourse-ff9800?labelColor=000000&style=flat-square
[ci-shield]: https://img.shields.io/badge/CI-passing-4caf50?labelColor=000000&style=flat-square
[coverage-shield]: https://img.shields.io/badge/coverage-~-%23bbbbbb?labelColor=000000&style=flat-square
[stars-shield]: https://img.shields.io/github/stars/iamcapote/semantic_flow?color=ffcb47&labelColor=000000&style=flat-square
[forks-shield]: https://img.shields.io/github/forks/iamcapote/semantic_flow?color=8ae8ff&labelColor=000000&style=flat-square
[twitter-share]: https://img.shields.io/badge/-share%20on%20x-000000?labelColor=000000&logo=x&logoColor=white&style=flat-square
[twitter-share-link]: https://x.com/intent/tweet?text=Check%20Semantic%20Flow%20%E2%80%94%20an%20open-source%20Context%20Engineering%20Canvas&url=https%3A%2F%2Fgithub.com%2Fiamcapote%2Fsemantic_flow
[reddit-share]: https://img.shields.io/badge/-share%20on%20reddit-ff4500?labelColor=000000&logo=reddit&logoColor=white&style=flat-square
[reddit-share-link]: https://www.reddit.com/submit?title=Semantic%20Flow%20%E2%80%94%20Context%20Engineering%20Canvas&url=https%3A%2F%2Fgithub.com%2Fiamcapote%2Fsemantic_flow
[telegram-share]: https://img.shields.io/badge/-share%20on%20telegram-26a5e4?labelColor=000000&logo=telegram&logoColor=white&style=flat-square
[telegram-share-link]: https://t.me/share/url?text=Semantic%20Flow%20Context%20Engineering%20Canvas&url=https%3A%2F%2Fgithub.com%2Fiamcapote%2Fsemantic_flow
[linkedin-share]: https://img.shields.io/badge/-share%20on%20linkedin-0a66c2?labelColor=000000&logo=linkedin&logoColor=white&style=flat-square
[linkedin-share-link]: https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fgithub.com%2Fiamcapote%2Fsemantic_flow
[github-release-link]: https://github.com/iamcapote/semantic_flow/releases
[stars-link]: https://github.com/iamcapote/semantic_flow/stargazers
[forks-link]: https://github.com/iamcapote/semantic_flow/network/members
[deploy-section]: #a-oneclick-deploy
[discourse-link]: https://docs.discourse.org/
[ci-link]: https://github.com/iamcapote/semantic_flow/actions
[coverage-link]: https://github.com/iamcapote/semantic_flow/actions
[repocloud-button]: https://d16t0pc4846x52.cloudfront.net/deploylobe.svg
[repocloud-link]: https://repocloud.io/

---

## 👩‍💻 Developer Guide (Quick)

This repo contains a React/Vite client and a small Express server. The server serves the SPA and implements Discourse SSO/proxies/SSE; all AI provider calls are BYOK from the browser.

- Client path alias: `@/*` → `src/*` (see `jsconfig.json`).
- Port: `8081` by default (Node server + Vite dev middleware).
- Start dev server:

```bash
npm install
npm run dev
# open http://localhost:8081
```

### Environment Variables

Create a `.env` from `.env.example` (if present) or set variables in your environment. Defaults work for local preview when Discourse features are not used.

| Variable | Required | Description | Example |
|---|:--:|---|---|
| `APP_BASE_URL` | Yes | Base URL of this app | `http://localhost:8081` |
| `DISCOURSE_BASE_URL` | No | Your Discourse base URL | `https://hub.bitwiki.org` |
| `DISCOURSE_SSO_SECRET` | No | Enables SSO login flow | `change-me` |
| `DISCOURSE_WEBHOOK_SECRET` | No | Verifies inbound webhooks | `change-me` |
| `API_KEY` | No | Optional admin key for Discourse write proxies | `change-me` |

When unset, Discourse-specific routes will return 5xx/501 as appropriate; the client handles these gracefully.

### Testing

```bash
npm run test           # unit/integration (Jest + jsdom)
npm run test:e2e       # E2E (Playwright)
npm run test:all       # both suites
```

### Linting & Type Hints

```bash
npm run lint
```

The codebase uses standard ESLint React rules. TypeScript is not enforced; some files include inline JSDoc/types.

### Build & Preview

```bash
npm run build
npm run preview
# open http://localhost:8081
```

### Directory Ref

- `src/components/*`: Canvas, nodes, modals, Discourse panels
- `src/lib/*`: `graphSchema`, `ontology`, `exportUtils`, `promptingEngine`, `security`
- `server/*`: Express app and index (mounts Vite in dev, serves `dist/` in prod)
- `docs/*`: User/developer documentation rendered under `/learn/docs`

### Security Notes

- Never proxy user provider keys; keys live in `sessionStorage` encrypted (BYOK).
- HttpOnly cookie session for SSO; CSRF token on logout.
- Webhook HMAC verification for Discourse.

For precise contracts, see `AGENTS.md`.
