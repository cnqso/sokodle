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
    } else if (playing === "notPlaying") {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTotalMs(0);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing]);

  useEffect(() => {
    if (playing === "won") {
      setFinalScore({ time: totalMs, steps: moves });
    }
  }, [playing, totalMs, moves, setFinalScore]);

  const format = (num: number) => (num < 10 ? `0${num}` : num);
  
  const minutes = Math.floor(totalMs / 6000);
  const seconds = Math.floor((totalMs % 6000) / 100);
  const centiseconds = totalMs % 100;

  return (
    <div className="flex h-10 w-full max-w-[500px] items-center justify-between px-1 text-sm tabular-nums">
      <span aria-label="Elapsed time">{format(minutes)}:{format(seconds)}<span className="text-xs opacity-50">:{format(centiseconds)}</span></span>
      <span><strong>{moves - 1}</strong> moves</span>
    </div>
  );
}
