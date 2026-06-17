import { createClient } from "@/lib/supabase/server";
import { AuditoriasClient } from "@/components/modules/auditorias-client";

export default async function AuditoriasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("auditorias")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auditorías</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Diagnóstico completo de tu negocio: oferta, visión, promesas, avatar y adquisición
        </p>
      </div>
      <AuditoriasClient initialData={data ?? null} />
    </div>
  );
}
