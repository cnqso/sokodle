import type { CSSProperties } from "react";
import type { Bite } from "@/lib/victoryFeast";

export type Facing = "up" | "down" | "left" | "right";
export type SquiggleFrame = 0 | 1 | 2;
export type ArtKind = "guinea-pig" | "carrot" | "bowl" | "bowl-full" | "wall" | "floor";

const ink = "#293c32";
const cream = "#fff1cb";
const caramel = "#ca8750";

// Three repeatable contour drawings, with fixed registration. No random values,
// scaling, or whole-sprite shaking: only the pen line changes between frames.
function redraw(path: string, frame: SquiggleFrame) {
  if (frame === 0) return path;
  let point = 0;
  return path.replace(/-?\d+(?:\.\d+)?/g, (value) => {
    const offset = Math.sin(++point * 2.37 + frame * 4.1) * 0.65;
    return (Number(value) + offset).toFixed(2);
  });
}

function Drawing({ kind, facing, frame, bites = 0, eating = false }: { kind: ArtKind; facing: Facing; frame: SquiggleFrame; bites?: Bite; eating?: boolean }) {
  if (kind === "bowl-full" && bites === 3) kind = "bowl";
  const p = (d: string) => redraw(d, frame);
  const line = { stroke: ink, strokeWidth: 2.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  if (kind === "floor") return (
    <g fill="none" stroke="#718b62" strokeWidth="1.5" strokeLinecap="round" opacity=".55">
      <path d={p("M9 17 L11 14 M11 17 L14 16 M45 48 L47 44 M49 48 L51 46")} />
    </g>
  );

  if (kind === "wall") return (
    <g {...line}>
      <path d={p("M5 6 Q18 3 32 5 Q46 3 59 6 L60 57 Q47 61 33 59 Q17 61 5 58 Z")} fill="#49654d" stroke="#344d3d" />
      <path d={p("M7 29 Q20 27 31 30 Q47 27 57 29 M32 6 Q30 17 31 29 M19 30 Q21 42 19 58 M48 30 Q46 44 48 58")} fill="none" stroke="#344d3d" />
      <path d={p("M10 10 Q17 8 24 10 M37 10 L52 10 M9 35 L14 35 M26 35 Q34 33 40 35")} fill="none" stroke="#678260" strokeWidth="2" />
      <path d={p("M8 53 L12 48 L14 53 M50 23 L53 19 L55 23")} fill="none" stroke="#7c925f" strokeWidth="2" />
    </g>
  );

  if (kind === "carrot") return (
    <g {...line}>
      <path d={p("M37 23 Q35 13 38 8 Q43 11 43 21 Q46 9 51 9 Q54 15 46 24 Q55 17 59 21 Q58 27 45 29")} fill="#94b95f" stroke="#3b603c" />
      <path d={p("M40 22 Q49 23 48 33 Q43 45 13 55 Q10 56 12 52 Q21 29 33 23 Q36 21 40 22 Z")} fill="#f3a04d" />
      <path d={p("M39 28 Q29 33 19 47")} fill="none" stroke="#ffd283" strokeWidth="3" />
      <path d={p("M35 28 L39 32 M26 37 L30 40 M20 46 L23 48")} fill="none" stroke="#b76b38" strokeWidth="2" />
    </g>
  );

  if (kind === "bowl-full") return (
    <g {...line}>
      {/* A dedicated drawing: only the carrot's shoulder emerges from the bowl.
          Its hidden end stops well inside the vessel in all three frames. */}
      <path d={p("M10 30 C9 18 54 17 55 30 Q53 46 46 51 Q32 56 19 51 Q11 46 10 30 Z")} fill="#89b5bc" />
      <path d={p("M10 30 C9 18 54 17 55 30 C55 42 11 43 10 30 Z")} fill="#c3d8ca" />
      <path d={p("M16 30 C17 23 48 24 49 30 C47 37 18 37 16 30 Z")} fill="#567e80" stroke="none" />
      {bites === 0 && <>
      <path d={p("M36 25 Q31 17 34 13 Q39 14 39 22 Q40 11 45 12 Q48 17 42 24 Q49 18 52 22 Q51 27 42 29 Z")} fill="#94b95f" stroke="#3b603c" />
      <path d={p("M25 38 Q28 29 33 25 Q38 21 42 26 Q47 30 39 38 Z")} fill="#f3a04d" />
      <path d={p("M30 33 L34 28")} fill="none" stroke="#ffd283" strokeWidth="2.5" />
      <path d={p("M39 29 L42 31")} fill="none" stroke="#b76b38" strokeWidth="2" />
      </>}
      {bites === 1 && <>
        <path d={p("M36 31 Q34 25 37 22 L40 28 Q42 21 46 24 Q47 28 41 33 Z")} fill="#94b95f" stroke="#3b603c" />
        <path d={p("M26 38 Q28 33 32 29 Q34 33 37 29 Q42 28 43 33 L38 39 Z")} fill="#f3a04d" />
        <path d={p("M30 35 L33 33")} fill="none" stroke="#ffd283" strokeWidth="2" />
      </>}
      {bites === 2 && <path d={p("M28 39 L30 33 Q33 35 35 32 Q37 35 40 33 L39 39 Z")} fill="#f3a04d" />}
      {/* The front ceramic lip covers the carrot at the opening's inner edge;
          the dark line below belongs to the outside of the bowl. */}
      <path d={p("M10 30 L16 30 C18 37 47 37 49 30 L55 30 C55 42 11 42 10 30 Z")} fill="#c3d8ca" stroke="none" />
      <path d={p("M10 30 C11 42 55 42 55 30 Q53 46 46 51 Q32 56 19 51 Q11 46 10 30 Z")} fill="#89b5bc" />
      <path d={p("M25 45 Q32 48 39 45")} fill="none" stroke="#e1ead7" strokeWidth="2.5" />
    </g>
  );

  if (kind === "bowl") return (
    <g {...line}>
      <path d={p("M10 30 Q11 46 19 51 Q32 56 46 51 Q53 46 55 30 Z")} fill="#89b5bc" />
      <path d={p("M10 30 C9 18 54 17 55 30 C55 42 11 43 10 30 Z")} fill="#c3d8ca" />
      <path d={p("M16 30 C17 23 48 24 49 30 C47 37 18 37 16 30 Z")} fill="#567e80" stroke="none" />
      <path d={p("M25 45 Q32 48 39 45")} fill="none" stroke="#e1ead7" strokeWidth="2.5" />
    </g>
  );

  const side = facing === "left" || facing === "right";
  if (side) return (
    <g {...line} transform={facing === "left" ? "translate(64 0) scale(-1 1)" : undefined}>
      <path d={p("M15 45 L14 51 Q18 54 23 51 L24 46 M39 46 L40 52 Q45 54 48 50 L46 44")} fill="#dfab86" />
      <path d={p("M7 34 C5 21 15 14 29 16 Q43 13 51 26 Q59 28 58 37 C58 46 48 49 34 49 L22 49 Q6 48 7 34 Z")} fill={cream} />
      <path d={p("M10 28 Q12 18 23 18 Q31 17 30 27 Q26 33 29 40 Q27 48 17 44 Q9 43 10 28 Z")} fill={caramel} stroke="none" />
      <path d={p("M37 25 C29 16 37 12 42 19 Q46 25 40 28 Z")} fill={caramel} />
      <path d={p("M37 21 L39 24")} fill="none" stroke="#edb6a1" strokeWidth="3" />
      <path d={p("M48 30 Q50 28 50 31 Q50 34 48 33 Z")} fill={ink} strokeWidth="1.5" />
      <path d={p("M55 35 L59 35 L57 38 Z")} fill="#c47f73" strokeWidth="1.5" />
      <path d={p("M50 40 L54 40 M15 36 L17 33 M19 38 L21 35")} fill="none" strokeWidth="1.5" />
    </g>
  );

  return (
    <g {...line}>
      <path d={p("M18 45 L17 51 Q21 54 25 51 M39 49 Q43 55 47 50 L46 44")} fill="#dfab86" />
      <path d={p("M13 32 C12 18 20 12 31 13 C44 11 52 22 51 35 Q55 49 41 51 Q31 55 21 51 Q10 48 13 32 Z")} fill={cream} />
      <path d={p("M16 28 Q16 18 26 16 Q33 15 34 22 Q30 30 32 38 Q24 46 16 38 Z")} fill={caramel} stroke="none" />
      {facing === "down" ? <>
        <path d={p("M16 31 Q8 20 15 20 Q23 19 23 29 M42 28 Q43 17 50 21 Q56 28 48 33")} fill={caramel} />
        <path d={p("M16 24 L19 28 M48 25 L46 29")} fill="none" stroke="#edb6a1" strokeWidth="3" />
        <path d={p(eating ? "M20 36 Q23 32 26 36 M39 36 Q42 32 45 36" : "M22 36 Q24 33 24 37 M41 36 Q43 33 43 37")} fill="none" strokeWidth={eating ? "2" : "3.5"} />
        <path d={p("M29 41 Q32 39 35 41 L32 44 Z")} fill="#c47f73" strokeWidth="1.5" />
        <path d={p(eating ? "M28 45 Q32 50 36 45 M16 42 L21 43 M44 43 L49 41" : "M28 46 Q31 48 32 44 Q33 48 36 46 M16 42 L21 43 M44 43 L49 41")} fill="none" strokeWidth="1.5" />
      </> : <>
        <path d={p("M17 21 Q9 12 17 13 Q23 12 23 19 M41 18 Q43 10 49 14 Q55 19 48 23")} fill={caramel} />
        <path d={p("M27 45 L29 42 M33 46 L34 43 M38 44 L39 41")} fill="none" stroke="#c4b18a" strokeWidth="1.5" />
      </>}
    </g>
  );
}

export default function GuineaPigArt({ kind, facing = "down", frame, phase = 0, bites = 0, eating = false }: {
  kind: ArtKind;
  facing?: Facing;
  frame?: SquiggleFrame;
  phase?: number;
  bites?: Bite;
  eating?: boolean;
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" data-art={kind} data-facing={kind === "guinea-pig" ? facing : undefined}>
      {frame !== undefined ? <Drawing kind={kind} facing={facing} frame={frame} bites={bites} eating={eating} /> :
        ([0, 1, 2] as const).map((drawing) => (
          <g key={drawing} className={`squiggle-frame squiggle-frame--${drawing}`} style={{ "--squiggle-delay": `${-phase * 0.14}s` } as CSSProperties}>
            <Drawing kind={kind} facing={facing} frame={drawing} bites={bites} eating={eating} />
          </g>
        ))}
    </svg>
  );
}
