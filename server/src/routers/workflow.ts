
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { CreateWorkflowInputSchema, UpdateWorkflowInputSchema } from '../schemas/workflow';

// In-memory workflow store (per process, for tests/dev only)
const workflowStore: Record<string, any[]> = {}; // userId -> workflows array
let workflowIdCounter = 1;

export const workflowRouter = router({
  // List all public workflows or user's own workflows
  list: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      // Flatten all workflows for all users
      let allWorkflows: any[] = [];
      for (const userId in workflowStore) {
        allWorkflows = allWorkflows.concat(workflowStore[userId]);
      }
      // Filter for public or user's own workflows
      const workflows = allWorkflows.filter(wf => wf.isPublic || (input.userId && wf.userId === input.userId));
      workflows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      let items = workflows.slice(0, input.limit);
      let nextCursor = undefined;
      if (workflows.length > input.limit) {
        nextCursor = workflows[input.limit].id;
      }
      return { items, nextCursor };
    }),

  // Get a single workflow by ID
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      let found: any = null;
      for (const userId in workflowStore) {
        found = workflowStore[userId].find(wf => wf.id === input.id);
        if (found) break;
      }
      if (!found) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }
      // For simplicity, allow access if public or userId matches (no session in stateless mode)
      if (!found.isPublic && input.userId && found.userId !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this workflow' });
      }
      return found;
    }),

  // Create a new workflow
  create: publicProcedure
    .input(CreateWorkflowInputSchema)
    .mutation(async ({ input }) => {
      const userId = input.userId || 'demo-user';
      const workflow = {
        ...input,
        id: `wf-${workflowIdCounter++}`,
        userId,
        version: '1.0.0',
        content: input.content || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        forkCount: 0,
        starCount: 0,
        tags: input.tags || [],
      };
      if (!workflowStore[userId]) workflowStore[userId] = [];
      workflowStore[userId].push(workflow);
      return workflow;
    }),

  // Update a workflow
  update: publicProcedure
    .input(UpdateWorkflowInputSchema)
    .mutation(async ({ input }) => {
      const { id, data } = input;
      let found: any = null;
      let userId: string | null = null;
      for (const uid in workflowStore) {
        const idx = workflowStore[uid].findIndex(wf => wf.id === id);
        if (idx !== -1) {
          found = workflowStore[uid][idx];
          userId = uid;
          workflowStore[uid][idx] = { ...found, ...data, updatedAt: Date.now() };
          break;
        }
      }
      if (!found) throw new TRPCError({ code: 'NOT_FOUND' });
      return workflowStore[userId!].find(wf => wf.id === id);
    }),

  // Delete a workflow
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id } = input;
      let deleted = false;
      for (const uid in workflowStore) {
        const idx = workflowStore[uid].findIndex(wf => wf.id === id);
        if (idx !== -1) {
          workflowStore[uid].splice(idx, 1);
          deleted = true;
          break;
        }
      }
      if (!deleted) throw new TRPCError({ code: 'NOT_FOUND' });
      return { success: true };
    }),
});
