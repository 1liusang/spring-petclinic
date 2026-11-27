import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { base, runId, metadata, request, evidenceDirectory } from './scripts/runtime.mjs';

const evidenceDir = evidenceDirectory('demo', 'output/bang_chung_chay_app');
await mkdir(evidenceDir, { recursive: true });

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function post(route, values) {
  return request(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values),
  });
}

async function save(name, body) {
  await writeFile(path.join(evidenceDir, name), body, 'utf8');
}

function redirectPath(response) {
  const location = response.headers.get('location');
  if (!location) return '';
  return new URL(location, base).pathname.replace(/;jsessionid=[^/]+/i, '');
}

const lastName = `KTPM${runId}`;
const petName = `Milo${runId}`;
const birth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const birthDate = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, '0')}-${String(birth.getDate()).padStart(2, '0')}`;
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const visitDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
const result = { ...metadata(), cases: [] };

try {
  const home = await request('/');
  check(home.response.status === 200 && home.body.includes('PetClinic'), 'Trang chủ không mở được');
  await save('01_trang_chu.html', home.body);

  const ownerForm = await request('/owners/new');
  check(ownerForm.response.status === 200 && ownerForm.body.includes('name="firstName"'), 'Form chủ nuôi không mở được');
  let stepStarted = performance.now();
  const ownerInput = {
    firstName: 'An', lastName, address: '12 Tran Phu', city: 'Da Lat', telephone: '0123456789',
  };
  const ownerPost = await post('/owners/new', ownerInput);
  const ownerLocation = redirectPath(ownerPost.response);
  check(ownerPost.response.status === 302 && /^\/owners\/\d+$/.test(ownerLocation), `Thêm chủ nuôi thất bại: ${ownerPost.response.status} ${ownerLocation}`);
  const ownerId = Number(ownerLocation.match(/\d+$/)[0]);
  const ownerPage = await request(ownerLocation);
  check(ownerPage.response.status === 200 && ownerPage.body.includes(lastName), 'Không thấy chủ nuôi vừa tạo');
  await save('02_chu_nuoi.html', ownerPage.body);
  result.cases.push({ flow: 'Thêm chủ nuôi', status: 'PASS', ownerId, path: ownerLocation,
    input: ownerInput, expected: { httpStatus: 302, persisted: true },
    actual: { httpStatus: ownerPost.response.status, location: ownerLocation, persisted: true },
    durationMs: Math.round(performance.now() - stepStarted), evidence: '02_chu_nuoi.html' });

  stepStarted = performance.now();
  const find = await request(`/owners?lastName=${encodeURIComponent(lastName)}`);
  check(find.response.status === 302 && redirectPath(find.response) === ownerLocation, 'Tìm chủ nuôi không trả về đúng hồ sơ');
  result.cases.push({ flow: 'Tìm chủ nuôi', status: 'PASS', query: lastName, ownerId,
    input: { lastName }, expected: { httpStatus: 302, location: ownerLocation },
    actual: { httpStatus: find.response.status, location: redirectPath(find.response) },
    durationMs: Math.round(performance.now() - stepStarted) });

  const petRoute = `/owners/${ownerId}/pets/new`;
  const petForm = await request(petRoute);
  check(petForm.response.status === 200 && petForm.body.includes('value="cat"'), 'Form thú nuôi không mở được');
  stepStarted = performance.now();
  const petInput = { name: petName, birthDate, type: 'cat' };
  const petPost = await post(petRoute, petInput);
  check(petPost.response.status === 302 && redirectPath(petPost.response) === ownerLocation, `Thêm thú nuôi thất bại: ${petPost.response.status}`);
  const petPage = await request(ownerLocation);
  check(petPage.response.status === 200 && petPage.body.includes(petName), 'Không thấy thú nuôi vừa tạo');
  const petIdMatch = petPage.body.match(new RegExp(`(?:/owners/)?${ownerId}/pets/(\\d+)/visits/new`));
  check(petIdMatch, 'Không tìm thấy đường dẫn thêm lượt khám cho thú nuôi');
  const petId = Number(petIdMatch[1]);
  await save('03_thu_nuoi.html', petPage.body);
  result.cases.push({ flow: 'Thêm thú nuôi', status: 'PASS', petId, path: ownerLocation,
    input: petInput, expected: { httpStatus: 302, persisted: true },
    actual: { httpStatus: petPost.response.status, location: redirectPath(petPost.response), persisted: true },
    durationMs: Math.round(performance.now() - stepStarted), evidence: '03_thu_nuoi.html' });

  const visitRoute = `/owners/${ownerId}/pets/${petId}/visits/new`;
  const visitForm = await request(visitRoute);
  check(visitForm.response.status === 200 && visitForm.body.includes('name="date"'), 'Form lượt khám không mở được');
  const description = `Kham dinh ky ${runId}`;
  stepStarted = performance.now();
  const visitInput = { date: visitDate, description, petId: String(petId) };
  const visitPost = await post(visitRoute, visitInput);
  check(visitPost.response.status === 302 && redirectPath(visitPost.response) === ownerLocation, `Thêm lượt khám thất bại: ${visitPost.response.status}`);
  const visitPage = await request(ownerLocation);
  check(visitPage.response.status === 200 && visitPage.body.includes(description) && visitPage.body.includes(visitDate), 'Không thấy lượt khám vừa tạo');
  await save('04_luot_kham.html', visitPage.body);
  result.cases.push({ flow: 'Ghi nhận lượt khám', status: 'PASS', visitDate, path: ownerLocation,
    input: visitInput, expected: { httpStatus: 302, persisted: true },
    actual: { httpStatus: visitPost.response.status, location: redirectPath(visitPost.response), persisted: true },
    durationMs: Math.round(performance.now() - stepStarted), evidence: '04_luot_kham.html' });

  result.status = 'PASS';
  result.ownerId = ownerId;
  result.petId = petId;
  result.ownerName = `An ${lastName}`;
  result.petName = petName;
} catch (error) {
  result.status = 'FAIL';
  result.error = String(error);
  process.exitCode = 1;
}

await writeFile(path.join(evidenceDir, 'ket_qua.json'), JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(result, null, 2));
