import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const base = process.env.PETCLINIC_URL ?? 'http://localhost:8080';
export const runId = process.env.R01_K06_RUN_ID ?? `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
const timeout = Number(process.env.R01_K06_TIMEOUT_MS ?? 15000);
if (!Number.isSafeInteger(timeout) || timeout < 1) throw new Error('R01_K06_TIMEOUT_MS must be a positive integer');

export function git(...args) {
  try { return execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim(); }
  catch { return null; }
}

export function metadata() {
  return { runId, ranAt: new Date().toISOString(), commit: git('rev-parse', 'HEAD'),
    dirty: Boolean(git('status', '--porcelain', '--untracked-files=no')),
    applicationCommit: process.env.PETCLINIC_APP_COMMIT ?? null,
    node: process.version, platform: process.platform, base };
}

export function evidenceDirectory(group, fallback) {
  return process.env.R01_K06_RUN_DIR
    ? path.join(path.resolve(process.env.R01_K06_RUN_DIR), group) : path.join(root, fallback);
}

export async function request(route, options = {}) {
  const response = await fetch(new URL(route, base), { redirect: 'manual', ...options,
    signal: options.signal ?? AbortSignal.timeout(timeout) });
  return { response, body: await response.text() };
}

export function dateISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
