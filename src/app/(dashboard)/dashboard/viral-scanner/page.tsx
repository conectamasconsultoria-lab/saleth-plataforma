import { createClient } from "@/lib/supabase/server";
import { ViralScannerClient } from "@/components/modules/viral-scanner-client";

export default async function ViralScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche")
    .eq("user_id", user!.id)
    .single();

  const { data: videos } = await supabase
    .from("viral_videos")
    .select("*")
    .order("scanned_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Escáner Viral</h1>
        <p className="text-muted-foreground mt-1">
          Videos virales de TikTok para tu nicho: <span className="font-medium text-foreground">{questionnaire?.niche}</span>
        </p>
      </div>
      <ViralScannerClient initialVideos={videos ?? []} userNiche={questionnaire?.niche ?? ""} />
    </div>
  );
}
