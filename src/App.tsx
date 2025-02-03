import './App.css'
import { useState, useEffect, useCallback, useRef } from 'react';

type coords = { x: number, y: number };
type vector = { dx: number, dy: number };
type arrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"
type keyMap = { "ArrowUp": vector, "ArrowDown": vector, "ArrowLeft": vector, "ArrowRight": vector };
const directionsMap: keyMap = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
}
const Sokoban = ({ mapData, playerStart }: { mapData: number[][], playerStart: coords }) => {
  const initialBoxes: coords[] = [];
  mapData.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 2) initialBoxes.push({ x, y });
    });
  });
  // Game state
  const [playerPosition, setPlayerPosition] = useState(playerStart);
  const [boxes, setBoxes] = useState(initialBoxes);
  const [history, setHistory] = useState([{ player: playerStart, boxes: initialBoxes }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [won, setWon] = useState(false);

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
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);

  // Win condition check
  useEffect(() => {
    const allGoalsCovered = goals.every(goal =>
      boxes.some(box => box.x === goal.x && box.y === goal.y)
    );
    setWon(allGoalsCovered);
  }, [boxes, goals]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (currentStep === 0) return;
    const prevStep = currentStep - 1;
    const prevState = history[prevStep];
    setPlayerPosition(prevState.player);
    setBoxes(prevState.boxes);
    setCurrentStep(prevStep);
  }, [currentStep, history]);

  // Movement logic
  const handleMove = useCallback((direction: vector) => {
    if (won) return;

    const newX = playerPosition.x + direction.dx;
    const newY = playerPosition.y + direction.dy;

    // Wall collision check
    if (walls.some(w => w.x === newX && w.y === newY)) return;

    // Box interaction
    const boxIndex = boxes.findIndex(b => b.x === newX && b.y === newY);
    let newBoxes = [...boxes];

    if (boxIndex !== -1) {
      const nextBoxX = newX + direction.dx;
      const nextBoxY = newY + direction.dy;

      // Validate new box position
      if (walls.some(w => w.x === nextBoxX && w.y === nextBoxY) ||
        newBoxes.some(b => b.x === nextBoxX && b.y === nextBoxY)) {
        return;
      }

      newBoxes = newBoxes.map((box, i) =>
        i === boxIndex ? { x: nextBoxX, y: nextBoxY } : box
      );
    }

    // Update state
    const newPlayer = { x: newX, y: newY };
    setHistory(prev => {
      const newHistory = prev.slice(0, currentStepRef.current + 1);
      newHistory.push({ player: newPlayer, boxes: newBoxes });
      return newHistory;
    });
    setCurrentStep(prev => prev + 1);
    setPlayerPosition(newPlayer);
    setBoxes(newBoxes);
  }, [playerPosition, boxes, walls, won]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        handleUndo();
        return;
      }

      const direction = directionsMap[e.key as arrowKey];

      if (direction) handleMove(direction);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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
      {won && <div style={{ color: 'green', fontSize: 24, marginBottom: 10 }}>🎉 You Win! 🎉</div>}
      <div className="grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 50px)`,
        gap: '2px',
        padding: '2px'
      }}>
        {Array.from({ length: rows }).map((_, y) =>
          Array.from({ length: cols }).map((_, x) => {
            const isWall = walls.some(w => w.x === x && w.y === y);
            const isGoal = goals.some(g => g.x === x && g.y === y);
            const isBox = boxes.some(b => b.x === x && b.y === y);
            const boxOnGoal = isBox && isGoal;
            const isPlayer = playerPosition.x === x && playerPosition.y === y;

            let emoji = ' '; // Default floor
            if (isWall) {
              emoji = '⬛';
            } else if (isPlayer) {
              emoji = '🧍';
            } else if (isBox) {
              emoji = boxOnGoal ? '✅' : '📦';
            } else if (isGoal) {
              emoji = '⚪';
            }

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                style={{
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  cursor: 'pointer',
                  backgroundColor: '#f0f0f0',
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
};

// Example usage
const App = () => {
  const exampleMap = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 3, 0, 1],
    [1, 1, 2, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  const playerStart = { x: 2, y: 1 };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎮 Sokoban Game 📦</h1>
      <div style={{ marginBottom: 20 }}>
        Use arrow keys or tap squares to move | Z to undo
      </div>
      <Sokoban mapData={exampleMap} playerStart={playerStart} />
    </div>
  );
};

export default App;