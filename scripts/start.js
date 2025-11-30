import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const cwd = process.cwd()
const port = process.env.PORT ?? '3000'
const hostname = process.env.HOSTNAME ?? '0.0.0.0'

const standaloneEntry = join(cwd, '.next', 'standalone', 'server.js')
const nextBinary = join(cwd, 'node_modules', '.bin', 'next')

const useStandalone = existsSync(standaloneEntry)

if (useStandalone) {
  console.log('[start] Found standalone build output. Launching server.js')
} else {
  console.warn(
    '[start] .next/standalone/server.js not found. Falling back to `next start`.',
  )
}

const [command, args] = useStandalone
  ? ['node', [standaloneEntry]]
  : [nextBinary, ['start', '-H', hostname, '-p', port]]

const child = spawn(command, args, {
  cwd,
  stdio: 'inherit',
  env: { ...process.env, PORT: port, HOSTNAME: hostname },
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error('Failed to launch the Next.js server.', error)
  process.exit(1)
})
