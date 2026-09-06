export type Difficulty = 1 | 2 | 3;

export const difficultyLabels: Record<Difficulty, string> = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};
export const LEVEL_NAME_MAX_LENGTH = 80;
export const CREATOR_NAME_MAX_LENGTH = 32;

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 1 || value === 2 || value === 3;
}

export function validateName(value: unknown, label: string, maxLength: number): string | null {
  if (typeof value !== "string" || !value.trim()) return `Enter a ${label}.`;
  if (value.trim().length > maxLength) return `Keep the ${label} to ${maxLength} characters or fewer.`;
  if (/[\u0000-\u001f\u007f]/.test(value)) return `Use a single line for the ${label}.`;
  return null;
}
