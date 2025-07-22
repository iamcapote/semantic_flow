Here is a CTO-level AGENTS.md, rewritten as a PRD/scaffold for agents, incorporating your codebase surgery, BYOK, and frontend-only architecture. This version is actionable, precise, and includes all the evidence-based decisions and instructions for working in this repo.

---

# AGENTS.md

## Semantic Flow – CTO/Lead Engineer Agent Scaffold & PRD

---

### Scope & Audience

This file is the canonical guide for all agents (senior, junior, or automated) working in this repository. It defines the architecture, codebase boundaries, and operational rules for maintaining, refactoring, and extending Semantic Flow—a frontend-only, BYOK (Bring Your Own Key) AI workflow builder. All instructions here are mandatory for any code, documentation, or test changes within this repo.

---

## 1. Codebase Philosophy

- **Frontend-Only**: All business logic, provider integration, and UI live in the frontend (src). No backend, server, or database code is present or allowed.
- **BYOK**: Users supply their own API keys for AI providers (OpenRouter, Venice, OpenAI, etc.). No backend stores or proxies keys.
- **Security**: API keys are stored only in browser session/local storage. Never send user keys to a backend.
- **Direct API Calls**: All provider calls are made directly from the browser using the official provider API patterns (see below).
- **React Flow + Ontology**: The core of the app is a React Flow canvas for building semantic workflows, with ontology-driven node types and a palette.

---

## 2. File/Folder Policy

### KEEP (required for a working, maintainable app):

- src – All frontend React code. Remove any backend or supabase code inside.
- public – Static assets, index.html.
- package.json, vite.config.js – Build/deps.
- README.md, REFRACTOR_PLAN.md – Docs.
- tests – Only frontend/provider logic tests.
- tailwind.config.js, postcss.config.js, jsconfig.json, .env.example, .eslintrc.cjs, babel.config.cjs, jest.config.cjs – Tooling/config.

### DELETE (must be removed):

- server, supabase, prisma – All backend/db.
- All deployment/CI scripts (docker-compose.yml, quick-deploy.sh, verify-repo.sh, etc.).
- All test output folders (coverage/, test-results/).
- All root files not required for frontend-only app.
- All test files that import backend/server code.

**If you are unsure about a file, check the codebase and log any useful code in CODEBASE_SURGERY_ROUTING.md before deleting.**

---

## 3. Provider API Integration (BYOK)

- All provider calls must use the official fetch pattern.
- **OpenRouter Example:**
  ```js
  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin, // Optional
      "X-Title": "Semantic Flow", // Optional
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen/qwen3-235b-a22b-07-25:free",
      messages: [{ role: "user", content: "What is the meaning of life?" }]
    })
  })
  ```
- **Venice Example:**
  ```js
  fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "venice-uncensored",
      messages: [{ role: "user", content: "What is the meaning of life?" }]
      // ...other Venice params as needed
    })
  })
  ```
- **OpenAI Example:**
  ```js
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: "What is the meaning of life?" }]
    })
  })
  ```
- Never proxy through a backend.
- All provider config and model lists are hardcoded or managed in the frontend.

---

## 4. Core App Structure

- **React Flow Canvas**: Main UI for building workflows. See LabCanvas.jsx, graphSchema.js, ontology.js.
- **Ontology/Palette**: Node types and clusters are defined in ontology.js and rendered in NodePalette.jsx.
- **Provider Setup**: Users enter/select API keys in ProviderSetup.jsx.
- **Workflow Execution**: AI requests are sent to the selected provider using the BYOK fetch pattern. See WorkflowExecutionModal.jsx, promptingEngine.js.
- **Node Enhancement**: Each node can be enhanced with AI using the same BYOK fetch pattern.
- **Text-to-Workflow**: Users can generate workflows from text using AI (see TextToWorkflow.jsx).

---

## 5. Security and Data Handling

- API keys are stored in sessionStorage or localStorage only.
- Never send user API keys to a backend.
- Clear API keys on logout or session clear.
- Do not store user data or workflows on a backend.
- All user data is local to the browser.

---

## 6. Testing

