-- Create tables for Semantic-Logic AI Workflow Builder
-- Run this in your Supabase SQL Editor

-- Create Users table
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Create ProviderConfig table
CREATE TABLE "ProviderConfig" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "baseURL" TEXT NOT NULL,
  "models" JSONB NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "headers" JSONB,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE ("userId", "providerId")
);

-- Create Workflow table
CREATE TABLE "Workflow" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" JSONB NOT NULL,
  "version" TEXT NOT NULL,
  "isPublic" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  "userId" TEXT NOT NULL,
  "forkCount" INTEGER DEFAULT 0,
  "starCount" INTEGER DEFAULT 0,
  "tags" TEXT[] DEFAULT '{}',
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create WorkflowConfig table
CREATE TABLE "WorkflowConfig" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "parameters" JSONB NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  "workflowId" TEXT NOT NULL,
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE
);

-- Create WorkflowExecution table
CREATE TABLE "WorkflowExecution" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "state" TEXT NOT NULL,
  "results" JSONB,
  "errors" JSONB,
  "tokenUsage" JSONB,
  "startedAt" TIMESTAMP DEFAULT now(),
  "completedAt" TIMESTAMP,
  "workflowId" TEXT NOT NULL,
  "configId" UUID NOT NULL,
  FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE,
  FOREIGN KEY ("configId") REFERENCES "WorkflowConfig"("id")
);

-- Create NodeExecution table
CREATE TABLE "NodeExecution" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "nodeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "input" TEXT,
  "output" TEXT,
  "state" TEXT NOT NULL,
  "duration" INTEGER,
  "tokenUsage" JSONB,
  "executionId" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now(),
  "completedAt" TIMESTAMP,
  FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution"("id") ON DELETE CASCADE
);

-- Create ApiKey table
CREATE TABLE "ApiKey" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now(),
  "expiresAt" TIMESTAMP,
  "permissions" TEXT[] DEFAULT '{}',
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "ProviderConfig_userId_idx" ON "ProviderConfig"("userId");
CREATE INDEX "Workflow_userId_idx" ON "Workflow"("userId");
CREATE INDEX "Workflow_isPublic_idx" ON "Workflow"("isPublic");
CREATE INDEX "Workflow_createdAt_idx" ON "Workflow"("createdAt");
CREATE INDEX "WorkflowConfig_workflowId_idx" ON "WorkflowConfig"("workflowId");
CREATE INDEX "WorkflowExecution_workflowId_idx" ON "WorkflowExecution"("workflowId");
CREATE INDEX "WorkflowExecution_configId_idx" ON "WorkflowExecution"("configId");
CREATE INDEX "WorkflowExecution_state_idx" ON "WorkflowExecution"("state");
CREATE INDEX "WorkflowExecution_startedAt_idx" ON "WorkflowExecution"("startedAt");
CREATE INDEX "NodeExecution_executionId_idx" ON "NodeExecution"("executionId");
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providerconfig_updated_at BEFORE UPDATE ON "ProviderConfig" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_updated_at BEFORE UPDATE ON "Workflow" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflowconfig_updated_at BEFORE UPDATE ON "WorkflowConfig" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
