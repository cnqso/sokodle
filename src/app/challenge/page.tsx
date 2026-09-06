"use client";

import { useState } from "react";
import Sokoban from "@/components/Sokoban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinalScore, GameState } from "@/lib/types";
import level from "@/lib/levels/bottleneck.json";

export default function ChallengePage() {
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [attempt, setAttempt] = useState(0);

  function startOver() {
    setPlaying("notPlaying");
    setFinalScore(null);
    setAttempt(previous => previous + 1);
  }

  return (
    <main className="max-w-full px-2 pb-6">
      <Card className="w-fit max-w-full">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">{level.name}</CardTitle>
              <CardDescription>{level.difficulty} · 4 carrots</CardDescription>
            </div>
            <Button variant="neutral" size="sm" onClick={startOver}>Start over</Button>
          </div>
          <CardDescription>Swipe, use arrow keys, or tap a nearby square.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Sokoban key={attempt} mapData={level.layout} playing={playing} setPlaying={setPlaying}
            finalScore={finalScore} setFinalScore={setFinalScore} />
        </CardContent>
      </Card>
    </main>
  );
}
