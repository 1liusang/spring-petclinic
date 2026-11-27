import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.PETCLINIC_URL ?? 'http://localhost:8080';
const output = path.join(root, 'output');
const jobs = [
  ['Ba luồng nghiệp vụ', 'demo_3_luong.mjs'],
  ['Pairwise và dữ liệu sai', 'pairwise_owner/run_owner_pairwise.mjs'],
  ['Tên thú nuôi trùng và ngày khám hôm nay', 'pairwise_owner/run_remaining_flows.mjs'],
];

async function run(relativePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, relativePath)], {
      cwd: root, env: process.env, stdio: 'inherit', windowsHide: true,
    });
    child.once('error', reject);
    child.once('exit', code => resolve(code));
  });
}
function csv(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

const summary = { ranAt: new Date().toISOString(), base, jobs: [], status: 'FAIL' };
try {
  const response = await fetch(new URL('/owners/new', base));
  if (!response.ok) throw new Error(`Form /owners/new trả HTTP ${response.status}`);
  for (const [name, file] of jobs) {
    console.log(`\n=== ${name} ===`);
    const exitCode = await run(file);
    summary.jobs.push({ name, file, exitCode });
    if (exitCode !== 0) throw new Error(`${name} thất bại; xem log phía trên`);
  }
  const demo = JSON.parse(await readFile(path.join(output, 'bang_chung_chay_app/ket_qua.json')));
  const pairwise = JSON.parse(await readFile(path.join(root, 'pairwise_owner/evidence/results.json')));
  const remaining = JSON.parse(await readFile(path.join(root, 'pairwise_owner/evidence/remaining_flows.json')));
  if (demo.status !== 'PASS' || pairwise.status !== 'PASS' || remaining.status !== 'PASS') {
    throw new Error('Ít nhất một tệp kết quả ghi FAIL');
  }
  const cases = [
    ...demo.cases.map((entry, index) => ({ id: ['TC01', 'FIND', 'TC04', 'TC06'][index],
      group: 'Luồng nghiệp vụ', description: entry.flow, status: entry.status,
      evidence: `output/bang_chung_chay_app/${entry.evidence ?? 'ket_qua.json'}` })),
    ...pairwise.positive.map(entry => ({ id: entry.id, group: 'Pairwise',
      description: Object.entries(entry.classes).map(([k, v]) => `${k}=${v}`).join('; '),
      status: entry.status, evidence: `pairwise_owner/evidence/${entry.evidence}` })),
    ...pairwise.negative.map(entry => ({ id: entry.id, group: 'Dữ liệu sai',
      description: entry.classes.description, status: entry.status,
      evidence: `pairwise_owner/evidence/${entry.evidence}; pairwise_owner/evidence/${entry.searchEvidence}` })),
    ...remaining.cases.map(entry => ({ id: entry.id, group: 'Luồng âm tính',
      description: entry.description, status: entry.status,
      evidence: `pairwise_owner/evidence/${entry.evidence}` })),
  ];
  summary.commit = demo.commit;
  summary.coverage = pairwise.coverage;
  summary.total = cases.length;
  summary.passed = cases.filter(x => x.status === 'PASS').length;
  summary.status = summary.passed === summary.total ? 'PASS' : 'FAIL';
  const header = ['Mã ca', 'Nhóm', 'Mô tả', 'Kết quả', 'Bằng chứng'];
  const lines = [header, ...cases.map(x => [x.id, x.group, x.description, x.status, x.evidence])];
  await writeFile(path.join(output, 'R01_K06_ket_qua_ca.csv'), '\uFEFF' +
    lines.map(line => line.map(csv).join(',')).join('\r\n') + '\r\n', 'utf8');
  if (summary.status !== 'PASS') throw new Error('Có ca kiểm thử không đạt');
} catch (error) {
  summary.error = String(error);
  process.exitCode = 1;
}
await writeFile(path.join(output, 'R01_K06_tong_hop.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(`\nR01 K06: ${summary.status} ${summary.passed ?? 0}/${summary.total ?? 0} ca; ` +
  `${summary.coverage?.coveredPairs ?? 0}/${summary.coverage?.totalPairs ?? 90} cặp`);
if (summary.error) console.error(summary.error);
