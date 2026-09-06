// Exact movement BFS for Sokodle, including its multiple-carrot chain pushes.
// Usage: node scripts/solve-level.cjs src/lib/levels/side-dish.json [--no-chain]
const fs = require('node:fs');
const level = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const grid = level.layout, width = grid[0].length, cells = grid.flat();
const floor = new Set(cells.flatMap((v, i) => v === 1 ? [] : [i]));
const goals = cells.flatMap((v, i) => v === 3 ? [i] : []);
const initialBoxes = cells.flatMap((v, i) => v === 2 ? [i] : []);
const start = cells.indexOf(4);
if (start < 0 || !goals.length || initialBoxes.length !== goals.length) throw new Error('Expected one player and equal carrots/bowls');
const directions = [-width, 1, width, -1];
const noChain = process.argv.includes('--no-chain');
// A carrot must be able to reach some bowl, even with all other carrots removed.
const live = new Set(goals), pending = [...goals];
for (let i = 0; i < pending.length; i++) for (const d of directions) {
  const previous = pending[i] - d;
  if (floor.has(previous) && floor.has(previous - d) && !live.has(previous)) {
    live.add(previous); pending.push(previous);
  }
}
const key = (p, b) => `${p}|${b.join(',')}`;
const states = [{ player: start, boxes: initialBoxes, parent: -1, direction: '', push: 0 }];
const seen = new Set([key(start, initialBoxes)]);
let solved = -1;
for (let index = 0; index < states.length; index++) {
  const state = states[index], occupied = new Set(state.boxes);
  if (goals.every(g => occupied.has(g))) { solved = index; break; }
  for (let direction = 0; direction < 4; direction++) {
    const d = directions[direction], next = state.player + d;
    if (!floor.has(next)) continue;
    const chain = [];
    let tip = next;
    while (occupied.has(tip)) { chain.push(tip); tip += d; }
    if (!floor.has(tip) || (noChain && chain.length > 1)) continue;
    const moved = new Set(chain);
    const boxes = state.boxes.map(b => moved.has(b) ? b + d : b).sort((a,b) => a-b);
    if (boxes.some(b => !live.has(b))) continue;
    const id = key(next, boxes);
    if (seen.has(id)) continue;
    seen.add(id);
    states.push({ player: next, boxes, parent: index, direction: 'URDL'[direction], push: chain.length });
  }
  if (states.length > 1500000) throw new Error('Search cap reached; no minimum established');
}
if (solved < 0) {
  console.log(JSON.stringify({ solved: false, states: states.length, noChain }));
} else {
  let solution = '', pushes = 0, chains = 0, emptiedBowls = 0;
  for (let i = solved; states[i].parent !== -1; i = states[i].parent) {
    const state = states[i], previous = states[state.parent];
    solution = state.direction + solution;
    pushes += state.push > 0; chains += state.push > 1;
    emptiedBowls += goals.some(g => previous.boxes.includes(g) && !state.boxes.includes(g));
  }
  console.log(JSON.stringify({ solved: true, minimumMoves: solution.length, pushes, chains, emptiedBowls, states: states.length, noChain, solution }));
}
