import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Check if we're running on the server
const isServer = typeof window === 'undefined';

let prisma: PrismaClient;

if (isServer) {
  // Server-side initialization
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
} else {
  // Client-side - provide a mock/dummy client that throws helpful errors
  prisma = new Proxy({} as PrismaClient, {
    get(target, prop) {
      if (prop === 'then') {
        // Special case for allowing Promise.resolve(prisma)
        return undefined;
      }
      throw new Error(
        `PrismaClient is not available in the browser. You're trying to access the '${String(prop)}' property.`
      );
    },
  });
}

// Export the prisma instance
export { prisma }; 