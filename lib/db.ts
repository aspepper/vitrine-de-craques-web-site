import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { PrismaClient } from '@prisma/client'

const engineFileNames = [
  'libquery_engine-debian-openssl-3.0.x.so.node',
  'libquery_engine-debian-openssl-1.1.x.so.node',
]

const engineSearchPaths = [
  ['node_modules', '.prisma', 'client'],
  ['.next', 'standalone', 'node_modules', '.prisma', 'client'],
  ['.next', 'server', 'chunks', '.prisma', 'client'],
]

function ensurePrismaEnginePath() {
  if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
    return
  }

  const cwd = process.cwd()

  for (const segments of engineSearchPaths) {
    for (const file of engineFileNames) {
      const candidate = join(cwd, ...segments, file)

      if (existsSync(candidate)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = candidate
        return
      }
    }
  }
}

ensurePrismaEnginePath()

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
