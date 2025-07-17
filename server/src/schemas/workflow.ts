import { z } from 'zod';

// Based on src/lib/graphSchema.js and prisma/schema.prisma

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.any(), // Keep it simple for now, can be refined
  style: z.any().optional(),
});

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  type: z.string().optional(),
  data: z.any().optional(),
  style: z.any().optional(),
});

export const WorkflowContentSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  viewport: z.any(),
});

export const CreateWorkflowInputSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  content: WorkflowContentSchema,
});

export const UpdateWorkflowInputSchema = z.object({
  id: z.string(),
  data: z.object({
    title: z.string().min(1, "Title is required.").optional(),
    description: z.string().optional().nullable(),
    content: WorkflowContentSchema.optional(),
    isPublic: z.boolean().optional(),
  }),
});
