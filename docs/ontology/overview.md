# Ontology

Purpose: organize node intentions into recognizable semantic categories so large canvases remain readable and injection context stays consistent.

Benefits of using specific types instead of a generic “Note” everywhere:
* Faster scanning (color and label cues)
* Natural grouping of reasoning or evidence clusters
* More precise mental model when reading exported JSON/Markdown

Recommended starting subset:
Idea / Proposition, Constraint, Source / Reference, Persona, Evaluation Criterion.

Expansion path: add Method, Evidence, Risk, Mitigation, Policy, Metric, and Decision nodes when the workflow needs deeper analytical structure.

Field augmentation: when free text repeatedly contains structured tokens (e.g., priority: high, owner: design), promote them to dedicated fields for clearer downstream use.

Edge neutrality: choosing a type does not alter execution or ordering; it only changes semantics communicated to readers or models.

Pruning strategy: if two adjacent nodes continuously travel together (always referenced jointly), merge them unless separation improves reuse or clarity.


