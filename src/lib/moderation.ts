/** Check each name separately so a rejected creator can be identified in the form. */
export async function moderateNames(names: string[]): Promise<boolean[]> {
  const key = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Moderation is not configured");

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: "omni-moderation-latest", input: names }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Moderation failed (${response.status})`);

  const data = await response.json();
  if (!Array.isArray(data.results) || data.results.length !== names.length ||
      !data.results.every((result: { flagged?: unknown } | null) => typeof result?.flagged === "boolean")) {
    throw new Error("Invalid moderation response");
  }
  return data.results.map((result: { flagged: boolean }) => !result.flagged);
}
