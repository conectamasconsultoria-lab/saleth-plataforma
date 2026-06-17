import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { AdminActions } from "./admin-actions";
import { ApproveButtonClient } from "./approve-button";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user!.id)
    .single();

  if (profile?.role !== "coach") redirect("/dashboard");

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, full_name, created_at, user_id, is_approved")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const clientIds = clients?.map((c) => c.user_id) ?? [];
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("user_id, niche")
    .in("user_id", clientIds.length > 0 ? clientIds : ["none"]);

  const completedSet = new Set(questionnaires?.map((q) => q.user_id));
  const nicheMap = Object.fromEntries(questionnaires?.map((q) => [q.user_id, q.niche]) ?? []);

  return (
    <div className="space-y-8">
      <AdminActions />

      <div>
        <h2 className="text-xl font-bold mb-1">Clientes</h2>
        <p className="text-muted-foreground text-sm">{clients?.length ?? 0} clientes registrados</p>
      </div>

      {!clients?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aún no hay clientes registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{client.full_name || "Sin nombre"}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {nicheMap[client.user_id] && (
                        <span>Nicho: {nicheMap[client.user_id]}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={completedSet.has(client.user_id) ? "default" : "secondary"} className="text-xs">
                      {completedSet.has(client.user_id) ? "Activo" : "Sin perfil"}
                    </Badge>
                    <Badge
                      variant={client.is_approved ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {client.is_approved ? "Aprobado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Registrado: {new Date(client.created_at).toLocaleDateString("es-AR")}
                </p>
                {!client.is_approved ? (
                  <ApproveButtonClient
                    userId={client.user_id}
                    clientName={client.full_name}
                    approved={true}
                    label="Aprobar acceso"
                  />
                ) : (
                  <ApproveButtonClient
                    userId={client.user_id}
                    clientName={client.full_name}
                    approved={false}
                    label="Revocar acceso"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
