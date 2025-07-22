
# Codebase Surgery Checklist (Frontend-Only MVP)

## ✅ KEEP (Required for Frontend-Only App)

- [ ] `/src/` — All frontend React code.  
  - Remove: `/src/integrations/supabase/` (delete this folder)
  - Remove any backend, server, or database code inside `/src/`
- [ ] `/public/` — Only static assets and `/public/index.html`
- [ ] `/package.json` — Project dependencies and scripts
- [ ] `/vite.config.js` — Vite build config
- [ ] `/README.md` — Main documentation
- [ ] `/REFRACTOR_PLAN.md` — Refactor plan doc
- [ ] `/tests/` — Only keep tests for frontend React components and BYOK provider logic.  
  - Delete: `/tests/e2e/`, `/tests/integration/`, `/tests/manual/`, `/tests/setup/`, `/tests/unit/` (if not frontend/provider logic)
  - Delete any test files that import backend/server code
- [ ] `/tailwind.config.js` — Tailwind config
- [ ] `/postcss.config.js` — PostCSS config
- [ ] `/jsconfig.json` — JS config (if used for path aliases or tooling)
- [ ] `/.env`, `/.env.example` — Environment files
- [ ] `/.eslintrc.cjs` — ESLint config


## ❌ DELETE (Remove Completely)

- [ ] `/server/` — All backend/server code
- [ ] `/supabase/` — All Supabase config/code
- [ ] `/prisma/` — All database code
- [ ] `/docker-compose.yml` — Docker config
- [ ] `/quick-deploy.sh` — Deployment script
- [ ] `/verify-repo.sh` — CI/CD script
- [ ] `/coverage/` — Test output
- [ ] `/test-results/` — Test output
- [ ] `/CODEBASE_SURGERY_SUMMARY.md` — Old surgery summary
- [ ] `/DEPLOYMENT.md` — Deployment doc
- [ ] `/DOCUMENTATION.md` — Old documentation
- [ ] `/newplan.md` — Old plan doc
- [ ] `/components.json` — Unused config
- [ ] `/index.html` (if not in `/public/`)
- [ ] `/bun.lockb` — Bun lockfile
- [ ] `/babel.config.cjs` — Babel config
- [ ] `/gpt-engineer.toml` — Unused config
- [ ] `/jest.config.cjs` — Jest config
- [ ] `/junit.xml` — Test output
- [ ] `/jest-results.json` — Test output
- [ ] `/provider-settings-test-result.json` — Test output
- [ ] `/test_plan.md` — Old test plan
- [ ] Any other root files not listed in KEEP

---

## INSTRUCTIONS (Step-by-Step)
1. **Start at the root of the repo.**
2. For each file/folder in the DELETE list above:
   - If it contains any code, config, or logic that might be useful for future refactoring, copy the relevant snippet or note into the "Snippets and Notes" section below before deleting.
   - Delete the file/folder.
3. For `/src/` and `/tests/`, open each subfolder and file:
   - Remove anything related to backend, server, database, or Supabase.
   - Only keep React components, BYOK provider logic, and related tests.
4. When finished, only the KEEP list should remain. The app should still build and run with `npm run dev` or `npm run build`.
5. Update `/README.md` to reflect the new frontend-only architecture.

---

## Snippets and Notes

Based on your request and the current state of CODEBASE_SURGERY_ROUTING.md, here is a validated, evidence-based list of all files in your workspace that are referenced in the checklist (KEEP and DELETE sections), with their actual presence confirmed:

## ✅ KEEP (Required for Frontend-Only App)
All of these files/folders exist in your workspace:

- `/src/`  
  - Contains all frontend React code, including components, pages, and BYOK logic.
  - Contains `/src/integrations/supabase/` (to be deleted).
- `/public/`  
  - Contains static assets and `/public/index.html`.
- `/package.json`
- `/vite.config.js`
- `/README.md`
- `/REFRACTOR_PLAN.md`
- `/tests/`  
  - Contains unit, integration, e2e, manual, and setup test folders/files.
- `/tailwind.config.js`
- `/postcss.config.js`
- `/jsconfig.json`
- `/.env.example` (no plain `.env` found, only `.env.example`)
- `/.eslintrc.cjs`

