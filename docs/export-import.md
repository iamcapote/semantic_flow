# Export & (Re)Use

Export whenever you need to reuse the structure outside the app (system messages, prompt libraries, specs, onboarding docs, prototypes).

## Formats
JSON
- Machine-friendly; preserves full fidelity (ids, metadata, fields, edges).

YAML
- Human-scannable; good for config handoffs or policy packs.

Markdown
- Readable narrative blend; embeds node content in a linear document—handy for documentation or sharing context via chat.

XML
- Only choose this if a downstream consumer expects structured XML.

## How to Export
1. Open the Builder (or any page with the header export menu).
2. Click Export.
3. Choose format; a download starts automatically.

## Selecting the Right Format
- Need to round-trip back into the tool later? Prefer JSON.
- Want teammates to skim logic and roles? Markdown.
- Need an editable yet structured draft of config? YAML.
- Interfacing with a system that ingests structured schema? JSON (or XML if mandated).

## Sanity Checklist Before Export
- Titles are consistent.
- No stray placeholder content (“lorem”, “TBD”).
- Sensitive keys or secrets removed (they are not needed in node content).

## Re-Importing
If an import feature is provided in your build, load a JSON export to continue where you left off. Otherwise keep a version history manually by saving dated exports.

Return to: [Enhance a Node](features/node-enhancement.md) · Continue: [Providers](providers.md)
