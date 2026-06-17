import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, error: "Código requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invitation_codes")
    .select("id")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .is("used_by", null)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Código inválido o ya usado" });
  }

  return NextResponse.json({ valid: true });
}
