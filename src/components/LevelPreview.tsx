import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UserLevel } from "@/lib/types";
import DifficultyRating from "@/components/DifficultyRating";
import TileSprite, { tileKindFromMapValue } from "@/components/TileSprite";

export default function LevelPreview({ level }: { level: UserLevel }) {
  const rows = level.layout.length;
  const cols = level.layout[0].length;
  const size = Math.min(200 / cols, 176 / rows);
  return (
    <Link href={`/userlevels/${level.user_level_id}`} className="level-card group flex min-w-0 flex-col overflow-hidden rounded-xl border-2 border-[#293c32]/70 bg-bw shadow-[3px_3px_0_#293c32] transition-colors hover:border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
      <div className="flex h-[220px] items-center justify-center border-b border-[#293c32]/15 bg-[#b8cc94]/25 p-5" aria-hidden="true">
        <div className="sokodle-board grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)` }}>
          {level.layout.map((row, y) => row.map((cell, x) => (
            <span key={`${x}-${y}`} style={{ width: size, height: size }}>
              <TileSprite kind={tileKindFromMapValue(cell)} frame={0} />
            </span>
          )))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="break-words font-display text-xl">{level.user_name}</h2>
        <p className="mt-1 break-words text-sm opacity-65">Made by {level.creator_name || "Anonymous"}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <DifficultyRating value={level.difficulty} />
          <span className="flex items-center gap-2 text-sm font-bold">Play <ArrowRight className="level-card-arrow" size={16} /></span>
        </div>
      </div>
    </Link>
  );
}
