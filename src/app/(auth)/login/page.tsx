"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Credenciales incorrectas. Revisá tu email y contraseña.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Ingresá tu email primero");
      return;
    }
    setResetLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error("Error al enviar el email. Intentá de nuevo.");
    } else {
      toast.success("Te enviamos un email para restablecer tu contraseña. Revisá tu bandeja de entrada.");
      setResetMode(false);
    }
    setResetLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={{background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)"}}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg, #1A6FFF, #00C8FF)"}}>
            <span className="text-white font-bold text-lg">C+</span>
          </div>
          <CardTitle className="text-2xl">{resetMode ? "Recuperar contraseña" : "Bienvenido"}</CardTitle>
          <CardDescription>
            {resetMode
              ? "Ingresá tu email y te enviaremos un link para restablecer tu contraseña"
              : "Ingresá a tu cuenta de Conecta+"}
          </CardDescription>
        </CardHeader>

        {resetMode ? (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link de recuperación
              </Button>
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Volver al login
              </button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ingresar
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                ¿No tenés cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Registrate
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
