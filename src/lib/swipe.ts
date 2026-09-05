import type { Vector } from "./types";

export const SWIPE_THRESHOLD_PX = 24;

export function swipeDirection(dx: number, dy: number): Vector | null {
  const x = Math.abs(dx);
  const y = Math.abs(dy);
  if (Math.max(x, y) < SWIPE_THRESHOLD_PX) return null;
  // Wait for a clear direction instead of choosing arbitrarily on a diagonal.
  if (Math.max(x, y) < Math.min(x, y) * 1.15) return null;
  return x > y ? { dx: Math.sign(dx), dy: 0 } : { dx: 0, dy: Math.sign(dy) };
}
