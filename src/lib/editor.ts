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

export function parseMap(text: string): number[][] {
  let value;
  try { value = JSON.parse(text); } catch { throw new Error("That map isn't valid JSON."); }
  if (!Array.isArray(value) || value.length < EDITOR_MIN_SIZE || value.length > EDITOR_MAX_SIZE ||
      !Array.isArray(value[0]) || value[0].length < EDITOR_MIN_SIZE || value[0].length > EDITOR_MAX_SIZE ||
      !value.every(row => Array.isArray(row) && row.length === value[0].length &&
        row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 4))) {
    throw new Error(`Use a rectangular map from ${EDITOR_MIN_SIZE} to ${EDITOR_MAX_SIZE} tiles per side, with values 0–4.`);
  }
  if (value.some((row, y) => row.some((cell: number, x: number) =>
    (!x || !y || x === row.length - 1 || y === value.length - 1) && cell !== 1))) {
    throw new Error("Surround the map with walls.");
  }
  return value;
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
