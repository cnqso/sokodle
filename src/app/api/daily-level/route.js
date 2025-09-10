import { getDBConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {headers} from "next/headers";

export async function GET(request) {
  try {
    console.log(request)
    // Extract 'date' parameter from the query string
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for");
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      console.log("Date parameter is required")
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const db = await getDBConnection();
    const [rows] = await db.execute("SELECT layout, daily_id FROM daily_levels WHERE date_of_level = ?", [date]);
    
    await db.end();
    if (rows.length === 0) {
      console.log("No level found for this date")
      return NextResponse.json({ error: "No level found for this date" }, { status: 404 });
    }

    // Parse the layout JSON string before sending to frontend
    const result = {
      ...rows[0],
      layout: JSON.parse(rows[0].layout)
    };

    console.log(result)
    return NextResponse.json(result);
  } catch (error) {
    console.error("Database error:", error);
    console.log("Internal Server Error")
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
