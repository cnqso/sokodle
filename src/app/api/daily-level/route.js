import { getDBConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {headers} from "next/headers";

export async function GET(request) {
  try {
    // Extract 'date' parameter from the query string
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for");
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const db = await getDBConnection();
    const [rows] = await db.execute("SELECT layout, daily_id FROM daily_levels WHERE date_of_level = ?", [date]);
    
    await db.end();
    if (rows.length === 0) {
      return NextResponse.json({ error: "No level found for this date" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
