# Text → Workflow

Turn a raw paragraph or requirement list into an initial structured workflow you can refine.

## When To Use
- You have an unstructured spec and don’t want to place 15 starter nodes manually.
- You’re exploring possible structure for a new domain.

## What It Produces
- A set of nodes (labels + content areas) and edges suggesting relationships.
- Sometimes minimal content requiring refinement—treat it as scaffolding.

## How To Run
1. Open the Router / API panel (or the feature location provided in the UI).
2. Paste your raw spec into the Text → Workflow input.
3. (Optional) Choose ontology inclusion mode if available:
  - Force Ontology: Prefer known node types.
  - Novel: Allow new category labels if no clear match.
  - Exclude: Freeform nodes only.
4. Press Generate.
5. Review the resulting draft; send accepted nodes to the canvas.

## Refining After Generation
- Rename vague node titles for clarity.
- Merge redundant nodes (delete one, enrich the other).
- Add missing linking edges to complete semantic context.
- Enhance individual nodes for tone or specificity.

## Tips
- Short, clean input specs create tighter node sets.
- If output is too generic, add explicit roles or constraints in the input text.
- Re-run with Exclude mode if you want purely freeform categories.

Next: [Run a Workflow](workflow-execution.md)
