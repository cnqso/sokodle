import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

// Build once per function instance. Checks stay local and need no API key.
const dataset = englishDataset.build();
const matcher = new RegExpMatcher({
  ...dataset,
  ...englishRecommendedTransformers,
  whitelistedTerms: [...(dataset.whitelistedTerms ?? []), "dickinson", "dickson"],
});

function normalizeForMatching(name: string): string {
  return name.normalize("NFKC")
    .replace(/\p{Default_Ignorable_Code_Point}/gu, "")
    // Join runs of isolated letters, not ordinary words (e.g. "pen is").
    .replace(/(?<![\p{L}\p{N}])(?:[\p{L}\p{N}][\s._-]+){2,}[\p{L}\p{N}](?![\p{L}\p{N}])/gu,
      letters => letters.replace(/[\s._-]+/g, ""))
    .trim();
}

/** English profanity heuristic; returns a separate decision for each name. */
export function moderateNames(names: string[]): boolean[] {
  return names.map(name => {
    const normalized = normalizeForMatching(name);
    return normalized.length > 0 && !matcher.hasMatch(normalized);
  });
}
