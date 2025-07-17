import { PrismaClient } from '@prisma/client';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../index';

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return { req, res, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
