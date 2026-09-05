import Link from "next/link";
import GuineaPigArt, { ArtKind, Facing } from "@/components/GuineaPigArt";
import FeastSprite from "@/components/FeastSprite";

const specimens: { label: string; kind: ArtKind; facing?: Facing }[] = [
  { label: "Guinea pig · front", kind: "guinea-pig", facing: "down" },
  { label: "Guinea pig · back", kind: "guinea-pig", facing: "up" },
  { label: "Guinea pig · left", kind: "guinea-pig", facing: "left" },
  { label: "Guinea pig · right", kind: "guinea-pig", facing: "right" },
  { label: "Carrot", kind: "carrot" },
  { label: "Empty bowl", kind: "bowl" },
  { label: "Full bowl", kind: "bowl-full" },
  { label: "Garden wall", kind: "wall" },
  { label: "Grass", kind: "floor" },
];

export default function ArtPreview() {
  return (
    <main className="art-preview">
      <Link href="/">← Back to the puzzle</Link>
      <h1>A little pig. A big lunch.</h1>
      <p>Soft shapes, crooked pen lines, and a garden palette. Three drawings per sprite, cycling slowly enough to feel alive. Every carrot belongs in a bowl.</p>
      <div className="art-palette" aria-label="Garden palette">
        {["#293c32", "#49654d", "#a4b887", "#fff1cb", "#ca8750", "#f3a04d", "#89b5bc"].map(color => <span key={color} style={{ background: color }} title={color} />)}
      </div>
      <div className="art-specimens">
        <div className="art-specimen art-specimen--header"><span>Sprite</span><span>01</span><span>02</span><span>03</span><span>Loop</span></div>
        {specimens.map(({ label, kind, facing }) => (
          <div className="art-specimen" key={label}>
            <span>{label}</span>
            {([0, 1, 2] as const).map(frame => <GuineaPigArt key={frame} kind={kind} facing={facing} frame={frame} />)}
            <GuineaPigArt kind={kind} facing={facing} />
          </div>
        ))}
      </div>
      <div className="art-specimens">
        <div className="art-specimen art-specimen--header"><span>Snack time</span><span>Ready</span><span>Bite 1</span><span>Bite 2</span><span>Bite 3</span></div>
        <div className="art-specimen">
          <span>Three little bites</span>
          {([0, 1, 2, 3] as const).map(bite => <FeastSprite key={bite} bite={bite} bowl={0} done={bite === 3} />)}
        </div>
      </div>
      <p className="mt-6">Try them in the <Link href="/editor">level editor</Link>. Animation respects your reduced-motion preference.</p>
    </main>
  );
}
