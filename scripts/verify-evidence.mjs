import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root as repositoryRoot } from './runtime.mjs';

export async function verifyEvidence(root = repositoryRoot) {
  root = path.resolve(root);
  const resolve = relative => {
    assert.equal(typeof relative, 'string', 'Evidence path must be text');
    const full = path.resolve(root, relative);
    assert.ok(full.startsWith(root + path.sep), `Evidence outside repo: ${relative}`);
    return full;
  };
  const text = relative => readFile(resolve(relative), 'utf8');
  const json = async relative => JSON.parse(await text(relative));
  const summary = await json('output/R01_K06_tong_hop.json');
  assert.equal(summary.status, 'PASS');
  assert.equal(summary.total, 27);
  assert.equal(summary.passed, 27);
  assert.equal(summary.dirty, false, 'Published run must start with clean tracked files');
  assert.match(summary.commit, /^[a-f0-9]{40}$/);
  assert.equal(summary.applicationCommit, summary.commit);
  const serverCommit = summary.serverInfo?.git?.commit?.id;
  assert.ok(typeof serverCommit === 'string' && serverCommit.length >= 7 && summary.commit.startsWith(serverCommit),
    'Server git metadata does not match the declared checkout');
  const expectedIds = ['TC01', 'FIND', 'TC04', 'TC06', 'TC05', 'TC07',
    ...Array.from({ length: 14 }, (_, i) => `PW${String(i + 1).padStart(2, '0')}`),
    ...Array.from({ length: 7 }, (_, i) => `NEG${String(i + 1).padStart(2, '0')}`)].sort();
  assert.deepEqual(summary.cases.map(c => c.id).sort(), expectedIds);
  assert.ok(summary.cases.every(c => c.status === 'PASS'));
  for (const item of summary.cases) {
    assert.ok(item.input && item.expected && item.actual, `${item.id}: missing input/expected/actual`);
    assert.ok(Number.isFinite(item.durationMs) && item.durationMs >= 0, `${item.id}: missing duration`);
    assert.equal(item.actual.httpStatus, item.expected.httpStatus, `${item.id}: wrong HTTP status`);
  }
  assert.equal(summary.jobs.length, 3);
  assert.ok(summary.jobs.every(job => job.exitCode === 0 && !job.error));

  const directory = summary.runDirectory;
  const runSummary = await json(`${directory}/R01_K06_tong_hop.json`);
  assert.deepEqual(runSummary, summary, 'Latest summary and immutable run snapshot differ');
  const demo = await json(`${directory}/demo/ket_qua.json`);
  const owner = await json(`${directory}/owner/results.json`);
  const flows = await json(`${directory}/flows/remaining_flows.json`);
  const pict = await json(`${directory}/owner/pict_verification.json`);
  for (const result of [demo, owner, flows, pict]) {
    assert.equal(result.runId, summary.runId);
    assert.equal(result.commit, summary.commit);
    assert.equal(result.dirty, false);
    assert.equal(result.status, 'PASS');
  }
  assert.equal(pict.generatedCases, 14);
  assert.equal(pict.matchesSavedCases, true);
  assert.match(pict.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(summary.pictVerification, pict);

  const matrix = (await text('pairwise_owner/owner_cases.tsv')).trim().split(/\r?\n/).map(line => line.split('\t'));
  const fields = matrix.shift();
  const levels = Object.fromEntries((await text('pairwise_owner/owner_model.pict')).split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => {
      const [field, values] = line.split(':');
      return [field.trim(), values.split(',').map(value => value.trim())];
    }));
  assert.deepEqual(fields, Object.keys(levels));
  assert.equal(matrix.length, 14);
  const covered = new Set();
  for (const row of matrix) {
    assert.equal(row.length, fields.length);
    row.forEach((value, i) => assert.ok(levels[fields[i]].includes(value)));
    for (let i = 0; i < fields.length; i++) for (let j = i + 1; j < fields.length; j++) {
      covered.add(`${fields[i]}=${row[i]}|${fields[j]}=${row[j]}`);
    }
  }
  let pairs = 0;
  for (let i = 0; i < fields.length; i++) for (let j = i + 1; j < fields.length; j++) {
    for (const a of levels[fields[i]]) for (const b of levels[fields[j]]) {
      pairs++;
      assert.ok(covered.has(`${fields[i]}=${a}|${fields[j]}=${b}`), 'Missing pair');
    }
  }
  assert.equal(pairs, 90);
  assert.deepEqual(summary.coverage, { generatedCases: matrix.length,
    exhaustiveCases: fields.reduce((product, field) => product * levels[field].length, 1),
    totalPairs: pairs, coveredPairs: covered.size, missingPairs: [] });
  assert.deepEqual(owner.coverage, summary.coverage);
  assert.deepEqual(await json(`${directory}/owner/coverage.json`), summary.coverage);

  assert.equal(owner.positive.length, 14);
  assert.equal(owner.negative.length, 7);
  for (const item of owner.positive) {
    const html = await text(`${directory}/owner/${item.evidence}`);
    assert.equal(item.httpStatus, 302);
    assert.equal(item.status, 'PASS');
    for (const field of fields) assert.ok(html.includes(item.input[field]), `${item.id}: saved ${field} absent`);
    assert.deepEqual(item.expected.fields, item.input);
    assert.equal(item.actual.persisted, true);
  }
  for (const item of owner.negative) {
    const html = await text(`${directory}/owner/${item.evidence}`);
    const search = await text(`${directory}/owner/${item.searchEvidence}`);
    assert.equal(item.httpStatus, 200);
    assert.equal(item.status, 'PASS');
    assert.ok(new RegExp(`class="form-group has-error"[\\s\\S]{0,200}<label for="${item.validationField}"`).test(html),
      `${item.id}: wrong validation field`);
    assert.ok(typeof item.expected.message === 'string' && html.includes(item.expected.message),
      `${item.id}: expected validation message absent`);
    assert.equal(item.actual.message, item.expected.message);
    assert.ok(search.includes('has not been found'), `${item.id}: rejected owner search is not empty`);
    assert.equal(item.actual.persisted, false);
  }
  assert.equal(demo.cases.length, 4);
  for (const item of demo.cases) assert.equal(item.status, 'PASS');
  const ownerHtml = await text(`${directory}/demo/02_chu_nuoi.html`);
  const petHtml = await text(`${directory}/demo/03_thu_nuoi.html`);
  const visitHtml = await text(`${directory}/demo/04_luot_kham.html`);
  assert.ok(ownerHtml.includes(demo.ownerName));
  assert.ok(petHtml.includes(demo.petName));
  assert.ok(visitHtml.includes(demo.cases[3].visitDate));
  assert.ok(visitHtml.includes(`Kham dinh ky ${summary.runId}`));
  assert.equal(flows.cases.length, 2);
  const duplicate = flows.cases.find(c => c.id === 'TC05');
  const sameDay = flows.cases.find(c => c.id === 'TC07');
  assert.equal(duplicate.petCount, 1);
  const petCount = (await text(`${directory}/flows/${duplicate.afterEvidence}`))
    .split(`<dd>Milo${summary.runId}</dd>`).length - 1;
  assert.equal(petCount, 1);
  assert.ok((await text(`${directory}/flows/${duplicate.evidence}`)).includes('is already in use'));
  const visitForm = await text(`${directory}/flows/${sameDay.evidence}`);
  assert.ok(/class="form-group has-error"[\s\S]{0,200}<label for="date"/.test(visitForm));
  assert.ok(!(await text(`${directory}/flows/${sameDay.afterEvidence}`)).includes(`Same day visit ${summary.runId}`));

  for (const item of summary.cases) for (const key of ['evidence', 'searchEvidence', 'afterEvidence']) {
    if (item[key]) assert.ok((await stat(resolve(item[key]))).size > 0, `Empty evidence ${item[key]}`);
  }
  const csv = (await text('output/R01_K06_ket_qua_ca.csv')).replace(/^\uFEFF/, '');
  const csvIds = csv.trim().split(/\r?\n/).slice(1).map(line => line.match(/^"([^"]+)"/)[1]).sort();
  assert.deepEqual(csvIds, expectedIds);
  assert.equal(csv, (await text(`${directory}/R01_K06_ket_qua_ca.csv`)).replace(/^\uFEFF/, ''));

  const maven = await json('reports/verification/maven-summary.json');
  assert.equal(maven.commit, summary.commit);
  assert.deepEqual(maven.totals, { tests: 79, failures: 0, errors: 0, skipped: 2 });
  const manifest = await json('reports/verification/evidence-manifest.json');
  assert.equal(manifest.runId, summary.runId);
  assert.equal(manifest.commit, summary.commit);
  assert.equal(new Set(manifest.files.map(file => file.path)).size, manifest.files.length);
  async function walk(relative) {
    const entries = await readdir(resolve(relative), { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) files.push(...await walk(child));
      else if (entry.isFile()) files.push(child);
      else throw new Error(`Unsupported entry in evidence bundle: ${child}`);
    }
    return files;
  }
  const required = [...await walk(directory),
    ...await walk('reports/verification'), 'output/R01_K06_tong_hop.json',
    'output/R01_K06_ket_qua_ca.csv', 'pairwise_owner/owner_model.pict', 'pairwise_owner/owner_cases.tsv']
    .filter(file => file !== 'reports/verification/evidence-manifest.json').sort();
  assert.deepEqual(manifest.files.map(file => file.path).sort(), required, 'Manifest omits or adds bundle files');
  for (const file of manifest.files) {
    const bytes = await readFile(resolve(file.path));
    assert.equal(bytes.length, file.bytes, `Size mismatch: ${file.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Hash mismatch: ${file.path}`);
  }
  return { runId: summary.runId, commit: summary.commit, cases: summary.total,
    pairs, checkedFiles: manifest.files.length, status: 'PASS' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await verifyEvidence(), null, 2)); }
  catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
}
