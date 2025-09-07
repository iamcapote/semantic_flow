# Pages Overview

Use this reference when deciding which screen to open next. Each page has a distinct role; switching does not destroy your existing workflow unless you clear storage manually.

## Landing (`/setup` or entry)
Purpose: Provide an initial jump-off. Add a key, read a summary, proceed to Builder or Learn. If you already configured a key you may be routed directly into the suite.

You use it to:
- Paste provider key(s)
- Orient yourself the first time

## Builder (`/builder`)
Purpose: Primary canvas for creating and organizing nodes (+ edges). This is where most structural thinking happens.

Key Regions:
- Left Palette: Drag node types (semantic, utility, blank).
- Canvas: Place, select, connect. Click a node to edit its fields & content.
- Header: Title input, Export menu (JSON/YAML/Markdown/XML), Settings (keys/system message), Clear Session.
- Execute Button (in canvas tools): Runs nodes in sequence and streams results.

When to stay here: Early drafting, restructuring, high‑level planning, adding or pruning nodes.

## IDE (`/ide`)
Purpose: Text-oriented view (if included in your build) allowing batch review or editing of the underlying serialized workflow. Useful for scanning or copying larger structures.

You use it to:
- Inspect raw JSON / DSL forms
- Perform quick global edits then return to Builder

## Router / API (`/api` or `/router`)
Purpose: Central place to assemble active context sets (personas, seeds, policies) and test Text → Workflow, Execute Workflow, or Enhancement operations in a controlled panel.

You use it to:
- Convert a free-form spec into a starter workflow
- Run a workflow in a chosen output format (e.g. JSON execution transcript)
- Enhance nodes and apply changes back

## Chat (`/chat`)
Purpose: Direct conversational testing with the active provider using your system message. Lightweight, not context-saturated beyond what you supply.

You use it to:
- Probe a model quickly
- Sanity check provider response quality

## Console (`/console`)
Purpose: Quick single-run surface to execute the saved workflow, enumerate nodes, and export fast without leaving a compact terminal-like panel.

You use it to:
- Run a quick execution
- List nodes/edges for inspection

## Learn (`/learn`)
Purpose: High-level orientation and quick-start guidance. Short explanations, not exhaustive.

You use it to:
- Understand core vocabulary
- Jump to docs browser

## Docs (`/learn/docs`)
Purpose: Complete in‑app documentation (this guide set). Left menu lists every topic. Content scrolls; menu is fixed length (no internal scroll needed).

You use it to:
- Deep dive on node types, execution, exports, security
- Revisit how to use features without guessing

## Discourse (`/discourse`)
Purpose: Link or configure discourse-related context (if enabled for your environment). Used when integrating forum-sourced personas or seeds.

## Retro Suite (`/` → App Shell)
Purpose: Unified Win95‑styled environment hosting the above views as tabs/windows (depending on configuration). Provides consistent theme, icons, and navigation.

Return to: [Getting Started](../getting-started.md) · Continue: [Ontology Overview](../ontology/overview.md)
