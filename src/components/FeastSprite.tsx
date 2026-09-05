import GuineaPigArt from "./GuineaPigArt";
import type { Bite } from "@/lib/victoryFeast";

export default function FeastSprite({ bite, bowl, done }: { bite: Bite; bowl: number; done: boolean }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="feast-sprite" data-bite={bite}>
      <g transform="translate(7 -1) scale(.8)">
        <g key={`${bowl}-${bite}`} className={bite > 0 && !done ? "feast-munch" : undefined}>
          <GuineaPigArt kind="guinea-pig" facing="down" eating />
        </g>
      </g>
      <g transform="translate(5 14) scale(.85)">
        <GuineaPigArt kind="bowl-full" bites={bite} />
      </g>
      {bite > 0 && bite < 3 && <g key={`crumbs-${bowl}-${bite}`} className="feast-crumbs" fill="#f3a04d">
        <rect x="13" y="33" width="3" height="3" rx="1" />
        <rect x="49" y="31" width="3" height="3" rx="1" />
      </g>}
      {bite === 3 && <text x="49" y="16" fontSize="13" fill="#bd6b64">♥</text>}
    </svg>
  );
}
