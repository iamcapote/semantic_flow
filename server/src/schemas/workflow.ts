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
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.any(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const UpdateWorkflowInputSchema = z.object({
  id: z.string(),
  data: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    content: z.any().optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});


