"use client";

import { useState, useEffect } from "react";

import { UserLevel } from "@/lib/types";


export default function UserLevelsPage() {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch levels from the API with the current offset
  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-levels?offset=${offset}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      const data = await response.json();

      // Append the new levels to the list
      setLevels((prev) => [...prev, ...data]);

      // If we received fewer than 10 levels, there are no more levels to load
      if (data.length < 10) {
        setHasMore(false);
      }

      // Increase the offset for the next fetch
      setOffset((prev) => prev + 10);
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchLevels();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Levels</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {levels.map((level) => (
          <LevelPreview userLevel={level} />
        ))}
      </div>
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

function LevelPreview({ userLevel }: { userLevel: UserLevel }) {
  const maxWidth = 300;
  const maxHeight = 300;

  const rows = userLevel.layout.length;
  const columns = userLevel.layout[0].length;

  const squareSize = Math.floor(Math.min((maxWidth / columns), (maxHeight / rows)));


  const mapData = userLevel.layout;
  return (
    <div key={userLevel.user_level_id}
      className="border-1 borderRadius-4 p-10">
      <h2>{userLevel.user_name}</h2>
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapData[0].length}, ${squareSize}px)`,
          gap: "2px",
          padding: "2px",
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




    </div>
  );

}


