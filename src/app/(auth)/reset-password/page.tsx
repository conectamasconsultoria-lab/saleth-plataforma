"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // El link del email establece una sesión de recuperación al cargar esta
    // página (Supabase la detecta sola desde la URL); confirmamos que haya
    // quedado una sesión activa antes de permitir cambiar la contraseña.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidLink(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidLink(true);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("No se pudo actualizar la contraseña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    toast.success("Contraseña actualizada con éxito");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)" }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
          >
            <span className="text-white font-bold text-lg">C+</span>
          </div>
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para tu cuenta de Conecta+</CardDescription>
        </CardHeader>

        {!ready ? (
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        ) : !validLink ? (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Este link de recuperación no es válido o ya venció. Solicita uno nuevo desde la pantalla de ingreso.
            </p>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Volver al login
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar nueva contraseña
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
