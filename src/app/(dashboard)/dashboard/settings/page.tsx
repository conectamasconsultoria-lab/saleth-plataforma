import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/modules/settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">Tu perfil y blueprint de marca personal</p>
      </div>
      <SettingsClient initialQuestionnaire={questionnaire} profile={profile} />
    </div>
  );
}
