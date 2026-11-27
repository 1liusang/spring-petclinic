import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'evidence');
const base = process.env.PETCLINIC_URL ?? 'http://localhost:8080';
const tag = Date.now().toString(36);
const result = { ranAt: new Date().toISOString(), base, cases: [], status: 'FAIL' };
await mkdir(output, { recursive: true });
function assert(ok, message) { if (!ok) throw new Error(message); }
async function request(route, options = {}) {
  const response = await fetch(new URL(route, base), { redirect: 'manual', ...options });
  return { response, body: await response.text() };
}
function post(route, data) {
  return request(route, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data) });
}
function redirectPath(response) {
  const location = response.headers.get('location');
  return location ? new URL(location, base).pathname.replace(/;jsessionid=[^/]+/i, '') : '';
}
const today = new Date();
const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
try {
  const owner = await post('/owners/new', { firstName: 'An', lastName: `Flow${tag}`,
    address: '12 Tran Phu', city: 'Da Lat', telephone: '0123456789' });
  const ownerPath = redirectPath(owner.response);
  assert(owner.response.status === 302 && /^\/owners\/\d+$/.test(ownerPath), 'Owner setup failed');
  const ownerId = Number(ownerPath.match(/\d+$/)[0]);
  const petName = `Milo${tag}`;
  const birth = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const birthDate = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, '0')}-${String(birth.getDate()).padStart(2, '0')}`;
  const petRoute = `/owners/${ownerId}/pets/new`;
  const pet = await post(petRoute, { name: petName, birthDate, type: 'cat' });
  assert(pet.response.status === 302 && redirectPath(pet.response) === ownerPath, 'Pet setup failed');
  const firstPage = await request(ownerPath);
  assert(firstPage.body.includes(`<dd>${petName}</dd>`), 'Setup pet missing');
  const visitLink = firstPage.body.match(new RegExp(`${ownerId}/pets/(\\d+)/visits/new`));
  assert(visitLink, 'Visit link missing');
  const petId = Number(visitLink[1]);

  const duplicate = await post(petRoute, { name: petName, birthDate, type: 'cat' });
  const afterDuplicate = await request(ownerPath);
  const petCount = afterDuplicate.body.split(`<dd>${petName}</dd>`).length - 1;
  const duplicatePassed = duplicate.response.status === 200 &&
    /class="form-group has-error"[\s\S]{0,200}<label for="name"/.test(duplicate.body) &&
    duplicate.body.includes('is already in use') && petCount === 1;
  result.cases.push({ id: 'TC05', description: 'Duplicate pet name', status: duplicatePassed ? 'PASS' : 'FAIL',
    httpStatus: duplicate.response.status, ownerId, petId, petCount, evidence: 'TC05.html' });
  await writeFile(path.join(output, 'TC05.html'), duplicate.body);

  const description = `Same day visit ${tag}`;
  const sameDay = await post(`/owners/${ownerId}/pets/${petId}/visits/new`,
    { date, description, petId: String(petId) });
  const afterVisit = await request(ownerPath);
  const visitPassed = sameDay.response.status === 200 && sameDay.body.includes('has-error') &&
    !afterVisit.body.includes(description);
  result.cases.push({ id: 'TC07', description: 'Visit date today', status: visitPassed ? 'PASS' : 'FAIL',
    httpStatus: sameDay.response.status, date, ownerId, petId, evidence: 'TC07.html' });
  await writeFile(path.join(output, 'TC07.html'), sameDay.body);
  result.status = result.cases.every(x => x.status === 'PASS') ? 'PASS' : 'FAIL';
} catch (error) {
  result.error = String(error);
}
await writeFile(path.join(output, 'remaining_flows.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exitCode = 1;
