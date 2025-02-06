// app/actions/submitDailyAttempt.js
"use server";

import { getDBConnection } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request) {
  // Optional: If you want to ensure the request is a POST (in routes, you'd typically name the function POST anyway).
  if (request.method && request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let levelID, moves, timeMs;

  try {
    const body = await request.json();
    levelID = Number(body.levelID);
    moves = Number(body.moves);
    timeMs = Number(body.timeMs);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check for missing or invalid fields
  if (
    !Number.isInteger(levelID) ||
    !Number.isInteger(moves) ||
    !Number.isInteger(timeMs) ||
    levelID <= 0 ||
    moves < 0 ||
    timeMs < 0
  ) {
    return new Response(JSON.stringify({ 
      error: "Missing or invalid fields: levelID, moves, timeMs must be valid integers" 
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Obtain IP address from headers
  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || "0.0.0.0";

  try {
    const db = await getDBConnection();

    await db.execute(
      "INSERT INTO daily_level_attempts (daily_id, moves, time_ms, ip_address) VALUES (?, ?, ?, ?)",
      [levelID, moves, timeMs, ipAddress]
    );

    await db.end();

    // Return a success response
    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log the error if needed
    console.error("Error inserting daily attempt:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
