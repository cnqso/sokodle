'use client'
import { useState, useEffect, useRef } from "react";
import { Coords, keyMap, Vector, ArrowKey, FinalScore, GameState } from "@/lib/types";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import ShareModal from "@/components/ShareModal";

function findPlayerStart(mapData: number[][]): Coords {
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
  mapData, playing, setPlaying, setFinalScore, context = 'user', levelNumber
}: {
  mapData: number[][];
  playing: GameState;
  setPlaying: React.Dispatch<React.SetStateAction<GameState>>;
  setFinalScore: React.Dispatch<React.SetStateAction<FinalScore | null>>;
  context?: 'daily' | 'user';
  levelNumber?: number;
}) {
  const initialBoxes: Coords[] = [];
  mapData.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 2) initialBoxes.push({ x, y });
    });
  });
  const playerStart: Coords = findPlayerStart(mapData);
    
  const validKeys = Object.keys(keyMap);
  const [playerPosition, setPlayerPosition] = useState(playerStart);
  const [boxes, setBoxes] = useState(initialBoxes);
  const [history, setHistory] = useState([
    { player: playerStart, boxes: initialBoxes },
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  // Add this new state near the other useState declarations
  const [showShareModal, setShowShareModal] = useState(false);

  // Static elements
  const [walls] = useState(() => {
    const w: Coords[] = [];
    mapData.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) w.push({ x, y });
      });
    });
    return w;
  });
  const [goals] = useState(() => {
    const g: Coords[] = [];
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
    // Update history to remove the undone moves
    setHistory(prev => prev.slice(0, prevStep + 1));
  };

  function handleMove(direction: Vector) {
    if (playing === "won") return;
    if (playing === "notPlaying") {
      setPlaying("playing");
    }
  
    const newX = playerPosition.x + direction.dx;
    const newY = playerPosition.y + direction.dy;
  
    // 1. Check if the next cell is a wall.
    if (walls.some((w) => w.x === newX && w.y === newY)) {
      return; // Cannot move into walls.
    }


  
    // 2. Check if there is at least one box in the next cell.
    const firstBoxIndex = boxes.findIndex((b) => b.x === newX && b.y === newY);
  
    // If there is NO box at that cell, we can move freely.
    if (firstBoxIndex === -1) {
      movePlayerWithoutBoxes(newX, newY);
      return;
    }
  
    // 3. If there IS a box, gather the consecutive boxes (the chain) in that direction.
    const boxChainIndices: number[] = [];
    let currentCheckX = newX;
    let currentCheckY = newY;
  
    while (true) {
      const boxIndex = boxes.findIndex(
        (b) => b.x === currentCheckX && b.y === currentCheckY
      );
      if (boxIndex === -1) {
        break; // No more boxes in a row.
      }
  
      // Add to the chain of boxes.
      boxChainIndices.push(boxIndex);
  
      // Move one step further in the same direction.
      currentCheckX += direction.dx;
      currentCheckY += direction.dy;
    }
  
    // Now, boxChainIndices contains the indexes of all consecutive boxes
    // directly in front of the player in the chosen direction.
  
    // 4. Check if the cell after the last box in the chain is free.
    const lastBoxIndex = boxChainIndices[boxChainIndices.length - 1];
    const lastBox = boxes[lastBoxIndex];
    const nextXAfterLastBox = lastBox.x + direction.dx;
    const nextYAfterLastBox = lastBox.y + direction.dy;
  
    // If this next cell is a wall, or is occupied by a box that is
    // *not* part of the chain, we cannot push.
    const isWallThere = walls.some(
      (w) => w.x === nextXAfterLastBox && w.y === nextYAfterLastBox
    );
    const otherBoxIndex = boxes.findIndex(
      (b, i) => b.x === nextXAfterLastBox && b.y === nextYAfterLastBox && !boxChainIndices.includes(i)
    );
  
    if (isWallThere || otherBoxIndex !== -1) {
      // Can't push the chain forward (blocked).
      return;
    }
  
    // 5. We can push the entire chain. Do so in *reverse* order so that
    // we move the last box first, preventing overwrites.
    const newBoxes = [...boxes];
    for (let i = boxChainIndices.length - 1; i >= 0; i--) {
      const idx = boxChainIndices[i];
      newBoxes[idx] = {
        x: newBoxes[idx].x + direction.dx,
        y: newBoxes[idx].y + direction.dy,
      };
    }
  
    // 6. Move the player into the first box's old spot.
    const newPlayer = { x: newX, y: newY };
  
    // 7. Update state (player, boxes, history).
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentStepRef.current + 1);
      newHistory.push({ player: newPlayer, boxes: newBoxes });
      return newHistory;
    });
    setCurrentStep((prev) => prev + 1);
    setPlayerPosition(newPlayer);
    setBoxes(newBoxes);
  }
  
  /**
   * Helper to move the player if no boxes are involved in the move.
   */
  function movePlayerWithoutBoxes(newX: number, newY: number) {
    const newPlayer = { x: newX, y: newY };
  
    setHistory((prev) => {
      const newHistory = prev.slice(0, currentStepRef.current + 1);
      newHistory.push({ player: newPlayer, boxes: boxes });
      return newHistory;
    });
    setCurrentStep((prev) => prev + 1);
    setPlayerPosition(newPlayer);
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "z") {
        handleUndo();
        return;
      } else if (validKeys.includes(e.key)) {

        const direction = keyMap[e.key as ArrowKey];

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

  // Add new state for cell size
  const [cellSize, setCellSize] = useState(50);
  
  // Add resize handler
  useEffect(() => {
    const updateCellSize = () => {
      const containerPadding = 30; // Reduced padding for narrow screens
      const availableWidth = window.innerWidth - containerPadding;
      const availableHeight = window.innerHeight - 250; // Increased space for other elements
      
      const cols = mapData[0]?.length || 0;
      const rows = mapData.length;
      
      // Calculate cell size based on available space and aspect ratio
      const cellByWidth = availableWidth / cols;
      const cellByHeight = availableHeight / rows;
      
      // Use the smaller of the two sizes to ensure it fits both dimensions
      const newSize = Math.min(cellByWidth, cellByHeight);
      
      // Cap the size between 16px and 50px
      setCellSize(Math.min(50, Math.max(16, newSize)));
    };

    // Initial calculation
    updateCellSize();

    // Update on resize
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [mapData]);

  return (
    <div className="flex flex-col items-center">
      <Timer playing={playing} moves={history.length} setFinalScore={setFinalScore}/>
      <div
        className="grid overflow-hidden font-sans"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: "0px",
          padding: "2px",
          maxWidth: '100vw',
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
                className="font-sans"
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: `${cellSize * 0.8}px`,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {emoji}
              </div>
            );
          })
        )}
      </div>
      {playing === "won" ? (
        context === 'daily' ? (
          <Button onClick={() => setShowShareModal(true)} className="mt-4 ml-1 mr-auto">
            Share
          </Button>
        ) : null
      ) : (
        <Button onClick={handleUndo} className="mt-4 ml-1 mr-auto">
          Undo (Z)
        </Button>
      )}
      {showShareModal && playing === "won" && context === 'daily' && (
        <ShareModal
          finalScore={{ time: history.length - 1, steps: history.length - 1 }}
          onClose={() => setShowShareModal(false)}
          levelNumber={levelNumber}
        />
      )}
    </div>
  );
}