- Only keep tests for frontend React components and BYOK/provider logic.
- Delete all tests that import backend/server code.
- Tests must validate real app behavior, not just pass for the sake of passing.
- Run all tests after any refactor.

---

## 7. Deployment

- App is deployed as a static frontend (Vercel, Netlify, etc.).
- No backend required.
- .env.example is for local/test/dev only. Do not commit real keys.

---

## 8. Best Practices

- Read code before deleting or refactoring.
- If in doubt, log useful code in CODEBASE_SURGERY_ROUTING.md before deleting.
- Keep the codebase lean, readable, and maintainable.
- Document all major changes in REFRACTOR_PLAN.md.
- If you break the build or tests, fix it before merging.

---

## 9. Troubleshooting

- If the app fails to build or run, check for missing frontend files or accidental deletion of required config.
- If provider calls fail, verify the fetch pattern matches the official docs and the API key is valid.
- If tests fail, ensure they are testing real, current app logic.

---

## 10. Summary Checklist

- [ ] All backend/server/database code is deleted.
- [ ] All provider logic is in the frontend and matches official provider docs.
- [ ] All config files are required and referenced.
- [ ] All tests are for frontend/provider logic and pass.
- [ ] The app builds and runs as a frontend-only React app with BYOK provider integration.
- [ ] Documentation is up to date.

---

## 11. Git & Agent Instructions

- Do not create new branches; commit directly to the current branch.
- Use git to commit all changes. If pre-commit fails, fix issues and retry.
- Leave the worktree in a clean state (no uncommitted changes).
- For every file you touch, obey all AGENTS.md instructions in scope.
- If AGENTS.md includes programmatic checks, run and validate them after all code changes.
- Add citations to PRs as required (see AGENTS.md spec above).

---

**If you are unsure about any file, function, or test, ask for evidence or check the codebase before acting. For questions, see README.md, REFRACTOR_PLAN.md, or ask the CTO.**

---


## 1. **Frontend-Only Architecture: What to KEEP and REMOVE**

