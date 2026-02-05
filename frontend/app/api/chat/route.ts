import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { session_id, message, code } = await request.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing message" },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual chat backend (e.g. Groq, OpenAI).
    // This stub echoes back so the UI works without a backend.
    const response = `You said: "${message}"${code ? ` (code length: ${code.length} chars)` : ""}. Connect a real LLM in app/api/chat/route.ts for full chat.`;
    return NextResponse.json({ success: true, response });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
