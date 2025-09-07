# Workflow Execution

Function: sequentially processes each node, enriching or transforming its content with optional upstream outputs as context.

Operational sequence:
1. Determine execution order (current list order of nodes).
2. Serialize current node context (title, fields, content).
3. Append upstream node outputs in a separated block.
4. Submit to provider model.
5. Capture response and mark completion or error.

Use cases:
* Batch refinement of draft nodes.
* Consistency pass across related definitions.
* Generating elaborations or summaries per node.

Not suited for: conditional branching, parallelism, external side effects, scheduling, or tool invocation.

Optimization guidelines:
Reduce extraneous upstream chains to control prompt length. Remove placeholder nodes before running. Lower temperature for convergence, raise for ideation.

Error handling: node failures are logged and execution continues. Manually re‑run failed nodes after adjustment.


