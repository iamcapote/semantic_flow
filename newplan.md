# **Semantic‑Logic AI Workflow Builder**

---

## 1 Mission Definition

Large‑scale web application for constructing, simulating, and persisting fine‑grained AI reasoning graphs built from formally‑typed semantic nodes (statement, hypothesis, evidence, method, modal tag, speech‑act, gate, engine, error). Goal: replace coarse “macro‑flows” with micro-flow ontology‑driven logic prompting pipelines that expose logic, cognitive‑science and philosophy‑of‑science primitives and systems while remaining approachable to non‑logicians.

In other words, this is prompt engineering on steroids. But shown in a visual easy to understand way.

---

## 2 User‑Tier Specification

### 2.1 Primary Surfaces

| Surface | Purpose | Critical Widgets |
| --- | --- | --- |
| **Lab Canvas** | Author graph | Node palette (semantic categories), drag‑drop grid, zoom, panning, snaplines, edge connectors, context menu |
| **Test Panel** | Chat harness | WhatsApp‑style transcript, prompt composer, send button, runtime config selector, “Run Flow” control. Sends prompt workflows to AI chats. |
| **Configuration Modal** | Persist model parameters | Name field, multiline system prompt, temperature slider (0–2), model radio (GPT‑4o / GPT‑4o‑Mini), save button |
| **Sidebar** | Utility blocks | GitHub token input (stored `localStorage`), “save Your AI workflow” instructions, AI Text-to-Workflow converter |
| **Branding** | Visual Identity | Custom logo, browser favicon, unique color palette, dark/light mode support |

### 2.2 Interaction Flow

1. Authenticate with session cookie.
2. Enter GitHub PAT (encrypted, local only).
3. Use **Text-to-Workflow AI** to convert a block of text into a preliminary node graph.
4. Drag additional ontology nodes from palette; connect via edges, and add content to each node.
5. Open **New Configuration** → set prompt, temperature, select model.
6. Switch to **Test** → type message → “Run Flow” (executes selected config).
7. Optionally **Export to GitHub Gist** or **Download** graph as JSON, YAML, Markdown, or XML.

### 2.3 Permissions

| Role | Abilities |
| --- | --- |
| Viewer | load, simulate |
| Editor | CRUD nodes/edges, configs |
| Owner | role assignment, delete flow, link GitHub |

---

### 2.4 Export Formats

| Format | Purpose | Key Elements |
| --- | --- | --- |
| **JSON** | Machine-readable | Complete graph structure, positions, metadata. Ideal for re-importing. |
| **YAML** | Human-readable | Clean, indented structure of the graph logic. Good for version control. |
| **Markdown** | Documentation | Text-based representation of the workflow, showing node content and connections. |
| **XML** | Interoperability | Verbose, structured format for integration with other systems. |

---

## 3 Ontology Catalogue Short

### 3.1 Proposition Cluster

`Statement` · `Claim` · `Definition` · `Observation` · `Concept`

### 3.2 Inquiry Cluster

`Query` · `Question` · `Problem`

### 3.3 Hypothesis / Evidence / Method

`Hypothesis` · `Evidence` · `Data` · `Counterexample` · `Method` · `Procedure` · `Algorithm` · `Protocol`

### 3.4 Reasoning Cluster

`Deduction` · `Induction` · `Abduction` · `Analogy` · `InferenceRule`

### 3.5 Evaluation Gates

`Verification` · `Validation` · `FalsifiabilityGate` · `ConsistencyCheck`

### 3.6 Modal & Mental‑State Tags

`Necessity` · `Possibility` · `Obligation` · `Permission` · `TemporalTag` · `EpistemicTag` · `Belief` · `Desire` · `Intent`

### 3.7 Speech‑Act Markers

`Assertion` · `Request` · `Command` · `Advice` · `Warning` · `Promise` · `Apology`

### 3.8 Discourse Meta

`Annotation` · `Revision` · `Summarization` · `Citation` · `Caveat`

### 3.9 Control & Meta Engines

