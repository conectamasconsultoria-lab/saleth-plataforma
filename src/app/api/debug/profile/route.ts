import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        step: "auth",
        error: "No session",
        details: authError?.message
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      step: "profile",
      userId: user.id,
      email: user.email,
      profile: profile,
      profileError: profileError?.message,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  } catch (e: unknown) {
    return NextResponse.json({
      step: "crash",
      error: e instanceof Error ? e.message : "Unknown error"
    });
  }
}
