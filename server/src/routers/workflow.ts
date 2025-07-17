import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { CreateWorkflowInputSchema, UpdateWorkflowInputSchema } from '../schemas/workflow';

const defaultWorkflowSelect = Prisma.validator<Prisma.WorkflowSelect>()({
  id: true,
  title: true,
  description: true,
  content: true,
  version: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  forkCount: true,
  starCount: true,
  tags: true,
});

export const workflowRouter = router({
  // List all public workflows or user's own workflows
  list: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      cursor: z.string().nullish(),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const where: Prisma.WorkflowWhereInput = {
        OR: [
          { isPublic: true },
          { userId: input.userId },
        ],
      };

      const workflows = await ctx.prisma.workflow.findMany({
        where,
        select: defaultWorkflowSelect,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (workflows.length > input.limit) {
        const nextItem = workflows.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: workflows,
        nextCursor,
      };
    }),

  // Get a single workflow by ID
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await ctx.prisma.workflow.findUnique({
        where: { id: input.id },
        select: defaultWorkflowSelect,
      });

      if (!workflow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Workflow not found' });
      }

      if (!workflow.isPublic && workflow.userId !== ctx.session?.user?.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this workflow' });
      }

      return workflow;
    }),

  // Create a new workflow
  create: protectedProcedure
    .input(CreateWorkflowInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const workflow = await ctx.prisma.workflow.create({
        data: { 
          ...input, 
          userId, 
          version: '1.0.0',
          content: input.content || {} // Ensure content is not undefined
        },
        select: defaultWorkflowSelect,
      });
      return workflow;
    }),

  // Update a workflow
  update: protectedProcedure
    .input(UpdateWorkflowInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const { id, data } = input;

      const existingWorkflow = await ctx.prisma.workflow.findUnique({ where: { id } });
      if (!existingWorkflow || existingWorkflow.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const updatedWorkflow = await ctx.prisma.workflow.update({
        where: { id },
        data,
        select: defaultWorkflowSelect,
      });
      return updatedWorkflow;
    }),

  // Delete a workflow
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const { id } = input;

      const existingWorkflow = await ctx.prisma.workflow.findUnique({ where: { id } });
      if (!existingWorkflow || existingWorkflow.userId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await ctx.prisma.workflow.delete({ where: { id } });
      return { success: true };
    }),
});
