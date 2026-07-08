import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_FORMATS = ["4:5", "3:4"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { export_format } = await req.json();
  if (!VALID_FORMATS.includes(export_format)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("carousels")
    .update({ export_format })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
