import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App.jsx';

// Mock auth hook to avoid async states
jest.mock('../../src/lib/auth', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

// Mock security key manager
jest.mock('../../src/lib/security', () => ({
  SecureKeyManager: { getApiKey: () => null },
}));

// Mock debug util
jest.mock('../../src/utils/debugNav', () => ({
  detectOverlappingElements: () => {},
}));

// Do not mock BrowserRouter; App manages routing internally.

// Mock heavy pages to simple stubs
jest.mock('../../src/pages/Win95Suite', () => () => <div>Win95Suite</div>);
jest.mock('../../src/pages/LearnPage', () => () => <div>LearnPage</div>);
jest.mock('../../src/pages/LandingPage', () => ({ onApiKeySet }) => <button onClick={() => onApiKeySet?.()}>LandingPage</button>);
// Mock Docs panel (raw markdown imports cause ENOENT under Jest)
jest.mock('../../src/components/DocsPanel95', () => () => <div>DocsPanel95</div>);

const setWidth = (w) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: w });
  window.dispatchEvent(new Event('resize'));
};

describe('Desktop-only viewport guard', () => {
  test('renders BlueScreen when width < 1024', () => {
    setWidth(800);
    render(<App />);
    expect(screen.getByTestId('desktop-required-bsod')).toBeInTheDocument();
  });

  test('renders app when width >= 1024', () => {
    setWidth(1280);
    render(<App />);
    expect(screen.queryByTestId('desktop-required-bsod')).not.toBeInTheDocument();
    expect(screen.getByText(/Win95Suite|LandingPage|LearnPage/)).toBeInTheDocument();
  });
});
