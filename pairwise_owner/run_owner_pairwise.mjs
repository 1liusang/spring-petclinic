import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { base, runId, metadata, request, evidenceDirectory } from '../scripts/runtime.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = evidenceDirectory('owner', 'pairwise_owner/evidence');
const fields = ['firstName', 'lastName', 'address', 'city', 'telephone'];
const classes = {
  firstName: ['short', 'unicode', 'max30'],
  lastName: ['short', 'unicode', 'max30'],
  address: ['short', 'unicode', 'max255'],
  city: ['short', 'unicode', 'max80'],
  telephone: ['digitsA', 'digitsB', 'digitsC'],
};

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

const modelLines = (await readFile(path.join(here, 'owner_model.pict'), 'utf8'))
  .split(/\r\n|\n|\r/).map(x => x.trim()).filter(x => x && !x.startsWith('#'));
const model = Object.fromEntries(modelLines.map(line => {
  const separator = line.indexOf(':');
  assert(separator > 0, `Invalid PICT model line: ${line}`);
  return [line.slice(0, separator).trim(), line.slice(separator + 1).split(',').map(x => x.trim())];
}));
assert(Object.keys(model).join(',') === fields.join(','), 'PICT model fields do not match test script');
for (const field of fields) {
  assert(model[field].join(',') === classes[field].join(','),
    `PICT model classes for ${field} do not match test script`);
}

const lines = (await readFile(process.env.PICT_CASES_FILE ?? path.join(here, 'owner_cases.tsv'), 'utf8'))
  .replace(/^\uFEFF/, '').split(/\r\n|\n|\r/).map(x => x.trim()).filter(Boolean);
assert(lines.shift() === fields.join('\t'), 'PICT output header does not match model');
const rows = lines.map((line, i) => {
  const values = line.split('\t');
  assert(values.length === fields.length, `Invalid PICT row ${i + 1}`);
  return Object.fromEntries(fields.map((field, j) => {
    assert(classes[field].includes(values[j]), `Unknown ${field} class: ${values[j]}`);
    return [field, values[j]];
  }));
});
assert(rows.length > 0, 'No PICT rows');

const covered = new Set();
for (const row of rows) {
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      covered.add(`${fields[i]}=${row[fields[i]]}|${fields[j]}=${row[fields[j]]}`);
    }
  }
}
const missing = [];
for (let i = 0; i < fields.length; i++) {
  for (let j = i + 1; j < fields.length; j++) {
    for (const a of classes[fields[i]]) {
      for (const b of classes[fields[j]]) {
        const pair = `${fields[i]}=${a}|${fields[j]}=${b}`;
        if (!covered.has(pair)) missing.push(pair);
      }
    }
  }
}
const totalPairs = fields.reduce((sum, field, i) => sum + fields.slice(i + 1)
  .reduce((inner, other) => inner + classes[field].length * classes[other].length, 0), 0);
const coverage = { generatedCases: rows.length,
  exhaustiveCases: fields.reduce((product, field) => product * classes[field].length, 1),
  totalPairs, coveredPairs: covered.size, missingPairs: missing };
assert(covered.size === totalPairs && missing.length === 0, 'Pairwise coverage incomplete');
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'coverage.json'), JSON.stringify(coverage, null, 2) + '\n');
console.log(`PICT: ${rows.length} cases; ${covered.size}/${totalPairs} pairs covered`);
if (process.argv.includes('--check')) process.exit(0);

const result = { ...metadata(), model: 'owner_model.pict',
  casesFile: 'owner_cases.tsv', coverage, positive: [], negative: [] };
function dataFor(row, index) {
  const tag = `PW${runId}${index.toString().padStart(2, '0')}`;
  const value = {
    firstName: { short: 'An', unicode: 'Ánh', max30: 'A'.repeat(30) },
    lastName: { short: `Test${tag}`, unicode: `Đức${tag}`, max30: `L${'X'.repeat(29 - tag.length)}${tag}` },
    address: { short: '12 Tran Phu', unicode: '12 Đường Trần Phú', max255: 'A'.repeat(255) },
    city: { short: 'Da Lat', unicode: 'Đà Lạt', max80: 'C'.repeat(80) },
    telephone: { digitsA: '0123456789', digitsB: '0987654321', digitsC: '5551234567' },
  };
  const data = Object.fromEntries(fields.map(f => [f, value[f][row[f]]]));
  assert(data.firstName.length <= 30 && data.lastName.length <= 30 &&
    data.address.length <= 255 && data.city.length <= 80 && /^\d{10}$/.test(data.telephone),
    `Bad test data in row ${index}`);
  return data;
}

