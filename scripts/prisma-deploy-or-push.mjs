#!/usr/bin/env node
import { spawn } from 'node:child_process';

const SCHEMA_PATH = 'prisma/schema.prisma';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('Skipping Prisma schema apply because DATABASE_URL is not set.');
  process.exit(0);
}

/**
 * Runs a command and returns the exit status alongside captured output.
 * Output is streamed to the parent process to preserve logs.
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<{ code: number | null, signal: NodeJS.Signals | null, stdout: string, stderr: string }>}
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(chunk);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(chunk);
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code, signal) => {
      resolve({ code, signal, stdout, stderr });
    });
  });
}

function includesBaselineError(output) {
  return output.toLowerCase().includes('p3005');
}

(async () => {
  const deploy = await runCommand('npx', ['prisma', 'migrate', 'deploy', '--schema', SCHEMA_PATH]);

  if (deploy.code === 0) {
    process.exit(0);
  }

  const combinedOutput = `${deploy.stdout}\n${deploy.stderr}`;

  if (includesBaselineError(combinedOutput)) {
    console.warn('Prisma migrate deploy failed because the database is not empty. Falling back to `prisma db push`.');
    const push = await runCommand('npx', ['prisma', 'db', 'push', '--schema', SCHEMA_PATH]);

    if (push.code === 0) {
      console.log('Prisma schema pushed successfully.');
      process.exit(0);
    }

    const pushOutput = `${push.stdout}\n${push.stderr}`;
    console.error('`prisma db push` also failed. Please inspect the logs above for details.');
    console.error(pushOutput);
    process.exit(push.code ?? 1);
  }

  console.error('`prisma migrate deploy` failed with an unexpected error.');
  console.error(combinedOutput);
  process.exit(deploy.code ?? 1);
})();
