export const EDITOR_MIN_SIZE = 4;
export const EDITOR_MAX_SIZE = 20;
export const tileLabels = ["Floor", "Wall", "Carrot", "Bowl", "Guinea pig"];

export function resizeMap(map: number[][], width: number, height: number): number[][] {
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
    if (!x || !y || x === width - 1 || y === height - 1) return 1;
    // The previous outside wall becomes floor when the board expands.
    if (x >= map[0].length - 1 || y >= map.length - 1) return 0;
    return map[y]?.[x] ?? 0;
  }));
}

export function paintTile(map: number[][], x: number, y: number, tile: number): number[][] {
  if (!x || !y || x === map[0].length - 1 || y === map.length - 1 || map[y][x] === tile) return map;
  return map.map((row, rowY) => row.map((cell, colX) =>
    rowY === y && colX === x ? tile : tile === 4 && cell === 4 ? 0 : cell));
}

export function mapErrors(map: number[][]): string[] {
  const cells = map.flat();
  const players = cells.filter(cell => cell === 4).length;
  const carrots = cells.filter(cell => cell === 2).length;
  const bowls = cells.filter(cell => cell === 3).length;
  return [
    ...(players !== 1 ? ["Place one guinea pig."] : []),
    ...(!bowls ? ["Add at least one bowl."] : []),
    ...(carrots < bowls ? ["Add a carrot for every bowl."] : []),
  ];
}
