# Security & Privacy

You control what leaves your browser. All meaningful outbound traffic occurs only when you execute, enhance, or convert text to workflow. That sends the relevant node or assembled workflow context to the active model provider you configured.

## Keys
- Stored locally in the browser (session/local storage depending on UI flow).
- Remove a key by clearing it in Settings; no further calls use it.
- Clearing “session” may not wipe stored keys—manually remove them if required.

## What Gets Sent
- Node titles, descriptions, fields, and content for the portion being processed.
- For execution: upstream node outputs are appended as textual context.
- Provider never receives your raw local storage objects beyond what’s in assembled text.

## Keep These Out of Nodes
- API secrets or private tokens (not needed for semantic structure).
- Personal identifying data unless absolutely necessary.
- Large binary data (store elsewhere; summarize instead).

## Hygiene Tips
- Review nodes before exporting or executing.
- Delete abandoned scratch nodes.
- Use concise, factual descriptions—avoid injecting unnecessary sensitive context.

Return to: [Providers](providers.md) · Continue: [FAQ](faq.md)
