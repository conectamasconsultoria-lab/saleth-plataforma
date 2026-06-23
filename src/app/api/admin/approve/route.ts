import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: "Solo el coach puede aprobar" }, { status: 403 });
    }

    const { userId, approved } = await req.json();

    if (!userId || typeof approved !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("approve_client", {
      client_user_id: userId,
      approve: approved,
    });

    if (error) {
      console.error("approve error:", error);
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }

    return NextResponse.json({ success: !!data });
  } catch (e) {
    console.error("approve crash:", e);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
