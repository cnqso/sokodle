import { NextRequest, NextResponse } from "next/server";
import { moderateNames } from "@/lib/moderation";
import { CREATOR_NAME_MAX_LENGTH, LEVEL_NAME_MAX_LENGTH, validateName } from "@/lib/levelMetadata";

// Retained for existing callers. Submission also enforces these checks itself.
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { levelName, creatorName } = body ?? {};
  const error = validateName(levelName, "level name", LEVEL_NAME_MAX_LENGTH) ||
    (creatorName !== undefined ? validateName(creatorName, "username", CREATOR_NAME_MAX_LENGTH) : null);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const names = creatorName === undefined ? [levelName.trim()] : [levelName.trim(), creatorName.trim()];
    const allowed = await moderateNames(names);
    return NextResponse.json({
      appropriate: allowed.every(Boolean),
      field: !allowed[0] ? "levelName" : allowed[1] === false ? "creatorName" : null,
    });
  } catch {
    return NextResponse.json({ error: "We couldn't check the names right now. Please try again." }, { status: 503 });
  }
}
