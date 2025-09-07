# FAQ

### Why did a node output look generic?
Usually the node description or fields were too thin. Add a concrete example or clarify intent, then re-run.

### Do edges determine order?
No. They supply upstream context. Order is the visual / creation order. Keep edges meaningful (real semantic linkage) to avoid noise.

### Can I run only part of the workflow?
Create a temporary copy with just the subset of nodes you want, or delete irrelevant nodes and undo afterwards if your environment supports it.

### How do I switch models safely?
Change provider/model in Settings and re-run one or two representative nodes (via execution) to compare tone and structure before a full pass.

### Are ontology nodes mandatory?
No. They just encourage clarity. Mix and match with freeform nodes.

### Why are placeholder nodes harmful?
They dilute context, causing the model to generalize. Remove or fill them before serious execution.

### How do I clear everything?
Use Clear Session for volatile state; manually clear browser storage to remove saved workflows. Export first if you may need the structure later.

### Can I share my workflow with someone else?
Export as JSON (full fidelity) or Markdown (readable narrative). They can re-import JSON if an import feature is available in their build.

Return to: [Getting Started](getting-started.md) · Back to: [User Guide Index](README.md)
