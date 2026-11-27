import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { root } from '../scripts/runtime.mjs';
import { verifyEvidence } from '../scripts/verify-evidence.mjs';

async function snapshot() {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'r01-evidence-'));
  const manifestPath = 'reports/verification/evidence-manifest.json';
  const manifest = JSON.parse(await readFile(path.join(root, manifestPath)));
  for (const file of [...manifest.files, { path: manifestPath }]) {
    const destination = path.join(temporary, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(root, file.path), destination);
  }
  return temporary;
}

test('published evidence passes independently of an application or PICT binary', async () => {
  const result = await verifyEvidence();
  assert.equal(result.cases, 27);
  assert.equal(result.pairs, 90);
  assert.equal(result.status, 'PASS');
});

test('missing HTML evidence is rejected', async () => {
  const temporary = await snapshot();
  try {
    const summary = JSON.parse(await readFile(path.join(temporary, 'output/R01_K06_tong_hop.json')));
    await rm(path.join(temporary, summary.cases.find(c => c.id === 'PW01').evidence));
    await assert.rejects(verifyEvidence(temporary), /ENOENT/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('a stored PASS cannot conceal missing persisted data', async () => {
  const temporary = await snapshot();
  try {
    const summary = JSON.parse(await readFile(path.join(temporary, 'output/R01_K06_tong_hop.json')));
    const owner = JSON.parse(await readFile(path.join(temporary, summary.runDirectory, 'owner/results.json')));
    const evidence = path.join(temporary, summary.cases.find(c => c.id === 'PW01').evidence);
    const html = await readFile(evidence, 'utf8');
    await writeFile(evidence, html.replaceAll(owner.positive[0].input.telephone, 'REMOVED'));
    await assert.rejects(verifyEvidence(temporary), /saved telephone absent/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('replacing a CSV case ID with a duplicate is rejected', async () => {
  const temporary = await snapshot();
  try {
    const csv = path.join(temporary, 'output/R01_K06_ket_qua_ca.csv');
    await writeFile(csv, (await readFile(csv, 'utf8')).replace('"PW01"', '"PW02"'));
    await assert.rejects(verifyEvidence(temporary));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('changed Maven log fails the snapshot hash check', async () => {
  const temporary = await snapshot();
  try {
    const logfile = path.join(temporary, 'reports/verification/maven-test.log');
    await writeFile(logfile, (await readFile(logfile, 'utf8')) + '\nchanged\n');
    await assert.rejects(verifyEvidence(temporary), /Size mismatch|Hash mismatch/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});

test('a manifest cannot silently omit a verification file', async () => {
  const temporary = await snapshot();
  try {
    const filename = path.join(temporary, 'reports/verification/evidence-manifest.json');
    const manifest = JSON.parse(await readFile(filename));
    manifest.files = manifest.files.filter(file => file.path !== 'reports/verification/maven-test.log');
    await writeFile(filename, JSON.stringify(manifest));
    await assert.rejects(verifyEvidence(temporary), /Manifest omits/);
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
