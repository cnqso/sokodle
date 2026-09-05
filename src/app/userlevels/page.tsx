"use client";

import Link from 'next/link';
import { UserLevel } from "@/lib/types";
import { useUserLevels } from "@/app/userlevels/UserLevelsContext";
import TileSprite, { tileKindFromMapValue } from "@/components/TileSprite";


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
  const mapData = userLevel.layout;
  
  const rows = mapData.length;
  const columns = mapData[0].length;

  const squareSize = Math.floor(Math.min((size / columns), (size / rows)));
  return (
    <Link className="content-center item-center text-center m-10" href={`/userlevels/${userLevel.user_level_id}`}>
      <h2 className="font-display text-2xl">{userLevel.user_name}</h2>
      <div
        className="grid content-center item-center m-auto" 
        style={{
          width:`${squareSize*mapData[0].length}px`,
          gridTemplateColumns: `repeat(${mapData[0].length}, ${squareSize}px)`,
        }}
      >
        {mapData?.map((thisRow, y) => {
          return thisRow.map((_, x) => {
            const cellValue = mapData[y][x];
            const tileKind = tileKindFromMapValue(cellValue);

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: squareSize,
                  height: squareSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  overflow: "hidden",
                }}
              >
                <TileSprite kind={tileKind} />
              </div>
            );
          });
        })}
      </div>
    </Link>
  );

}

