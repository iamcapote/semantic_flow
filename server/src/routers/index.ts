import { router } from '../trpc';
import { workflowRouter } from './workflow';
import { userRouter } from './user';
import { executionRouter } from './execution';
import { providerRouter } from './provider';

export const appRouter = router({
  workflow: workflowRouter,
  user: userRouter,
  execution: executionRouter,
  provider: providerRouter,
});

export type AppRouter = typeof appRouter;
