# FAQ

**Executions are sequential. Why?**  Current design favors transparency and simplicity for refinement passes. Parallel dependency resolution is not active.

**Do edges control order?**  No. They supply upstream context only.

**How do I keep prompts short?**  Trim verbose narrative fields, switch Chat injection to stripped, and merge low‑value nodes.

**Can I recover a past workflow version?**  Export routinely; the application does not maintain historical versions.

**Why did execution skip a node’s expected dependency?**  Because ordering is linear; ensure dependent nodes appear earlier or manually adjust.

**Are ontology types mandatory?**  No. They improve readability but freeform nodes function.

**Where are my keys stored?**  Local browser storage only.

**Can I view a diff after enhancement?**  Not internally; copy original content before running if you need manual comparison.

**Why is a model response empty or truncated?**  Provider token limits or filtering. Retry with a more concise node context or a different model.

