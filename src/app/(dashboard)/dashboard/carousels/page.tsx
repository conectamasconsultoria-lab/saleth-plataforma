import { createClient } from "@/lib/supabase/server";
import { CarouselsClient } from "@/components/modules/carousels-client";

export default async function CarouselsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: carousels } = await supabase
    .from("carousels")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carruseles</h1>
        <p className="text-muted-foreground mt-1">Generá estructuras de carrusel personalizadas para Instagram y LinkedIn</p>
      </div>
      <CarouselsClient initialCarousels={carousels ?? []} />
    </div>
  );
}
