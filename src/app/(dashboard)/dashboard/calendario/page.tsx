import { createClient } from "@/lib/supabase/server";
import { CalendarioClient } from "@/components/modules/calendario-client";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const from = `${firstDayOfMonth.getFullYear()}-${pad(firstDayOfMonth.getMonth() + 1)}-01`;
  const to = `${lastDayOfMonth.getFullYear()}-${pad(lastDayOfMonth.getMonth() + 1)}-${pad(lastDayOfMonth.getDate())}`;

  const { data: posts } = await supabase
    .from("calendar_posts")
    .select("*")
    .eq("user_id", user!.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Publicación</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Planifica y organiza tus publicaciones día a día. Agrega contenido, asigna tipo y plataforma, y lleva control del estado.
        </p>
      </div>
      <CalendarioClient initialPosts={posts ?? []} />
    </div>
  );
}
