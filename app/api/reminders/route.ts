import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { replacePlaceholders, buildEmailHtml } from "@/lib/templates";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function fetchAudience(supabase: ReturnType<typeof getServiceClient>, type: string) {
  if (type === "rsvp_nudge") {
    return supabase
      .from("guests")
      .select("*")
      .eq("rsvp_status", "pending")
      .not("invite_sent_at", "is", null);
  }
  return supabase
    .from("guests")
    .select("*")
    .eq("rsvp_status", "yes");
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") || "event_reminder";
  const validTypes = ["rsvp_nudge", "event_reminder", "thank_you"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: template } = await supabase
    .from("message_templates")
    .select("*")
    .eq("id", type)
    .single();

  if (!template) {
    return NextResponse.json({ error: `Template '${type}' not found` }, { status: 404 });
  }

  const { data: guests, error } = await fetchAudience(supabase, type);

  if (error || !guests) {
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const results = [];

  for (const guest of guests) {
    const guestVars = {
      "{{first_name}}": guest.first_name,
      "{{rsvp_link}}": `${siteUrl}/rsvp/${guest.invite_token}`,
    };

    if (guest.email) {
      try {
        const subject = replacePlaceholders(template.email_subject, guestVars);
        const body = replacePlaceholders(template.email_body, guestVars);
        const html = buildEmailHtml(body);

        await getResend().emails.send({
          from: process.env.EMAIL_FROM || "Eesha's Ceremony <hello@hello.eesha.info>",
          to: guest.email,
          subject,
          html,
        });
        results.push({ id: guest.id, email: "sent" });
      } catch {
        results.push({ id: guest.id, email: "failed" });
      }
    }

    if (guest.mobile && process.env.WASENDER_API_KEY) {
      try {
        const text = replacePlaceholders(template.whatsapp_text, guestVars);
        const { createWasender } = await import("wasenderapi");
        const wasender = createWasender(process.env.WASENDER_API_KEY!);
        await wasender.sendText({ to: guest.mobile, text });
        results.push({ id: guest.id, whatsapp: "sent" });
      } catch {
        results.push({ id: guest.id, whatsapp: "failed" });
      }
    }

    await supabase
      .from("guests")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", guest.id);
  }

  return NextResponse.json({
    type,
    audienceCount: guests.length,
    results,
  });
}
