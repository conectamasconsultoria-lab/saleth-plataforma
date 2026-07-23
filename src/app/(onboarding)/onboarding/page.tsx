"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const STEPS = [
  {
    title: "Tu nicho e industria",
    description: "Contanos sobre el rubro en el que trabajas",
    fields: ["niche"],
  },
  {
    title: "Tu oferta principal",
    description: "¿Qué es lo que vendes o ofreces?",
    fields: ["offer"],
  },
  {
    title: "Tu estilo de contenido",
    description: "¿Cómo estás haciendo contenido actualmente?",
    fields: ["content_style"],
  },
  {
    title: "Blueprint de tu marca personal",
    description: "Definamos cómo quieres que te perciban",
    fields: ["tone", "values", "target_audience", "content_pillars"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    niche: "",
    offer: "",
    content_style: "",
    tone: "",
    values: "",
    target_audience: "",
    content_pillars: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFinish() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("questionnaires").upsert({
      user_id: user.id,
      niche: form.niche,
      offer: form.offer,
      content_style: form.content_style,
      brand_blueprint: {
        tone: form.tone,
        values: form.values,
        target_audience: form.target_audience,
        content_pillars: form.content_pillars,
      },
      completed_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Error al guardar. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    toast.success("¡Perfil completado! Ahora descubre tu arquetipo");
    router.push("/personality");
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)"}}>
      <div className="w-full max-w-xl" style={{background: "unset"}}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl flex items-center justify-center" style={{background: "linear-gradient(135deg, #1A6FFF, #00C8FF)"}}>
            <span className="text-white font-bold text-lg">C+</span>
          </div>
          <h1 className="text-2xl font-bold">Configura tu perfil</h1>
          <p className="text-muted-foreground mt-1">Paso {step + 1} de {STEPS.length}</p>
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <div className="space-y-2">
                <Label>¿En qué nicho o industria trabajas?</Label>
                <Input
                  placeholder="Ej: Coaching de negocios, Nutrición, Fitness, Real Estate..."
                  value={form.niche}
                  onChange={(e) => update("niche", e.target.value)}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-2">
                <Label>¿Cuál es tu oferta principal?</Label>
                <Textarea
                  placeholder="Ej: Mentoría 1:1 para coaches que quieren escalar a $10k/mes, Programa de 8 semanas de nutrición personalizada..."
                  value={form.offer}
                  onChange={(e) => update("offer", e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label>¿Cómo estás haciendo contenido actualmente?</Label>
                <Textarea
                  placeholder="Ej: Publico 3 veces por semana en Instagram, hago reels de valor, tengo un podcast mensual..."
                  value={form.content_style}
                  onChange={(e) => update("content_style", e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tono de comunicación</Label>
                  <Input
                    placeholder="Ej: Directo, empático, motivacional, profesional con humor..."
                    value={form.tone}
                    onChange={(e) => update("tone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valores de marca</Label>
                  <Input
                    placeholder="Ej: Autenticidad, resultados, comunidad, libertad..."
                    value={form.values}
                    onChange={(e) => update("values", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tu cliente ideal</Label>
                  <Input
                    placeholder="Ej: Coaches de 30-45 años que tienen clientes pero no escalan..."
                    value={form.target_audience}
                    onChange={(e) => update("target_audience", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pilares de contenido</Label>
                  <Input
                    placeholder="Ej: Mindset, estrategia de ventas, casos de éxito, detrás de escena..."
                    value={form.content_pillars}
                    onChange={(e) => update("content_pillars", e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>

              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Finalizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
