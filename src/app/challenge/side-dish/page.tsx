"use client";

import { useState } from "react";
import DifficultyRating from "@/components/DifficultyRating";
import Sokoban from "@/components/Sokoban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinalScore, GameState } from "@/lib/types";
import level from "@/lib/levels/side-dish.json";

export default function SideDishPage() {
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [attempt, setAttempt] = useState(0);

  function startOver() {
    setPlaying("notPlaying");
    setFinalScore(null);
    setAttempt(previous => previous + 1);
  }

  return (
    <main className="w-full max-w-[620px] px-2 pb-6">
      <Card className="w-full">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="font-display text-2xl">{level.name}</CardTitle>
            <DifficultyRating value={2} />
            <Button variant="neutral" size="sm" onClick={startOver}>Start over</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Sokoban key={attempt} mapData={level.layout} playing={playing} setPlaying={setPlaying}
            finalScore={finalScore} setFinalScore={setFinalScore} />
        </CardContent>
      </Card>
    </main>
  );
}
