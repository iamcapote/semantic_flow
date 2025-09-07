# Pages Overview

## Builder (/builder)
Primary workspace. Left palette lists available node types. Drag to canvas. Select a node to edit fields and free text. Create edges by dragging from a handle or connector. Use for assembling structured knowledge, requirements, prompt components, personas, evaluation criteria, and API shapes.

Keyboard tips (if enabled in your build): Delete removes a selected node; basic zoom via mouse wheel.

Leave Builder when you need bulk text edits or want to inspect the raw unified structure.

## IDE (/ide)
Structured textual view of the current workflow. Supports faster batch editing of titles, field values, or content blocks. Use to clean naming conventions, collapse redundant nodes, and verify exported representations (JSON / YAML / Markdown / XML) match expectations.

## Chat (/chat)
Multi‑conversation chat with optional workflow injection. Manage multiple threads, rename conversations, and control injection mode:
* None: plain messages.
* System: workflow appended to system prompt.
* First: workflow prepended to first user message.
Selection mode (full vs stripped) controls whether auxiliary metadata is included. Use Chat to test clarity and completeness of your workflow: the higher the model’s alignment to intended output, the more coherent your structure likely is.

## Console (/console)
Lightweight inspection and single inference interface. Faster to load than full chat for quick checks. Use to test a workflow snapshot or verify an export without context noise.

## Router / API (/api)
Provider selection, model choice, staged message assembly, workflow export utilities, text → workflow conversion, node enhancement operations. Establish base parameters here before jumping back to Builder or Chat.

## Learn (/learn)
Overview and orientation. Use at first contact or when introducing another user. Links out to the full documentation browser.

## Documentation Browser (/learn/docs)
Left navigation tree of all guide topics rendered inline. Remains within application style; no external navigation required.

## Discourse (/discourse) (conditional)
Integrates a Discourse community space: pull topic summaries, seed shared context, reference collaborative briefs. Appears only if configured.

## Win95 Suite Shell
The retro multi‑tab environment that hosts Builder, IDE, API/Router, Chat, and Console. Direct route access simply preselects a tab.

## Usage Guidance
Add nodes only when they add clarity. Prefer concise field keys. Keep edge network sparse; dense edge webs reduce readability. Periodically export to ensure external representation matches intent.


