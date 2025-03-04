"use client";

import Loader from "@/components/Loader";
import Sokoban from "@/components/Sokoban";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinalScore, GameState, UserLevel } from "@/lib/types";
import { formatMilliseconds } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Level({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);

  const fetchLevel = async () => {
    setLoading(true);
    try {
      const levelId = await params;
      const response = await fetch(`/api/user-level?id=${levelId.level}`);
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      const data = await response.json();
      console.log(data);
      setLevel(data[0]);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };
  async function handleSubmit() {
    await fetch("/api/user-level-attempt", {
      method: "POST",
      body: JSON.stringify({
        levelID: level?.user_level_id,
        moves: finalScore?.steps,
        timeMs: finalScore?.time,
      }),
      headers: { "Content-Type": "application/json" },
    });
  }

  const countryName = "the USA 🇺🇸";

  useEffect(() => {
    fetchLevel();
  }, []);
  // Initial fetch on component mount
  useEffect(() => {
    if (finalScore?.steps && finalScore?.time && level?.user_level_id) {
      handleSubmit();
    }
  }, [finalScore]);

  return (
    <div>
      {playing == "won" && (
        <div className="text-center">
          <div style={{ color: "green", fontSize: 24, marginBottom: 10 }}>
            🎉 You Win! 🎉
          </div>
          <div>
            Time: {`${finalScore && formatMilliseconds(finalScore.time)}s —— `} Moves: {finalScore?.steps}
          </div>
        </div>
      )}
      <Card className="max-w-max max-width: max-content">
        <Link href="/userlevels" className=" float-right m-2">
          Back
        </Link>

        <CardHeader>
          <CardTitle>{level?.user_name}</CardTitle>
          <CardDescription>Made in {countryName}</CardDescription>
        </CardHeader>
        <CardContent>
          {level ? (
            <Sokoban
              mapData={level.layout}
              playing={playing}
              setPlaying={setPlaying}
              setFinalScore={setFinalScore}
            />
          ) : (
            <Loader width={"400px"} height={"400px"} size={"60px"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
