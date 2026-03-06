import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

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
    const cleanMobile = mobile?.trim() || null;

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
      const { data: existing } = await supabase
        .from("guests")
        .select("*")
        .ilike("mobile", `%${cleanMobile.replace(/\D/g, "")}`)
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ guest: newGuest, existing: false });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
