import GuineaPigArt from "@/components/GuineaPigArt";
import { difficultyLabels, type Difficulty } from "@/lib/levelMetadata";
import { cn } from "@/lib/utils";

export default function DifficultyRating({ value, className }: { value: Difficulty; className?: string }) {
  const label = `${difficultyLabels[value]}: ${value} of 3 guinea pigs`;
  return (
    <span className={cn("inline-flex items-center", className)} role="img" aria-label={label} title={label}>
      {Array.from({ length: value }, (_, index) => (
        <span key={index} className="block h-7 w-7 [&_svg]:block [&_svg]:h-full [&_svg]:w-full">
          <GuineaPigArt kind="guinea-pig" frame={0} />
        </span>
      ))}
    </span>
  );
}
