"use client";

import Link from 'next/link';
import { UserLevel } from "@/lib/types";
import { useUserLevels } from "@/app/userlevels/UserLevelsContext";
import localFont from 'next/font/local';

const orelo = localFont({
  src: '../../../public/fonts/Orelo-Extended-Trial-Regular-BF674e807573e67.otf', // Adjust this path based on where you place the font file
  variable: '--font-orelo',
})

export default function UserLevelsPage() {
  const { levels, fetchLevels, loading, hasMore } = useUserLevels();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => (
          <LevelPreview key={level.user_level_id} userLevel={level} size={200} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {hasMore ? (
          <button 
            onClick={fetchLevels} 
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        ) : (
          <p>No more levels to load.</p>
        )}
      </div>
    </div>
  );
}

function LevelPreview({ userLevel, size }: { userLevel: UserLevel, size: number }) {

  const rows = userLevel.layout.length;
  const columns = userLevel.layout[0].length;

  const squareSize = Math.floor(Math.min((size / columns), (size / rows)));


  const mapData = userLevel.layout;
  return (
    <Link className="content-center item-center text-center m-10" href={`/userlevels/${userLevel.user_level_id}`}>
      <h2 className={`${orelo.className} text-2xl`}>{userLevel.user_name}{" "}{userLevel.user_level_id}</h2>
      <div
        className="grid content-center item-center m-auto" 
        style={{
          width:`${squareSize*mapData[0].length}px`,
          gridTemplateColumns: `repeat(${mapData[0].length}, ${squareSize}px)`,
        }}
      >
        {mapData.map((thisRow, y) => {
          return thisRow.map((_, x) => {
            const cellValue = mapData[y][x];
            const isWall = cellValue === 1;
            const isBox = cellValue === 2;
            const isGoal = cellValue === 3;
            const isPlayer = cellValue === 4;

            let emoji = " "; // Default floor
            if (isWall) emoji = "⬛";
            else if (isBox) emoji = "📦";
            else if (isGoal) emoji = "🍒";
            else if (isPlayer) emoji = "🧍";

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: squareSize,
                  height: squareSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.floor(squareSize * 0.8),
                  cursor: "pointer",
                  backgroundColor: "#f0f0f0",
                  userSelect: "none",
                }}
              >
                {emoji}
              </div>
            );
          });
        })}
      </div>
    </Link>
  );

}


