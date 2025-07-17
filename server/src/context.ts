import { PrismaClient } from '@prisma/client';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../index';

// Simulate a session object for demonstration purposes
// In a real app, this would come from an auth library like Lucia, NextAuth, etc.
export interface UserSession {
  user: {
    id: string;
    // other user properties
  } | null;
}

const getUserFromHeader = (req: CreateFastifyContextOptions['req']): UserSession => {
  // For demo purposes, we'll use a default user
  // In production, this would validate JWT tokens, sessions, etc.
  return { user: { id: 'demo-user' } };
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const session = getUserFromHeader(req);
  return { req, res, prisma, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
