import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import DiscoursePage from '../../src/pages/DiscoursePage.jsx';

jest.mock('../../src/lib/auth', () => ({
  useAuth: () => ({ user: null, loading: false, login: jest.fn(), logout: jest.fn(), refresh: jest.fn() })
}));

function wrap(ui) {
  const qc = new QueryClient();
  return <MemoryRouter><QueryClientProvider client={qc}>{ui}</QueryClientProvider></MemoryRouter>;
}

describe('DiscoursePage', () => {
  test('shows CTA when unauthenticated', () => {
    render(wrap(<DiscoursePage />));
    expect(screen.getByText(/Discourse \(Read/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Discourse/i })).toBeInTheDocument();
  });
});
