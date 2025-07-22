
# Test Plan: Stateless, Browser-Storage-Only Architecture (July 2025)

This plan supersedes all previous test plans. It is based on the updated product vision and the July 2025 discovery that backend/database persistence is unnecessary technical debt. The app must be 100% functional, stateless, and browser-storage-only. All tests must validate this architecture, and every refactor must be test-driven and validated before proceeding.

---


## 1. **Frontend: React Components & Pages**

### **Component Files**
- **src/components/**  
  - *Core UI*: LabCanvas.jsx, NodePalette.jsx, SemanticNode.jsx, ProviderSettings.jsx, NodeTestingPanel.jsx, ExportModal.jsx, ThemeProvider.jsx, ThemeToggle.jsx, ClearSessionButton.jsx, NodeEnhancementModal.jsx, EnhancedSettingsModal.jsx, ConfigurationModal.jsx, WorkflowExecutionModal.jsx, ProviderSelectionCard.jsx, ProviderSetup.jsx, SimpleProviderSetup.jsx, SettingsModal.jsx, TextToWorkflow.jsx.
  - *UI Library*: 40+ files in `src/components/ui/` (tabs.jsx, alert-dialog.jsx, button.jsx, card.jsx, select.jsx, etc.)

### **Page Files**
- **src/pages/**  
  - ChatPage.jsx, WorkflowBuilderPage.jsx, LandingPage.jsx, Index.jsx

### **Entry Points**
- **src/App.jsx**: Main app logic, routing, API key management, theme provider.
- **src/main.jsx**: ReactDOM render, app bootstrap.

---


## 2. **Frontend: Core Libraries**

- **src/lib/**  
  - *Ontology*: ontology.js (semantic node types, clusters, tags)
  - *Graph Schema*: graphSchema.js (node/edge/workflow validation)
  - *Workflow Engine*: WorkflowExecutionEngine.js (workflow execution, node testing, error handling)
  - *Prompting Engine*: promptingEngine.js
  - *Export Utilities*: exportUtils.js, exportFormats.js
  - *Security*: security.js
  - *tRPC Client*: trpc.ts, trpc-vanilla.js
  - *Utils*: utils.js

---


## 3. **Backend: Stateless Proxy/Pass-Through Only**

- All backend/database persistence logic for users, providers, and workflows must be removed or stubbed out.
- Backend endpoints should only exist as stateless pass-throughs or proxies (e.g., for CORS or API key security), if needed.
- No persistent user, provider, or workflow data should be stored server-side.


## 4. **Database & Integrations**

- All database schema, seed scripts, and Supabase/Prisma logic are to be removed or ignored. No persistent storage is required or allowed.

---

## 5. **Supporting Files**

- **src/env-config.js**: Environment configuration.
- **src/nav-items.jsx**: Navigation items.
- **src/index.css**: Global styles.

---

## 6. **Documentation & Verification**

- **README.md**: Project overview, setup, API reference.
- **DOCUMENTATION.md**: Index of technical guides.
- **DEPLOYMENT.md**: Deployment and troubleshooting.
- **OPTIMIZATION.md**: Performance and backend checklist.
- **docs/backend/**: Architecture, execution engine, node ontology schema.

---


## 7. **Testing & Quality Assurance Evidence**

- **Error Handling**: NodeTestingPanel.jsx, WorkflowExecutionEngine.js, ProviderSetup.jsx, ProviderSettings.jsx, ai.ts, openai.js.
- **Validation**: graphSchema.js (validateNode, validateEdge, validateWorkflow).
- **API Error Handling**: NodeTestingPanel.jsx, ProviderSettings.jsx, ai.ts (testConnection).
- **Edge Cases**: Ontology.js (error/recovery nodes), graphSchema.js (validation errors), backend routers (mutation/query error handling).

---


## 8. **Test Suite Structure Recommendation**

### **Folder Structure**
```
/tests
  /unit
    /components
    /lib
    /services
  /integration
    /api
    /workflow
    /provider
  /e2e
    /scenarios
    /api
    /ui
```


### **Test Types**
- **Unit Tests**:  
  - Individual React components (props, rendering, events)
  - Core library functions (ontology, graph schema, utils)
- **Integration Tests**:  
  - UI flows, browser storage/session management, stateless proxy endpoints (if any)
- **End-to-End Tests**:  
  - Full workflow creation, execution, export
  - Provider setup and testing (API key, model selection, browser storage)
  - UI flows (theme switching, error handling)
  - Simulate browser storage clearing and recovery


### **Coverage Goals**
- **88-90% coverage**:  
  - All major components, services, and UI flows.
  - Positive and negative scenarios, edge cases, error handling.
  - Validation logic, security model, session management (browser storage only).

### **Test Data & Naming**
- Use clear, descriptive test data (e.g., valid/invalid nodes, workflows, API keys).
- Naming conventions: `ComponentName.test.jsx`, `serviceName.unit.test.js`, `workflow.integration.test.ts`, `scenario.e2e.test.js`.


### **Automation**
- Use npm scripts:  
  - `npm test` (run all tests)
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm run test:e2e`
  - `npm run coverage` (generate coverage report)

---


## 9. **Technical Details for Test Coverage**

- **React Components**:  
  - Render tests, prop validation, event simulation, error boundary.
- **Core Libraries**:  
  - Ontology: node type mapping, cluster assignment, error nodes.
  - Graph Schema: node/edge/workflow validation, error cases.
  - Workflow Engine: execution order, node input preparation, error handling, API key/session logic.
- **Browser Storage**:  
  - Session and local storage logic for API keys, workflows, provider configs.
- **Stateless Proxy Endpoints (if any)**:  
  - Pass-through/proxy logic only, no persistence.
- **Security**:  
  - BYOK model, session-only storage, error handling for missing/invalid keys.

---


## 10. **Edge Cases & Error Handling**

- **API errors**: 500, missing/invalid API key, invalid input, provider errors.
- **Validation errors**: Missing node/edge fields, invalid workflow structure.
- **Session errors**: API key not found, session expired.
- **UI errors**: Invalid props, missing data, rendering failures.

---


## 11. **Summary and Refactor Protocol**

This plan is evidence-based and matches the new product vision. All backend/database persistence is to be removed as technical debt. All tests must be updated to reflect a stateless, browser-storage-only architecture. Every refactor step must be accompanied by test fixes and passing tests before proceeding. Tests must validate real app functionality, not legacy backend logic.

**Protocol:**
1. For every file/component refactored, FIRST update or remove tests to match the new architecture.
2. Only proceed to the next component after all relevant tests pass.
3. Use the codebase as evidence for what to test and how the app should behave.
4. No random or arbitrary changes—every change must be justified by the product vision and code evidence.
5. The app must be 100% functional, stateless, and browser-storage-only at the end of this process.

**If you need to see sample test files or want to know how to implement specific tests for any module, let me know which files or features you want to focus on next.**

---

## 1. Test Suite Directory Structure

Create a new top-level folder `/tests` with the following structure:

```
/tests
  /unit
    /components
    /lib
    /server
  /integration
    /api
    /db
    /workflow
  /e2e
    /scenarios
    /ui
    /security
  /setup
    jest.setup.js
    test-data/
```

---

## 2. Testing Frameworks & Tools

- **Jest**: Unit and integration tests (frontend & backend)
- **React Testing Library**: Frontend component tests
- **Supertest**: Backend API integration tests
- **Playwright or Cypress**: End-to-end UI and workflow tests
- **Prisma Test Environment**: For DB integration tests

---

## 3. Coverage Goals & Automation

- Set coverage thresholds in Jest config:  
  `"lines": 88`, `"functions": 88`, `"branches": 88`, `"statements": 88`
- Add scripts to package.json:
  ```json
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
  ```
- Integrate with CI (GitHub Actions) for automatic test runs and coverage reporting.

---

## 4. Unit Test Coverage

### Components (components)
- **LabCanvas.jsx**: Node rendering, drag/drop, connection logic, state updates
- **NodePalette.jsx**: Search, cluster expansion, node drag events
- **SemanticNode.jsx**: Editing, blank node logic, update callbacks
- **ProviderSettings.jsx / ProviderSetup.jsx / SimpleProviderSetup.jsx**: API key handling, provider selection, validation
- **ExportModal.jsx**: Format selection, export triggers
- **ThemeProvider.jsx / ThemeToggle.jsx**: Theme switching, context propagation
- **ClearSessionButton.jsx**: Session clearing logic
- **NodeTestingPanel.jsx**: Input handling, provider/model selection, result display

### Core Libraries (lib)
- **ontology.js**: Node type definitions, cluster grouping, edge cases
- **graphSchema.js**: Schema validation, port types, edge grammar
- **exportUtils.js**: Export functions for JSON, Markdown, YAML, XML
- **promptingEngine.js**: Text-to-workflow conversion, workflow execution, node enhancement
- **security.js**: BYOK logic, session clearing, encryption
- **utils.js**: Utility functions (e.g., `cn`)

### Backend (src)
- **services/ai.ts**: Provider API calls, error handling, response parsing
- **services/apiKeyService.ts**: Key storage, retrieval, encryption
- **routers/user.ts**: User queries, protected procedures
- **routers/workflow.ts**: CRUD operations, input validation
- **routers/execution.ts**: Workflow execution, streaming, error cases
- **routers/provider.ts**: Provider config, testNode mutation

---

## 5. Integration Test Coverage

- **tRPC Client ↔ Backend Routers**: All API endpoints (workflows, providers, execution, user)
- **WorkflowBuilderPage.jsx**: Workflow list, create, update, delete via tRPC
- **ProviderSettings.jsx**: Provider config fetch/update, error handling
- **API Error Handling**: Simulate 400/401/403/404/500 errors, verify frontend displays correct messages and does not leak sensitive data
- **Session Security**: Session-only persistence, logout clearing, no API key leakage
- **Prisma Models**: Migrations, CRUD for User, Workflow, ProviderConfig
- **Seed Script**: Initial user creation, upsert logic

---

## 6. End-to-End (E2E) Test Coverage

- **Workflows**: Create, edit, execute, export workflow; edge cases (empty workflow, invalid node connections, large graphs)
- **Providers**: API key entry, model selection, provider switching; invalid keys
- **Security**: BYOK model, session clearing, browser close, no key persistence; error scenarios (API failures, network errors, invalid responses)
- **Export**: All formats, large workflows, malformed data
- **UI**: Theme switching, navigation, error boundaries

---

## 7. Error Handling & Edge Cases

- Simulate API errors (400, 401, 403, 404, 500)
- Validation errors (missing node/edge fields, invalid workflow structure)
- Session errors (API key not found, session expired)
- UI errors (invalid props, missing data, rendering failures)
- Ensure no sensitive data leaks in error messages
- Test for memory leaks, unhandled promises, and session persistence

---

## 8. Naming Conventions & Test Data

- Use descriptive test data (valid/invalid nodes, workflows, API keys)
- Name tests by feature and scenario:  
  `should_render_semantic_node_with_blank_label`,  
  `should_export_workflow_as_yaml_with_all_nodes`,  
  `should_handle_api_500_error_gracefully`

---

## 9. Example Test File Structure

```
tests/
  unit/
    components/
      LabCanvas.test.jsx
      NodePalette.test.jsx
      SemanticNode.test.jsx
      ...
    lib/
      ontology.test.js
      graphSchema.test.js
      exportUtils.test.js
      ...
    server/
      aiService.test.ts
      userRouter.test.ts
      workflowRouter.test.ts
      ...
  integration/
    api/
      trpcClient-workflow.test.ts
      trpcClient-provider.test.ts
      ...
    db/
      prisma-user.test.ts
      prisma-workflow.test.ts
      ...
  e2e/
    workflows/
      create-edit-execute-export.test.ts
    providers/
      api-key-config.test.ts
    security/
      session-clearing.test.ts
    ui/
      theme-switching.test.ts
      navigation.test.ts
```

---

## 10. Implementation Steps

1. **Create `/tests` folder and subdirectories.**
2. **Add Jest, React Testing Library, Supertest, Playwright/Cypress to devDependencies.**
3. **Write test setup files (`jest.setup.js`, test-data fixtures).**
4. **Begin with unit tests for core libraries and most critical components.**
5. **Add integration tests for API endpoints and database.**
6. **Implement E2E tests for workflows, provider setup, security, and UI.**
7. **Configure coverage thresholds and CI integration.**
8. **Review coverage reports, refactor/add tests for uncovered lines/branches.**
9. **Optimize and maintain test suite for readability, isolation, and reliability.**

---
