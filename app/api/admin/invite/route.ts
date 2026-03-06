import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Resend } from "resend";
import { EVENT } from "@/lib/constants";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { guestIds } = await request.json();

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: "Guest IDs required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { data: guests, error } = await supabase
      .from("guests")
      .select("*")
      .in("id", guestIds);

    if (error || !guests) {
      return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const results = [];

    for (const guest of guests) {
      const rsvpLink = `${siteUrl}/rsvp/${guest.invite_token}`;
      const guestResult: Record<string, string> = { id: guest.id };

      if (guest.email) {
        try {
          await getResend().emails.send({
            from: process.env.EMAIL_FROM || "Eesha's Ceremony <hello@hello.eesha.info>",
            to: guest.email,
            subject: `You're Invited: ${EVENT.title}`,
            html: buildInviteEmail(guest.first_name, rsvpLink),
          });
          guestResult.email = "sent";
        } catch (emailError) {
          const msg = emailError instanceof Error ? emailError.message : "Unknown error";
          guestResult.email = `failed: ${msg}`;
        }
      }

      if (guest.mobile && process.env.WASENDER_API_KEY) {
        try {
          const { createWasender } = await import("wasenderapi");
          const wasender = createWasender(process.env.WASENDER_API_KEY!);
          const waResponse = await wasender.sendTextMessage({
            to: guest.mobile,
            text: `Hi ${guest.first_name}! 🎉\n\nYou're invited to *${EVENT.title}*\n\n📅 ${EVENT.date}\n🕐 ${EVENT.time}\n📍 ${EVENT.venue}, ${EVENT.address}\n\nPlease RSVP here: ${rsvpLink}\n\nReply *Yes* or *No* to RSVP directly here!\n\nWith love,\nSaran, Usha & Rithika`,
          });
          guestResult.whatsapp = "sent";

          const msgId = (waResponse as Record<string, unknown>)?.data
            ? ((waResponse as Record<string, unknown>).data as Record<string, unknown>)?.msgId
            : (waResponse as Record<string, unknown>)?.msgId;
          if (msgId) {
            await supabase
              .from("guests")
              .update({
                wa_message_id: String(msgId),
                wa_delivery_status: "sent",
              })
              .eq("id", guest.id);
          }
        } catch {
          guestResult.whatsapp = "failed";
        }
      }

      if (guestResult.email === "sent" || guestResult.whatsapp === "sent") {
        await supabase
          .from("guests")
          .update({ invite_sent_at: new Date().toISOString() })
          .eq("id", guest.id);
        guestResult.status = "sent";
      } else if (!guest.email && !guest.mobile) {
        guestResult.status = "skipped";
        guestResult.reason = "no email or mobile";
      } else {
        guestResult.status = "failed";
      }

      results.push(guestResult);
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildInviteEmail(firstName: string, rsvpLink: string): string {
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
      <h1 style="color:#d4a843;font-size:28px;margin:0 0 24px;">
        ${EVENT.title}
      </h1>
      <p style="color:#faf3e0;font-size:16px;margin:0 0 8px;">
        Dear ${firstName},
      </p>
      <p style="color:#ebe0c0;font-size:15px;margin:0 0 24px;line-height:1.6;">
        You are cordially invited to celebrate with us on this special occasion.
      </p>
      <div style="background:rgba(212,168,67,0.1);border-radius:8px;padding:20px;margin:0 0 24px;">
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
      <a href="${rsvpLink}" style="display:inline-block;background:#d4a843;color:#0a1628;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:16px;font-family:Arial,sans-serif;">
        RSVP Now
      </a>
      <p style="color:#ebe0c0;font-size:13px;margin:24px 0 0;opacity:0.7;">
        With love and blessings
      </p>
      <p style="color:#faf3e0;font-size:14px;margin:6px 0 0;opacity:0.8;">
        Saran, Usha &amp; Rithika
      </p>
    </div>
  </div>
</body>
</html>`;
}
