import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/lib/db";
import { moderateNames } from "@/lib/moderation";
import { CREATOR_NAME_MAX_LENGTH, LEVEL_NAME_MAX_LENGTH, isDifficulty, validateName } from "@/lib/levelMetadata";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { user_name, creator_name, difficulty, layout } = body ?? {};
  const nameError = validateName(user_name, "level name", LEVEL_NAME_MAX_LENGTH);
  const creatorError = validateName(creator_name, "username", CREATOR_NAME_MAX_LENGTH);
  if (nameError || creatorError) {
    return NextResponse.json({ error: nameError || creatorError, field: nameError ? "levelName" : "creatorName" }, { status: 400 });
  }
  if (!isDifficulty(difficulty)) {
    return NextResponse.json({ error: "Choose a difficulty from 1 to 3 guinea pigs." }, { status: 400 });
  }
  if (!Array.isArray(layout) || !layout.length || !Array.isArray(layout[0]) || !layout[0].length ||
      !layout.every(row => Array.isArray(row) && row.length === layout[0].length &&
        row.every(cell => Number.isInteger(cell) && cell >= 0 && cell <= 4))) {
    return NextResponse.json({ error: "Invalid level layout." }, { status: 400 });
  }

  const levelName = user_name.trim();
  const creatorName = creator_name.trim();
  // Enforce moderation here; a caller cannot bypass it by skipping the editor.
  try {
    const [levelAllowed, creatorAllowed] = await moderateNames([levelName, creatorName]);
    if (!levelAllowed || !creatorAllowed) {
      return NextResponse.json({
        error: !levelAllowed ? "Please choose an appropriate level name." : "Please choose an appropriate username.",
        field: !levelAllowed ? "levelName" : "creatorName",
      }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "We couldn't check the names right now. Please try again." }, { status: 503 });
  }

  try {
    const db = await getDBConnection();
    try {
      const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown";
      await db.execute(
        `INSERT INTO user_submitted_levels (user_name, creator_name, difficulty, layout, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [levelName, creatorName, difficulty, JSON.stringify(layout), ipAddress],
      );
    } finally {
      await db.end();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error inserting user-submitted level:", error);
    return NextResponse.json({ error: "Couldn't save the level. Please try again." }, { status: 500 });
  }
}
