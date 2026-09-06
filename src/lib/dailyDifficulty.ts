import ratings from "@/lib/levels/daily-ratings.json";
import type { Difficulty } from "@/lib/levelMetadata";

/** Reviewed built-in maps; new daily puzzles default to medium until rated. */
export function dailyDifficulty(layout: number[][]): Difficulty {
  const key = JSON.stringify(layout);
  return (ratings.find(rating => JSON.stringify(rating.layout) === key)?.difficulty ?? 2) as Difficulty;
}
