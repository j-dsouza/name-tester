import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Configure timeouts for database warming scenarios
  __internal: {
    engine: {
      requestTimeout: 30000, // 30 seconds
      connectTimeout: 30000,  // 30 seconds
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma