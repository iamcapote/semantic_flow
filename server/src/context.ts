import { PrismaClient } from '@prisma/client';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../index';

// Simulate a session object for demonstration purposes
// In a real app, this would come from an auth library like Lucia, NextAuth, etc.
interface UserSession {
  user: {
    id: string;
    // other user properties
  } | null;
}

const getUserFromHeader = (req: CreateFastifyContextOptions['req']): UserSession => {
  // This is a placeholder for session logic.
  // You might decode a JWT from the Authorization header, for example.
  if (req.headers.authorization) {
    // Dummy logic: if there's any authorization header, assume it's user '1'
    return { user: { id: '1' } };
  }
  return { user: null };
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const session = getUserFromHeader(req);
  return { req, res, prisma, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
