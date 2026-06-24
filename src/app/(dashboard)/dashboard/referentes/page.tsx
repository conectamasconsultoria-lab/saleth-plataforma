import { createClient } from "@/lib/supabase/server";
import { ReferentesClient } from "@/components/modules/referentes-client";

export default async function ReferentesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: personalVideos } = await supabase
    .from("personal_videos")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Videos Referentes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Videos curados por nicho para inspirarte + tu colección personal
        </p>
      </div>
      <ReferentesClient initialPersonalVideos={personalVideos ?? []} />
    </div>
  );
}
