"use client";

import Link from 'next/link';
import { UserLevel } from "@/lib/types";
import { useUserLevels } from "@/lib/UserLevelsContext";
import localFont from 'next/font/local';

const orelo = localFont({
  src: '../../../public/fonts/Orelo-Extended-Trial-Regular-BF674e807573e67.otf', // Adjust this path based on where you place the font file
  variable: '--font-orelo',
})

export default function UserLevelsPage() {
  const { levels, fetchLevels, loading, hasMore } = useUserLevels();
  console.log(levels.length)
  return (
    <div>

        {levels.map((level) => (
          <LevelPreview userLevel={level} size={200} />
        ))}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {hasMore ? (
          <button onClick={fetchLevels} disabled={loading}>
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
    <Link key={userLevel.user_level_id} className="content-center item-center text-center m-10" href={`/userlevels/${userLevel.user_level_id}`}>
      <h2 className={`${orelo.className} text-2xl`}>{userLevel.user_name}</h2>
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


