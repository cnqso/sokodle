import { useState, useEffect, useRef } from "react";
import { coords, keyMap, vector, arrowKey } from "../types";
import Timer from "./Timer";

function findPlayerStart(mapData: number[][]): coords {
  for (let y = 0; y < mapData.length; y++) {
    for (let x = 0; x < mapData[y].length; x++) {
      if (mapData[y][x] === 4) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: 0 }; // Default position if not found
}

export default function Sokoban({
  mapData,
}: {
  mapData: number[][];
}) {
  const initialBoxes: coords[] = [];
  mapData.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 2) initialBoxes.push({ x, y });
    });
  });
  const playerStart: coords = findPlayerStart(mapData);
    
  const validKeys = Object.keys(keyMap);
  const [playerPosition, setPlayerPosition] = useState(playerStart);
  const [boxes, setBoxes] = useState(initialBoxes);
  const [history, setHistory] = useState([
    { player: playerStart, boxes: initialBoxes },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState<"notPlaying" | "playing" | "won">(
    "notPlaying"
  );
  const [finalTime, setFinalTime] = useState(0);

  // Static elements
  const [walls] = useState(() => {
    const w: coords[] = [];
    mapData.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) w.push({ x, y });
      });
    });
    return w;
  });
  const [goals] = useState(() => {
    const g: coords[] = [];
    mapData.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 3) g.push({ x, y });
      });
    });
    return g;
  });

  const currentStepRef = useRef(currentStep);
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Win condition check
  useEffect(() => {
    const allGoalsCovered = goals.every((goal) =>
      boxes.some((box) => box.x === goal.x && box.y === goal.y)
    );
    if (allGoalsCovered) {
      setPlaying("won");
    }
  }, [boxes, goals]);

  // Undo functionality
  function handleUndo() {
    if (playing !== "playing") return;
    if (currentStep === 0) return;
    const prevStep = currentStep - 1;
    const prevState = history[prevStep];
    setPlayerPosition(prevState.player);
    setBoxes(prevState.boxes);
    setCurrentStep(prevStep);
  };

  function handleMove(direction: vector) {
      
      if (playing == "won") return;
      if (playing === "notPlaying") {
        setPlaying("playing");
      }

      const newX = playerPosition.x + direction.dx;
      const newY = playerPosition.y + direction.dy;

      // Wall collision check
      if (walls.some((w) => w.x === newX && w.y === newY)) return;

      // Box interaction
      const boxIndex = boxes.findIndex((b) => b.x === newX && b.y === newY);
      let newBoxes = [...boxes];

      if (boxIndex !== -1) {
        const nextBoxX = newX + direction.dx;
        const nextBoxY = newY + direction.dy;

        // Validate new box position
        if (
          walls.some((w) => w.x === nextBoxX && w.y === nextBoxY) ||
          newBoxes.some((b) => b.x === nextBoxX && b.y === nextBoxY)
        ) {
          return;
        }

        newBoxes = newBoxes.map((box, i) =>
          i === boxIndex ? { x: nextBoxX, y: nextBoxY } : box
        );
      }

      // Update state
      const newPlayer = { x: newX, y: newY };
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentStepRef.current + 1);
        newHistory.push({ player: newPlayer, boxes: newBoxes });
        return newHistory;
      });
      setCurrentStep((prev) => prev + 1);
      setPlayerPosition(newPlayer);
      setBoxes(newBoxes);
    };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "z") {
        handleUndo();
        return;
      } else if (validKeys.includes(e.key)) {

        const direction = keyMap[e.key as arrowKey];

        if (direction) handleMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleMove, handleUndo]);

  // Touch controls
  const handleCellClick = (x: number, y: number) => {
    const dx = x - playerPosition.x;
    const dy = y - playerPosition.y;

    // Only allow adjacent moves
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      handleMove({ dx, dy });
    }
  };

  // Render setup
  const rows = mapData.length;
  const cols = mapData[0]?.length || 0;

  return (
    <div>
      <button onClick={handleUndo} style={{ marginBottom: 10 }}>
        Undo (Z)
      </button>
      <Timer playing={playing} setFinalTime={setFinalTime}/>
      {playing == "won" && (
        <div style={{ color: "green", fontSize: 24, marginBottom: 10 }}>
          🎉 You Win! 🎉 <span>Final time: {finalTime} Moves: {history.length}</span>
        </div>
      )}
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 50px)`,
          gap: "2px",
          padding: "2px",
        }}
      >
        {Array.from({ length: rows }).map((_, y) =>
          Array.from({ length: cols }).map((_, x) => {
            const isWall = walls.some((w) => w.x === x && w.y === y);
            const isGoal = goals.some((g) => g.x === x && g.y === y);
            const isBox = boxes.some((b) => b.x === x && b.y === y);
            const boxOnGoal = isBox && isGoal;
            const isPlayer = playerPosition.x === x && playerPosition.y === y;

            let emoji = " "; // Default floor
            if (isWall) {
              emoji = "⬛";
            } else if (isPlayer) {
              emoji = "🧍";
            } else if (isBox) {
              emoji = boxOnGoal ? "✅" : "📦";
            } else if (isGoal) {
              emoji = "🍒";
            }

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
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
          })
        )}
      </div>
    </div>
  );
}