`Branch` · `Condition` · `Loop` · `Halt` · `AbductionEngine` · `HeuristicSelector` · `ConflictResolver` · `ParadoxDetector`

### 3.10 Error / Exception

`Contradiction` · `Fallacy` · `Exception`

---

## 4 Ontology Catalogue — Extended, gap‑closed, schema‑tagged

### Legend

`*Code*` = internal enum key `⟡` = semantic tag for UI filter `↦` = terse definition

---

### 3.1 Proposition Cluster `PROP‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| PROP‑STM | Statement | {atomic} | Truth‑apt sentence |
| PROP‑CLM | Claim | {assertive} | Contestable statement |
| PROP‑DEF | Definition | {lexical} | Term explication |
| PROP‑OBS | Observation | {empirical} | Sense/measurement report |
| PROP‑CNC | Concept | {abstraction} | Mental representation |

---

### 3.2 Inquiry Cluster `INQ‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| INQ‑QRY | Query | {interrogative} | Data request |
| INQ‑QST | Question | {wh, polar} | Information gap |
| INQ‑PRB | Problem | {challenge} | Desired‑state mismatch |

---

### 3.3 Hypothesis/Evidence/Method `HEM‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| HEM‑HYP | Hypothesis | {tentative} | Testable proposition |
| HEM‑EVD | Evidence | {support} | Observation backing/undermining |
| HEM‑DAT | Data | {raw} | Uninterpreted record |
| HEM‑CTX | Counterexample | {refuter} | Instance violating hypothesis |
| HEM‑MTH | Method | {procedure} | High‑level approach |
| HEM‑PRC | Procedure | {stepwise} | Ordered steps |
| HEM‑ALG | Algorithm | {computable} | Finite deterministic routine |
| HEM‑PRT | Protocol | {standard} | Formalised procedure |

---

### 3.4 Reasoning Cluster `RSN‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| RSN‑DED | Deduction | {validity} | Necessitation from premises |
| RSN‑IND | Induction | {generalise} | Pattern extrapolation |
| RSN‑ABD | Abduction | {explain} | Best‑fit hypothesis generation |
| RSN‑ANL | Analogy | {similarity} | Mapping source→target infer |
| RSN‑IRL | InferenceRule | {schema} | Formal derivation pattern |

---

### 3.5 Evaluation Gates `EVL‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| EVL‑VER | Verification | {internal} | Meets spec/logic |
| EVL‑VAL | Validation | {external} | Meets real‑world need |
| EVL‑FAL | FalsifiabilityGate | {Popper} | Reject if counterevidence |
| EVL‑CON | ConsistencyCheck | {coherence} | Non‑contradiction scan |

---

### 3.6 Modal / Mental‑State Tags `MOD‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| MOD‑NEC | Necessity | {◻} | True in all worlds |
| MOD‑POS | Possibility | {◇} | True in some world |
| MOD‑OBL | Obligation | {deontic} | Duty‑bound |
| MOD‑PER | Permission | {deontic} | Allowed |
| MOD‑TMP | TemporalTag | {time} | Past/Present/Future |
| MOD‑EPI | EpistemicTag | {knowledge} | Certainty level |
| MOD‑BEL | Belief | {mental} | Agent accepts p |
| MOD‑DES | Desire | {mental} | Agent wants p |
| MOD‑INT | Intent | {mental} | Agent plans p |

---

### 3.7 Speech‑Act Markers `SPA‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| SPA‑AST | Assertion | {constative} | Claim truth |
| SPA‑REQ | Request | {directive} | Ask action/info |
| SPA‑CMD | Command | {imperative} | Order action |
| SPA‑ADV | Advice | {directive} | Recommend |
| SPA‑WRN | Warning | {directive} | Alert hazard |
| SPA‑PRM | Promise | {commissive} | Commit future act |
| SPA‑APO | Apology | {expressive} | Express regret |

---

### 3.8 Discourse Meta `DSC‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| DSC‑ANN | Annotation | {meta} | Side note |
| DSC‑REV | Revision | {edit} | Modify prior |
| DSC‑SUM | Summarization | {abbrev} | Condense content |
| DSC‑CIT | Citation | {source} | External ref |
| DSC‑CAV | Caveat | {limitation} | Scope warning |

