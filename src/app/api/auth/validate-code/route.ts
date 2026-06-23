import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, error: "Código requerido" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("validate_invitation_code", {
      code_input: code.trim().toUpperCase(),
    });

    if (error) {
      console.error("validate-code error:", error);
      return NextResponse.json({ valid: false, error: "Error al validar código" });
    }

    return NextResponse.json({ valid: !!data });
  } catch (e) {
    console.error("validate-code crash:", e);
    return NextResponse.json({ valid: false, error: "Error del servidor" }, { status: 500 });
  }
}
