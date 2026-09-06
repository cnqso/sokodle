const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Run the actual TypeScript route and moderation helper with only external I/O replaced.
function setup({ flags = [false, false], moderationResponse, moderationFailure = false, databaseFailure = false } = {}) {
  const inserted = [];
  const moderationCalls = [];
  let connections = 0;
  let closed = 0;
  const cache = new Map();
  const db = {
    async execute(sql, args) {
      if (databaseFailure) throw new Error('Database unavailable');
      if (sql.includes('INSERT')) inserted.push(args);
      if (sql.includes('SELECT')) return [inserted.map((args, index) => ({
        user_level_id: String(index + 1), user_name: args[0], creator_name: args[1],
        difficulty: args[2], layout: args[3], uploaded_at: '2026-09-06T12:00:00Z',
      }))];
      return [{ affectedRows: 1 }];
    },
    async end() { closed++; },
  };
  const fakeFetch = async (url, options) => {
    moderationCalls.push({ url, body: JSON.parse(options.body) });
    if (moderationFailure) throw new Error('Moderation unavailable');
    return Response.json(moderationResponse ?? { results: flags.map(flagged => ({ flagged })) });
  };
  function load(file) {
    const filename = path.resolve(file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, fetch: fakeFetch,
      process: { env: { OPEN_AI_KEY: 'test-only-key' } },
      AbortSignal, URL, console: { error() {} },
      require(id) {
        if (id === '@/lib/db') return { getDBConnection: async () => { connections++; return db; } };
        if (id.startsWith('@/')) return load(`src/${id.slice(2)}.ts`);
        return require(id);
      },
    }, { filename });
    return module.exports;
  }
  const route = load('src/app/api/submit-level/route.ts');
  return {
    inserted, moderationCalls,
    get connections() { return connections; }, get closed() { return closed; },
    submit: body => route.POST(new Request('http://localhost/api/submit-level', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })),
    list: () => load('src/app/api/user-levels/route.ts').GET(new Request('http://localhost/api/user-levels')),
    detail: () => load('src/app/api/user-level/route.ts').GET(new Request('http://localhost/api/user-level?id=1')),
  };
}
const valid = {
  user_name: '  Carrot Corner  ', creator_name: '  GardenPig  ', difficulty: 2,
  layout: [[1,1,1,1,1], [1,4,2,3,1], [1,1,1,1,1]],
};

test('moderates both trimmed names, persists the credit/rating, and returns them through list and detail', async () => {
  const app = setup();
  assert.equal((await app.submit(valid)).status, 200);
  assert.deepEqual(app.moderationCalls[0].body, {
    model: 'omni-moderation-latest', input: ['Carrot Corner', 'GardenPig'],
  });
  assert.equal(app.moderationCalls.length, 1);
  assert.equal(app.inserted.length, 1);
  for (const response of [await app.list(), await app.detail()]) {
    assert.equal(response.status, 200);
    const [level] = await response.json();
    assert.equal(level.user_name, 'Carrot Corner');
    assert.equal(level.creator_name, 'GardenPig');
    assert.equal(level.difficulty, 2);
    assert.deepEqual(level.layout, valid.layout);
    assert.equal('country' in level, false);
  }
  assert.equal(app.closed, 3);
});

for (const [flags, field] of [[[true, false], 'levelName'], [[false, true], 'creatorName']]) {
  test(`rejects flagged ${field} even when the editor's preflight is skipped`, async () => {
    const app = setup({ flags });
    const response = await app.submit(valid);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).field, field);
    assert.equal(app.connections, 0);
  });
}

for (const difficulty of [0, 4, 1.5, '2', null]) {
  test(`rejects invalid difficulty ${JSON.stringify(difficulty)} before moderation or database access`, async () => {
    const app = setup();
    assert.equal((await app.submit({ ...valid, difficulty })).status, 400);
    assert.equal(app.moderationCalls.length, 0);
    assert.equal(app.connections, 0);
  });
}

for (const difficulty of [1, 3]) {
  test(`accepts difficulty ${difficulty}`, async () => {
    const app = setup();
    assert.equal((await app.submit({ ...valid, difficulty })).status, 200);
    assert.equal(app.inserted[0][2], difficulty);
  });
}

for (const creator_name of ['', '  ', 'x'.repeat(33), ['GardenPig'], 'line\nbreak']) {
  test(`rejects invalid username ${JSON.stringify(creator_name)}`, async () => {
    const app = setup();
    assert.equal((await app.submit({ ...valid, creator_name })).status, 400);
    assert.equal(app.moderationCalls.length, 0);
    assert.equal(app.connections, 0);
  });
}

for (const options of [
  { moderationFailure: true },
  { moderationResponse: { results: [] } },
  { moderationResponse: { results: [{ flagged: false }, {}] } },
]) {
  test(`fails closed on unavailable or malformed moderation: ${JSON.stringify(options)}`, async () => {
    const app = setup(options);
    assert.equal((await app.submit(valid)).status, 503);
    assert.equal(app.connections, 0);
  });
}

test('a failed database save returns an error and closes the connection', async () => {
  const app = setup({ databaseFailure: true });
  assert.equal((await app.submit(valid)).status, 500);
  assert.equal(app.closed, 1);
});
