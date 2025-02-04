export type coords = { x: number, y: number };
export type vector = { dx: number, dy: number };


export const keyMap = {
  ArrowUp: { dx: 0, dy: -1 }, 
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  w: { dx: 0, dy: -1 },
  s: { dx: 0, dy: 1 },
  a: { dx: -1, dy: 0 },
  d: { dx: 1, dy: 0 },
}

export type arrowKey = keyof typeof keyMap
