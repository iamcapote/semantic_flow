// Semantic Logic AI Workflow Builder - Backend Setup

import Fastify from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastifyCors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { createContext } from './src/context';
import { appRouter } from './src/routers';

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Create and configure Fastify server
export async function createServer() {
  const fastify = Fastify({
    logger: true,
    trustProxy: true
  });
  
  // Register CORS plugin
  await fastify.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
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
  
  return fastify;
}

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  
  const start = async () => {
    try {
      const server = await createServer();
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
