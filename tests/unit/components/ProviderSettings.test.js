// ...existing code...
jest.mock('@/lib/trpc', () => {
  const actual = jest.requireActual('@/lib/trpc');
  return {
    ...actual,
    trpc: {
      ...actual.trpc,
      Provider: actual.trpc.Provider,
      provider: {
        ...actual.trpc.provider,
        getConfig: {
          ...actual.trpc.provider.getConfig,
          useQuery: () => ({
            data: [
              {
                providerId: 'openai',
                name: 'OpenAI',
                baseURL: 'https://api.openai.com/v1',
                apiKey: 'sk-test',
                models: ['gpt-3.5-turbo'],
                isActive: true
              }
            ],
            isLoading: false,
            refetch: jest.fn()
          })
        },
        updateConfig: {
          useMutation: () => ({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: true,
            reset: jest.fn(),
          })
        },
        testNode: {
          useMutation: () => ({
            mutate: jest.fn(),
            isLoading: false,
            isSuccess: true,
            reset: jest.fn(),
          })
        },
      }
    }
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { trpc, trpcClient, TRPCProvider } from '@/lib/trpc.ts';
import ProviderSettings from '@/components/ProviderSettings.jsx';
import { ThemeProvider } from '@/components/theme-provider.jsx';
import { TooltipProvider } from '@/components/ui/tooltip.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('ProviderSettings', () => {
  it('renders provider settings UI', async () => {
    const queryClient = new QueryClient();
    function AppProviders({ children }) {
      return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                {children}
              </TooltipProvider>
            </QueryClientProvider>
          </trpc.Provider>
        </ThemeProvider>
      );
    }
    render(
      <AppProviders>
        <ProviderSettings userId="demo-user" />
      </AppProviders>
    );
    expect(await screen.findByTestId('provider-settings')).toBeInTheDocument();
  });
});
