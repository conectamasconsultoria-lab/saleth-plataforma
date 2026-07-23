import { createClient } from "@/lib/supabase/server";
import { MetricsClient } from "@/components/modules/metrics-client";

export default async function MetricsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: uploads } = await supabase
    .from("metrics_uploads")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Análisis de Métricas</h1>
        <p className="text-muted-foreground mt-1">
          Sube un screenshot de tus métricas y la IA te dará insights accionables
        </p>
      </div>
      <MetricsClient initialUploads={uploads ?? []} />
    </div>
  );
}
