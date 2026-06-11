"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Wand2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const AWARENESS_LEVELS = [
  {
    id: "low",
    label: "Conciencia Baja",
    emoji: "😴",
    color: "border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800",
    activeColor: "border-orange-500 bg-orange-100 dark:bg-orange-900",
    description: "Tu cliente no sabe que tiene el problema. Necesitás despertar conciencia.",
    examples: ["Está perdiendo dinero sin saberlo", "Le pasa esto y ni lo nota", "El error que comete el 80% de los coaches"],
  },
  {
    id: "medium",
    label: "Conciencia Media",
    emoji: "🤔",
    color: "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    activeColor: "border-blue-500 bg-blue-100 dark:bg-blue-900",
    description: "Sabe que tiene el problema pero no conoce tu solución. Educá y posicioná.",
    examples: ["Por qué no alcanza con solo hacer contenido", "La diferencia entre X e Y (tu método)", "Cómo resolví este problema en 30 días"],
  },
  {
    id: "high",
    label: "Conciencia Alta",
    emoji: "🎯",
    color: "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
    activeColor: "border-green-500 bg-green-100 dark:bg-green-900",
    description: "Te conoce y está evaluando comprarte. Convertí con prueba social y oferta.",
    examples: ["Resultado de cliente + oferta", "Preguntas frecuentes resueltas", "Por qué trabajar con nosotros"],
  },
];

const STAGES = [
  { id: "attraction", label: "Atracción", description: "Atraer audiencia nueva, generar alcance" },
  { id: "nurturing", label: "Nutrición", description: "Educar, generar confianza y autoridad" },
  { id: "conversion", label: "Conversión", description: "Cerrar ventas, generar consultas" },
];

export function AwarenessClient() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    script: { title: string; hook: string; development: string; cta: string };
    topics: string[];
  } | null>(null);

  async function handleGenerate() {
    if (!selectedLevel || !selectedStage) {
      toast.error("Seleccioná nivel de conciencia y etapa");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awarenessLevel: selectedLevel,
          stage: selectedStage,
          topic: `Contenido de ${selectedStage} para cliente con conciencia ${selectedLevel}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // También pedimos temas recomendados
      const topicsRes = await fetch("/api/awareness/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel, stage: selectedStage }),
      });
      const topicsData = await topicsRes.json();

      setResult({ script: data.script, topics: topicsData.topics || [] });
      toast.success("Guión generado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setLoading(false);
    }
  }

  function copyScript() {
    if (!result) return;
    const text = `🎬 ${result.script.title}\n\n🎯 GANCHO:\n${result.script.hook}\n\n📝 DESARROLLO:\n${result.script.development}\n\n📣 CTA:\n${result.script.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Guión copiado");
  }

  return (
    <div className="space-y-6">
      {/* Selector de nivel */}
      <div>
        <h2 className="text-sm font-semibold mb-3">1. ¿En qué nivel de conciencia está tu cliente?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AWARENESS_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={cn(
                "text-left p-4 rounded-lg border-2 transition-all",
                selectedLevel === level.id ? level.activeColor : level.color
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{level.emoji}</span>
                <span className="font-semibold text-sm">{level.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{level.description}</p>
              <div className="mt-3 space-y-1">
                {level.examples.map((ex) => (
                  <p key={ex} className="text-xs text-muted-foreground">• {ex}</p>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de etapa */}
      <div>
        <h2 className="text-sm font-semibold mb-3">2. ¿Cuál es el objetivo de este contenido?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={cn(
                "text-left p-4 rounded-lg border-2 transition-all",
                selectedStage === stage.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <p className="font-semibold text-sm">{stage.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading || !selectedLevel || !selectedStage}
        className="w-full sm:w-auto"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
        Generar guión + temas recomendados
      </Button>

      {/* Resultado */}
      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{result.script.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {selectedLevel && <Badge variant="outline">{AWARENESS_LEVELS.find(l => l.id === selectedLevel)?.label}</Badge>}
                    {selectedStage && <Badge variant="secondary">{STAGES.find(s => s.id === selectedStage)?.label}</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={copyScript}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">🎯 Gancho</p>
                  <p className="text-sm">{result.script.hook}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📝 Desarrollo</p>
                  <p className="text-sm whitespace-pre-line">{result.script.development}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📣 CTA</p>
                  <p className="text-sm">{result.script.cta}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {result.topics.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">💡 Temas recomendados para esta combinación</CardTitle>
                <CardDescription>Otros temas que funcionan bien con este nivel de conciencia y etapa</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
