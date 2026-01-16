// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { ensurePrismaEnginePath } from './prisma-engine'

ensurePrismaEnginePath()

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const databaseUrl = process.env.DATABASE_URL

export const prisma =
  globalForPrisma.prisma ??
  (databaseUrl
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString: databaseUrl }),
        // log: ['query', 'error', 'warn'] // útil pra depurar em dev
      })
    : (new Proxy(
        {},
        {
          get() {
            throw new Error('DATABASE_URL não configurada para o Prisma Client')
          },
        },
      ) as PrismaClient))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
