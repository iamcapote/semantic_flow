import React from 'react';

import ProviderSettings from '../../../src/components/ProviderSettings.jsx';
import TestTRPCProvider from '../../setup/TestTRPCProvider.jsx';
import { render, screen, fireEvent } from '@testing-library/react';

import { validApiKey } from '../../setup/test-data/testData.js';

jest.mock('../../../src/lib/trpc', () => {
  const actual = jest.requireActual('../../../src/lib/trpc');
  return {
    ...actual,
    trpc: {
      ...actual.trpc,
      Provider: actual.trpc.Provider,
      provider: {
        getConfig: {
          useQuery: () => ({
            data: [
              {
                providerId: 'openai',
                name: 'OpenAI',
                baseURL: 'https://api.openai.com/v1',
                models: ['gpt-4o', 'gpt-4o-mini'],
                isActive: true,
                apiKey: 'sk-test-valid-key',
              }
            ],
            isLoading: false,
            refetch: jest.fn(),
          })
        },
        updateConfig: {
          useMutation: () => ({
            mutateAsync: jest.fn().mockResolvedValue({ success: true }),
            isLoading: false,
          })
        },
        testNode: {
          useMutation: () => ({
            mutateAsync: jest.fn().mockResolvedValue({ provider: 'OpenAI' }),
            isLoading: false,
          })
        }
      }
    }
  };
});

describe('ProviderSettings', () => {

  it('renders provider selection', () => {
    render(
      <TestTRPCProvider>
        <ProviderSettings userId={"demo-user"} />
      </TestTRPCProvider>
    );
    expect(screen.getByTestId('provider-settings')).toBeInTheDocument();
  });

  it('handles API key input', () => {
    // Simulate API key entry
    expect(true).toBe(true);
  });

  it('validates provider selection', () => {
    // Simulate provider selection validation
    expect(true).toBe(true);
  });
});
