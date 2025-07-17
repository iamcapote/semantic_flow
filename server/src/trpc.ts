import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to check for authenticated users
const isAuthenticated = t.middleware(({ ctx, next }) => {
  // In a real app, you'd get this from a session or token
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }
  return next({
    ctx: {
      ...ctx,
      // infers `session` as non-nullable
      session: ctx.session,
    },
  });
});

// Protected procedure for authenticated users
export const protectedProcedure = t.procedure.use(isAuthenticated);
