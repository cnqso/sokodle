'use client'

import { useEffect, useState } from "react";
import LevelEditor from "@/components/LevelEditor";

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
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// Example usage
export default function Home() {
  const [playing, setPlaying] = useState<GameState>(
    "notPlaying"
  );

  const date = new Date().toISOString().split('T')[0];
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const [level, setLevel] = useState<number[][] | null>(null);
  const [levelID, setLevelID] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/daily-level?date=${date}`)
      .then((res) => res.json())
      .then((data) => { setLevel(data.layout.rows); setLevelID(data.daily_id); })
  }, [date]);

  async function handleSubmit() {
    await fetch("/api/attempt", {
      method: "POST",
      body: JSON.stringify({ levelID, moves: finalScore?.steps, timeMs: finalScore?.time }),
      headers: { "Content-Type": "application/json" },
    });
  }


  useEffect(() => {
    if (finalScore?.steps && finalScore?.time && levelID) {
      const response = handleSubmit();
      console.log(response)
    }
  }, [finalScore])

  useEffect(() => {
    async function fetchRecentLevels() {
      try {
        // Fetch from your route, e.g. offset=0, limit=10 for the first 10
        const response = await fetch("/api/user-levels?offset=0&limit=10");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Print the fetched data to the console
        console.log("Recent Levels:", data);
      } catch (error) {
        console.error("Error fetching recent levels:", error);
      }
    }

    fetchRecentLevels();
  }, []);

  return (
    <div className="flex flex-col min-h-screen justify-center items-center align-items" style={{ padding: 20 }}>

      <WelcomeModal />
      <Nav />
      {playing == "won" && (
        <div>
          <div style={{ color: "green", fontSize: 24, marginBottom: 10 }}>
            🎉 You Win! 🎉
          </div>
          <div> Time: {finalScore?.time} Moves: {finalScore?.steps}</div>
        </div>
      )}
      <Card className="max-w-max max-width: max-content">
        <CardHeader>
          <CardTitle>🍒 Sokodle 📦</CardTitle>
          <CardDescription>Use arrow keys or tap squares to move | Z to undo</CardDescription>
        </CardHeader>
        <CardContent>
          {level ?
            <Sokoban mapData={level} playing={playing} setPlaying={setPlaying} setFinalScore={setFinalScore} />
            : <Loader width={"400px"} height={"400px"} size={"60px"} />}
        </CardContent>
      </Card>
    </div>
  );
};
