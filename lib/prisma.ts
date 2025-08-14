import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Force fresh Prisma client instance
export const prisma: PrismaClient = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})