### ✅ KEEP (with evidence)
- **src/**: All frontend React code, including:
  - **React Flow**: Present in `src/components/LabCanvas.jsx`, `src/components/NodePalette.jsx`, and related files.
  - **Ontology**: Present in `src/lib/ontology.js`, `src/lib/graphSchema.js`.
  - **Provider logic (BYOK)**: Present in `src/lib/security.js`, `src/components/ProviderSetup.jsx`, `src/lib/promptingEngine.js`, and related files.
  - **Pages**: `src/pages/ChatPage.jsx`, `src/pages/WorkflowBuilderPage.jsx`, etc.
  - **UI**: All components in `src/components/`.
  - **Remove**: `/src/integrations/supabase/` (backend/Supabase, not needed).
- **public/**: Only static assets and `/public/index.html`.
- **package.json**: Project dependencies and scripts.
- **vite.config.js**: Vite build config.
- **README.md**, **REFRACTOR_PLAN.md**: Essential docs.
- **tests/**: Only keep tests for frontend React components and BYOK/provider logic.
  - **Delete**: `/tests/e2e/`, `/tests/integration/`, `/tests/manual/`, `/tests/setup/`, `/tests/unit/` (if not frontend/provider logic).
  - **Delete**: Any test files that import backend/server code.
- **tailwind.config.js**: Tailwind config.
- **postcss.config.js**: PostCSS config.
- **jsconfig.json**: JS config (used for path aliases/tooling).
- **.env, .env.example**: Environment files.
- **.eslintrc.cjs**: ESLint config.
- **babel.config.cjs**: Used by Jest and build (keep if using Jest for frontend tests, which you are).
- **jest.config.cjs**: Used for all frontend tests (keep, as you use Jest for frontend tests).

### ❌ DELETE (with evidence)
- **server/**: All backend/server code (contains routers, services, context, etc.).
- **supabase/**: All Supabase config/code.
- **prisma/**: All database code.
- **docker-compose.yml**, **quick-deploy.sh**, **verify-repo.sh**: Deployment/CI/CD scripts.
- **coverage/**, **test-results/**: Test output.
- **CODEBASE_SURGERY_SUMMARY.md**, **DEPLOYMENT.md**, **DOCUMENTATION.md**, **newplan.md**, **components.json**, **index.html** (if not in public), **bun.lockb**, **gpt-engineer.toml**, **junit.xml**, **jest-results.json**, **provider-settings-test-result.json**, **test_plan.md**: Not required for frontend-only app.

---

## 2. **Direct API Calls for Providers (OpenRouter, Venice AI, OpenAI)**

### **Where provider logic lives (frontend, BYOK):**
- `src/components/ProviderSetup.jsx`
- `src/lib/promptingEngine.js`
- `src/components/WorkflowExecutionModal.jsx`
- `src/components/TextToWorkflow.jsx`
- `src/pages/ChatPage.jsx`
- `src/pages/WorkflowBuilderPage.jsx`

### **How providers are called (current code):**
- **OpenRouter** and **Venice** are called directly from the frontend using `fetch` with user-supplied API keys.
- Example from `src/components/ProviderSetup.jsx`:
  ```js
  if (providerId === 'openrouter') {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', { ... });
  }
  if (providerId === 'venice') {
    response = await fetch('https://api.venice.ai/api/v1/chat/completions', { ... });
  }
  ```
- Models and endpoints are hardcoded in the frontend, matching the BYOK pattern.

### **No backend proxying required:**
- All logic for provider selection, API key management, and API calls is in the frontend.
- No references to backend/server/provider registry in the frontend code.

---

## 3. **Tests: What to KEEP and REMOVE**

### **KEEP:**
- Only tests for React components and BYOK provider logic.
  - Example: `tests/unit/components/ProviderSettings.test.jsx`
  - Example: `tests/unit/components.test.jsx` (tests sessionStorage for API key)
  - Example: `tests/unit/WorkflowExecutionEngine.test.js` (if it only tests frontend logic)

### **REMOVE:**
- All tests that import backend/server code or test backend logic.
  - Example: `tests/integration/api/provider.integration.test.js` (imports from server)
  - Example: `tests/integration/api/user.integration.test.js`
  - Example: `tests/e2e/`, `tests/integration/`, `tests/manual/`, `tests/setup/` (all backend or infra-related)

---

## 4. **Evidence for Config/Tooling Usage**

- **Babel**: `babel.config.cjs` is referenced by Jest and build tooling (keep).
- **Jest**: `jest.config.cjs` is referenced and used for frontend tests (keep).
- **Tailwind/PostCSS**: Both configs are referenced in `index.css` and Vite config (keep).
- **.env/.env.example**: Used for environment variables in code and tests (keep).
- **ESLint**: `.eslintrc.cjs` is referenced for linting (keep).
- **jsconfig.json**: Used for path aliases/tooling (keep).

---

## 5. **Provider API Call Patterns (per docs and code)**

- **OpenRouter**:  
  - Uses `fetch` with `Authorization: Bearer <OPENROUTER_API_KEY>`, `Content-Type: application/json`, and optional headers.
  - Models: `"qwen/qwen3-235b-a22b-07-25:free"`, `"moonshotai/kimi-k2:free"`, etc.
- **Venice AI**:  
  - Uses `fetch` with `Authorization: Bearer <token>`, `Content-Type: application/json`.
  - Model: `"venice-uncensored"`, etc.
- **Your code**: Already matches this pattern in `ProviderSetup.jsx` and related files.

---

## 6. **React Flow and Ontology: Core App Functionality**

- **React Flow**:  
  - `src/components/LabCanvas.jsx` and `src/components/NodePalette.jsx` are the main files for the canvas and node palette.
  - `src/lib/graphSchema.js` and `src/lib/ontology.js` define the ontology and node types.
- **AI Integration**:  
  - AI is used in three ways: to import into the React Flow, inside each node, and at the end to execute the workflow.
  - All of this is handled in the frontend, with no backend/database.

---

## 7. **Summary Table: File/Folder Actions**

| File/Folder                  | Action  | Reason/Evidence                                                                 |
|------------------------------|---------|---------------------------------------------------------------------------------|
| src/                         | KEEP    | All frontend React code, BYOK logic, React Flow, ontology, no backend/server code except supabase      |
| src/integrations/supabase/   | DELETE  | Only used for backend/Supabase, not needed for frontend/BYOK                    |
| public/                      | KEEP    | Static assets and index.html                                                    |
| package.json                 | KEEP    | Project dependencies and scripts                                                |
| vite.config.js               | KEEP    | Vite build config                                                               |
| README.md, REFRACTOR_PLAN.md | KEEP    | Essential docs                                                                  |
| tests/                       | PARTIAL | Keep only frontend/provider logic tests, delete backend/server-related tests     |
| tailwind.config.js           | KEEP    | Tailwind config                                                                 |
| postcss.config.js            | KEEP    | PostCSS config                                                                  |
| jsconfig.json                | KEEP    | JS config for tooling                                                           |
| .env, .env.example           | KEEP    | Environment files                                                               |
| .eslintrc.cjs                | KEEP    | ESLint config                                                                   |
| babel.config.cjs             | KEEP    | Used by Jest/build for frontend tests                                           |
| jest.config.cjs              | KEEP    | Used for frontend tests                                                         |
| server/, supabase/, prisma/  | DELETE  | All backend/server/database code                                                 |
| docker-compose.yml, ...      | DELETE  | Deployment/CI/CD scripts not needed for frontend-only app                       |
| coverage/, test-results/     | DELETE  | Test output, not needed in repo                                                 |
| ... (other root files)       | DELETE  | Not required for frontend-only app                                              |

---

## 8. **Validation and Health Check**

- All provider logic is in the frontend and matches provider docs.
- No backend/server/database code remains.
- All config files are required and referenced.
- All tests are for frontend/provider logic and pass.
- The app builds and runs as a frontend-only React app with BYOK provider integration.

---

## 9. **Key Code Locations for AGENTS.md**

- **Provider API logic**:  
  - `src/components/ProviderSetup.jsx` (main BYOK logic, fetch patterns for OpenRouter, Venice, OpenAI)
  - `src/lib/promptingEngine.js` (AI prompt handling)
  - `src/components/WorkflowExecutionModal.jsx`, `src/components/TextToWorkflow.jsx` (AI workflow execution)
- **React Flow/Canvas/Ontology**:  
  - `src/components/LabCanvas.jsx` (main canvas)
  - `src/components/NodePalette.jsx` (ontology palette)
  - `src/lib/ontology.js`, `src/lib/graphSchema.js` (ontology definitions)
- **Security**:  
  - `src/lib/security.js` (API key storage in session/local storage)
- **Tests**:  
  - `tests/unit/components/ProviderSettings.test.jsx`, `tests/unit/components.test.jsx`, etc. (frontend/provider logic only)

---

## 10. **Provider API Call Patterns (from provider docs, to be included in AGENTS.md)**

**OpenRouter:**
```js
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <OPENROUTER_API_KEY>",
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional
    "X-Title": "<YOUR_SITE_NAME>",     // Optional
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "qwen/qwen3-235b-a22b-07-25:free",
    "messages": [
      { "role": "user", "content": "What is the meaning of life?" }
    ]
  })
});
```

**Venice:**
```js
fetch('https://api.venice.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "model": "venice-uncensored",
    "messages": [
      { "role": "user", "content": "What is the meaning of life?" }
    ],
    // ...other Venice parameters as needed
  })
});
```

---

## 11. **Summary for AGENTS.md**

- The app is a frontend-only React app with BYOK provider integration (OpenRouter, Venice, OpenAI).
- All provider logic, config, and API calls are in the frontend, using the official fetch patterns.
- No backend/server/database code is present or required.
- React Flow and ontology/canvas features are core to the app and must be retained.
- All tests must validate real frontend/provider logic and pass because the app works as intended.
- All config/tooling files are required and referenced.
- The app is ready for live deployment when all tests pass and the app builds/runs as intended.

---

**If you need the exact code for any of the above files, or a file-by-file breakdown of which tests to keep or delete, let me know!**
