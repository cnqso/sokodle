"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useUserLevels } from "@/app/userlevels/UserLevelsContext";
import LevelPreview from "@/components/LevelPreview";
import DifficultyRating from "@/components/DifficultyRating";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { difficultyLabels, type Difficulty } from "@/lib/levelMetadata";

export default function UserLevelsPage() {
  const { levels, fetchLevels, loading, error, hasMore } = useUserLevels();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const matches = levels.filter(level => (!difficulty || level.difficulty === difficulty) &&
    `${level.user_name} ${level.creator_name || "Anonymous"}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <main className="w-full max-w-[1080px] px-4 pb-12 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5 sm:py-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">User levels</h1>
          <p className="mt-2 text-sm opacity-70">Little puzzles from other people.</p>
        </div>
        <Button asChild><Link href="/editor"><Plus /> Create a level</Link></Button>
      </header>
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#293c32]/20 bg-bw p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-3 opacity-50" size={16} />
          <Input aria-label="Search levels or creators" placeholder="Find a level or creator" value={query} onChange={event => setQuery(event.target.value)} className="h-10 border-[#293c32]/30 pl-9" />
        </label>
        <div className="flex items-center gap-1" aria-label="Filter by difficulty">
          <button onClick={() => setDifficulty(null)} aria-pressed={difficulty === null} className={`h-10 rounded-lg px-4 text-sm font-bold ${difficulty === null ? "bg-main" : "hover:bg-[#b8cc94]/30"}`}>All</button>
          {([1,2,3] as const).map(value => <button key={value} onClick={() => setDifficulty(value)} aria-label={`${difficultyLabels[value]} levels`} aria-pressed={difficulty === value}
            className={`flex h-10 min-w-12 items-center justify-center rounded-lg px-1 ${difficulty === value ? "bg-main" : "hover:bg-[#b8cc94]/30"}`}><DifficultyRating value={value} /></button>)}
        </div>
      </div>
      {!!matches.length && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{matches.map(level => <LevelPreview key={level.user_level_id} level={level} />)}</div>}
      {loading && <div role="status" aria-label="Loading levels" className="py-12"><Loader width="100%" height="64px" size="64px" /></div>}
      {error && <div role="alert" className="my-8 rounded-xl border border-[#293c32]/20 bg-bw p-6 text-center"><p className="mb-4 text-sm">{error}</p><Button variant="neutral" onClick={fetchLevels}>Try again</Button></div>}
      {!loading && !error && !matches.length && <div className="py-12 text-center">
        <p className="font-display text-xl">{levels.length ? "No matches yet" : "No levels yet"}</p>
        <p className="mt-2 text-sm opacity-70">{levels.length ? "Try another name or difficulty." : "Create a puzzle to get things started."}</p>
        {(query || difficulty) && <button className="mt-4 text-sm font-bold underline underline-offset-4" onClick={() => { setQuery(""); setDifficulty(null); }}>Clear filters</button>}
      </div>}
      {hasMore && !loading && !error && <div className="mt-8 text-center"><Button variant="neutral" onClick={fetchLevels}>Load more levels</Button></div>}
      {hasMore && !!levels.length && (query || difficulty) && <p className="mt-3 text-center text-xs opacity-60">Filters apply to loaded levels. Load more to keep looking.</p>}
    </main>
  );
}
