import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, rsvp_status, guest_count, veg_count, non_veg_count } = body;

    if (!token || !rsvp_status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["yes", "no"].includes(rsvp_status)) {
      return NextResponse.json(
        { error: "Invalid RSVP status" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("guests")
      .update({
        rsvp_status,
        guest_count: rsvp_status === "yes" ? guest_count : 0,
        veg_count: rsvp_status === "yes" ? veg_count : 0,
        non_veg_count: rsvp_status === "yes" ? non_veg_count : 0,
        rsvp_responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("invite_token", token)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, guest: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
