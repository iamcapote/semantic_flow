# 🚨 CTO's Surgical Refactor Prompt for Junior Developers 🚨

---

## 🏥 Context: The Patient is the Codebase (#codebase)

You are now part of a high-stakes, mission-critical operation. Our application is a stateless, browser-storage-only AI workflow tool. The original vision is clear: **NO persistent user data, NO backend database for users, providers, or workflows.** All sensitive data (API keys, configs, workflows) must live in the browser (sessionStorage/localStorage) and nowhere else.

**What went wrong?**  
Legacy code and tests introduced backend/database persistence (Prisma, Supabase, SQL) that is NOT needed and is now technical debt. This has caused test failures, confusion, and is blocking us from shipping a healthy, live product.

---

## 🩺 Your Mission

**With surgical precision, you must:**
- Remove all unnecessary backend/database persistence.
- Refactor the codebase and tests to be 100% stateless and browser-storage-only.
- Ensure every modular part of the application is valid, efficient, and fully tested.
- For every refactor, you MUST fix the tests and ensure they pass before moving on.

---

## 🧑‍⚕️ Step-by-Step Surgical Plan

### 1. **Diagnosis: Identify What to Remove or Refactor**

- Search for all uses of `prisma`, `supabase`, `DATABASE_URL`, `findUnique`, `findMany`, `create`, `update`, `delete`, etc. in:
  - #codebase: `/server/`, `/prisma/`, `/tests/integration/`, `/tests/e2e/`, `/src/lib/`, `/src/components/`
- Identify all backend API endpoints and logic that store or retrieve user/provider/workflow data from a database.
- Identify all tests (integration, E2E, unit) that expect backend persistence.

### 2. **Surgical Removal & Refactor**

- Remove or refactor backend code, database schema, and API endpoints related to persistent user, provider, and workflow storage.
- Refactor backend endpoints to be stateless or proxy-only (for CORS or API key security if needed).
- Remove or stub out all Prisma/Supabase/SQL logic that is not required.
- Refactor frontend and backend to use only browser storage for all user/provider/workflow data.

### 3. **Test-Driven Recovery**

- For every file you touch, FIRST update or remove tests to match the new stateless, browser-storage-only architecture.
- Remove or rewrite integration and E2E tests that depend on backend/database persistence.
- Add/keep tests for:
  - Browser storage (sessionStorage/localStorage)
  - UI flows (provider setup, workflow creation, chat)
  - Session management (simulate clearing storage/cookies)
- **After each change, run the relevant test(s) and ensure they pass before moving on.**
- If a test fails, fix the code or the test so that it matches the intended, stateless app behavior.

### 4. **AI API Communication: Triple Verification**

- The app must support and test ALL THREE ways to talk to the AI APIs:
  1. **Direct browser-to-AI API** (with user-provided key)
  2. **Proxy via backend (if needed for CORS/security)**
  3. **Any third-party integration (e.g., Supabase Edge Functions, if present)**
- For each, ensure:
  - The UI allows the user to configure and use the method.
  - The correct API key is used from browser storage.
  - The response is handled and displayed correctly.
  - There are tests (unit/E2E) for each method, simulating real user flows.

### 5. **Manual QA & Edge Case Review**

- Walk through all UI flows to confirm no user data is lost except when browser storage is cleared.
- Validate error handling for missing data (e.g., after clearing cookies).
- Ensure security and privacy: no sensitive data is ever sent to a backend or stored insecurely.

### 6. **Final QA and Documentation**

- Run the full test suite (unit, integration, E2E) to confirm all tests pass in the new, stateless architecture.
- Update documentation to clarify that the app is browser-storage only, with no persistent user data on the backend.
- Document the rationale for this refactor and the lessons learned for future contributors.

---

## 🧑‍🔬 For Junior Developers: Step-by-Step Checklist

