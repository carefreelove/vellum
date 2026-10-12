import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDatabase } from '../server/database.mjs';
import { createApp } from '../server/app.mjs';

let server, db, base;
before(async () => {
  db = openDatabase(':memory:');
  server = createApp(db).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});
const get = (path) => fetch(base + path);

test('health checks database connectivity', async () => {
  const response = await get('/api/health');
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
});
test('catalog contains three original bilingual concepts', async () => {
  const { items, total } = await (await get('/api/themes')).json();
  assert.equal(total, 3);
  assert.equal(items[0].id, 'paper-studio');
  for (const item of items) {
    assert.ok(item.name.zh && item.name.en && item.description.zh && item.description.en);
    assert.equal(item.status, 'concept');
  }
});
test('filters combine and search matches Chinese and English', async () => {
  const dark = await (await get('/api/themes?mode=dark')).json();
  assert.equal(dark.total, 2);
  const search = await (await get('/api/themes?q=' + encodeURIComponent('苔'))).json();
  assert.equal(search.items[0].id, 'moss-and-mist');
  const combined = await (await get('/api/themes?mode=light&mood=organic')).json();
  assert.equal(combined.total, 0);
  const english = await (await get('/api/themes?q=ORBIT')).json();
  assert.equal(english.total, 1);
});
test('invalid filters and repeated parameters return 400', async () => {
  for (const query of [
    'mode=wrong',
    'sort=wrong',
    'mood=wrong',
    'q=a&q=b',
    'q=' + 'a'.repeat(101),
  ]) {
    assert.equal((await get('/api/themes?' + query)).status, 400);
  }
});
test('unknown themes and routes are explicit 404 errors', async () => {
  for (const path of ['/api/themes/nope', '/api/themes/nope/palette', '/api/nope']) {
    assert.equal((await get(path)).status, 404);
  }
});
test('SQL-shaped input cannot change query semantics', async () => {
  const response = await get('/api/themes/' + encodeURIComponent("' OR 1=1 --"));
  assert.equal(response.status, 404);
  assert.equal((await (await get('/api/themes')).json()).total, 3);
});
test('palette download has attachment metadata and honest compatibility notice', async () => {
  const response = await get('/api/themes/paper-studio/palette');
  assert.match(response.headers.get('content-disposition'), /paper-studio\.palette\.json/);
  const data = await response.json();
  assert.equal(data.palette.accent, '#ae3b24');
  assert.match(data.notice, /Not an installable/);
});
test('seed is idempotent and database survives reopening', () => {
  const directory = mkdtempSync(join(tmpdir(), 'theme-gallery-test-'));
  const path = join(directory, 'test.sqlite');
  let database = openDatabase(path);
  database.prepare('INSERT INTO themes VALUES (?, ?)').run('test', JSON.stringify({ id: 'test' }));
  database.close();
  database = openDatabase(path);
  assert.equal(database.prepare('SELECT count(*) AS count FROM themes').get().count, 4);
  database.close();
  rmSync(directory, { recursive: true });
});
test('native download serves text only for the experimental sample', async () => {
  const response = await get('/api/themes/paper-studio/native');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/plain/);
  assert.match(response.headers.get('content-disposition'), /codex-theme.txt/);
  assert.match(await response.text(), /^codex-theme-v1:/);
  assert.equal((await get('/api/themes/midnight-orbit/native')).status, 404);
});
