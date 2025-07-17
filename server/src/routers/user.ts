import { router, publicProcedure } from '../trpc';

export const userRouter = router({
  // Placeholder for get
  get: publicProcedure.query(() => {
    return { id: '1', name: 'Test User' };
  }),
});