## ❌ DELETE (Remove Completely)
All of these files/folders also exist in your workspace and are safe to delete for a frontend-only app:

- `/server/`  
  - Contains backend/server code, including API, routers, services, and context.
- `/supabase/`  
  - Contains Supabase config/code.
- `/prisma/`  
  - Contains database code.
- `/docker-compose.yml`
- `/quick-deploy.sh`
- `/verify-repo.sh`
- `/coverage/`
- `/test-results/`
- `/CODEBASE_SURGERY_SUMMARY.md`
- `/DEPLOYMENT.md`
- `/DOCUMENTATION.md`
- `/newplan.md`
- `/components.json`
- `/index.html` (in root, not `/public/`)
- `/bun.lockb`
- `/babel.config.cjs`
- `/gpt-engineer.toml`
- `/jest.config.cjs`
- `/junit.xml`
- `/jest-results.json`
- `/provider-settings-test-result.json`
- `/test_plan.md`

## Additional Notes
- `/package-lock.json` is present but not referenced in the checklist. Usually, you want to keep this for dependency locking.
- `/LICENSE`, `/.gitignore`, and other meta files are present but not referenced. These are typically kept for open source/compliance reasons.
- `/src/integrations/supabase/` exists and should be deleted as per instructions.
- `/tests/` contains many subfolders. Only keep tests for frontend React components and BYOK provider logic; delete all others as specified.

If you need a breakdown of which files in `/tests/` or `/src/` are backend-related or not, or want a list of all files in any specific folder, let me know!Here is a validated, CTO-level summary of which files in your codebase are required for a production frontend-only React+Vite+Tailwind+Jest+BYOK app, and which are not. This is based on direct evidence from your codebase:

---

## ✅ KEEP (Required for Frontend-Only App)

- src — All frontend React code.
  - Remove: supabase (not used in frontend-only, BYOK logic is in security.js)
  - Remove any backend/server/database code inside src (none found, all code is frontend or BYOK)
- public — Only static assets and `/public/index.html`
- package.json — Project dependencies and scripts
- vite.config.js — Vite build config
- README.md — Main documentation
- REFRACTOR_PLAN.md — Refactor plan doc
- tests — Only keep tests for frontend React components and BYOK provider logic.
  - Delete: e2e, integration, manual, setup, unit (if not frontend/provider logic)
  - Delete any test files that import backend/server code
- tailwind.config.js — Tailwind config (used in index.css)
- postcss.config.js — PostCSS config (used by Tailwind and Vite)
- jsconfig.json — JS config (used for path aliases/tooling)
- .env, .env.example — Environment files (used in code and tests)
- .eslintrc.cjs — ESLint config (used in code and for linting)
- babel.config.cjs — Babel config (used by Jest and build)
- jest.config.cjs — Jest config (used for all frontend tests)

---

## ❌ DELETE (Remove Completely)

- server — All backend/server code (not used by frontend)
- supabase — All Supabase config/code (not used by frontend)
- prisma — All database code (not used by frontend)
- docker-compose.yml — Docker config (not used by frontend)
- quick-deploy.sh — Deployment script (not used by frontend)
- verify-repo.sh — CI/CD script (not used by frontend)
- coverage — Test output
- test-results — Test output
- CODEBASE_SURGERY_SUMMARY.md — Old surgery summary
- DEPLOYMENT.md — Deployment doc
- DOCUMENTATION.md — Old documentation
- newplan.md — Old plan doc
- components.json — Unused config
- index.html (if not in public)
- bun.lockb — Bun lockfile
- gpt-engineer.toml — Unused config
- junit.xml — Test output
- jest-results.json — Test output
- provider-settings-test-result.json — Test output
- test_plan.md — Old test plan
- Any other root files not listed in KEEP

---

**Validation:**  
- All config files in KEEP are referenced in your codebase and/or build/test tooling.
- All files in DELETE are not required for a frontend-only app and are not referenced by the frontend build or runtime.
- No backend/server/database code is used in the frontend app.
- BYOK logic is handled in security.js and related files, not in Supabase/server code.

