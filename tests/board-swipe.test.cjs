const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, require) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require, Element: Cell });
  return mod.exports;
}
class Cell {
  dataset = { cell: '2,3' };
  closest() { return this; }
}
function setup() {
  const listeners = new Map(), effects = [], cleanups = [], moves = [], taps = [];
  const cell = new Cell();
  const board = {
    contains: target => target === cell,
    addEventListener: (name, fn, options) => listeners.set(name, { fn, options }),
    removeEventListener: (name, fn) => { assert.equal(listeners.get(name).fn, fn); listeners.delete(name); },
    setPointerCapture() {}, hasPointerCapture: () => false,
  };
  const react = { useRef: current => ({ current }), useLayoutEffect: fn => effects.push(fn) };
  const swipe = load('src/lib/swipe.ts');
  const hook = load('src/hooks/useBoardSwipe.ts', name => name === 'react' ? react : swipe).default;
  const handlers = hook(direction => moves.push({ ...direction }), (x, y) => taps.push([x, y]));
  handlers.ref.current = board;
  effects.forEach(fn => { const cleanup = fn(); if (cleanup) cleanups.push(cleanup); });
  const point = (x, y, identifier = 1) => ({ clientX: x, clientY: y, identifier });
  const fire = (name, points, options = {}) => {
    const event = { cancelable: true, target: cell, touches: points, changedTouches: points,
      prevented: false, preventDefault() { this.prevented = true; }, ...options };
    listeners.get(name).fn(event);
    return event;
  };
  return { handlers, listeners, moves, taps, point, fire, board, cleanup: () => cleanups.forEach(fn => fn()) };
}

test('claims a touch at its start with a non-passive board listener, before any movement', () => {
  const s = setup();
  assert.equal(s.listeners.get('touchstart').options.passive, false);
  assert.equal(s.fire('touchstart', [s.point(1, 100)]).prevented, true);
  assert.equal(s.moves.length, 0);
});
test('left and right edge swipes deliver one move, with no duplicate pointer move or tap', () => {
  for (const [start, end, dx] of [[1, 80, 1], [389, 310, -1]]) {
    const s = setup();
    s.handlers.onPointerDown({ pointerType: 'touch', isPrimary: true, button: 0, pointerId: 1, clientX: start, clientY: 100 });
    s.fire('touchstart', [s.point(start, 100)]);
    s.fire('touchmove', [s.point(end, 100)]);
    s.handlers.onPointerMove({ pointerId: 1, clientX: end, clientY: 100, currentTarget: s.board });
    s.fire('touchmove', [s.point(end + dx * 30, 100)]);
    s.fire('touchend', [], { changedTouches: [s.point(end, 100)] });
    assert.deepEqual(s.moves, [{ dx, dy: 0 }]);
    assert.deepEqual(s.taps, []);
  }
});
test('a canceled native click is replaced by exactly one cell tap', () => {
  const s = setup();
  s.fire('touchstart', [s.point(100, 100)]);
  s.fire('touchend', [], { changedTouches: [s.point(104, 102)] });
  assert.deepEqual(s.taps, [[2, 3]]);
  let stopped = false;
  s.handlers.onClickCapture({ preventDefault() {}, stopPropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(s.moves.length, 0);
});
test('vertical fast swipe works even if the browser delivers no intermediate move', () => {
  const s = setup();
  s.fire('touchstart', [s.point(100, 100)]);
  s.fire('touchend', [], { changedTouches: [s.point(100, 160)] });
  assert.deepEqual(s.moves, [{ dx: 0, dy: 1 }]);
  assert.equal(s.taps.length, 0);
});
test('diagonal drags, multitouch and canceled touches never become taps', () => {
  for (const kind of ['diagonal', 'multitouch', 'cancel']) {
    const s = setup();
    s.fire('touchstart', [s.point(100, 100)]);
    if (kind === 'diagonal') s.fire('touchmove', [s.point(150, 150)]);
    if (kind === 'multitouch') s.fire('touchstart', [s.point(100, 100), s.point(200, 100, 2)]);
    if (kind === 'cancel') s.fire('touchcancel', []);
    s.fire('touchend', [], { changedTouches: [s.point(100, 100)] });
    assert.equal(s.taps.length, 0);
    assert.equal(s.moves.length, 0);
  }
});
test('mouse drags still work, ordinary mouse clicks remain available, and listeners clean up', () => {
  const s = setup();
  const pointer = { pointerType: 'mouse', isPrimary: true, button: 0, pointerId: 2, clientX: 100, clientY: 100, currentTarget: s.board };
  s.handlers.onPointerDown(pointer);
  s.handlers.onPointerMove({ ...pointer, clientX: 150 });
  s.handlers.onPointerUp({ ...pointer, clientX: 170 });
  assert.deepEqual(s.moves, [{ dx: 1, dy: 0 }]);
  s.handlers.onPointerDown(pointer);
  s.handlers.onPointerUp(pointer);
  s.handlers.onClickCapture({ preventDefault() { assert.fail('mouse tap canceled'); }, stopPropagation() {} });
  s.cleanup();
  assert.equal(s.listeners.size, 0);
});
