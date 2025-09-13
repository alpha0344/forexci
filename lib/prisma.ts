import { PrismaClient } from '@prisma/client'

// Instance globale de Prisma Client pour éviter les reconnections en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// En développement, on stocke l'instance dans global pour éviter 
// la création de nouvelles instances à chaque rechargement
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}