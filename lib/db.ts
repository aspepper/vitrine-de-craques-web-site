import { PrismaClient } from '@prisma/client'

import { ensurePrismaEnginePath } from './prisma-engine'

ensurePrismaEnginePath()

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    return null
  }

  return new PrismaClient()
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma =
  globalThis.prisma ??
  (prismaClientSingleton() ??
    (new Proxy(
      {},
      {
        get() {
          throw new Error('DATABASE_URL não configurada para o Prisma Client')
        },
      },
    ) as PrismaClient))

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
