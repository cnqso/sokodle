import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get JSON body from request
    const body = await request.json();
    const { levelName } = body;

    if (!levelName) {
      return NextResponse.json(
        { error: "Missing levelName in request body" },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment variable
    const openAiKey = process.env.OPEN_AI_KEY;
    if (!openAiKey) {
      console.error("OPEN_AI_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Call OpenAI moderation API
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        input: levelName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Error checking content moderation" },
        { status: 500 }
      );
    }

    const moderationData = await response.json();
    
    // Check if the content was flagged
    const isFlagged = moderationData.results[0].flagged;

    return NextResponse.json(
      { 
        appropriate: !isFlagged,
        moderationResult: moderationData.results[0]
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error moderating level name:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 