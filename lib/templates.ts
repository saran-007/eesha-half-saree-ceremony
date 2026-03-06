import { EVENT } from "./constants";

export interface MessageTemplate {
  id: string;
  email_subject: string;
  email_body: string;
  whatsapp_text: string;
  updated_at: string;
}

const PLACEHOLDERS: Record<string, string> = {
  "{{event_title}}": EVENT.title,
  "{{event_date}}": EVENT.date,
  "{{event_time}}": EVENT.time,
  "{{venue}}": EVENT.venue,
  "{{address}}": EVENT.address,
  "{{maps_link}}": EVENT.googleMapsUrl,
  "{{event_details}}": `Date: ${EVENT.date}\nTime: ${EVENT.time}\nVenue: ${EVENT.venue}\n${EVENT.address}`,
};

export function replacePlaceholders(
  text: string,
  extra: Record<string, string> = {}
): string {
  let result = text;
  const allVars = { ...PLACEHOLDERS, ...extra };
  for (const [key, value] of Object.entries(allVars)) {
    result = result.split(key).join(value);
  }
  return result;
}

export function buildEmailHtml(body: string): string {
  const htmlBody = body
    .split("\n\n")
    .map((p) => `<p style="color:#faf3e0;font-size:15px;margin:0 0 16px;line-height:1.6;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
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
      ${htmlBody}
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
</body>
</html>`;
}

export const AVAILABLE_PLACEHOLDERS = [
  { key: "{{first_name}}", description: "Guest's first name" },
  { key: "{{event_title}}", description: "Eesha Half Saree Ceremony" },
  { key: "{{event_date}}", description: EVENT.date },
  { key: "{{event_time}}", description: EVENT.time },
  { key: "{{venue}}", description: EVENT.venue },
  { key: "{{address}}", description: EVENT.address },
  { key: "{{rsvp_link}}", description: "Guest's unique RSVP link" },
  { key: "{{maps_link}}", description: "Google Maps directions link" },
  { key: "{{event_details}}", description: "Full event details block" },
];
