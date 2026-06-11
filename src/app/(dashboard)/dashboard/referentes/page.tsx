import { createClient } from "@/lib/supabase/server";
import { ReferentesClient } from "@/components/modules/referentes-client";

export default async function ReferentesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  const { data: videos } = await supabase
    .from("reference_videos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Videos Referentes</h1>
        <p className="text-muted-foreground mt-1">
          Referentes de la industria que tu coach seleccionó para inspirarte
        </p>
      </div>
      <ReferentesClient initialVideos={videos ?? []} isCoach={profile?.role === "coach"} />
    </div>
  );
}
