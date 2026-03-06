import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { EVENT } from "@/lib/constants";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

    sendConfirmation(data).catch(() => {});

    return NextResponse.json({ success: true, guest: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendConfirmation(guest: Record<string, string | number | null>) {
  const isYes = guest.rsvp_status === "yes";

  if (guest.email && process.env.RESEND_API_KEY) {
    try {
      await getResend().emails.send({
        from: process.env.EMAIL_FROM || "Eesha's Ceremony <hello@hello.eesha.info>",
        to: guest.email as string,
        subject: isYes
          ? `RSVP Confirmed: ${EVENT.title}`
          : `RSVP Received: ${EVENT.title}`,
        html: buildConfirmationEmail(
          guest.first_name as string,
          isYes,
          guest.guest_count as number,
          guest.veg_count as number,
          (guest.guest_count as number) - (guest.veg_count as number)
        ),
      });
    } catch { /* best effort */ }
  }

  if (guest.mobile && process.env.WASENDER_API_KEY) {
    try {
      const { createWasender } = await import("wasenderapi");
      const wasender = createWasender(process.env.WASENDER_API_KEY!);
      const text = isYes
        ? `Hi ${guest.first_name}! ✅\n\nYour RSVP for *${EVENT.title}* is confirmed!\n\n👥 Guests: ${guest.guest_count}\n🌿 Veg: ${guest.veg_count} | 🍗 Non-Veg: ${(guest.guest_count as number) - (guest.veg_count as number)}\n\n📅 ${EVENT.date}\n🕐 ${EVENT.time}\n📍 ${EVENT.venue}, ${EVENT.address}\n\nSee you there!\nSaran, Usha & Rithika`
        : `Hi ${guest.first_name}!\n\nWe received your RSVP for *${EVENT.title}*. We'll miss you!\n\nIf you change your mind, you can update your response anytime.\n\nWith love,\nSaran, Usha & Rithika`;
      await wasender.sendText({ to: guest.mobile as string, text });
    } catch { /* best effort */ }
  }
}

function buildConfirmationEmail(
  firstName: string,
  isYes: boolean,
  guestCount: number,
  vegCount: number,
  nonVegCount: number
): string {
  const body = isYes
    ? `<p style="color:#faf3e0;font-size:16px;margin:0 0 8px;">Dear ${firstName},</p>
       <p style="color:#ebe0c0;font-size:15px;margin:0 0 24px;line-height:1.6;">Your RSVP is confirmed! We can't wait to see you.</p>
       <div style="background:rgba(212,168,67,0.1);border-radius:8px;padding:20px;margin:0 0 16px;">
         <p style="color:#faf3e0;margin:4px 0;font-size:15px;"><strong>Guests:</strong> ${guestCount}</p>
         <p style="color:#4ade80;margin:4px 0;font-size:15px;"><strong>Vegetarian:</strong> ${vegCount}</p>
         <p style="color:#fb923c;margin:4px 0;font-size:15px;"><strong>Non-Vegetarian:</strong> ${nonVegCount}</p>
       </div>`
    : `<p style="color:#faf3e0;font-size:16px;margin:0 0 8px;">Dear ${firstName},</p>
       <p style="color:#ebe0c0;font-size:15px;margin:0 0 24px;line-height:1.6;">We received your RSVP. We'll miss you! If you change your mind, you can update your response anytime.</p>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding:30px;background:linear-gradient(135deg,#0d2457 0%,#1b2d4f 100%);border:2px solid #d4a843;border-radius:12px;">
      <h1 style="color:#d4a843;font-size:24px;margin:0 0 16px;">${isYes ? "RSVP Confirmed!" : "RSVP Received"}</h1>
      ${body}
      <div style="background:rgba(212,168,67,0.1);border-radius:8px;padding:20px;margin:16px 0 24px;">
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;"><strong>Date:</strong> ${EVENT.date}</p>
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;"><strong>Time:</strong> ${EVENT.time}</p>
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;"><strong>Venue:</strong> ${EVENT.venue}</p>
        <p style="color:#ebe0c0;margin:4px 0;font-size:13px;">${EVENT.address}</p>
      </div>
      <p style="color:#ebe0c0;font-size:13px;margin:24px 0 0;opacity:0.7;">With love and blessings</p>
      <p style="color:#faf3e0;font-size:14px;margin:6px 0 0;opacity:0.8;">Saran, Usha &amp; Rithika</p>
    </div>
  </div>
</body></html>`;
}
