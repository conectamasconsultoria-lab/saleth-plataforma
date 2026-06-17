import { createClient } from "@/lib/supabase/server";
import { ReferentesClient } from "@/components/modules/referentes-client";

export default async function ReferentesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: videos }, { data: personalVideos }] = await Promise.all([
    supabase.from("profiles").select("role").eq("user_id", user!.id).single(),
    supabase.from("reference_videos").select("*").order("created_at", { ascending: false }),
    supabase.from("personal_videos").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Videos Referentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Biblioteca curada por tu coach + tu colección personal de inspiración
        </p>
      </div>
      <ReferentesClient
        initialVideos={videos ?? []}
        initialPersonalVideos={personalVideos ?? []}
        isCoach={profile?.role === "coach"}
      />
    </div>
  );
}
