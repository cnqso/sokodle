import type { Difficulty } from "./levelMetadata";

export type Coords = { x: number, y: number };
export type Vector = { dx: number, dy: number };


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

export type ArrowKey = keyof typeof keyMap
export type GameState = "notPlaying" | "playing" | "won"
export type FinalScore = { time: number, steps: number }

// Timestamp looks like this: "2025-02-09T22:00:32.000Z"
export type UserLevel = {
  user_level_id: string;
  user_name: string; // Historical column name: this is the level title.
  creator_name: string | null;
  difficulty: Difficulty;
  layout: number[][];
  uploaded_at: string;
};
export type UserLevelRow = Omit<UserLevel, "layout"> & { layout: string };
