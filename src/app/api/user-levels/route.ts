import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Parse query params from URL
    const { searchParams } = new URL(request.url);
    const offsetParam = searchParams.get("offset") || "0";
    const limitParam = searchParams.get("limit") || "10";

    const offset = parseInt(offsetParam, 10);
    const limit = parseInt(limitParam, 10);

    if (isNaN(offset) || isNaN(limit)) {
      return NextResponse.json(
        { error: "Invalid offset or limit" },
        { status: 400 }
      );
    }

    const db = await getDBConnection();

    const query = `
      SELECT user_level_id, user_name, layout, ip_address, uploaded_at
      FROM user_submitted_levels
      ORDER BY uploaded_at DESC
      LIMIT ?, ?
    `;

    const [rows] = await db.execute(query, [offset.toString(), limit.toString()]);

    await db.end();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching user-submitted levels:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
