import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import crypto from "crypto";

function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.WASENDER_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");

  if (process.env.WASENDER_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as string;
  const supabase = getServiceClient();

  if (event === "message.sent" || event === "message-receipt.update") {
    await handleDeliveryUpdate(supabase, body);
  } else if (event === "messages.upsert") {
    await handleIncomingMessage(supabase, body);
  }

  return NextResponse.json({ received: true });
}

async function handleDeliveryUpdate(
  supabase: ReturnType<typeof getServiceClient>,
  body: Record<string, unknown>
) {
  const data = body.data as Record<string, unknown> | undefined;
  if (!data) return;

  const msgId = (data.msgId || data.id || data.messageId) as string | undefined;
  if (!msgId) return;

  let status = "sent";
  const receipt = data.receipt as Record<string, unknown> | undefined;
  if (receipt) {
    const type = receipt.type as string;
    if (type === "read" || type === "read-self") status = "read";
    else if (type === "delivery" || type === "delivered") status = "delivered";
    else if (type === "played") status = "read";
  }

  if (data.status) {
    const s = (data.status as string).toLowerCase();
    if (s.includes("read")) status = "read";
    else if (s.includes("deliver")) status = "delivered";
    else if (s.includes("fail") || s.includes("error")) status = "failed";
  }

  await supabase
    .from("guests")
    .update({
      wa_delivery_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("wa_message_id", String(msgId));
}

async function handleIncomingMessage(
  supabase: ReturnType<typeof getServiceClient>,
  body: Record<string, unknown>
) {
  const data = body.data as Record<string, unknown> | undefined;
  if (!data) return;

  const message = (data.message || data) as Record<string, unknown>;
  const fromJid = (message.from || message.remoteJid || data.from) as string | undefined;
  if (!fromJid) return;

  if ((message.fromMe as boolean) === true) return;

  const phone = fromJid.replace(/@.*/, "").replace(/\D/g, "");
  if (!phone) return;

  const text = (
    (message.body as string) ||
    ((message.message as Record<string, unknown>)?.conversation as string) ||
    ""
  ).trim().toLowerCase();

  if (!text) return;

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .ilike("mobile", `%${phone.slice(-10)}`)
    .maybeSingle();

  if (!guest) return;

  if (text === "yes" || text === "y" || text === "attending" || text === "accept") {
    await supabase
      .from("guests")
      .update({
        rsvp_status: "yes",
        guest_count: guest.guest_count || 1,
        rsvp_responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", guest.id);
  } else if (text === "no" || text === "n" || text === "decline" || text === "not attending") {
    await supabase
      .from("guests")
      .update({
        rsvp_status: "no",
        guest_count: 0,
        veg_count: 0,
        non_veg_count: 0,
        rsvp_responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", guest.id);
  } else {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      await supabase
        .from("guests")
        .update({
          rsvp_status: "yes",
          guest_count: num,
          rsvp_responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", guest.id);
    }
  }
}
