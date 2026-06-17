import { createClient } from "@/lib/supabase/server";
import { EstrategiaClient } from "@/components/modules/estrategia-client";

export default async function EstrategiaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: strategy }, { data: questionnaire }, { data: profile }] =
    await Promise.all([
      supabase
        .from("brand_strategy")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("questionnaires")
        .select("niche, offer, content_style, brand_blueprint, personality_archetype")
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user!.id)
        .single(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estrategia de Marca</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tu hoja de ruta completa para construir una marca personal sólida
        </p>
      </div>
      <EstrategiaClient
        initialStrategy={strategy}
        questionnaire={questionnaire}
        role={profile?.role ?? "client"}
      />
    </div>
  );
}
