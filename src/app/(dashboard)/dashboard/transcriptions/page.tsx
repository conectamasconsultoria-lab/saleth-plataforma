import { createClient } from "@/lib/supabase/server";
import { TranscriptionsClient } from "@/components/modules/transcriptions-client";

export default async function TranscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transcriptions } = await supabase
    .from("transcriptions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transcripciones</h1>
        <p className="text-muted-foreground mt-1">Transcribe cualquier audio o video a texto en segundos</p>
      </div>
      <TranscriptionsClient initialTranscriptions={transcriptions ?? []} />
    </div>
  );
}
