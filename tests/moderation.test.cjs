const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const mod = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/moderation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  module: mod, exports: mod.exports, require, process: { env: {} },
  fetch() { assert.fail('Local moderation must not make network requests'); },
});
const { moderateNames } = mod.exports;

test('allows current levels, ordinary names, Unicode names, and common false positives', () => {
  const names = [
    ...JSON.parse(fs.readFileSync('scripts/user-level-ratings.json', 'utf8')).map(row => row.name),
    'GardenPig', 'Carrot Corner', 'Codex', 'Scunthorpe', 'Cockburn', 'Dickinson',
    'Dickson', 'Classic Puzzle', 'Grasshopper', 'Assassin', 'Grapes',
    'The pen is blue', 'GayPig', 'TransPig', 'José', 'にんじん', '胡萝卜',
  ];
  for (const name of names) assert.equal(moderateNames([name])[0], true, name);
});

test('rejects profanity and slurs with case, repetition, leetspeak, and Unicode disguises', () => {
  for (const name of [
    'FUCK', 'fuuuuuckkk', 'f.u.c.k', 'f_u_c_k', 'f-u-c-k', 'f u c k',
    'f\u200buck', 'f\u2060uck', 'f\ufe0fuck', 'ｆｕｃｋ', '𝒻𝓊𝒸𝓀',
    'sh1t', 'n1gger', 'fuckGardenPig', 'Scunthorpe fuck', 'Dickinson fuck',
  ]) assert.equal(moderateNames([name])[0], false, name);
});

test('checks names independently and rejects names made entirely of invisible characters', () => {
  assert.deepEqual(Array.from(moderateNames(['GardenPig', 'fuck', '\u200b\u2060', '  '])), [true, false, false, false]);
});
