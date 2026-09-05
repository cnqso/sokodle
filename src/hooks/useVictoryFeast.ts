"use client";

import { useEffect, useState } from "react";
import { advanceFeast, BITE_MS, BOWL_FINISH_MS, FEAST_START_MS, type Feast } from "@/lib/victoryFeast";

export default function useVictoryFeast(won: boolean, bowlCount: number) {
  const [feast, setFeast] = useState<Feast | null>(null);

  useEffect(() => {
    if (!won) {
      setFeast(null);
      return;
    }
    if (!bowlCount) {
      setFeast({ bowl: 0, bite: 3, done: true });
      return;
    }
    // Let the final push arrive before starting the first snack.
    const start = window.setTimeout(() => setFeast({ bowl: 0, bite: 0, done: false }), FEAST_START_MS);
    return () => window.clearTimeout(start);
  }, [won, bowlCount]);

  useEffect(() => {
    if (!won || !feast || feast.done) return;
    const next = window.setTimeout(() => setFeast(advanceFeast(feast, bowlCount)),
      feast.bite === 3 ? BOWL_FINISH_MS : BITE_MS);
    return () => window.clearTimeout(next);
  }, [won, feast, bowlCount]);

  return { feast: won ? feast : null };
}
