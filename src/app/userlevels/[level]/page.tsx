"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Loader from "@/components/Loader";
import Sokoban from "@/components/Sokoban";
import DifficultyRating from "@/components/DifficultyRating";
import { Button } from "@/components/ui/button";
import type { FinalScore, GameState, UserLevel } from "@/lib/types";

export default function Level({ params }: { params: Promise<{ level: string }> }) {
  const { level: id } = use(params);
  return <LevelViewer key={id} id={id} />;
}

function LevelViewer({ id }: { id: string }) {
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState<GameState>("notPlaying");
  const [finalScore, setFinalScore] = useState<FinalScore | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/user-level?id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Couldn't load this level. Please try again.");
        const data = await response.json();
        if (!data[0]) throw new Error("This level couldn't be found.");
        if (!controller.signal.aborted) setLevel(data[0]);
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, retry]);

  useEffect(() => {
    if (!finalScore || !level || recorded.current) return;
    recorded.current = true;
    void fetch("/api/user-level-attempt", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelID: level.user_level_id, moves: finalScore.steps, timeMs: finalScore.time }),
    }).catch(() => { /* A score-service outage must not interrupt the completed puzzle. */ });
  }, [finalScore, level]);

  function replay() {
    recorded.current = false;
    setFinalScore(null);
    setPlaying("notPlaying");
    setAttempt(previous => previous + 1);
  }

  return (
    <main className="level-viewer-page w-full max-w-[620px] px-3 pb-6 sm:px-6">
      <Link href="/userlevels" className="my-3 inline-flex h-8 items-center gap-2 text-sm font-bold opacity-75 hover:opacity-100"><ArrowLeft size={16} /> All levels</Link>
      <section className="level-viewer-shell rounded-xl border-2 border-border bg-bw p-3 shadow-[3px_3px_0_#293c32] sm:p-5">
        {level && <header className="mb-2 flex items-start justify-between gap-3 border-b border-[#293c32]/15 pb-3">
          <div className="min-w-0">
            <h1 className="break-words font-display text-2xl leading-tight">{level.user_name}</h1>
            <p className="mt-1 break-words text-sm opacity-65">Made by {level.creator_name || "Anonymous"}</p>
          </div>
          <DifficultyRating value={level.difficulty} className="shrink-0" />
        </header>}
        {loading && <div role="status" aria-label="Loading level"><Loader width="100%" height="260px" size="64px" /></div>}
        {error && <div role="alert" className="py-12 text-center"><p className="mb-4 text-sm">{error}</p><Button variant="neutral" onClick={() => setRetry(previous => previous + 1)}>Try again</Button></div>}
        {level && !loading && <>
          <Sokoban key={attempt} mapData={level.layout} playing={playing} setPlaying={setPlaying} finalScore={finalScore} setFinalScore={setFinalScore} context="user" />
          {playing === "won" ? <div className="mt-3 flex justify-center pb-2"><Button onClick={replay}><RotateCcw /> Play again</Button></div> :
            <p className="mt-2 text-center text-xs opacity-60">Swipe, use arrow keys, or tap a nearby square.</p>}
        </>}
      </section>
    </main>
  );
}
