"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWorkflowInputSchema = exports.CreateWorkflowInputSchema = exports.WorkflowContentSchema = exports.EdgeSchema = exports.NodeSchema = void 0;
var zod_1 = require("zod");
// Based on src/lib/graphSchema.js and prisma/schema.prisma
exports.NodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
    data: zod_1.z.any(), // Keep it simple for now, can be refined
    style: zod_1.z.any().optional(),
});
exports.EdgeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    source: zod_1.z.string(),
    target: zod_1.z.string(),
    sourceHandle: zod_1.z.string().nullable().optional(),
    targetHandle: zod_1.z.string().nullable().optional(),
    type: zod_1.z.string().optional(),
    data: zod_1.z.any().optional(),
    style: zod_1.z.any().optional(),
});
exports.WorkflowContentSchema = zod_1.z.object({
    nodes: zod_1.z.array(exports.NodeSchema),
    edges: zod_1.z.array(exports.EdgeSchema),
    viewport: zod_1.z.any(),
});
exports.CreateWorkflowInputSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required."),
    description: zod_1.z.string().optional(),
    content: exports.WorkflowContentSchema,
});
exports.UpdateWorkflowInputSchema = zod_1.z.object({
    id: zod_1.z.string(),
    data: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required.").optional(),
        description: zod_1.z.string().optional().nullable(),
        content: exports.WorkflowContentSchema.optional(),
        isPublic: zod_1.z.boolean().optional(),
    }),
});
