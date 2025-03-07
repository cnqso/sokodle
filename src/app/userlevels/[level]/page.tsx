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
import localFont from 'next/font/local';
import { X } from "lucide-react";

const orelo = localFont({
  src: '../../../../public/fonts/Orelo-Extended-Trial-Regular-BF674e807573e67.otf', // Adjust this path based on where you place the font file
  variable: '--font-orelo',
})

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
      <Card className="max-w-max max-width: max-content relative">
        <Link 
          href="/userlevels" 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </Link>

        <CardHeader className="pb-0">
          <CardTitle className={orelo.className}>{level?.user_name}</CardTitle>
          <CardDescription>Made in {countryName}</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {level ? (
            <Sokoban
              mapData={level.layout}
              playing={playing}
              setPlaying={setPlaying}
              setFinalScore={setFinalScore}
              context="user"
            />
          ) : (
            <Loader width={"400px"} height={"400px"} size={"60px"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
