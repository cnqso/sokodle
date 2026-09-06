const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function setup({ rows = [], connectionFailure = false, queryFailure = false } = {}) {
  const cache = new Map();
  let closed = 0, connections = 0;
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
    const mod = { exports: {} }; cache.set(filename, mod);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText, { exports: mod.exports, module: mod, URL, require(id) {
      if (id === '@/lib/db') return { getDBConnection: async () => {
        connections++;
        if (connectionFailure) throw new Error('Database unavailable');
        return { execute: async () => { if (queryFailure) throw new Error('Query failed'); return [rows]; }, end: async () => { closed++; } };
      } };
      if (id.startsWith('@/')) return load(`src/${id.slice(2)}${id.endsWith('.json') ? '' : '.ts'}`);
      return require(id);
    } });
    return mod.exports;
  }
  return { load, get closed() { return closed; }, get connections() { return connections; },
    get: date => load('src/app/api/daily-level/route.js').GET(new Request(`http://localhost/api/daily-level${date ? `?date=${date}` : ''}`)),
  };
}
test('every daily fallback uses the same reviewed difficulty as its user-level counterpart', async () => {
  const app = setup();
  const reviewed = JSON.parse(fs.readFileSync('scripts/user-level-ratings.json', 'utf8'));
  for (let day = 1; day <= 6; day++) {
    const result = await (await app.get(`2026-09-0${day}`)).json();
    const expected = reviewed.find(row => JSON.stringify(row.layout) === JSON.stringify(result.layout));
    assert.ok(expected);
    assert.equal(result.difficulty, expected.difficulty);
  }
  assert.equal(app.closed, 6);
});
test('database difficulty overrides the default for a known layout and keeps the daily id', async () => {
  const layout = setup().load('src/lib/maps.ts').basic;
  const app = setup({ rows: [{ daily_id: 42, layout: JSON.stringify(layout), difficulty: 3 }] });
  const result = await (await app.get('2026-09-06')).json();
  assert.equal(result.difficulty, 3); assert.equal(result.daily_id, 42);
  assert.equal(app.closed, 1);
});
test('missing ratings use a reviewed layout rating, including already parsed JSON layouts', async () => {
  const layout = setup().load('src/lib/maps.ts').basic;
  const app = setup({ rows: [{ daily_id: 1, layout, difficulty: null }] });
  assert.equal((await (await app.get('2026-09-06')).json()).difficulty, 1);
});
test('unreviewed maps default to medium', () => {
  assert.equal(setup().load('src/lib/dailyDifficulty.ts').dailyDifficulty([[1,1],[1,1]]), 2);
});
for (const failure of ['connectionFailure', 'queryFailure']) {
  test(`${failure} still supplies a rated fallback and closes any open connection`, async () => {
    const app = setup({ [failure]: true });
    const response = await app.get('2026-09-06');
    assert.equal(response.status, 200);
    const body = await response.json(); assert.ok([1,2,3].includes(body.difficulty)); assert.ok(body.layout.length);
    assert.equal(app.closed, failure === 'queryFailure' ? 1 : 0);
  });
}
test('missing date returns 400 before opening the database', async () => {
  const app=setup(); assert.equal((await app.get()).status,400); assert.equal(app.connections,0);
});
