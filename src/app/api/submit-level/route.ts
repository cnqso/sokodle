import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDBConnection } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get IP from headers
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "Unknown";
    // Get JSON body from request
    const body = await request.json();
    const { user_name, layout } = body;

    if (!user_name || !layout) {
      return NextResponse.json(
        { error: "Missing user_name or layout in request body" },
        { status: 400 }
      );
    }

    // Connect to DB
    const db = await getDBConnection();

    // Insert new row
    // Layout is a JSON column in MySQL. We can store it by stringifying.
    const query = `
      INSERT INTO user_submitted_levels (user_name, layout, ip_address)
      VALUES (?, ?, ?)
    `;
    await db.execute(query, [
      user_name,
      JSON.stringify(layout), // Store JSON as string
      ipAddress,
    ]);

    // Close DB connection
    await db.end();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error inserting user-submitted level:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
