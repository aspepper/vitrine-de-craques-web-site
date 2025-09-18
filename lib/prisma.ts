// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

import { ensurePrismaEnginePath } from './prisma-engine'

ensurePrismaEnginePath()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'] // útil pra depurar em dev
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
