import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code, userId } = await req.json();

  if (!code || !userId) {
    return NextResponse.json({ error: "Código y userId requeridos" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("use_invitation_code", {
      code_input: code.trim().toUpperCase(),
      user_id_input: userId,
    });

    if (error) {
      console.error("use-code error:", error);
      return NextResponse.json({ error: "No se pudo usar el código" }, { status: 400 });
    }

    return NextResponse.json({ success: !!data });
  } catch (e) {
    console.error("use-code crash:", e);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
