import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+1${digits}`;
}

export async function POST(request: NextRequest) {
  try {
    const { first_name, last_name, email, mobile } = await request.json();

    if (!first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    if (!email?.trim() && !mobile?.trim()) {
      return NextResponse.json(
        { error: "Email or mobile number is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const cleanEmail = email?.trim()?.toLowerCase() || null;
    const cleanMobile = mobile?.trim() ? formatPhone(mobile.trim()) : null;

    if (cleanEmail) {
      const { data: existing } = await supabase
        .from("guests")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ guest: existing, existing: true });
      }
    }

    if (cleanMobile) {
      const digits = cleanMobile.replace(/\D/g, "");
      const last10 = digits.slice(-10);
      const { data: existing } = await supabase
        .from("guests")
        .select("*")
        .or(`mobile.ilike.%${last10},mobile.ilike.%${digits}`)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ guest: existing, existing: true });
      }
    }

    const { data: newGuest, error } = await supabase
      .from("guests")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: cleanEmail,
        mobile: cleanMobile,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        const { data: found } = await supabase
          .from("guests")
          .select("*")
          .or(
            [
              cleanEmail ? `email.eq.${cleanEmail}` : null,
              cleanMobile ? `mobile.ilike.%${cleanMobile.replace(/\D/g, "").slice(-10)}` : null,
            ]
              .filter(Boolean)
              .join(",")
          )
          .maybeSingle();

        if (found) {
          return NextResponse.json({ guest: found, existing: true });
        }
      }
      return NextResponse.json(
        { error: "We couldn't process your registration. Please try again or use a different email/phone." },
        { status: 500 }
      );
    }

    return NextResponse.json({ guest: newGuest, existing: false });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
