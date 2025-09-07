# Ontology Overview

The ontology is the catalog of predefined node types you can choose from. Using a defined type gives the model clearer intent than a generic freeform node.

Each node type carries:
- A short label (what it is)
- A description (why it exists / conceptual role)
- A cluster (its broader family)
- Optional icon + tags (visual + semantic cues)

You are never forced to use an ontology type; you can still create blank or freeform nodes. However, mixing structured ontology nodes with a few custom ones usually yields the clearest exported context and better model interpretation.

## Clusters (Families)
Clusters group related semantic functions (e.g. Reasoning, Proposition, Evaluation, Creative, Utility, Coding, AI/ML domains, Specialized technical domains). In the palette they help you scan quickly—colors and grouping reduce search friction.

Typical high‑level clusters you’ll notice:
- Proposition / Inquiry: Statements and questions
- Reasoning / Evaluation: Logical operations and quality checks
- Creative / Cognitive: Generative or conceptual shaping
- Control / Utility: Structural, blank, or meta nodes
- Domain sets: AI/ML, Crypto/Web3, Engineering, Bio, etc.

## Choosing the Right Type
Ask: “What role does this node play?” Then pick the closest semantic type. Examples:
- Instructional specification → Reasoning / Constraint style node
- Persona definition → Modal / Role / Agent-related node (or blank with clear title)
- Reference dataset description → Data / Source / Evidence style node
- Output quality checklist → Evaluation cluster node

If nothing fits, use a blank node and label it precisely; you can always refactor later by duplicating content into a better fitting type.

## When to Stay Freeform
- Early brainstorming (speed > taxonomy)
- Experimental domains not covered by clusters
- Temporary scratch content you will delete

## Consistency Tips
- Keep titles short (“User Persona – Analyst”, “Risk Gate – Thresholds”).
- Put rationale or deeper theory in Description, not the Title.
- Use fields for structured attributes (examples, constraints, params) instead of burying them in a long paragraph.

## Impact on Execution
During execution the type label and cluster help shape the model’s expectation of that node’s purpose, reinforcing clarity without extra verbosity.

Return to: [Pages Overview](../pages/overview.md) · Continue: [Fields & Context](node-context.md)
