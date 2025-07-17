import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/routers/index';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get API URL - default to backend server port
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser - get current host but change port to backend
    return `${window.location.protocol}//${window.location.hostname}:3001/api/trpc`;
  }
  return 'http://localhost:3001/api/trpc';
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
