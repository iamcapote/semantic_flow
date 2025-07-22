// Declare global in-memory user store for stateless operation
declare global {
  var inMemoryUsers: Array<{ id: string; [key: string]: any }>;
}
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const userRouter = router({
  // Get current user's profile
  me: protectedProcedure
    .query(({ ctx }) => {
      return ctx.session.user;
    }),
  // Get user by ID
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // In-memory user lookup (replace with actual in-memory store as needed)
      return globalThis.inMemoryUsers?.find((u: any) => u.id === input) || null;
    }),
});
