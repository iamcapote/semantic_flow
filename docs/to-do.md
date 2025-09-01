# Semantic Flow — To‑Do and Change Log

A living checklist for refactors, GUI redesign, and build fixes. Append new entries at the bottom with UTC timestamps.

## Open Tasks
- [ ] Restore stable build (Tailwind/PostCSS) and blank page fix
- [ ] Win95 Suite: Flow Builder, Flow IDE, Console, Win95 Chat — polish and integrate
- [ ] Admin panel for configuration (providers, SSO, Discourse settings)
- [ ] SSO (Discourse) wiring and gated Discourse tab
- [ ] Ontology updates: add crypto node types, keep templates generic
- [ ] Theme controls: background/node color customization in Flow builder
- [ ] Tests: smoke + unit coverage for new modules

## Notes
- Do not remove existing features; reorganize safely.
- BYOK remains: keys only in session storage (encrypted), never persisted.

## Log
- 2025-09-01T19:45:00Z — Fixed Tailwind/PostCSS build by switching to postcss.config.cjs and pinning tailwindcss 3.x.
- 2025-09-01T19:56:00Z — Patched missing npm package files (dlv, extend) via postinstall script to stabilize build environment.
- 2025-09-01T20:05:00Z — Added Win95 Suite page and route (/win95) and navigation entry.