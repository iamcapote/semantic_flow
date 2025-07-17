-- Supabase Schema for Semantic-Logic AI Workflow Builder
-- Run this in your Supabase SQL Editor to create all tables

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workflow table
CREATE TABLE IF NOT EXISTS "Workflow" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    version TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "forkCount" INTEGER NOT NULL DEFAULT 0,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    tags TEXT[],
    CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- WorkflowConfig table
CREATE TABLE IF NOT EXISTS "WorkflowConfig" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    parameters JSONB NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workflowId" TEXT NOT NULL,
    CONSTRAINT "WorkflowConfig_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- WorkflowExecution table
CREATE TABLE IF NOT EXISTS "WorkflowExecution" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    state TEXT NOT NULL,
    results JSONB,
    errors JSONB,
    "tokenUsage" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "workflowId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkflowExecution_configId_fkey" FOREIGN KEY ("configId") REFERENCES "WorkflowConfig"(id) ON UPDATE CASCADE
);

-- NodeExecution table
CREATE TABLE IF NOT EXISTS "NodeExecution" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nodeId" TEXT NOT NULL,
    type TEXT NOT NULL,
    input TEXT,
    output TEXT,
    state TEXT NOT NULL,
    duration INTEGER,
    "tokenUsage" JSONB,
    "executionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "NodeExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ApiKey table
CREATE TABLE IF NOT EXISTS "ApiKey" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    provider TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- NodeType table
CREATE TABLE IF NOT EXISTS "NodeType" (
    id TEXT PRIMARY KEY,
    cluster TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    schema JSONB NOT NULL
);

-- EdgeType table
CREATE TABLE IF NOT EXISTS "EdgeType" (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    "validSources" TEXT[],
    "validTargets" TEXT[],
    "requiresCondition" BOOLEAN NOT NULL DEFAULT false
);

-- ExecutionCache table
CREATE TABLE IF NOT EXISTS "ExecutionCache" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "executionId" TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3)
);

-- UsageMetric table
CREATE TABLE IF NOT EXISTS "UsageMetric" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    action TEXT NOT NULL,
    "resourceId" TEXT,
    "tokenCount" INTEGER,
    duration INTEGER,
    metadata JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Workflow_userId_idx" ON "Workflow"("userId");
CREATE INDEX IF NOT EXISTS "Workflow_isPublic_idx" ON "Workflow"("isPublic");
CREATE INDEX IF NOT EXISTS "Workflow_createdAt_idx" ON "Workflow"("createdAt");
CREATE INDEX IF NOT EXISTS "WorkflowConfig_workflowId_idx" ON "WorkflowConfig"("workflowId");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_workflowId_idx" ON "WorkflowExecution"("workflowId");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_configId_idx" ON "WorkflowExecution"("configId");
CREATE INDEX IF NOT EXISTS "WorkflowExecution_state_idx" ON "WorkflowExecution"(state);
CREATE INDEX IF NOT EXISTS "WorkflowExecution_startedAt_idx" ON "WorkflowExecution"("startedAt");
CREATE INDEX IF NOT EXISTS "NodeExecution_executionId_idx" ON "NodeExecution"("executionId");
CREATE INDEX IF NOT EXISTS "NodeExecution_nodeId_idx" ON "NodeExecution"("nodeId");
CREATE INDEX IF NOT EXISTS "NodeExecution_state_idx" ON "NodeExecution"(state);
CREATE INDEX IF NOT EXISTS "ApiKey_userId_idx" ON "ApiKey"("userId");
CREATE INDEX IF NOT EXISTS "ApiKey_provider_idx" ON "ApiKey"(provider);
CREATE INDEX IF NOT EXISTS "NodeType_cluster_idx" ON "NodeType"(cluster);
CREATE INDEX IF NOT EXISTS "EdgeType_label_idx" ON "EdgeType"(label);
CREATE INDEX IF NOT EXISTS "ExecutionCache_executionId_idx" ON "ExecutionCache"("executionId");
CREATE INDEX IF NOT EXISTS "ExecutionCache_key_idx" ON "ExecutionCache"(key);
CREATE INDEX IF NOT EXISTS "UsageMetric_userId_idx" ON "UsageMetric"("userId");
CREATE INDEX IF NOT EXISTS "UsageMetric_action_idx" ON "UsageMetric"(action);
CREATE INDEX IF NOT EXISTS "UsageMetric_createdAt_idx" ON "UsageMetric"("createdAt");
