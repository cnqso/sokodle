export type Bite = 0 | 1 | 2 | 3;
export type Feast = { bowl: number; bite: Bite; done: boolean };

export const FEAST_START_MS = 240;
export const BITE_MS = 160;
export const BOWL_FINISH_MS = 420;

export function advanceFeast(feast: Feast, bowlCount: number): Feast {
  if (feast.done) return feast;
  if (feast.bite < 3) return { ...feast, bite: (feast.bite + 1) as Bite };
  if (feast.bowl + 1 < bowlCount) return { bowl: feast.bowl + 1, bite: 0, done: false };
  return { ...feast, done: true };
}
