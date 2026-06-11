import { createClient } from "@/lib/supabase/server";
import { PromptsCoachView } from "@/components/modules/prompts-coach-view";
import { PromptsClientView } from "@/components/modules/prompts-client-view";

export default async function PromptsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  const isCoach = profile?.role === "coach";

  const { data: prompts } = await supabase
    .from("coach_prompts")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca de Prompts</h1>
        <p className="text-muted-foreground mt-1">
          {isCoach
            ? "Creá y gestioná los prompts que compartís con tus clientes"
            : "Prompts de tu coach para potenciar tu contenido con IA"}
        </p>
      </div>

      {isCoach ? (
        <PromptsCoachView initialPrompts={prompts ?? []} />
      ) : (
        <PromptsClientView prompts={prompts ?? []} />
      )}
    </div>
  );
}
