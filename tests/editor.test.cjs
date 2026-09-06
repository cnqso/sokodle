const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const mod = {exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/editor.ts','utf8'), {
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText,{module:mod,exports:mod.exports});
const {paintTile, resizeMap, mapErrors} = mod.exports;
const map = [[1,1,1,1,1],[1,4,0,0,1],[1,2,3,0,1],[1,1,1,1,1]];

test('placing a guinea pig moves the existing pig and preserves the previous map for undo',()=>{
  const next=paintTile(map,3,1,4);
  assert.equal(next.flat().filter(cell=>cell===4).length,1);
  assert.equal(next[1][3],4);
  assert.equal(next[1][1],0);
  assert.equal(map[1][1],4);
});
test('border painting and repainting an unchanged tile are no-ops',()=>{
  assert.equal(paintTile(map,0,1,0),map);
  assert.equal(paintTile(map,1,1,4),map);
});
test('expansion preserves interior objects, opens the old border, and encloses the new one',()=>{
  const next=resizeMap(map,6,5);
  assert.equal(next[1][1],4);
  assert.equal(next[2][1],2);
  assert.equal(next[1][4],0);
  assert.equal(next[1][5],1);
  assert.ok(next[4].every(cell=>cell===1));
});
test('testing requires a player, a bowl, and enough carrots; spare carrots are valid',()=>{
  assert.equal(mapErrors(map).length,0);
  assert.equal(mapErrors(paintTile(map,3,1,2)).length,0);
  assert.ok(mapErrors(resizeMap([[1,1],[1,1]],5,5)).length>0);
  assert.ok(mapErrors(paintTile(map,1,2,0)).length>0);
});
