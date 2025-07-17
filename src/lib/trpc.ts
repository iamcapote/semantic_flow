import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/routers/index';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get API URL - using hardcoded value for now
const getApiUrl = () => {
  // In Codespaces, use localhost instead of external URL
  if (typeof window !== 'undefined') {
    // Check if we're in Codespaces
    if (window.location.hostname.includes('app.github.dev')) {
      return 'http://localhost:3002/api/trpc';
    }
    return `${window.location.protocol}//${window.location.hostname.replace('8081', '3002')}/api/trpc`;
  }
  return 'http://localhost:3002/api/trpc';
};

// Create the tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      headers: () => {
        // Add any headers (like auth tokens) here
        return {};
      },
    }),
  ],
});
