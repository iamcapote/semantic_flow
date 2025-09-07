# Execution Details

Execution processes your workflow one node at a time and shows a step log so you can evaluate structure and clarity.

## What Happens Internally (Conceptually)
1. Each node’s own content and fields are assembled.
2. Outputs from nodes that point into it (incoming edges) are appended as upstream context.
3. That combined text is sent to the active model.
4. The model’s reply becomes that node’s output shown in the results panel.
5. The next node proceeds with its own context augmented by any upstream outputs.

## Reading the Output Stream
You’ll see lines for:
- Start (execution begins)
- Node started (processing a specific node)
- Node completed (with a rendered snippet)
- Errors (if a single node fails; others continue)
- Final summary (counts of completed nodes)

## Improving Results Iteratively
After a run:
- Weak or generic outputs usually mean the source node is vague—sharpen the description or add example fields.
- Repeated patterns across nodes often indicate you duplicated redundant context; consolidate or break apart nodes strategically.
- Missing nuance: add an explicit constraint or evaluation node upstream.

## When to Re-Execute
Re-run after any structural change (adding nodes, relabeling edges, splitting a large node) to verify context flow still makes sense.

## Performance Hygiene
- Remove placeholder nodes before executing to reduce noise.
- Keep large raw dumps (logs, transcripts) in separate nodes flagged clearly so they don’t drown more critical semantics.

Return to: [Run a Workflow](features/workflow-execution.md) · Continue: [Enhance a Node](features/node-enhancement.md)
