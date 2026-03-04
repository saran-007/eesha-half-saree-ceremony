import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ guests: data });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { guests } = body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: "Guests array required" },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const toInsert = guests.map(
      (g: { first_name: string; last_name: string; email?: string; mobile?: string }) => ({
        first_name: g.first_name?.trim(),
        last_name: g.last_name?.trim(),
        email: g.email?.trim()?.toLowerCase() || null,
        mobile: g.mobile?.trim() || null,
      })
    );

    const results = [];
    const errors = [];

    for (const guest of toInsert) {
      if (guest.email) {
        const { data: existing } = await supabase
          .from("guests")
          .select("id")
          .eq("email", guest.email)
          .maybeSingle();

        if (existing) {
          errors.push(`${guest.first_name} ${guest.last_name} (${guest.email}) already exists`);
          continue;
        }
      }

      const { data, error } = await supabase
        .from("guests")
        .insert(guest)
        .select()
        .single();

      if (error) {
        errors.push(`${guest.first_name} ${guest.last_name}: ${error.message}`);
      } else if (data) {
        results.push(data);
      }
    }

    return NextResponse.json({
      guests: results,
      count: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("guests").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
