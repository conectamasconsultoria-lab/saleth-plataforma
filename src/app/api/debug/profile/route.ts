import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No session", authError });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Also check with admin client (bypasses RLS)
  const admin = createAdminClient();
  const { data: adminProfile, error: adminError } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    profileViaRLS: profile,
    profileError: profileError?.message,
    profileViaAdmin: adminProfile,
    adminError: adminError?.message,
  });
}
