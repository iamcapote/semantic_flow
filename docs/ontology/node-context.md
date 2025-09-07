# Node Context

Definition: the serialized textual form of a node used for model prompting and exports. It combines identity, supporting fields, and explanatory content, adapting to the node’s declared language.

Construction logic (practical understanding):
1. Pick title, description, content from either explicit fields or top‑level values.
2. Omit core keys from the custom field block to avoid duplication.
3. Render according to language mode:
   * Markdown: heading + optional description + bullet list of remaining fields + freeform notes section.
   * JSON/YAML/XML: structured object with header, description, fields object, and content.

Field type overview (user impact):
text / longText for narrative, number and boolean for quantifiable gates, enum / multiEnum for controlled vocabularies, object / array for small embedded structures, tags for quick filtering lists, file for referencing external assets, fileFormat to influence serialization.

Validation guidance:
Keep numeric fields numeric (avoid embedding units in the same field; use a companion field if needed). Restrict enum sets to fewer than ~12 values for usability. Use tags for unbounded labeling rather than expanding enum lists indefinitely.

Prompt efficiency tips:
Strip redundant prose from content if fields already capture it. Prefer concise structured fields plus one clarifying paragraph instead of multiple overlapping paragraphs.

