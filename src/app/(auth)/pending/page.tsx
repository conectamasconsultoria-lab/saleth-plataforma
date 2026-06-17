"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogOut } from "lucide-react";

export default function PendingPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleRetry() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={{background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)"}}>
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Cuenta pendiente</CardTitle>
          <CardDescription className="text-base mt-2">
            Tu cuenta fue creada correctamente pero necesita ser aprobada por el coach antes de que puedas acceder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recibirás acceso una vez que el coach apruebe tu cuenta. Podés intentar ingresar nuevamente más tarde.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              Intentar ingresar
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
