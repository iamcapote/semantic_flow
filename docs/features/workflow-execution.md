# Run a Workflow

Execution sends each node (with upstream context appended) to your chosen model and shows a rolling log of progress and outputs.

## Why Run It
- Sanity check: Does your structured context produce coherent intermediate outputs?
- Iterate wording: Adjust weak nodes and re-execute quickly.
- Collect staged outputs for documentation or further prompting.

## Before You Press Execute
Confirm:
- Nodes have meaningful titles + concise descriptions.
- Edges reflect dependency or reference (upstream outputs should logically feed downstream interpretation).
- Sensitive content is removed (you are sending node text to the provider). 

## How To Execute
1. Open the Builder.
2. Press Execute (button in the canvas controls or header depending on layout).
3. Watch the Test / Results panel populate messages:
   - Start notice
   - Per-node start
   - Per-node completion with result snippet
   - Final summary

## Reading the Log
- ✅ Completed: Model returned content.
- ❌ Error: That node failed (usually missing key, rate limit, or formatting issue). Subsequent nodes may still run.
- Upstream Context section (internally assembled) is included in what the model sees for each downstream node.

## Improving Outputs
- If results feel repetitive, reduce redundancy in source nodes.
- If a node output is too generic, enrich its content or add examples fields.
- If outputs drift, tighten descriptions and remove vague filler language.

## Re-Running Safely
You can re-run after edits; previous log entries remain visible for comparison until you clear or refresh.

## Exporting After Execution
Execution does not alter node data. To save structure, use the Export menu (not the log). Copy individual outputs manually if needed.

Next: [Enhance a Node](node-enhancement.md)
