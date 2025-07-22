# Integration Tests

This folder contains integration and UI tests using React Testing Library and Jest. These tests simulate user flows and component interactions, but do not require a running browser or server.

- Only Playwright E2E tests should remain in `tests/e2e/`.
- All Jest/RTL-based E2E tests have been moved here for clarity and correct test runner separation.
