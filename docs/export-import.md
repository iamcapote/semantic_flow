# Export / Import

Supported export formats: JSON, YAML, Markdown, XML. Use JSON for programmatic reuse, Markdown for readable briefs, YAML when embedding in configuration workflows, XML only if integrating with XML‑centric pipelines.

Canonical JSON outline:
id, metadata (title, createdAt, updatedAt), nodes[], edges[]. Each node contains data: label, type, fields (array of name/type/value), content, optional metadata.

Export usage patterns:
* Snapshot before major refactor (archive the JSON).
* Generate a Markdown brief for stakeholders without exposing internal UI.
* Produce YAML for downstream templating or static site generation.

Import (if enabled in your build) should target a clean canvas to avoid duplicate IDs; otherwise manually reconcile.

Pre‑AI sanitization removes extraneous UI artifacts so only meaningful semantic content reaches a model.

