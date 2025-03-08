'use client'
import { useState, useEffect, useRef } from "react";
import { FinalScore } from "@/lib/types";

export default function StopWatch({
  playing, moves, setFinalScore
}: {
  playing: "notPlaying" | "playing" | "won";
  moves: number;
  setFinalScore: React.Dispatch<React.SetStateAction<FinalScore | null>>
}) {
  const [totalMs, setTotalMs] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing === "playing") {
      timerRef.current = window.setInterval(() => {
        setTotalMs(prev => prev + 1);
      }, 10);
    } else if (playing === "won") {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setFinalScore({ time: totalMs, steps: moves });
      }
    }
  }, [playing]);

  const format = (num: number) => (num < 10 ? `0${num}` : num);
  
  const minutes = Math.floor(totalMs / 6000);
  const seconds = Math.floor((totalMs % 6000) / 100);
  const centiseconds = totalMs % 100;

  return (
    <div className="relative h-12 w-full max-w-[600px] px-4">
      <div className="absolute left-8 top-1/2 -translate-y-1/2 min-w-[100px] text-left">
        {format(minutes)}:{format(seconds)}:{format(centiseconds)}
      </div>

      {playing === "won" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-green-900 font-bold whitespace-nowrap font-orelo">
          🎉 You Win! 🎉
        </div>
      )}

      <div className="absolute right-8 top-1/2 -translate-y-1/2 min-w-[80px] text-right">
        {moves - 1} moves
      </div>
    </div>
  );
}
