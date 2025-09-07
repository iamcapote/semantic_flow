# Fields & Context

Every node combines four layers of meaning:
1. Title – the concise handle.
2. Description – why it exists / intent.
3. Fields – structured attributes (key/value; arrays or objects where suitable).
4. Content – freeform body (Markdown, JSON, YAML, XML, or plain text).

When you run or enhance, the system assembles a clean textual representation so the model sees a well-ordered snapshot of the node.

## Deciding What Goes Where
Put structured, enumerated, or machine‑parsable info into fields. Use the content block for narrative, examples, or multi-paragraph logic. If you find yourself writing a list like “Parameters: A:…, B:…, C:…”, convert those into distinct fields.

## Field Usage Patterns
- tags: Topical or functional labels (“classification”, “persona”, “scoring”).
- enum / multi select style fields (if present in UI): Mode switches or capability flags.
- object / array: Complex configuration payloads that you still want nested.

## Format Choice
Choose the content format that matches downstream intent:
- Markdown: General instructions, prose, examples.
- JSON: Data shapes, structured config, machine contract drafts.
- YAML: Hierarchical policies or human‑oriented config.
- XML: Less common—use only if you plan to consume it that way elsewhere.

## Keeping Nodes Lean
Shorter is clearer. Split a node if:
- Description is doing two unrelated jobs.
- Content grows into multiple independent conceptual blocks.
- You want to re-use part of it downstream without copying everything.

## Before Execution
Skim each node: Title precise? Description crisp? Fields populated? Content free of placeholders? Adjust, then execute.

Return to: [Ontology Overview](overview.md) · Continue: [Run a Workflow](../features/workflow-execution.md)