async function postOwner(data) {
  return request('/owners/new', { method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data) });
}
function locationPath(response) {
  const location = response.headers.get('location');
  return location ? new URL(location, base).pathname.replace(/;jsessionid=[^/]+/i, '') : '';
}
async function runCase(label, row, data, negative = false, field = '') {
  const started = performance.now();
  const message = !negative ? null : field === 'telephone' ? 'Telephone must be a 10-digit number'
    : data[field] === '' ? 'must not be blank'
      : `size must be between 0 and ${{ firstName: 30, lastName: 30, address: 255, city: 80 }[field]}`;
  const entry = { id: label, classes: row, input: data, status: 'FAIL',
    expected: negative ? { httpStatus: 200, validationField: field, message, persisted: false }
      : { httpStatus: 302, persisted: true, fields: data } };
  try {
    const posted = await postOwner(data);
    const location = locationPath(posted.response);
    entry.httpStatus = posted.response.status;
    entry.location = location;
    if (negative) {
      assert(posted.response.status === 200, `Expected form response, got ${posted.response.status}`);
      assert(new RegExp(`class="form-group has-error"[\\s\\S]{0,200}<label for="${field}"`).test(posted.body),
        `Validation error absent for ${field}`);
      assert(posted.body.includes(message), `Validation message absent for ${field}: ${message}`);
      const search = await request(`/owners?lastName=${encodeURIComponent(data.lastName)}`);
      assert(search.response.status === 200 && search.body.includes('has not been found'),
        `Rejected owner ${data.lastName} appeared in search`);
      entry.validationField = field;
      entry.actual = { validationField: field, message, persisted: false, httpStatus: posted.response.status };
      entry.evidence = `${label}.html`;
      entry.searchEvidence = `${label}_search.html`;
      await writeFile(path.join(output, entry.evidence), posted.body);
      await writeFile(path.join(output, entry.searchEvidence), search.body);
    } else {
      assert(posted.response.status === 302 && /^\/owners\/\d+$/.test(location),
        `Expected owner redirect, got ${posted.response.status} ${location}`);
      const page = await request(location);
      assert(page.response.status === 200 &&
        fields.every(f => page.body.includes(data[f])), `Saved owner data missing on ${location}`);
      entry.ownerId = Number(location.match(/\d+$/)[0]);
      entry.actual = { httpStatus: posted.response.status, persisted: true, fieldsMatch: true };
      entry.evidence = `${label}.html`;
      await writeFile(path.join(output, entry.evidence), page.body);
    }
    entry.status = 'PASS';
  } catch (error) {
    entry.error = String(error);
  }
  entry.durationMs = Math.round((performance.now() - started) * 100) / 100;
  (negative ? result.negative : result.positive).push(entry);
  console.log(`${label}: ${entry.status}${entry.error ? ` ${entry.error}` : ''}`);
}

try {
  const form = await request('/owners/new');
  assert(form.response.status === 200 && form.body.includes('name="firstName"'),
    'PetClinic owner form is unavailable');
  for (let i = 0; i < rows.length; i++) {
    await runCase(`PW${String(i + 1).padStart(2, '0')}`, rows[i], dataFor(rows[i], i + 1));
  }
  const valid = dataFor(rows[0], 99);
  const negatives = [
    ['NEG01', 'firstName', '', 'blank firstName'],
    ['NEG02', 'telephone', '123456789', '9 digit telephone'],
    ['NEG03', 'telephone', '12345abcde', 'nondigit telephone'],
    ['NEG04', 'firstName', 'A'.repeat(31), '31 character firstName'],
    ['NEG05', 'lastName', 'L'.repeat(31), '31 character lastName'],
    ['NEG06', 'address', 'A'.repeat(256), '256 character address'],
    ['NEG07', 'city', 'C'.repeat(81), '81 character city'],
  ];
  for (const [id, field, bad, description] of negatives) {
    const data = { ...valid, lastName: `Bad${runId}${id}`, [field]: bad };
    await runCase(id, { description }, data, true, field);
  }
} catch (error) {
  result.setupError = String(error);
}

const all = [...result.positive, ...result.negative];
result.summary = { positivePassed: result.positive.filter(x => x.status === 'PASS').length,
  positiveTotal: rows.length, negativePassed: result.negative.filter(x => x.status === 'PASS').length,
  negativeTotal: 7 };
result.status = !result.setupError && all.length === rows.length + 7 &&
  all.every(x => x.status === 'PASS') ? 'PASS' : 'FAIL';
await writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
if (result.status !== 'PASS') process.exitCode = 1;
console.log(JSON.stringify(result.summary));
