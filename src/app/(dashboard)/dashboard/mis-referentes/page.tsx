import { createClient } from "@/lib/supabase/server";
import { MisReferentesClient } from "@/components/modules/mis-referentes-client";

export default async function MisReferentesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("user_referent_accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referentes IA</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Agregá cuentas de TikTok que te inspiran — el sistema obtiene sus videos virales y los adapta a tu nicho y voz de marca
        </p>
      </div>
      <MisReferentesClient initialAccounts={accounts ?? []} />
    </div>
  );
}
