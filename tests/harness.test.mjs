import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { root } from '../scripts/runtime.mjs';

async function child(script, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const processChild = spawn(process.execPath, [path.join(root, script), ...args], {
      cwd: os.tmpdir(), env: { ...process.env, ...env }, windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    processChild.stdout.on('data', chunk => { output += chunk; });
    processChild.stderr.on('data', chunk => { output += chunk; });
    processChild.once('error', reject);
    processChild.once('exit', code => resolve({ code, output }));
  });
}

test('coverage rejects an incomplete suite and unknown classes', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'r01-coverage-'));
  try {
    const cases = await readFile(path.join(root, 'pairwise_owner/owner_cases.tsv'), 'utf8');
    const fixture = path.join(temporary, 'cases.tsv');
    const env = { R01_K06_RUN_DIR: temporary, PICT_CASES_FILE: fixture };
    await writeFile(fixture, cases);
    const complete = await child('pairwise_owner/run_owner_pairwise.mjs', ['--check'], env);
    assert.equal(complete.code, 0, complete.output);
    const coverage = JSON.parse(await readFile(path.join(temporary, 'owner/coverage.json')));
    assert.equal(coverage.coveredPairs, 90);
    await writeFile(fixture, cases.trim().split(/\r?\n/).slice(0, 2).join('\n'));
    const incomplete = await child('pairwise_owner/run_owner_pairwise.mjs', ['--check'], env);
    assert.notEqual(incomplete.code, 0);
    assert.match(incomplete.output, /coverage incomplete/);
    await writeFile(fixture, cases.replace('short', 'unknown-class'));
    const unknown = await child('pairwise_owner/run_owner_pairwise.mjs', ['--check'], env);
    assert.notEqual(unknown.code, 0);
    assert.match(unknown.output, /Unknown/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('a failing server overwrites an old PASS summary and returns nonzero', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'r01-failure-'));
  const server = createServer((request, response) => { response.writeHead(503); response.end('unavailable'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await writeFile(path.join(temporary, 'R01_K06_tong_hop.json'), JSON.stringify({ status: 'PASS', total: 27 }));
    const result = await child('run_r01_k06.mjs', [], { R01_K06_OUTPUT: temporary,
      PETCLINIC_URL: `http://127.0.0.1:${server.address().port}` });
    assert.notEqual(result.code, 0);
    const summary = JSON.parse(await readFile(path.join(temporary, 'R01_K06_tong_hop.json')));
    assert.equal(summary.status, 'FAIL');
    assert.equal(summary.total, 0);
    assert.match(summary.error, /503/);
    assert.ok(summary.runId);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});

test('HTTP timeout stops a server that never responds', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'r01-timeout-'));
  const sockets = new Set();
  const server = createServer(() => {});
  server.on('connection', socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await child('run_r01_k06.mjs', [], { R01_K06_OUTPUT: temporary,
      PETCLINIC_URL: `http://127.0.0.1:${server.address().port}`, R01_K06_TIMEOUT_MS: '200' });
    assert.notEqual(result.code, 0);
    const summary = JSON.parse(await readFile(path.join(temporary, 'R01_K06_tong_hop.json')));
    assert.equal(summary.status, 'FAIL');
    assert.match(summary.error, /TimeoutError/);
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  }
});