---

### 3.9 Control & Meta Engines `CTL‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| CTL‑BRN | Branch | {if} | Conditional fork |
| CTL‑CND | Condition | {guard} | Boolean filter |
| CTL‑LOP | Loop | {iterate} | Repeat until |
| CTL‑HLT | Halt | {terminal} | Stop execution |
| CTL‑ABD | AbductionEngine | {generator} | Auto‑create hypotheses |
| CTL‑HSL | HeuristicSelector | {search} | Pick best rule |
| CTL‑CRS | ConflictResolver | {merge} | Resolve contradictions |
| CTL‑PDX | ParadoxDetector | {selfref} | Flag liar/loop |

---

### 3.10 Error / Exception `ERR‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| ERR‑CON | Contradiction | {⊥} | p ∧ ¬p |
| ERR‑FAL | Fallacy | {invalid} | Faulty reasoning type |
| ERR‑EXC | Exception | {runtime} | Engine failure |

---

### 3.11 Creative Operations `CRT‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| CRT‑INS | Insight | {aha} | Sudden re‑framing |
| CRT‑DIV | DivergentThought | {brainstorm} | Idea expansion |
| CRT‑COM | ConceptCombination | {blend} | Merge disparate concepts |

### 3.12 Mathematical Reasoning `MTH‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| MTH‑PRF | ProofStrategy | {meta‑proof} | Method to derive theorem |
| MTH‑CON | Conjecture | {open} | Unproven proposition |
| MTH‑UND | UndecidableTag | {Gödel} | Truth value unresolvable |

### 3.13 Cognitive Mechanics `COG‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| COG‑CHN | Chunk | {memory} | Unitised info |
| COG‑SCH | Schema | {frame} | Organised prior knowledge |
| COG‑CLD | CognitiveLoad | {resource} | Working‑memory usage |
| COG‑PRM | Priming | {bias} | Prior activation |
| COG‑INH | Inhibition | {suppress} | Filter interference |
| COG‑THG | ThresholdGate | {attention} | Fire only if salience≥δ |
| COG‑FLU | FluidIntelligence | {gf} | Novel problem solving |
| COG‑CRY | CrystallizedProxy | {gc} | Stored knowledge metric |

### 3.14 Mind Constructs `MND‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| MND‑PHF | PhenomenalField | {qualia} | First‑person content |
| MND‑ACC | AccessConsciousness | {reportable} | Info globally available |
| MND‑ZOM | ZombieArgument | {philosophy} | Absence of qualia test |
| MND‑SUP | SupervenienceTag | {dependence} | Higher‑level on base |
| MND‑EXT | ExtendedMind | {4E} | Mind beyond skull |
| MND‑EMB | EmbeddedProcess | {situated} | Cognition in env |

### 3.15 Non‑Classical Logic `NCL‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| NCL‑REL | RelevanceMarker | {R‑logic} | Enforce premise relevance |
| NCL‑LIN | LinearResource | {⊗} | Consume‑once proposition |
| NCL‑MNV | ManyValued | {Łukasiewicz} | >2 truth degrees |
| NCL‑QNT | QuantumLogic | {orthomodular} | Non‑distributive lattice |
| NCL‑REV | BeliefRevision | {AGM} | Update (K, φ)→K* |
| NCL‑AGM | AGM‑Operator | {∘} | Contraction/revision func |

### 3.16 Dynamic Semantics `DYN‑*`

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| DYN‑UPD | UpdateProcedure | {context} | Modify discourse state |
| DYN‑CSH | ContextShift | {indexical} | Change evaluation world |
| DYN‑REF | DiscourseReferent | {DRT} | Entity slot |
| DYN‑ANA | AnaphoraTag | {coref} | Pronoun link |
| DYN‑CGD | CommonGround | {shared} | Mutual belief store |
| DYN‑PRS | Presupposition | {presup} | Background truth |

---

## 3B Cross‑cutting Deficit Nodes

