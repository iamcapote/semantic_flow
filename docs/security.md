# Security & Key Management

API keys are stored locally in browser storage under provider‑specific entries. Removing site data or using a clear session control deletes them. Keys are sent only to the chosen provider’s HTTPS endpoint during requests.

User content (nodes, fields, exports) remains local unless a provider invocation includes it as part of a prompt. Avoid placing secrets or regulated data into node content or fields intended for model injection.

Operational precautions:
* Never paste provider keys into node fields.
* Exclude or redact proprietary data before running enhancement or execution on large canvases.
* Regularly clear stale workflows containing sensitive temporary context.

Recommended practices for stricter environments (if deploying a managed instance): server‑side key proxy, encryption at rest for any cached context, strict CSP and referrer policies, optional audit logging of export actions.

