import { createClient } from "@/lib/supabase/server";
import { ScriptsClient } from "@/components/modules/scripts-client";

export default async function ScriptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: scripts } = await supabase
    .from("scripts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Guiones</h1>
        <p className="text-muted-foreground mt-1">Tus guiones generados con IA, personalizados para tu nicho</p>
      </div>
      <ScriptsClient initialScripts={scripts ?? []} />
    </div>
  );
}
