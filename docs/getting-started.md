# Getting Started

## Purpose
Represent structured thinking as a graph of nodes so it can be reused, inspected, refined, and injected into model context with precision.

## Core Objects
Node: a labeled unit containing fields (key/value entries) plus optional free text content.
Field: a discrete attribute (title, description, constraints, status, etc.).
Edge: a directional relationship expressing reference or conceptual dependency. Edges do not enforce execution order.
Workflow: the set of nodes and edges currently in focus.
Provider: the model service used for any AI calls (you supply the key).

## Basic Flow
1. Open Builder.
2. Drag several nodes from the palette.
3. Select each node and define a clear title and at least one descriptive field.
4. Connect related nodes (only add edges that clarify meaning).
5. Export to JSON or Markdown to confirm structure.
6. Open Chat and test injection modes to see how structure changes model replies.

## When to Create a New Node
Create a separate node if the information can stand alone, will be reused, or has a distinct lifecycle (e.g., Requirement, Persona, Constraint, Evaluation Criterion).

## Field Strategy
Keep core identity fields near the top (title, role, purpose). Group operational or parameter fields after that. Use concise keys: `goal`, `audience`, `risk`, `apiVersion`, `constraints`.

## Content vs Fields
Use structured fields wherever a value could later be filtered, diffed, or programmatically validated. Reserve free text for narrative or nuanced explanation.

## Persistence
The active workflow is stored in browser storage automatically. Clearing site data removes it. No remote sync is active by default.

## Execution Reality
The built‑in execution runs nodes sequentially and feeds upstream outputs as context. It is best for iterative refinement, not automation chains.

## Chat Injection Overview
Chat can optionally include the serialized workflow (full or stripped) either in the system role or prepended to first user input. Use stripped mode to reduce token usage when the raw node content is sufficient.

## Scaling Your Canvas
* Consolidate: merge overly fine nodes that only repeat context.
* Split: isolate nodes that shift meaning mid‑content.
* Color/type choice: use ontology types for faster scanning.

## Quality Pass Checklist
Titles are specific and unique.
Each node has a primary purpose field.
Edges are minimal and intentional.
Exported JSON passes a quick visual scan (no duplicate or placeholder nodes).

Proceed to Pages Overview when comfortable placing and editing nodes.