| Code | UI Label | ⟡Tags | ↦ |
| --- | --- | --- | --- |
| HYB‑NEU | NeuroSymbolicMap | {embedding} | Bridge vector⇄symbol |
| ATT‑ECO | AttentionBudget | {economics} | Allocate cognitive tokens |
| ETH‑BIA | BiasAudit | {fairness} | Detect value distortion |

---

## 3C Cluster‑to‑Palette Mapping

Palette groups list codes; UI filter uses ⟡Tags; engine switch routes by leading prefix (`PROP`, `INQ`, …, `ETH`). Graph JSON `kind` field stores code.

---

### Gap audit complete — ontology now covers creative cognition, advanced maths, psychology, philosophy of mind, non‑classical logics, discourse dynamics, neurosymbolic bridges, attention economics, and algorithmic bias.

---

## 5 Formal Logic Mapping

| NodeKind | Logical Operator / Rule | Truth‑table / Semantics |
| --- | --- | --- |
| `Statement` | atomic proposition **p** | Boolean variable |
| `Deduction` | Modus Ponens | (p → q) ∧ p ⇒ q |
| `FalsifiabilityGate` | Popperian test | Reject H if ∃e : (e ⊨ ¬H) |
| `Necessity` | ◻p true in all accessible worlds | Kripke frame (W,R) |
| `Possibility` | ◇p ≝ ¬◻¬p | dual operator |
| `ConflictResolver` | paraconsistent merge | Priest’s LP semantics |
| `ParadoxDetector` | self‑reference scan | fixed‑point finder on Godel numbering |

---

## 5 Technology Stack

### 5.1 Frontend

- **Framework**: React 18 + TypeScript (lovable.dev standard)
- **Graph**: `react‑flow` with custom node renderers per ontology cluster
- **State**: Zustand (graph), Jotai (form)
- **Styling**: TailwindCSS + shadcn/ui + Radix primitives
- **Icons**: lucide‑react
- **Codegen**: Zod → TypeScript types for ontology

### 5.2 Backend

- **Runtime**: Node 18 + Fastify
- **API**: tRPC for type‑safe RPC
- **DB**: PostgreSQL (Supabase)
- **Cache**: Redis (token buckets, session tables)
- **LLM Gateway**: OpenAI REST (models: `gpt‑4o`, `gpt‑4o‑mini`)
- **Stream Transport**: Server‑Sent Events for partial completions
- **Logic Engine**: custom executor + Z3 proofs via `wasm‑z3`

### 5.3 DevOps

- Container: Docker, multi‑stage (node:18‑alpine)
- Orchestration: Fly.io (api), Vercel (frontend)
- CI: GitHub Actions (lint → type → test → proof → build → deploy)
- Secrets: Doppler injection

### 5.4 Observability

- Sentry (FE+BE), OpenTelemetry traces, Grafana Loki logs, Prometheus metrics
- Alerts: LLM latency > 3 s P95, contradiction rate > 10 %, GitHub push failure

---

## 6 Data Structures

### 6.1 Prisma Models

```
model Flow {
  id         String   @id @default(uuid())
  name       String
  graph      Json
  ownerId    String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  configs    Config[]
}

model Config {
  id            String   @id @default(uuid())
  flowId        String   @index
  systemPrompt  String
  temperature   Float
  modelSlug     String   // gpt‑4o, gpt‑4o‑mini
}

```

### 6.2 Graph JSON

```
{
  "id": "uuid",
  "version": 1,
  "nodes": [
    {
      "id": "uuid",
      "kind": "Hypothesis",
      "label": "H1: All ravens are black",
      "ports": [{ "id": "in", "name": "ctx", "type": "in" },
                { "id": "out", "name": "proof", "type": "out"}],
      "payload": {}
    }
  ],
  "edges": [
    { "id": "uuid", "source": "nodeA", "target": "nodeB", "condition": "truth==T" }
  ]
}

```

---

## 7 Execution Algorithm

