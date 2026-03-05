import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { EVENT } from "@/lib/constants";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: guests, error } = await supabase
    .from("guests")
    .select("*")
    .eq("rsvp_status", "yes")
    .not("invite_sent_at", "is", null);

  if (error || !guests) {
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const results = [];

  for (const guest of guests) {
    if (guest.email) {
      try {
        const rsvpLink = `${siteUrl}/rsvp/${guest.invite_token}`;
        await getResend().emails.send({
          from: process.env.EMAIL_FROM || "Eesha's Ceremony <hello@hello.eesha.info>",
          to: guest.email,
          subject: `Reminder: ${EVENT.title} is coming up!`,
          html: buildReminderEmail(guest.first_name, rsvpLink),
        });
        results.push({ id: guest.id, email: "sent" });
      } catch {
        results.push({ id: guest.id, email: "failed" });
      }
    }

    if (guest.mobile && process.env.TWILIO_ACCOUNT_SID) {
      try {
        const twilio = await import("twilio");
        const client = twilio.default(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        await client.messages.create({
          body: `Hi ${guest.first_name}! Reminder: ${EVENT.title} is on ${EVENT.date}, ${EVENT.time} at ${EVENT.venue}, ${EVENT.address}. We look forward to seeing you! ${EVENT.googleMapsUrl}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: guest.mobile,
        });
        results.push({ id: guest.id, sms: "sent" });
      } catch {
        results.push({ id: guest.id, sms: "failed" });
      }
    }

    await supabase
      .from("guests")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", guest.id);
  }

  return NextResponse.json({
    sent: results.length,
    results,
  });
}

function buildReminderEmail(firstName: string, rsvpLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a1628;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding:30px;background:linear-gradient(135deg,#0d2457 0%,#1b2d4f 100%);border:2px solid #d4a843;border-radius:12px;">
      <h1 style="color:#d4a843;font-size:24px;margin:0 0 16px;">
        Reminder: The celebration is almost here!
      </h1>
      <p style="color:#faf3e0;font-size:16px;margin:0 0 8px;">
        Dear ${firstName},
      </p>
      <p style="color:#ebe0c0;font-size:15px;margin:0 0 24px;line-height:1.6;">
        We're excited to see you at the ceremony!
      </p>
      <div style="background:rgba(212,168,67,0.1);border-radius:8px;padding:20px;margin:0 0 24px;">
        <p style="color:#d4a843;font-size:18px;margin:0 0 12px;font-weight:bold;">
          ${EVENT.title}
        </p>
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;">
          <strong>Date:</strong> ${EVENT.date}
        </p>
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;">
          <strong>Time:</strong> ${EVENT.time}
        </p>
        <p style="color:#faf3e0;margin:4px 0;font-size:15px;">
          <strong>Venue:</strong> ${EVENT.venue}
        </p>
        <p style="color:#ebe0c0;margin:4px 0;font-size:13px;">
          ${EVENT.address}
        </p>
      </div>
      <a href="${EVENT.googleMapsUrl}" style="display:inline-block;background:#d4a843;color:#0a1628;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:bold;font-size:14px;font-family:Arial,sans-serif;margin:0 8px;">
        Get Directions
      </a>
      <a href="${rsvpLink}" style="display:inline-block;background:transparent;color:#d4a843;text-decoration:none;padding:12px 28px;border-radius:50px;font-weight:bold;font-size:14px;font-family:Arial,sans-serif;border:2px solid #d4a843;margin:0 8px;">
        View RSVP
      </a>
      <p style="color:#ebe0c0;font-size:12px;margin:24px 0 0;opacity:0.6;">
        With love and blessings
      </p>
    </div>
  </div>
</body>
</html>`;
}
