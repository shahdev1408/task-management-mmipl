import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL }
  },
  log: ["error"],
})

globalForPrisma.prisma = prisma