```
for node in topologicalSort(graph):
    if node.kind in GATE_KINDS:
        result = evaluateGate(node, ctx)
        if result == FAIL: raise Contradiction
    elif node.kind in ENGINE_KINDS:
        ctx = runEngine(node, ctx)
    else:
        ctx = applyPrimitive(node, ctx)

```

*Edge conditions expressed in Pythonic infix; parsed by PEG; executed in Node VM sandbox.*

---

## 8 GitHub User‑Side Integration

| Step | Action |
| --- | --- |
| 1 | User pastes PAT → `localStorage.githubToken` (AES‑256 encrypted by passphrase) |
| 2 | “Export to GitHub” → POST /api/git/export {flowId} |
| 3 | Backend clones/creates repo `<username>/hermes‑graphs` via user token |
| 4 | Commits `flow‑<uuid>.json`, optional prompt `.md`, pushes branch |
| 5 | Returns PR URL; UI shows toast |

No server‑side storage of tokens.

---

## 9 Security Checklist

1. CSP default‑src 'self'; frame‑ancestors 'none'.
2. OWASP top‑10 scan in CI.
3. Zod validation all inbound JSON.
4. Graph evaluation time‑boxed (worker threads, 3 s max).
5. LLM responses passed through profanity + PII filters.

---

## 10 Testing Matrix

| Layer | Tool | Coverage |
| --- | --- | --- |
| Unit | Vitest | ≥ 95 % ontology, executor |
| Type | `tsc --noEmit` | 100 % |
| Logic Proof | wasm‑z3 | all inference rules |
| UI | Playwright | node drag, edge snap, config modal, SSE display |
| E2E | Cypress | export to GitHub, reload, simulate |

---

## 11 CLI Utility (`hermes`)

```bash
hermes create flow "Raven Paradigm"
hermes add hypothesis --text "All ravens are black"
hermes add evidence --text "Observed white raven"
hermes add gate FalsifiabilityGate
hermes link 1 3
hermes link 2 3
hermes run         # returns gate‑fail, hypothesis rejected
hermes push github # commits to repo

```

Outputs JSON compliant with Graph schema.

---

## 12 Deployment Environments

| Env | URL | DB | LLM | GitHub App |
| --- | --- | --- | --- | --- |
| dev | *.local | docker postgres | mock‑llm | none |
| staging | staging.hermes.ai | Supabase | GPT‑4o | Staging App ID |
| prod | hermes.ai | Supabase prod | GPT‑4o | Production App ID |

Zero‑downtime deploys via Fly deploy hooks.

---

## 13 Roadmap Highlights

- Multi‑tenant CRDT collaboration (Yjs).
- Visual proof tree inspector.
- Paraconsistent mode toggle.
- Ontology marketplace with semantic versioning.
- Native iPad pencil node authoring.

---

## 14 Glossary

| Term | Definition |
| --- | --- |
| **Ontology Node** | Graph vertex labelled by `NodeKind`, encapsulating semantic function. |
| **Gate** | Boolean filter applying logical or empirical test to upstream assertions. |
| **Engine** | Active component that synthesises or resolves content (abduction, paradox). |
| **Modal Tag** | Unary operator adding accessibility‑relation metadata. |
| **Speech‑Act Marker** | Pragmatic wrapper aligning output with conversational intention. |
| **lovable.dev** | React+Tailwind SaaS IDE hosting and authenticating the builder. |
| **PAT** | GitHub Personal Access Token, client‑side only. |

---

**Auth source ⇒ for testing session based , based on your api keys provided at the start. the flow is the same where the front page is gated expecting a correct api key.**

every time you log out it restarts. download to github or downlad as .md to save progress. no user accounts. BYOK each run. users must independently have their own api keys.

they source their keys from openai or their service provider. we provide a form at the start, where users input their api keys, choose the providers we support. use openai defaults, and let users change if they need to: url to send to api, and other basic settings, nothing too complicated. we use openai framework and many companies do so to with just using a different url which is great.

---

user flow ⇒ opens site ⇒ inputs api keys for venice ⇒ opens clean dashboard with the tools to start a flowchart system for logic and ai reasoning. ⇒ uses platform ⇒ save to computer by downloading or by uploading to github.

