"use client";

import { useEffect, useState } from "react";
import LevelEditor from "@/app/editor/LevelEditor";

import Sokoban from "@/components/Sokoban";
import { FinalScore, GameState } from "@/lib/types";
import WelcomeModal from "@/components/WelcomeModal";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Nav from "@/components/Nav";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import { formatMilliseconds } from "@/lib/utils";

// Example usage
export default function Home() {
  const [playing, setPlaying] = useState<GameState>("notPlaying");

  const date = new Date().toISOString().split("T")[0];
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [level, setLevel] = useState<number[][] | null>(null);
  const [levelID, setLevelID] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/daily-level?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('API Response:', data);
        if (data.layout) {
          setLevel(data.layout);
          setLevelID(data.daily_id);
        }
      })
      .catch((error) => {
        console.error('Error fetching daily level:', error);
      });
  }, [date]);

  async function handleSubmit() {
    await fetch("/api/attempt", {
      method: "POST",
      body: JSON.stringify({
        levelID,
        moves: finalScore?.steps,
        timeMs: finalScore?.time,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }

  useEffect(() => {
    if (finalScore?.steps && finalScore?.time && levelID) {
      const response = handleSubmit();
      console.log(response);
    }
  }, [finalScore]);

  return (
    <div>
      <WelcomeModal />
      <Card className="max-w-max max-width: max-content">
      {level && <CardHeader className="pb-0">
         <CardTitle className="font-orelo text-2xl">
            🍒 Sokodle {levelID ? `#${levelID}` : ''} 📦
          </CardTitle>
          <CardDescription>
            Use arrow keys or tap squares to move
          </CardDescription>
        </CardHeader>}
        <CardContent className="px-2">
          {level ? (
            <Sokoban
              mapData={level}
              playing={playing}
              setPlaying={setPlaying}
              setFinalScore={setFinalScore}
              context="daily"
              levelNumber={levelID}
            />
          ) : (
            <Loader width={"400px"} height={"400px"} size={"60px"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
