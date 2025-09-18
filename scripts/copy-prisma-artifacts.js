const { cpSync, existsSync, mkdirSync, rmSync } = require('node:fs')
const { dirname, join } = require('node:path')

const projectRoot = process.cwd()

const pathsToCopy = [
  {
    source: join(projectRoot, 'node_modules', '.prisma', 'client'),
    targets: [
      join(
        projectRoot,
        '.next',
        'standalone',
        'node_modules',
        '.prisma',
        'client',
      ),
      join(projectRoot, '.next', 'server', '.prisma', 'client'),
      join(
        projectRoot,
        '.next',
        'server',
        'chunks',
        '.prisma',
        'client',
      ),
    ],
  },
  {
    source: join(projectRoot, 'node_modules', '@prisma', 'client'),
    targets: [
      join(
        projectRoot,
        '.next',
        'standalone',
        'node_modules',
        '@prisma',
        'client',
      ),
      join(projectRoot, '.next', 'server', '@prisma', 'client'),
      join(
        projectRoot,
        '.next',
        'server',
        'chunks',
        '@prisma',
        'client',
      ),
    ],
  },
]

function ensureDirectory(path) {
  const dir = dirname(path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

function copyPrismaAssets() {
  let copiedSomething = false

  for (const { source, targets } of pathsToCopy) {
    if (!existsSync(source)) {
      console.warn(`[copy-prisma-artifacts] Source path not found: ${source}`)
      continue
    }

    for (const target of targets) {
      if (existsSync(target)) {
        rmSync(target, { recursive: true, force: true })
      }

      ensureDirectory(target)

      cpSync(source, target, { recursive: true })
      copiedSomething = true
      console.log(`[copy-prisma-artifacts] Copied Prisma artifacts to ${target}`)
    }
  }

  if (!copiedSomething) {
    console.warn(
      '[copy-prisma-artifacts] No Prisma artifacts were copied. Have you run `prisma generate`?',
    )
  }
}

try {
  copyPrismaAssets()
} catch (error) {
  console.error('[copy-prisma-artifacts] Failed to copy Prisma artifacts.', error)
  process.exitCode = 1
}