[extract prompt] ⇒ Download-to-computer/Upload-to-Github

high material design, clear design, visually appealing, high value, masterpiece, magnum opus.

millers law for modular ux ui. Palette collapsed into ~8 groups sets. this is for everything in general as a rule of thumb. octaves are a brand element too indicative of a hyper reasoning engine.

---

mouse keys layout shortcuts to be simple and intuitive for now at the mvp but with room to improve. need zoom redo undo fit copy-paste and more!

---

databases are used for our ontology and semantic framework. users 

if possible reloading should not affect data but its saved on the browser/user side and at their own risk and expense.

---

we should have a Minimum viable set of ontology nodes 

however, we need to keep the full list in the files and server so that it is easier to make and start testing and developing.

---

LLM interactions:

1. For testing the LLM ⇒ flow chart or logic chart or semantic chart is converted into text, then passed to the ai as system prompt and instruction set.
2. second way to test ai is token classifier mode. where you enter a small query , limit to 250 words. and it is passed to an ai with a system prompt (we need to properly define this) that will prompt the ai to classify the prompt in the way of the flowchart. so its a converter from text into flowchart.

---

```
### SYSTEM PROMPT: FlowExecutor‑v1  (Graph→Prompt mode)

You are a deterministic reasoning micro‑kernel exposed through a large‑language‑model API.

Input payload = JSON object:

{
  graph:   <Semantic‑Logic AI Workflow graph JSON v1>,
  config:  {temperature: <float>, modelSlug: "<id>"},
  ctxInit: <arbitrary JSON or null>
}

Ontology enumeration keys follow 3–4‑letter codes (PROP‑*, RSN‑*, CTL‑*, …).
Each node kind maps to a *handler*:

- PROP‑*   → `assertProp(node, ctx)`
- RSN‑*    → `infer(node, ctx)`
- EVL‑*    → `gate(node, ctx)`
- CTL‑*    → `control(node, ctx)`
- ERR‑*    → `raiseError(node)`

Execution rules:

1. Topological order; respect edge guards (`condition` field, JS‑safe Boolean, ctx‑scoped).
2. Maintain immutable working memory `ctx`: {symbols, traces, errors}.
3. On Gate fail ⇒ abort run, return `{status:"fail", nodeId, reason}`.
4. On Engine node ⇒ may call this LLM recursively; budget `max_tokens` = 2048 – (#ctx tokens ⋅2).
5. After final node emit:

{

status: "ok",

result: ,

traces: ,

metrics: {tokens_used, latency_ms}

}

Respond **only** with the JSON result, no prose, no formatting.

```

```
### SYSTEM PROMPT: FlowClassifier‑v1  (Text→Graph mode)

You are a linguistic‑to‑ontology transpiler.
Input text ≤ 250 tokens.

Output strict JSON:

{

"version":1,

"nodes":[

{ "id":"n1", "kind":"", "label":"" },

...

],

"edges":[

{ "source":"n1", "target":"n2", "relation":"supports|contradicts|elaborates|causes" }

]

}

Mapping rules:

- Detect statements, claims, questions → PROP/INQ cluster codes.
- Hypothesis/evidence patterns → HEM cluster codes.
- Inferential verbs (“therefore”, “suggests”) → RSN‑* deduction or induction.
- Modal auxiliaries (“must”, “might”) → MOD‑* tags on same node via `"mods":["MOD‑NEC"]`.
- Reject content that does not map; exclude filler tokens.
- Max unique nodes = 15.
- Preserve original technical terms in `label`; truncate >120 chars with ellipsis.

Return **only** the JSON object, without Markdown, comments, or additional text.

```

---

testing suite ⇒ test all usecase, and keep testing to a high 88% approving rate .

errors should handle gracefully, but we should not have errors. we should plan for a solid engine that works without leaks. however common api errors like 500 can occur.

strive for a machine with no leaks , whenever you do surgery on a patient you dont leave him bleeding, this is the same.

return complete masterpiece magnum opus level of work.

---

---