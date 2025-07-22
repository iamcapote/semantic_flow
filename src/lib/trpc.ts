// Add type declaration for window.ENV
declare global {
  interface Window {
    ENV?: {
      SEMANTIC_FLOW_API_URL?: string;
    };
  }
}
import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/routers/index';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get API URL - using hardcoded value for now
const getApiUrl = () => {
  // Use window.ENV for browser, fallback to localhost for dev
  if (typeof window !== 'undefined' && window.ENV && window.ENV.SEMANTIC_FLOW_API_URL) {
    return window.ENV.SEMANTIC_FLOW_API_URL;
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
