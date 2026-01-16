import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { ensurePrismaEnginePath } from './prisma-engine'

ensurePrismaEnginePath()

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    return null
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
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
