import { NextRequest, NextResponse } from "next/server";
import { getDBConnection } from "@/lib/db";
import { UserLevel } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // Parse query params from URL
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id") || "0";
    const limitParam = searchParams.get("limit") || "10";

    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid offset or limit" },
        { status: 400 }
      );
    }

    const db = await getDBConnection();

    const query = `
      SELECT user_level_id, user_name, layout, ip_address, uploaded_at
      FROM user_submitted_levels
      WHERE user_level_id = ?
    `;

    const [rows] = await db.execute(query, [id.toString()]);

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
