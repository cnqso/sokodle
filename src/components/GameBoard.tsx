"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Coords, Vector } from "@/lib/types";
import useBoardSwipe from "@/hooks/useBoardSwipe";
import GuineaPigArt, { type Facing } from "./GuineaPigArt";
import TileSprite from "./TileSprite";
import FeastSprite from "./FeastSprite";
import type { Feast } from "@/lib/victoryFeast";

export const MOVE_DURATION_MS = 90;

const samePosition = (a: Coords, b: Coords) => a.x === b.x && a.y === b.y;

export default function GameBoard({
  rows, cols, cellSize, walls, goals, boxes, player, facing, animate, feast, onCellClick, onSwipe,
}: {
  rows: number;
  cols: number;
  cellSize: number;
  walls: Coords[];
  goals: Coords[];
  boxes: Coords[];
  player: Coords;
  facing: Facing;
  animate: boolean;
  feast: Feast | null;
  onCellClick: (x: number, y: number) => void;
  onSwipe: (direction: Vector) => void;
}) {
  const swipeHandlers = useBoardSwipe(onSwipe, onCellClick);
  const [arrivedBoxes, setArrivedBoxes] = useState<(Coords | null)[]>(boxes);
  const previousTargets = useRef(boxes);

  useLayoutEffect(() => {
    const delay = animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? MOVE_DURATION_MS : 0;
    const previous = previousTargets.current;
    previousTargets.current = boxes;
    // Invalidate changed targets before paint, including a quick reversal back
    // to a bowl that was occupied before the interrupted slide.
    setArrivedBoxes(arrived => boxes.map((box, index) =>
      !delay ? box : previous[index] && samePosition(previous[index], box) ? arrived[index] : null));
    const arrival = window.setTimeout(() => setArrivedBoxes(boxes), delay);
    return () => window.clearTimeout(arrival);
  }, [boxes, animate]);

  const boxHasArrived = (index: number) => {
    const arrived = arrivedBoxes[index];
    return !animate || (arrived !== null && arrived !== undefined && samePosition(arrived, boxes[index]));
  };
  const boxIsInBowl = (index: number) => boxHasArrived(index) &&
    goals.some(goal => samePosition(goal, boxes[index]));
  const actorStyle = ({ x, y }: Coords): CSSProperties => ({
    width: cellSize,
    height: cellSize,
    transform: `translate(${x * 100}%, ${y * 100}%)`,
  });
  const feastPosition = feast ? goals[feast.bowl] : undefined;

  return (
    <div {...swipeHandlers} className="sokodle-board p-[2px]" style={{ "--move-duration": `${MOVE_DURATION_MS}ms`, touchAction: "none", overscrollBehavior: "none" } as CSSProperties} data-motion={animate ? "slide" : "snap"}>
      <div className="relative">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
          {Array.from({ length: rows }, (_, y) =>
            Array.from({ length: cols }, (_, x) => {
              const position = { x, y };
              const isWall = walls.some(wall => samePosition(wall, position));
              const goalIndex = goals.findIndex(goal => samePosition(goal, position));
              const isGoal = goalIndex !== -1;
              const isEatingHere = feastPosition && samePosition(feastPosition, position);
              const isEaten = feast && (feast.done || goalIndex < feast.bowl);
              const isFilled = isGoal && !isEaten && boxes.some((box, index) => samePosition(box, position) && boxHasArrived(index));
              return (
                <div key={`${x}-${y}`} onClick={() => onCellClick(x, y)} data-cell={`${x},${y}`}
                  className="cursor-pointer select-none" style={{ width: cellSize, height: cellSize }}>
                  <TileSprite kind={isWall ? "wall" : isEatingHere ? "floor" : isFilled ? "cell-docked" : isGoal ? "dock" : "floor"} phase={(x + y * 2) % 3} />
                </div>
              );
            })
          )}
        </div>
        {/* Actor identities survive moves, so CSS can interpolate their positions.
            Box order is stable through pushes, undo, and reset. Terrain stays put. */}
        <div className="sokodle-actors" aria-hidden="true">
          {boxes.map((box, index) => (
            <div key={index} className="sokodle-actor" data-actor={`carrot-${index}`} style={actorStyle(box)}>
              <div className="sokodle-actor-art" style={{ visibility: boxIsInBowl(index) ? "hidden" : "visible" }}>
                <GuineaPigArt kind="carrot" phase={index % 3} />
              </div>
            </div>
          ))}
          <div className="sokodle-actor sokodle-actor--player" data-actor="player" data-feasting={!!feastPosition} style={actorStyle(feastPosition ?? player)}>
            {feast && feastPosition ? <FeastSprite bite={feast.bite} bowl={feast.bowl} done={feast.done} /> : <div className="sokodle-actor-art">
              <GuineaPigArt kind="guinea-pig" facing={facing} />
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
