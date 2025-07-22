// TEST-ONLY: Reset provider config for a user (integration tests)
import { __resetProviderConfig } from './src/routers/provider';

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  app.post('/api/test/reset-provider-config', async (req, res) => {
    const { userId } = req.body as { userId: string };
    if (userId) {
      __resetProviderConfig(userId);
      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ error: 'Missing userId' });
    }
  });
}
// Semantic Logic AI Workflow Builder - Backend Setup

import Fastify, { FastifyInstance } from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';
// import { PrismaClient } from '@prisma/client';
import { createContext } from './src/context';
import { appRouter } from './src/routers';

// No DB: Remove Prisma Client

// No DB: Remove FastifyWithPrisma

// Create and configure Fastify server
export async function createServer() {
  // TEST-ONLY: Reset provider config for a user (integration tests)
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    fastify.post('/api/test/reset-provider-config', async (req, reply) => {
      const { userId } = req.body as { userId: string };
      if (userId) {
        __resetProviderConfig(userId);
        reply.status(200).send({ success: true });
      } else {
        reply.status(400).send({ error: 'Missing userId' });
      }
    });
    fastify.log.info('Test-only /api/test/reset-provider-config route registered');
  }
  const fastify = Fastify({
    logger: true,
    trustProxy: true
  });
  // In-memory stores for stateless operation
  const inMemoryUsers: { id: string; name: string }[] = [{ id: 'stateless-user', name: 'Stateless User' }];
  let inMemoryProviders: Array<{ providerId: string; name: string; baseURL: string; models: string[]; isActive: boolean; headers?: any; userId: string }> = [];
  let inMemoryWorkflows: Array<{ id: string; title: string; description: string; content: any; userId: string; version: string }> = [];
  
  // Register CORS plugin with improved configuration
  await fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) {
        return cb(null, true);
      }

      // Custom logic to handle multiple origins if needed
      const allowedOrigins = [
        'https://bookish-robot-r7779gg5695hpr95-8081.app.github.dev',
        'https://bookish-robot-r7779gg5695hpr95-8082.app.github.dev'
      ];

      // If CORS_ORIGIN is set, add it to allowed origins
      if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(process.env.CORS_ORIGIN);
      }

      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.app.github.dev')) {
        return cb(null, true);
      }

      // Default to allow all in development
      if (process.env.NODE_ENV === 'development') {
        return cb(null, true);
      }

      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  });
  
  // Register tRPC plugin
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: { 
      router: appRouter, 
      createContext 
    }
  });
  
  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // REST endpoint: Get first user (for integration tests)
  fastify.get('/api/user', async (req, reply) => {
    try {
      const user = inMemoryUsers[0];
      if (!user) return reply.code(404).send({ error: 'User not found' });
      reply.send(user);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      reply.code(500).send({ error: errorMsg });
    }
  });

  // REST endpoint: Get all provider configs
  fastify.get('/api/providers', async (req, reply) => {
    try {
      reply.send(inMemoryProviders);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      reply.code(500).send({ error: errorMsg });
    }
  });

  // REST endpoint: Upsert provider config
  fastify.post('/api/providers', async (req, reply) => {
    try {
      const { providerId, name, baseURL, models, isActive, headers, userId } = req.body as any;
      if (!providerId || !userId) {
        return reply.code(400).send({ error: 'Invalid provider config' });
      }
      // Upsert logic for in-memory providers
      let idx = inMemoryProviders.findIndex(p => p.providerId === providerId && p.userId === userId);
      if (idx !== -1) {
        inMemoryProviders[idx] = { providerId, name, baseURL, models, isActive, headers, userId };
      } else {
        inMemoryProviders.push({ providerId, name, baseURL, models, isActive, headers, userId });
      }
      reply.send({ success: true, provider: { providerId, name, baseURL, models, isActive, headers, userId } });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      reply.code(500).send({ error: errorMsg });
    }
  });

  // REST endpoint: Get all workflows
  fastify.get('/api/workflows', async (req, reply) => {
    try {
      reply.send(inMemoryWorkflows);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      reply.code(500).send({ error: errorMsg });
    }
  });

  // REST endpoint: Create workflow
  fastify.post('/api/workflows', async (req, reply) => {
    try {
      const { title, description, content, userId } = req.body as any;
      if (!title || !userId) {
        return reply.code(400).send({ error: 'Invalid workflow creation' });
      }
      const workflow = { id: `${Date.now()}`, title, description, content: content || {}, userId, version: '1.0.0' };
      inMemoryWorkflows.push(workflow);
      reply.code(201).send(workflow);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      reply.code(500).send({ error: errorMsg });
    }
  });
  
  return fastify;
}

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

  const start = async () => {
    try {
      const server = await createServer();

      // TEST-ONLY: Register reset-provider-config route on the actual server instance
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        server.post('/api/test/reset-provider-config', async (req, reply) => {
          const { userId } = req.body as { userId: string };
          if (userId) {
            const { __resetProviderConfig } = await import('./src/routers/provider');
            __resetProviderConfig(userId);
            reply.status(200).send({ success: true });
          } else {
            reply.status(400).send({ error: 'Missing userId' });
          }
        });
        server.log.info('Test-only /api/test/reset-provider-config route registered');
      }

      await server.listen({ port: PORT, host: '0.0.0.0' });
      console.log(`🚀 tRPC Server listening on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 tRPC API: http://localhost:${PORT}/api/trpc`);
    } catch (err) {
      console.error('❌ Error starting server:', err);
      process.exit(1);
    }
  };

  start();
}
