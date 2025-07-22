import { createTRPCClient, httpBatchLink } from '@trpc/client';

// Get the API URL - use the environment variable or construct it
const getApiUrl = () => {
  // Use window.ENV for browser, fallback to localhost for dev
  if (typeof window !== 'undefined' && window.ENV && window.ENV.SEMANTIC_FLOW_API_URL) {
    return window.ENV.SEMANTIC_FLOW_API_URL;
  }
  // For server-side Node.js, you can add process.env support if needed
  return 'http://localhost:3001/api/trpc';
};

// This client is for use outside of React components
export const trpcVanilla = createTRPCClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      // You can pass any HTTP headers you wish here
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
});
