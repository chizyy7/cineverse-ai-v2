import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __cineversePrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__cineversePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__cineversePrisma = prisma;
}

export default prisma;
