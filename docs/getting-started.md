# Getting Started

Use this page to go from zero to a working workflow in minutes.

## Prerequisites
- Modern browser (Chrome/Firefox/Edge)
- Optional: Accounts/API keys for your preferred AI provider (e.g., OpenAI)
- Optional: Discourse instance and SSO secret if you want Discourse-backed features

## 1. Add a Provider Key
Open any page header “Settings” / key modal. Paste an API key (e.g. OpenAI). Provider becomes active. You can switch providers later without losing the canvas.

## 2. Open the Builder
Navigate to the Builder (tab or direct route `/builder`). You now see:
- Left: Node Palette (grouped types; you can also start with Blank nodes).
- Center: Canvas (empty space to place nodes).
- Top Bar: Title field, Export menu, Settings, Theme toggle, Clear Session.

## 3. Place Your First Nodes
Drag a node type onto the canvas. Click it to edit:
- Title (what it is)
- Description (purpose)
- Fields (structured attributes)
- Content (freeform body respecting a format: Markdown / JSON / YAML / XML)

Keep nodes focused: one concept, contract, instruction, persona, or reference per node.

## 4. Link Nodes
Create edges to show reference or dependency of meaning (not execution order). Upstream node outputs are appended as context when executing downstream nodes.

## 5. Execute (Preview Reasoning)
Press Execute. The system walks nodes in their current order and sends contextualized prompts. You see a running log (start → per node result → complete). Adjust content and re-run as needed.

## 6. Enhance a Node (Optional)
Open a node enhancement option (modal if provided in UI) and choose a style like Improve or Simplify. Review the rewritten content and apply if acceptable.

## 7. Export
Use Export menu to download JSON / YAML / Markdown / XML. These formats mirror the live structure so you can reuse them elsewhere (system messages, specs, docs, prototypes).

## 8. Continue Building
Iterate: Add nodes for roles, constraints, evaluation checks, data shapes, examples, transformations, or meta commentary. Link logically. Keep labels short and descriptions precise.

## Persistence
Current workflow auto-saves locally. Clearing session removes volatile state (provider selection, system message) but not the saved workflow unless you manually clear storage.

> Note
> AI provider keys are stored only in your browser session (encrypted). SSO (if enabled) is cookie-based and never stores your provider keys.

## When to Use Text → Workflow
If you have a raw paragraph spec, feed it through the Text → Workflow feature (where available). It drafts an initial structure you refine manually.

## Next
- Read the [Pages Overview](pages/overview.md) to understand each screen.
- Study the [Ontology Overview](ontology/overview.md) to pick better node types.
- Consult [Providers](providers.md) if switching models.

Proceed to: [Pages Overview →](pages/overview.md)
