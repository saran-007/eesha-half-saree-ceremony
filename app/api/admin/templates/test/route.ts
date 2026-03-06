import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Resend } from "resend";
import { replacePlaceholders, buildEmailHtml } from "@/lib/templates";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email_subject, email_body, whatsapp_text, test_email, test_mobile } =
      await request.json();

    const sampleVars = {
      "{{first_name}}": "Test Guest",
      "{{rsvp_link}}": "https://www.eesha.info/rsvp",
    };

    const results: Record<string, string> = {};

    if (test_email) {
      try {
        const subject = replacePlaceholders(email_subject, sampleVars);
        const body = replacePlaceholders(email_body, sampleVars);
        const html = buildEmailHtml(body);

        await getResend().emails.send({
          from:
            process.env.EMAIL_FROM ||
            "Eesha's Ceremony <hello@hello.eesha.info>",
          to: test_email,
          subject: `[TEST] ${subject}`,
          html,
        });
        results.email = "sent";
      } catch (err) {
        results.email = `failed: ${err instanceof Error ? err.message : "unknown"}`;
      }
    }

    if (test_mobile && process.env.WASENDER_API_KEY) {
      try {
        const text = replacePlaceholders(whatsapp_text, sampleVars);
        const { createWasender } = await import("wasenderapi");
        const wasender = createWasender(process.env.WASENDER_API_KEY!);
        await wasender.sendText({ to: test_mobile, text });
        results.whatsapp = "sent";
      } catch {
        results.whatsapp = "failed";
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
