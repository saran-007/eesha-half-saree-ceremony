import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Resend } from "resend";
import { EVENT } from "@/lib/constants";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: guests, error } = await supabase
    .from("guests")
    .select("*")
    .in("rsvp_status", ["yes", "no"])
    .not("rsvp_responded_at", "is", null);

  if (error || !guests) {
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }

  const results = [];

  for (const guest of guests) {
    const isYes = guest.rsvp_status === "yes";
    const guestResult: Record<string, string> = {
      name: `${guest.first_name} ${guest.last_name}`,
      status: guest.rsvp_status,
    };

    if (guest.email && process.env.RESEND_API_KEY) {
      try {
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || "Eesha's Ceremony <hello@hello.eesha.info>",
          to: guest.email,
          subject: isYes
            ? `RSVP Confirmed: ${EVENT.title}`
            : `RSVP Received: ${EVENT.title}`,
          html: buildConfirmationEmail(
            guest.first_name,
            isYes,
            guest.guest_count,
            guest.veg_count,
            guest.guest_count - guest.veg_count
          ),
        });
        guestResult.email = "sent";
      } catch {
        guestResult.email = "failed";
      }
    }

    if (guest.mobile && process.env.WASENDER_API_KEY) {
      try {
        const { createWasender } = await import("wasenderapi");
        const wasender = createWasender(process.env.WASENDER_API_KEY!);
        const text = isYes
          ? `Hi ${guest.first_name}! ✅\n\nYour RSVP for *${EVENT.title}* is confirmed!\n\n👥 Guests: ${guest.guest_count}\n🌿 Veg: ${guest.veg_count} | 🍗 Non-Veg: ${guest.guest_count - guest.veg_count}\n\n📅 ${EVENT.date}\n🕐 ${EVENT.time}\n📍 ${EVENT.venue}, ${EVENT.address}\n\nSee you there!\nSaran, Usha & Rithika`
          : `Hi ${guest.first_name}!\n\nWe received your RSVP for *${EVENT.title}*. We'll miss you!\n\nWith love,\nSaran, Usha & Rithika`;
        await wasender.sendText({ to: guest.mobile, text });
        guestResult.whatsapp = "sent";
      } catch {
        guestResult.whatsapp = "failed";
      }
    }

    results.push(guestResult);
  }

  return NextResponse.json({ sent: results.length, results });
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
        <a href="${EVENT.googleMapsUrl}" style="color:#e0be6a;font-size:13px;text-decoration:underline;">${EVENT.address}</a>
      </div>
      <div style="margin:0 0 24px;">
        <a href="${EVENT.googleMapsUrl}" style="display:inline-block;background:#d4a843;color:#0a1628;text-decoration:none;padding:12px 24px;border-radius:50px;font-weight:bold;font-size:14px;font-family:Arial,sans-serif;margin:4px;">Get Directions</a>
        <a href="${EVENT.googleCalendarUrl}" style="display:inline-block;background:transparent;color:#d4a843;text-decoration:none;padding:12px 24px;border-radius:50px;font-weight:bold;font-size:14px;font-family:Arial,sans-serif;border:2px solid #d4a843;margin:4px;">Add to Calendar</a>
      </div>
      <p style="color:#ebe0c0;font-size:13px;margin:16px 0 0;opacity:0.7;">With love and blessings</p>
      <p style="color:#faf3e0;font-size:14px;margin:6px 0 0;opacity:0.8;">Saran, Usha &amp; Rithika</p>
    </div>
  </div>
</body></html>`;
}
