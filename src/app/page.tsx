'use client'

import { useState } from "react";
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


// Example usage
export default function Home() {
  const exampleMap = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 4, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const [playing, setPlaying] = useState<GameState>(
    "notPlaying"
  );
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);

  return (
    <>

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
            <Sokoban mapData={exampleMap} playing={playing} setPlaying={setPlaying} setFinalScore={setFinalScore} />

          </CardContent>
        </Card>
      </div>
    </>
  );
};