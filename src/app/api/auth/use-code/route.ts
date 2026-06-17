import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, userId } = await req.json();

  if (!code || !userId) {
    return NextResponse.json({ error: "Código y userId requeridos" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invitation_codes")
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .is("used_by", null)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo usar el código" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
