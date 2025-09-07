# Enhance a Node

Use enhancement when a node’s content is serviceable but weak—too wordy, vague, inconsistent in tone, or underdeveloped.

## What It Does
Sends the node’s serialized content plus a style directive to the model. Returns a rewritten version for you to optionally accept.

## Available Styles
- Improve: General clarity + strength.
- Optimize: Tighter, removes fluff, keeps intent.
- Refactor: Reorganizes structure for readability.
- Enhance: Enriches with detail and precision.
- Simplify: Shorter, plainer language.
- Elaborate: Expands with additional depth.

## How To Use
1. Select a node (via canvas modal or enhancement action where provided).
2. Choose a style.
3. Submit. Wait for the enhanced content to appear.
4. Compare quickly (original vs enhanced if diff UI is provided or by pasting temporarily elsewhere).
5. Accept (replace content) or discard.

## Good Candidates
- Long rambling descriptions
- Nodes with placeholders like “TBD” or “Refine this later”
- Inconsistent tone across related nodes (personas / constraints)

## Avoid Over-Enhancing
Repeated enhancement on already-clean content can introduce verbosity. Stop when the node is clear, specific, and minimal.

## Troubleshooting
- Empty result: Try a different provider or a less aggressive style (e.g. Improve instead of Enhance).
- Overly flowery rewrite: Use Simplify to bring it back down.

Return to: [Run a Workflow](workflow-execution.md) · Continue: [Export / Import](../export-import.md)
