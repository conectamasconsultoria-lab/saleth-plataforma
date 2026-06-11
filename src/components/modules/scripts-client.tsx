"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { Script } from "@/lib/supabase/types";

type Props = { initialScripts: Script[] };

export function ScriptsClient({ initialScripts }: Props) {
  const [scripts, setScripts] = useState<Script[]>(initialScripts);
  const [topic, setTopic] = useState("");
  const [awarenessLevel, setAwarenessLevel] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Ingresá un tema para el guión");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, awarenessLevel: awarenessLevel || undefined, stage: stage || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScripts((prev) => [data.script, ...prev]);
      setExpanded(data.script.id);
      toast.success("Guión generado");
      setTopic("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setLoading(false);
    }
  }

  function copyScript(script: Script) {
    const text = `🎬 ${script.title}\n\n🎯 GANCHO:\n${script.hook}\n\n📝 DESARROLLO:\n${script.development}\n\n📣 CTA:\n${script.cta}`;
    navigator.clipboard.writeText(text);
    toast.success("Guión copiado al portapapeles");
  }

  const stageLabel: Record<string, string> = {
    attraction: "Atracción", conversion: "Conversión", nurturing: "Nutrición",
  };
  const awarenessLabel: Record<string, string> = {
    high: "Conciencia Alta", medium: "Conciencia Media", low: "Conciencia Baja",
  };

  return (
    <div className="space-y-6">
      {/* Generador */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Nuevo guión con IA
          </CardTitle>
          <CardDescription>Generá un guión personalizado según tu nicho y oferta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema del guión</Label>
            <Textarea
              placeholder="Ej: 3 errores que cometen los coaches al hacer contenido, Por qué no te compran aunque tengas buena oferta..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nivel de conciencia (opcional)</Label>
              <Select value={awarenessLevel} onValueChange={setAwarenessLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo — no sabe que tiene el problema</SelectItem>
                  <SelectItem value="medium">Medio — sabe el problema, no la solución</SelectItem>
                  <SelectItem value="high">Alto — ya te conoce</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Etapa del funnel (opcional)</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attraction">Atracción</SelectItem>
                  <SelectItem value="nurturing">Nutrición</SelectItem>
                  <SelectItem value="conversion">Conversión</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generar guión
          </Button>
        </CardContent>
      </Card>

      {/* Lista de guiones */}
      {scripts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aún no generaste ningún guión</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((script) => (
            <Card key={script.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base">{script.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {script.stage && (
                        <Badge variant="outline" className="text-xs">{stageLabel[script.stage]}</Badge>
                      )}
                      {script.awareness_level && (
                        <Badge variant="secondary" className="text-xs">{awarenessLabel[script.awareness_level]}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyScript(script)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(expanded === script.id ? null : script.id)}
                    >
                      {expanded === script.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expanded === script.id && (
                <CardContent className="pt-0 space-y-4">
                  <div className="rounded-lg bg-muted p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">🎯 Gancho (0–3 seg)</p>
                      <p className="text-sm">{script.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📝 Desarrollo</p>
                      <p className="text-sm whitespace-pre-line">{script.development}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📣 CTA</p>
                      <p className="text-sm">{script.cta}</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
