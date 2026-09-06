"use client";

import { useEffect, useState, useCallback } from "react";

import DifficultyRating from "@/components/DifficultyRating";
import { isDifficulty, type Difficulty } from "@/lib/levelMetadata";
import Sokoban from "@/components/Sokoban";
import { FinalScore, GameState } from "@/lib/types";
import WelcomeModal from "@/components/WelcomeModal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Loader from "@/components/Loader";

// Example usage
export default function Home() {
  const [playing, setPlaying] = useState<GameState>("notPlaying");

  const date = new Date().toISOString().split("T")[0];
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [level, setLevel] = useState<number[][] | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [levelID, setLevelID] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/daily-level?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.layout) {
          setLevel(data.layout);
          setLevelID(data.daily_id);
          setDifficulty(isDifficulty(data.difficulty) ? data.difficulty : 2);
        }
      })
      .catch((error) => {
        console.error('Error fetching daily level:', error);
      });
  }, [date]);

  const handleSubmit = useCallback(async () => {
    await fetch("/api/attempt", {
      method: "POST",
      body: JSON.stringify({
        levelID,
        moves: finalScore?.steps,
        timeMs: finalScore?.time,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }, [levelID, finalScore?.steps, finalScore?.time]);

  useEffect(() => {
    if (finalScore?.steps && finalScore?.time && levelID) {
      handleSubmit();
    }
  }, [finalScore, handleSubmit, levelID]);

  return (
    <div className="w-full max-w-[540px] px-2 pb-4">
      <WelcomeModal />
      <Card className="w-full">
      {level && <CardHeader className="pb-0">
         <CardTitle className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-display text-2xl">
            <span>Sokodle {levelID ? `#${levelID}` : ''}</span>
            <DifficultyRating value={difficulty} />
          </CardTitle>
          <CardDescription>
            Swipe, use arrow keys, or tap a nearby square
          </CardDescription>
        </CardHeader>}
        <CardContent className="px-2">
          {level ? (
            <Sokoban
              mapData={level}
              playing={playing}
              setPlaying={setPlaying}
              finalScore={finalScore}
              setFinalScore={setFinalScore}
              context="daily"
              levelNumber={levelID}
            />
          ) : (
            <Loader width={"100%"} height={"400px"} size={"60px"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
