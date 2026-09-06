import { getDBConnection } from "@/lib/db";
import { dailyDifficulty } from "@/lib/dailyDifficulty";
import { isDifficulty } from "@/lib/levelMetadata";
import { dailyFallbackMaps } from "@/lib/maps";
import { NextResponse } from "next/server";
// import {headers} from "next/headers";

function getFallbackLevel(date) {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  const parsedTime = parsedDate.getTime();
  const daysSinceEpoch = Number.isNaN(parsedTime)
    ? 0
    : Math.floor(parsedTime / 86_400_000);
  const fallbackIndex =
    ((daysSinceEpoch % dailyFallbackMaps.length) + dailyFallbackMaps.length) %
    dailyFallbackMaps.length;

  return {
    layout: dailyFallbackMaps[fallbackIndex],
    difficulty: dailyDifficulty(dailyFallbackMaps[fallbackIndex]),
  };
}

export async function GET(request) {
  try {
    // Extract 'date' parameter from the query string
    // const headersList = await headers();
    // const ip = headersList.get("x-forwarded-for");
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const db = await getDBConnection();
    let rows;
    try {
      [rows] = await db.execute("SELECT layout, daily_id, difficulty FROM daily_levels WHERE date_of_level = ?", [date]);
    } finally {
      await db.end();
    }
    if (rows.length === 0) {
      return NextResponse.json(getFallbackLevel(date));
    }

    // Parse the layout JSON string before sending to frontend
    const layout = typeof rows[0].layout === "string" ? JSON.parse(rows[0].layout) : rows[0].layout;
    const result = {
      ...rows[0],
      layout,
      difficulty: isDifficulty(rows[0].difficulty) ? rows[0].difficulty : dailyDifficulty(layout),
    };

    return NextResponse.json(result);
  } catch {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    return NextResponse.json(getFallbackLevel(date));
  }
}
