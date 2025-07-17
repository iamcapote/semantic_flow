import { router, protectedProcedure } from '../trpc';

export const userRouter = router({
  // Get current user's profile
  me: protectedProcedure
    .query(({ ctx }) => {
      return ctx.session.user;
    }),
});
