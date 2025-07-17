// Backend Architecture Plan for Semantic-Logic AI Workflow Builder
// Engineer: GitHub Copilot - Backend & Logic & Infrastructure 
// Date: July 16, 2025

/*
   This document outlines the backend architecture for the Semantic-Logic AI Workflow Builder.
   It provides a roadmap for implementing the server-side components that will power the
   workflow execution engine, data persistence, and API endpoints.
*/

// =============================================================================
//                             TECHNICAL OVERVIEW
// =============================================================================

/*
   ARCHITECTURE SUMMARY:
   
   - Fastify server with tRPC API integration
   - Prisma ORM for database models and migrations
   - Redis for caching and rate limiting
   - Server-Sent Events (SSE) for real-time execution updates
   - OpenAI API integration for workflow execution
   - Secure key management and encryption
   - Docker containerization for deployment
   - Observability stack with Sentry, Prometheus, and Loki
*/

// =============================================================================
//                          DATABASE SCHEMA (PRISMA)
// =============================================================================

/*
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  workflows     Workflow[]
  apiKeys       ApiKey[]
}

model Workflow {
  id            String    @id
  title         String
  description   String?
  content       Json      // Store the full workflow JSON
  isPublic      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  executions    WorkflowExecution[]
  configs       WorkflowConfig[]
}

model WorkflowConfig {
  id            String    @id @default(uuid())
  name          String
  model         String
  parameters    Json      // Store temperature, maxTokens, etc.
  systemPrompt  String    @db.Text
  isDefault     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  workflowId    String
  workflow      Workflow  @relation(fields: [workflowId], references: [id])
}

model WorkflowExecution {
  id            String    @id @default(uuid())
  state         String    // PENDING, RUNNING, COMPLETED, FAILED, PAUSED
  results       Json?     // Store execution results
  errors        Json?     // Store execution errors
  tokenUsage    Json?     // Store token usage statistics
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  workflowId    String
  workflow      Workflow  @relation(fields: [workflowId], references: [id])
  configId      String?
  nodeExecutions NodeExecution[]
}

model NodeExecution {
  id               String    @id @default(uuid())
  nodeId           String    // Original node ID from workflow
  input            String?   @db.Text
  output           String?   @db.Text
  state            String    // PENDING, RUNNING, COMPLETED, FAILED
  duration         Int?      // Execution time in milliseconds
  tokenUsage       Json?     // Prompt, completion, total tokens
  executionId      String
  workflowExecution WorkflowExecution @relation(fields: [executionId], references: [id])
  createdAt        DateTime  @default(now())
}

model ApiKey {
  id            String    @id @default(uuid())
  name          String
  key           String    // Encrypted API key
  provider      String    // OPENAI, ANTHROPIC, etc.
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  userId        String
  user          User      @relation(fields: [userId], references: [id])
}
*/

// =============================================================================
//                              tRPC API ROUTES
// =============================================================================

/*
export const appRouter = router({
  workflows: router({
    // Workflow CRUD operations
    create: protectedProcedure
      .input(CreateWorkflowSchema)
      .mutation(({ input, ctx }) => { ... }),
      
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input, ctx }) => { ... }),
      
    update: protectedProcedure
      .input(UpdateWorkflowSchema)
      .mutation(({ input, ctx }) => { ... }),
      
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input, ctx }) => { ... }),
      
    list: protectedProcedure
      .input(ListWorkflowsSchema)
      .query(({ input, ctx }) => { ... }),
      
    // Workflow execution
    execute: protectedProcedure
      .input(ExecuteWorkflowSchema)
      .mutation(async ({ input, ctx }) => { ... }),
      
    getExecution: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input, ctx }) => { ... }),
      
    listExecutions: protectedProcedure
      .input(z.object({ workflowId: z.string() }))
      .query(({ input, ctx }) => { ... })
  }),
  
  nodes: router({
    // Individual node operations
    executeNode: protectedProcedure
      .input(ExecuteNodeSchema)
      .mutation(async ({ input, ctx }) => { ... }),
  }),
  
  configs: router({
    // Configuration CRUD operations
    create: protectedProcedure
      .input(CreateConfigSchema)
      .mutation(({ input, ctx }) => { ... }),
      
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input, ctx }) => { ... }),
      
    update: protectedProcedure
      .input(UpdateConfigSchema)
      .mutation(({ input, ctx }) => { ... }),
      
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input, ctx }) => { ... }),
      
    list: protectedProcedure
      .input(z.object({ workflowId: z.string() }))
      .query(({ input, ctx }) => { ... })
  }),
  
  // OpenAI proxy for direct chat completions
  openai: router({
    chat: protectedProcedure
      .input(OpenAIChatSchema)
      .mutation(async ({ input, ctx }) => { ... })
  }),
  
  // User management
  users: router({
    me: protectedProcedure
      .query(({ ctx }) => { ... }),
      
    updateSettings: protectedProcedure
      .input(UpdateUserSettingsSchema)
      .mutation(({ input, ctx }) => { ... })
  }),
  
  // API key management
  apiKeys: router({
    create: protectedProcedure
      .input(CreateApiKeySchema)
      .mutation(({ input, ctx }) => { ... }),
      
    list: protectedProcedure
      .query(({ ctx }) => { ... }),
      
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(({ input, ctx }) => { ... })
  })
});
*/

// =============================================================================
//                         EXECUTION ENGINE ARCHITECTURE
// =============================================================================

