import { createTRPCClient, httpBatchLink } from '@trpc/client';

// Get the API URL - use the environment variable or construct it
const getApiUrl = () => {
  // For Vite projects in browser
  if (typeof window !== 'undefined') {
    // Try to get from window (Vite exposes env vars on window)
    if (window.ENV && window.ENV.VITE_API_URL) {
      return `${window.ENV.VITE_API_URL}/api/trpc`;
    }
    // Fallback to constructing URL from current hostname
    return `${window.location.protocol}//${window.location.hostname.replace('8081', '3002')}/api/trpc`;
  }
  // Fallback for non-browser environments
  return 'http://localhost:3002/api/trpc';
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
