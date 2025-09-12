import { getDBConnection } from "@/lib/db";
import { NextResponse } from "next/server";
// import {headers} from "next/headers";

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
    const [rows] = await db.execute("SELECT layout, daily_id FROM daily_levels WHERE date_of_level = ?", [date]);
    
    await db.end();
    if (rows.length === 0) {
      return NextResponse.json({ error: "No level found for this date" }, { status: 404 });
    }

    // Parse the layout JSON string before sending to frontend
    const result = {
      ...rows[0],
      layout: JSON.parse(rows[0].layout)
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