/*
   The workflow execution engine is responsible for:
   
   1. Validating the workflow graph structure
   2. Performing topological sorting to determine execution order
   3. Executing semantic nodes with appropriate handlers
   4. Streaming results back to the client
   5. Managing token budgets and API rate limits
   6. Handling errors and providing execution traces
   
   Core Components:
   
   - WorkflowExecutor: Orchestrates the overall execution process
   - NodeHandlerRegistry: Factory for node-specific handlers
   - NodeHandler: Abstract class for handling different semantic node types
   - ExecutionContext: Maintains state between node executions
   - TokenBudget: Tracks and enforces token usage limits
   - ExecutionTracer: Records detailed execution logs
*/

/*
class WorkflowExecutor {
  constructor(workflow, config, options = {}) {
    this.workflow = workflow;
    this.config = config;
    this.options = options;
    this.context = new ExecutionContext();
    this.handlers = new NodeHandlerRegistry();
    this.tracer = new ExecutionTracer();
    this.tokenBudget = new TokenBudget(options.maxTokens);
  }

  async execute() {
    // 1. Validate workflow structure
    const validation = validateWorkflow(this.workflow);
    if (!validation.isValid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    // 2. Perform topological sort
    const sortedNodes = this.topologicalSort();
    
    // 3. Create execution record
    const execution = await this.createExecutionRecord();
    
    // 4. Execute nodes in order
    for (const node of sortedNodes) {
      await this.executeNode(node, execution);
      
      if (this.context.shouldHalt) {
        break;
      }
    }
    
    // 5. Finalize execution
    return this.finalizeExecution(execution);
  }
  
  async executeNode(node, execution) {
    // Get appropriate handler for node type
    const handler = this.handlers.getHandler(node.data.type);
    
    // Create node execution record
    const nodeExecution = await this.createNodeExecutionRecord(node, execution);
    
    try {
      // Update node state to RUNNING
      await this.updateNodeExecutionState(nodeExecution, 'RUNNING');
      
      // Execute the node
      const startTime = Date.now();
      const result = await handler.execute(node, this.context, this.config);
      const duration = Date.now() - startTime;
      
      // Update token usage
      this.tokenBudget.add(result.tokenUsage);
      
      // Update node execution record
      await this.updateNodeExecutionSuccess(nodeExecution, result, duration);
      
      // Update node in workflow with execution result
      this.context.setNodeResult(node.id, result);
      
      return result;
    } catch (error) {
      // Handle execution error
      await this.updateNodeExecutionFailure(nodeExecution, error);
      throw error;
    }
  }
  
  // Additional methods for topological sorting, execution management, etc.
}
*/

// =============================================================================
//                             SECURITY MEASURES
// =============================================================================

/*
   Security Measures:
   
   1. API Key Encryption:
      - OpenAI API keys stored encrypted at rest using AES-256
      - Keys only decrypted in memory during execution
   
   2. Content Security:
      - Strict CSP headers to prevent XSS attacks
      - Input sanitization for all user-provided content
      
   3. Rate Limiting:
      - IP-based rate limiting for public endpoints
      - User-based rate limiting for authenticated endpoints
      - Graduated rate limits based on user tier
      
   4. Authentication & Authorization:
      - JWT-based authentication with short expiry
      - Role-based access control for workflows
      - Secure cookie handling with SameSite and HttpOnly flags
      
   5. Data Protection:
      - PII isolation and encryption where necessary
      - Regular security audits and vulnerability scanning
*/

// =============================================================================
//                          IMPLEMENTATION ROADMAP
// =============================================================================

/*
   Phase 1: Core Backend (Days 1-5)
   --------------------------------
   - Set up Fastify server with tRPC integration
   - Implement Prisma schema and migrations
   - Create basic workflow CRUD operations
   - Implement simple workflow validation
   - Add authentication middleware
   
   Phase 2: Execution Engine (Days 6-10)
   ------------------------------------
   - Implement topological sort algorithm
   - Create node handler registry and base handlers
   - Implement handlers for each node type prefix
   - Add execution context and state management
   - Create execution record tracking
   
   Phase 3: AI Integration (Days 11-15)
   ----------------------------------
   - Implement OpenAI proxy with streaming
   - Add token usage tracking and budgeting
   - Create rate limiting middleware
   - Implement API key encryption
   - Add error handling and retry logic
   
   Phase 4: Streaming & Real-time Updates (Days 16-20)
   ------------------------------------------------
   - Implement SSE for real-time execution updates
   - Add WebSocket fallback for older clients
   - Create execution progress tracking
   - Implement execution pause/resume functionality
   
   Phase 5: Security & Deployment (Days 21-25)
   ----------------------------------------
   - Add comprehensive security headers
   - Implement rate limiting
   - Set up Docker containerization
   - Configure GitHub Actions for CI/CD
   - Deploy to Fly.io and Vercel
   
   Phase 6: Observability & Testing (Days 26-30)
   ------------------------------------------
   - Set up Sentry for error tracking
   - Add Prometheus metrics and Grafana dashboards
   - Implement extensive logging with Loki
   - Create unit tests with Vitest
   - Add integration tests with Cypress
*/

// =============================================================================
//                             INTEGRATION POINTS
// =============================================================================

/*
   Frontend Integration Points:
   
   1. API Client:
      - Replace local storage with API calls in workflow components
      - Add authentication flow
      - Connect execution status updates to UI
      
   2. Real-time Updates:
      - Subscribe to SSE for execution progress
      - Update node states based on execution events
      - Show streaming results in Test Panel
      
   3. Error Handling:
      - Display execution errors in UI
      - Provide debugging information for failed nodes
      - Add retry functionality
*/

// =============================================================================
//                             NEXT STEPS
// =============================================================================

/*
   Immediate Next Steps:
   
   1. Set up project structure for backend
   2. Create Prisma schema and generate client
   3. Implement Fastify server with tRPC
   4. Set up basic API routes for workflow CRUD
   5. Begin implementation of execution engine
*/
