import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter required" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  const isEmail = q.includes("@");
  const column = isEmail ? "email" : "mobile";
  const value = isEmail ? q.toLowerCase() : q.replace(/\D/g, "");

  const { data: guest, error } = await supabase
    .from("guests")
    .select("*")
    .ilike(column, isEmail ? value : `%${value}`)
    .single();

  if (error || !guest) {
    return NextResponse.json(
      { error: "Guest not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ guest });
}
