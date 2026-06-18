import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role ?? "client";
  const isApproved = profile?.is_approved ?? false;

  // Clientes no aprobados van a /pending
  if (role !== "coach" && !isApproved) {
    redirect("/pending");
  }

  // Solo clientes necesitan onboarding completo
  if (role !== "coach") {
    const { data: questionnaire } = await supabase
      .from("questionnaires")
      .select("id, personality_archetype")
      .eq("user_id", user.id)
      .single();

    if (!questionnaire) redirect("/onboarding");
    if (!questionnaire.personality_archetype) redirect("/personality");
  }

  return (
    <div className="flex h-screen bg-[#f6f8fc]">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={{ name: profile?.full_name ?? user.email ?? "", role }} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f6f8fc]">{children}</main>
      </div>
    </div>
  );
}
