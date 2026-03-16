import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (!process.env.WASENDER_API_KEY) {
      return NextResponse.json({
        error: "WASENDER_API_KEY is not set in environment variables",
      }, { status: 500 });
    }

    const { createWasender } = await import("wasenderapi");
    const wasender = createWasender(process.env.WASENDER_API_KEY);

    const result = await wasender.sendText({
      to,
      text: "Test message from Eesha RSVP system. If you received this, WhatsApp integration is working!",
    });

    return NextResponse.json({
      success: true,
      sentTo: to,
      apiResponse: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const details = err instanceof Error ? { name: err.name, stack: err.stack?.split("\n").slice(0, 3) } : {};
    return NextResponse.json({
      success: false,
      error: message,
      details,
    }, { status: 500 });
  }
}
