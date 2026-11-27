import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { base, root, runId, metadata, request } from './scripts/runtime.mjs';

const output = path.resolve(process.env.R01_K06_OUTPUT ?? path.join(root, 'output'));
const runDir = path.join(output, 'r01-k06', 'runs', runId);
const jobs = [
  ['Ba luồng nghiệp vụ', 'demo_3_luong.mjs', 'demo/ket_qua.json'],
  ['Pairwise và dữ liệu sai', 'pairwise_owner/run_owner_pairwise.mjs', 'owner/results.json'],
  ['Tên thú nuôi trùng và ngày khám hôm nay', 'pairwise_owner/run_remaining_flows.mjs', 'flows/remaining_flows.json'],
];
await mkdir(runDir, { recursive: true });
const started = performance.now();
const summary = { ...metadata(), runDirectory: path.relative(root, runDir).split(path.sep).join('/'),
  jobs: [], cases: [], status: 'FAIL' };
const env = { ...process.env, R01_K06_RUN_ID: runId, R01_K06_RUN_DIR: runDir };

async function run(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, file)], { cwd: root, env,
      stdio: 'inherit', windowsHide: true });
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
}
const evidence = (group, file) => path.relative(root, path.join(runDir, group, file))
  .split(path.sep).join('/');
const csv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

try {
  const form = await request('/owners/new');
  if (form.response.status !== 200 || !form.body.includes('name="firstName"')) {
    throw new Error(`Không có form chủ nuôi: HTTP ${form.response.status}`);
  }
  // Capture server-reported build/git information independently of caller metadata.
  const info = await request('/actuator/info');
  if (info.response.status === 200) {
    try { summary.serverInfo = JSON.parse(info.body); } catch { summary.serverInfo = null; }
  }
  const results = [];
  if (process.argv.includes('--verify-pict')) {
    const verified = await run('pairwise_owner/verify_pict.mjs');
    summary.pictVerification = JSON.parse(await readFile(path.join(runDir, 'owner/pict_verification.json'), 'utf8'));
    if (verified.code !== 0 || summary.pictVerification.status !== 'PASS') throw new Error('Không tái tạo được PICT');
  }
  for (const [name, file, resultFile] of jobs) {
    const jobStart = performance.now();
    console.log(`\n=== ${name} ===`);
    const exit = await run(file);
    summary.jobs.push({ name, file, exitCode: exit.code, signal: exit.signal,
      durationMs: Math.round(performance.now() - jobStart) });
    const result = JSON.parse(await readFile(path.join(runDir, resultFile), 'utf8'));
    if (result.runId !== runId || result.commit !== summary.commit) throw new Error(`Kết quả khác run/commit: ${file}`);
    results.push(result);
    if (exit.code !== 0 || result.status !== 'PASS') summary.jobs.at(-1).error = result.error ?? result.setupError ?? 'Có ca không đạt';
  }
  const [demo, pairwise, remaining] = results;
  summary.coverage = pairwise.coverage;
  summary.cases = [
    ...demo.cases.map((entry, index) => ({ ...entry, id: ['TC01', 'FIND', 'TC04', 'TC06'][index],
      group: 'Luồng nghiệp vụ', description: entry.flow,
      evidence: evidence('demo', entry.evidence ?? 'ket_qua.json') })),
    ...pairwise.positive.map(entry => ({ ...entry, group: 'Pairwise',
      description: Object.entries(entry.classes).map(([k, v]) => `${k}=${v}`).join('; '),
      evidence: evidence('owner', entry.evidence) })),
    ...pairwise.negative.map(entry => ({ ...entry, group: 'Dữ liệu sai', description: entry.classes.description,
      evidence: evidence('owner', entry.evidence), searchEvidence: evidence('owner', entry.searchEvidence) })),
    ...remaining.cases.map(entry => ({ ...entry, group: 'Luồng âm tính',
      evidence: evidence('flows', entry.evidence), afterEvidence: evidence('flows', entry.afterEvidence) })),
  ];
  if (summary.cases.length !== 27 || new Set(summary.cases.map(c => c.id)).size !== 27) {
    throw new Error(`Cần đủ 27 mã ca riêng biệt, nhận ${summary.cases.length}`);
  }
  summary.status = summary.jobs.every(job => job.exitCode === 0 && !job.error) &&
    summary.cases.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL';
} catch (error) {
  summary.error = String(error);
}
summary.total = summary.cases.length;
summary.passed = summary.cases.filter(c => c.status === 'PASS').length;
summary.durationMs = Math.round(performance.now() - started);
const lines = [['Mã ca', 'Nhóm', 'Mô tả', 'Kết quả', 'Bằng chứng'],
  ...summary.cases.map(c => [c.id, c.group, c.description, c.status,
    [c.evidence, c.searchEvidence, c.afterEvidence].filter(Boolean).join('; ')])];
const table = '\uFEFF' + lines.map(line => line.map(csv).join(',')).join('\r\n') + '\r\n';
for (const directory of [runDir, output]) {
  await writeFile(path.join(directory, 'R01_K06_tong_hop.json'), JSON.stringify(summary, null, 2) + '\n');
  await writeFile(path.join(directory, 'R01_K06_ket_qua_ca.csv'), table);
}
console.log(`\nR01 K06: ${summary.status} ${summary.passed}/${summary.total} ca; run ${runId}`);
if (summary.status !== 'PASS') {
  console.error(summary.error ?? 'Có ca không đạt');
  process.exitCode = 1;
}