1. **Read this plan and the #codebase `README.md` to understand the product vision.**
2. **For each backend or test file you touch, FIRST update or remove tests to match the new stateless, browser-storage-only architecture.**
3. **Remove backend/database code for user/provider/workflow persistence.**
4. **Refactor frontend and backend to use only browser storage for all user/provider/workflow data.**
5. **After each change, run the relevant test(s) and ensure they pass before moving on.**
6. **If a test fails, fix the code or the test so that it matches the intended, stateless app behavior.**
7. **Repeat until all backend/database persistence is removed and all tests pass.**
8. **Run the full test suite and perform manual QA.**
9. **Update documentation to reflect the new architecture.**
10. **Ask for help if you are unsure—do not guess or make random changes.**

---

## 🧑‍💻 For Senior Developers: Technical Details

- **Browser Storage:** All provider configs, API keys, and workflows must be stored in `sessionStorage` or `localStorage`. Use secure, namespaced keys. Never store sensitive data in the backend or in cookies.
- **API Communication:** Ensure all three AI API communication methods are modular, testable, and can be toggled/configured in the UI.
- **Testing:** Use mocks for browser storage in unit tests. Use Playwright or similar for E2E UI flows. Remove all test DB setup/teardown.
- **Security:** Never log or transmit API keys except as required for direct/proxy AI API calls. Clear storage on logout.
- **Code Hygiene:** Remove all unused imports, dead code, and database artifacts. Refactor for clarity and maintainability.
- **Documentation:** Update all relevant docs (#codebase: `README.md`, `newplan.md`, `test_plan.md`) to reflect the new architecture and test strategy.

---

## 🏁 Guiding Principles

- **Tests validate the app, not vice versa.**
- **Evidence-based fixes only.**
- **No random or arbitrary changes.**
- **Codebase must remain healthy and functional.**
- **Deployment only when all tests pass and manual QA is complete.**
- **Every refactor step must be accompanied by test fixes and passing tests before proceeding.**

---

## 🚀 Hype from Your CTO

You are the surgical team saving our codebase. Every line you touch is a life-or-death decision for our product. Move with confidence, precision, and pride. We are building the future of AI workflows—stateless, secure, and blazing fast. Let’s make this patient not just survive, but THRIVE. You got this!

---

#codebase:  
- `/src/` (frontend logic, browser storage, UI flows)  
- `/server/` (backend, to be refactored for stateless/proxy only)  
- `/tests/` (unit, integration, E2E—must be updated for stateless logic)  
- `/prisma/` (remove if not needed)  
- `.env`, `README.md`, `newplan.md`, `test_plan.md` (update docs and configs)

---

**Now, scrub in and start the operation. For every change, TEST FIRST, then refactor, then TEST AGAIN. The patient’s life depends on you.**Summarized conversation history# 🚨 CTO Surgical Refactor & Test Protocol 🚨

## Team, this is your moment. Our codebase is the patient. We are the surgeons. One wrong move and the patient dies. But with precision, discipline, and teamwork, we will save it and make it stronger than ever. This is not just a refactor—this is a rescue mission. Let’s go!

---

## 🧭 Mission Context

- **Product Vision:** Stateless, browser-storage-only, BYOK (Bring Your Own Key). No persistent user/provider/workflow data on the backend. All sensitive data lives in the browser (sessionStorage/localStorage).
- **Current State:** Legacy backend/database code is technical debt. Tests are failing because they expect persistence that should not exist. Our app must be 100% functional, modular, and efficient—every part must work, every test must pass, every feature must be real.

---

## 🩺 Step-by-Step Surgical Plan

### 1. **Codebase Audit & Tagging**
- **Tag all files and systems you touch with #codebase.**
- Identify all backend/database persistence logic (Prisma, Supabase, SQL, server/src/routers, prisma/schema.prisma, etc.).
- Identify all tests (unit, integration, e2e) that depend on backend persistence.
- Identify all frontend code that references backend user/provider/workflow persistence.

### 2. **Test-Driven Refactor Protocol**
- **For every file/component you refactor, FIRST update or remove the related tests.**
- Tests must validate the real, stateless, browser-storage-only app logic.
- **Do not move to the next file/component until all relevant tests pass.**
- If a test fails, fix the code or the test so it matches the intended, stateless behavior.

### 3. **Backend Refactor**
- Remove all backend/database persistence for users, providers, workflows.
- Backend endpoints should be stateless or proxy-only (for CORS/API key security).
- Remove or stub out all Prisma/Supabase/SQL logic.
- If a backend endpoint is needed for proxying, ensure it does NOT store or persist any user/provider/workflow data.

### 4. **Frontend Refactor**
- All provider setup, workflow creation, and chat features must use only browser storage.
- Remove any UI or logic that references backend user profiles or persistent provider configs.
- Simulate clearing browser storage (sessionStorage/localStorage) and ensure the app recovers gracefully (prompts user to re-enter API keys, etc.).

### 5. **Testing: Three Ways to Talk to AI APIs**
- **You MUST test all three ways the app can talk to AI APIs:**
  1. **Direct from frontend (browser fetch/axios to provider API)**
  2. **Via stateless backend proxy (if needed for CORS/security)**
  3. **Via any tRPC or custom abstraction (e.g., trpcVanilla, PromptingEngine, etc.)**
- For each, verify:
  - API key is never leaked or persisted server-side.
  - Session-only storage is enforced.
  - All error cases (invalid key, network error, API error) are handled gracefully.
  - The UI updates correctly and the user is always informed.

### 6. **Comprehensive Modular Testing**
- Every modular part of the application (components, libraries, flows) MUST have passing, meaningful tests.
- Tests must cover:
  - Rendering, props, events, and state for React components.
  - All core library logic (ontology, graph schema, workflow engine, security).
  - All browser storage/session management logic.
  - All UI flows (provider setup, workflow creation, chat, export, theme switching, error handling).
  - Edge cases: missing/invalid API key, session expired, invalid workflow, etc.
  - Security: BYOK, session-only, no leaks.

### 7. **Documentation & Communication**
- Update README.md and all relevant docs to reflect the new architecture.
- Document every major change and the rationale.
- Use clear commit messages and PR descriptions.
- If you are unsure, ASK. Do not guess. Do not make random changes.

---

## 🏆 Guiding Principles

- **Tests validate the app, not vice versa.**
- **Every refactor step must be accompanied by test fixes and passing tests before proceeding.**
- **No random or arbitrary changes.**
- **Codebase must remain healthy and functional at all times.**
- **Deployment only when all tests pass and manual QA is complete.**
- **Every developer is responsible for the health of the patient (the codebase).**

---

## 🧑‍💻 For Juniors: What To Do, How To Do It

- Read this plan, the README.md, and the codebase.
- For every file you touch, FIRST update or remove the tests.
- Remove backend/database code for user/provider/workflow persistence.
- Refactor frontend and backend to use only browser storage.
- After each change, run the relevant test(s) and ensure they pass before moving on.
- If a test fails, fix the code or the test so that it matches the intended, stateless app behavior.
- Repeat until all backend/database persistence is removed and all tests pass.
- Run the full test suite and perform manual QA.
- Update documentation to reflect the new architecture.
- Ask for help if you are unsure—do not guess or make random changes.

---

## 🧑‍🔬 For Seniors: Technical Details

- Remove all Prisma/Supabase/SQL logic and related migrations/seeds.
- Refactor tRPC routers and backend endpoints to be stateless or proxy-only.
- Ensure all API key management is session-only and encrypted in the browser (see #codebase:src/lib/security.js).
- Refactor PromptingEngine, WorkflowExecutionEngine, and all provider logic to use browser storage and stateless calls.
- Ensure all three AI API call paths are tested and work as intended.
- Use Playwright/Cypress for E2E, Jest/RTL for unit/integration.
- Coverage must remain at or above 88–90%.
- All error and edge cases must be tested.
- No sensitive data may ever be persisted server-side.

---

## 🚀 Final Words

This is your moment. The world is watching. The codebase is the patient. Let’s save it—together, with precision, discipline, and pride. Every test must pass because the code is correct, not because the test is wrong. Every feature must work because it is real, not because it is faked. Let’s make this the best, most secure, most reliable stateless app in the world.

#codebase #surgery #refactor #testdriven #stateless #browserstorage #BYOK #ai #security #modularity #teamwork

---

**Now, get to work. The patient is counting on you.**