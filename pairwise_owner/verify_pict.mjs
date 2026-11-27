import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { metadata, evidenceDirectory } from '../scripts/runtime.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const executable = process.env.PICT_PATH ?? path.join(root, '.tmp', 'pict.exe');
const model = path.join(here, 'owner_model.pict');
const expectedFile = path.join(here, 'owner_cases.tsv');
const outputFile = path.join(evidenceDirectory('owner', 'pairwise_owner/evidence'), 'pict_verification.json');
const normalized = text => text.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n').trimEnd();
const result = { ...metadata(), executable,
  command: 'pict owner_model.pict /o:2 /r:20261017', status: 'FAIL' };

try {
  const binary = await readFile(executable);
  result.sha256 = createHash('sha256').update(binary).digest('hex');
  if (!process.env.PICT_PATH && result.sha256 !==
      '80aba862739cf18b4faa13d408163324d188a1c4efccdd977d9c5ba3f8950bbd') {
    throw new Error('PICT binary does not match the release used for this project');
  }
  const run = spawnSync(executable, [model, '/o:2', '/r:20261017'], {
    cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000,
  });
  if (run.error) throw run.error;
  if (run.status !== 0) throw new Error(`PICT exited ${run.status}: ${run.stderr}`);
  const actual = normalized(run.stdout);
  const expected = normalized(await readFile(expectedFile, 'utf8'));
  result.generatedCases = actual.split('\n').length - 1;
  result.matchesSavedCases = actual === expected;
  if (!result.matchesSavedCases) {
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');
    result.firstDifferentLine = Array.from({ length: Math.max(actualLines.length, expectedLines.length) },
      (_, i) => i).find(i => actualLines[i] !== expectedLines[i]) + 1;
    throw new Error(`PICT output differs from owner_cases.tsv at line ${result.firstDifferentLine}`);
  }
  result.status = 'PASS';
} catch (error) {
  result.error = String(error);
  process.exitCode = 1;
}
await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, JSON.stringify(result, null, 2) + '\n');
console.log(`${result.status}: ${result.generatedCases ?? 0} PICT cases; ` +
  `${result.matchesSavedCases ? 'output matches owner_cases.tsv' : result.error}`);
