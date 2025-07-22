# Refactor Plan: Frontend-Only AI Provider Integration

## Overview
This document outlines a step-by-step plan to refactor the codebase for a frontend-only, BYOK (Bring Your Own Key) AI provider architecture. The goal is to ensure all provider logic, configuration, and API calls are handled securely and pragmatically in the frontend, with no backend proxying or registry. All changes will be reflected in the test suites to ensure correctness and maintainability.

---

## TODO List

### 1. Provider Integration & API Calls
- [ ] Review all provider-related code to ensure **no backend proxying** is used for OpenRouter, Venice, or any other AI provider.
- [ ] Refactor all API calls to use the provider's official, recommended frontend fetch pattern (see provider docs for headers, body, etc.).
- [ ] Ensure all API keys are stored only in browser/session storage using a secure utility (e.g., `SecureKeyManager`).
- [ ] Remove any backend code, endpoints, or logic related to provider management or proxying.
- [ ] Update provider model lists and config to match the latest from provider docs.

### 2. ProviderSetup Component
- [ ] Ensure the `ProviderSetup` component only manages providers in the frontend.
- [ ] Validate that the test connection logic for each provider matches the official API usage (headers, body, etc.).
- [ ] Confirm that all provider config is hardcoded or managed in the frontend state.

### 3. Security & Data Handling
- [ ] Double-check that API keys are never sent to any backend or third-party except the provider's API.
- [ ] Ensure all sensitive data is handled in-memory or session storage only.
- [ ] Document security practices in the code and README.

### 4. Test Suite Alignment
- [ ] Review all tests for provider logic to ensure they reflect the new frontend-only architecture.
- [ ] Remove or refactor any tests that expect backend endpoints or proxying.
- [ ] Add/Update tests to validate direct API calls, error handling, and provider switching.
- [ ] Ensure tests do not produce false positives/negatives and are aligned with the intended app behavior.

### 5. Codebase Cleanup
- [ ] Remove all backend files, scripts, and references related to provider proxying.
- [ ] Update documentation to reflect the new architecture and usage patterns.
- [ ] Log all major changes and rationale in `CODEBASE_SURGERY_SUMMARY.md`.

---

## Revision & Description

This plan is designed to make the codebase:
- Simpler and easier to maintain (no backend for providers)
- More secure (API keys never leave the browser)
- More reliable and easier to debug
- Fully aligned with provider documentation and best practices
- Testable and ready for live deployment

Each step should be completed and validated before moving to the next. All changes must be reflected in the test suite to ensure the application remains functional and robust. Document all decisions and changes for future maintainers.

---

## Next Steps
1. Begin with a full audit of provider-related code and tests.
2. Refactor and update incrementally, running and updating tests after each major change.
3. Keep this plan updated as progress is made.
