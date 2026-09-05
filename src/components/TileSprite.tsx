import GuineaPigArt, { Facing, SquiggleFrame } from "./GuineaPigArt";
import { cn } from "@/lib/utils";

export type TileKind =
  | "floor"
  | "wall"
  | "dock"
  | "cell"
  | "cell-docked"
  | "keeper"
  | "keeper-dock";

export function tileKindFromMapValue(value: number): TileKind {
  if (value === 1) return "wall";
  if (value === 2) return "cell";
  if (value === 3) return "dock";
  if (value === 4) return "keeper";
  return "floor";
}

export function resolveTileKind({
  isWall,
  isGoal,
  isBox,
  isPlayer,
}: {
  isWall: boolean;
  isGoal: boolean;
  isBox: boolean;
  isPlayer: boolean;
}): TileKind {
  if (isWall) return "wall";
  if (isPlayer) return isGoal ? "keeper-dock" : "keeper";
  if (isBox) return isGoal ? "cell-docked" : "cell";
  if (isGoal) return "dock";
  return "floor";
}

export default function TileSprite({
  kind,
  className,
  facing = "down",
  frame,
  phase = 0,
}: {
  kind: TileKind;
  className?: string;
  facing?: Facing;
  frame?: SquiggleFrame;
  phase?: number;
}) {
  const isPlayer = kind === "keeper" || kind === "keeper-dock";
  const art = kind === "wall" ? "wall" : kind === "cell" ? "carrot" :
    kind === "cell-docked" ? "bowl-full" : kind === "dock" ? "bowl" : "floor";

  return (
    <span className={cn("sokodle-tile", `sokodle-tile--${kind}`, className)} data-kind={kind}>
      <GuineaPigArt kind="floor" frame={frame} phase={phase} />
      {kind === "keeper-dock" && <span className="sokodle-tile-underlay"><GuineaPigArt kind="bowl" frame={frame} phase={phase} /></span>}
      {isPlayer ? <GuineaPigArt kind="guinea-pig" facing={facing} frame={frame} phase={phase} /> :
        kind !== "floor" && <GuineaPigArt kind={art} frame={frame} phase={phase} />}
    </span>
  );
}
