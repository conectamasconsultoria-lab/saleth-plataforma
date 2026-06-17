import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SALETH-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el coach" }, { status: 403 });
  }

  const { data: codes } = await supabase
    .from("invitation_codes")
    .select("*, used_profile:profiles!invitation_codes_used_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  return NextResponse.json({ codes: codes ?? [] });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el coach" }, { status: 403 });
  }

  const code = generateCode();

  const { data, error } = await supabase
    .from("invitation_codes")
    .insert({ code, created_by: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al crear código" }, { status: 500 });
  }

  return NextResponse.json({ code: data });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return NextResponse.json({ error: "Solo el coach" }, { status: 403 });
  }

  const { codeId } = await req.json();

  const { error } = await supabase
    .from("invitation_codes")
    .update({ is_active: false })
    .eq("id", codeId);

  if (error) {
    return NextResponse.json({ error: "Error al desactivar" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
