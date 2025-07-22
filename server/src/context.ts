import { PrismaClient } from '@prisma/client';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../index';

// Production: Session object should come from a real authentication provider (e.g., Lucia, NextAuth)
export interface UserSession {
  user: {
    id: string;
    // other user properties
  } | null;
}

const getUserFromHeader = (req: CreateFastifyContextOptions['req']): UserSession => {
  // TODO: Implement real user extraction from request/session
  // Example: Validate JWT, session cookies, etc.
  return { user: null };
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const session = getUserFromHeader(req);
  return { req, res, prisma, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
