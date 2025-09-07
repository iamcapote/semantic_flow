# Architecture Overview

Semantic Flow is a client-centric React application with modular libraries for semantic graph modeling, AI prompting, execution orchestration, and import/export.

```
UI (React Components)
  ├─ Pages (routes)
  ├─ Builder Canvas (LabCanvas, NodePalette)
  ├─ Modals (Configuration, Enhancement, Export)
  └─ Retro Themes (Win95 variants)

Core Logic (src/lib)
  ├─ promptingEngine.js (LLM interaction strategies)
  ├─ aiRouter.js (normalized chatCompletion abstraction)
  ├─ WorkflowExecutionEngine.js (sequential execution)
  ├─ nodeModel.js (field normalization + context serialization)
  ├─ ontology.js (semantic node types + clusters)
  ├─ graphSchema.js (workflow schema factory + id generation)
  ├─ exportUtils.js / importUtils.js (format serialization)
  ├─ sanitizer.js (safe content extraction for AI)
  ├─ providerCatalog.js / providerConfig.js (metadata & persistence)
  ├─ security.js (SecureKeyManager abstraction)
  └─ workflowBus.js (event channel / future real-time hooks)

Persistence
  - localStorage: current workflow, saved workflows by id
  - sessionStorage: active provider, model defaults, system message, base URLs

AI Provider Layer
  - Uniform interface: `chatCompletion(providerId, apiKey, { model, messages })`
  - Extensible provider list embedded in `PromptingEngine.providers` (override baseURL via sessionStorage)

Execution Data Flow
User Action → UI Handler → WorkflowExecutionEngine → PromptingEngine → aiRouter → Provider HTTP API → Response → UI Progress Feed

Security
- API keys stored client-side via `SecureKeyManager` (abstraction allowing future encrypted storage / remote vault).

Theming & UX
- Tailwind CSS + custom Win95 theme overlays.
- Reusable UI primitives under `components/ui/` (largely ShadCN style components).

Extensibility Pivot Points
- Add new node types → extend `ontology.js`.
- Add new provider → append to `PromptingEngine.providers` & update UI provider selection.
- Introduce parallel execution → enhance `WorkflowExecutionEngine.getExecutionOrder` + scheduling logic.
- Validate workflows → implement schema validator before execution.
