import { useState } from "react";

export default function LevelEditor() {
  const [width, setWidth] = useState(7);
  const [height, setHeight] = useState(5);
  const [mapData, setMapData] = useState([
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 4, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]);

  function generateMap(w: number, h: number, biggerX: boolean, biggerY: boolean) {
    return Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        {
          if (y === 0 || y === h - 1 || x === 0 || x === w - 1) {
            return 1;
          }
          if ((biggerY && y === h - 2) || (biggerX && x === w - 2)) {
            return 0;
          }
          if (mapData[y] && mapData[y][x]) {
            return mapData[y][x];
          }
          return 0;
        }
      })
    );
  }

  function handleCellClick(y: number, x: number) {
    console.log(x, y);
    const oldMapData = [...mapData];
    const glyph = mapData[y][x];
    if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
      oldMapData[y][x] = 1;
    } else if (glyph > 3) {
      oldMapData[y][x] = 0;
    } else {
      oldMapData[y][x]++;
    }
    setMapData(oldMapData);
  }

  function handleSizeChange(newWidth: number, newHeight: number) {
    const biggerX = newWidth > width
    const biggerY = newHeight > height
    setWidth(newWidth);
    setHeight(newHeight);
    setMapData(generateMap(newWidth, newHeight, biggerX, biggerY));
  }

  return (
    <div>
      <div>
        <label>
          Width:
          <input
            type="number"
            min="3"
            value={width}
            onChange={(e) => handleSizeChange(Number(e.target.value), height)}
          />
        </label>
        <label>
          Height:
          <input
            type="number"
            min="3"
            value={height}
            onChange={(e) => handleSizeChange(width, Number(e.target.value))}
          />
        </label>
      </div>
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapData[0].length}, 50px)`,
          gap: "2px",
          padding: "2px",
        }}
      >
        {mapData.map((thisRow, y) => {
          return thisRow.map((_, x) => {
            const isWall = mapData[y][x] === 1;
            const isBox = mapData[y][x] === 2;
            const isGoal = mapData[y][x] === 3;
            const isPlayer = mapData[y][x] === 4;

            let emoji = " "; // Default floor
            if (isWall) {
              emoji = "⬛";
            } else if (isPlayer) {
              emoji = "🧍";
            } else if (isBox) {
              emoji = "📦";
            } else if (isGoal) {
              emoji = "🍒";
            }

            return (
                <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(y, x)}
                style={{
                  width: 50,
                  height: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
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
        <br />
      </div>
    </div>
  );
}
