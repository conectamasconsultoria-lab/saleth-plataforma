"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, ChevronDown, ChevronUp, Megaphone, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Script } from "@/lib/supabase/types";

type Props = { initialScripts: Script[] };

const CONTENT_TYPES = [
  {
    id: "atraccion",
    label: "Atracción",
    icon: Megaphone,
    color: "border-violet-300 bg-violet-50 dark:bg-violet-950 dark:border-violet-800",
    activeColor: "border-violet-500 bg-violet-100 dark:bg-violet-900 ring-2 ring-violet-500/30",
    description: "Generar alcance, atraer audiencia nueva con temas universales",
    subtypes: [
      {
        id: "polemico",
        label: "Casos Polémicos",
        description: "Usa un caso famoso o polémico para captar atención y conectar con tu nicho",
        formula: "Pregunta Universal → Caso Famoso → Open Loop → Valor → CTA",
      },
      {
        id: "deseos",
        label: "Deseos Humanos",
        description: "Conecta con deseos universales (dinero, estatus, atracción) y deriva a tu nicho",
        formula: "Gancho Universal → Contexto → Desarrollo → Moraleja → CTA",
      },
    ],
  },
  {
    id: "nutricion",
    label: "Nutrición",
    icon: Heart,
    color: "border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    activeColor: "border-blue-500 bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500/30",
    description: "Educar, generar confianza y posicionarte como experto",
    subtypes: [
      {
        id: "valor",
        label: "Atracción + Valor",
        description: "Enseña algo valioso sin vender, genera autoridad y ofrece un recurso",
        formula: "Hook Resultado → Romper Creencia → Enseñar → Autoridad → Recurso → CTA",
      },
      {
        id: "dolor",
        label: "Dolor + Valor",
        description: "Identifica el dolor del cliente, amplifica y revela la verdadera causa",
        formula: "Dolor → Amplifica → Causa Real → Valor → Posicionamiento → Recurso",
      },
    ],
  },
  {
    id: "ventas",
    label: "Ventas",
    icon: ShoppingCart,
    color: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800",
    activeColor: "border-emerald-500 bg-emerald-100 dark:bg-emerald-900 ring-2 ring-emerald-500/30",
    description: "Generar deseo, eliminar objeciones y llevar a la acción",
    subtypes: [
      {
        id: "directo",
        label: "Directo al Dolor",
        description: "Habla del dolor o deseo, agita el problema, presenta solución y elimina objeciones",
        formula: "Hook Dolor → Agita → Solución → Beneficios → Objeciones → CTA",
      },
      {
        id: "testimonio",
        label: "Con Testimonios",
        description: "Vende usando prueba social: muestra el antes y después de un cliente real",
        formula: "Resultado → Situación Inicial → Emoción → Solución → Transformación → CTA",
      },
    ],
  },
];

export function ScriptsClient({ initialScripts }: Props) {
  const [scripts, setScripts] = useState<Script[]>(initialScripts);
  const [contentType, setContentType] = useState<string | null>(null);
  const [subType, setSubType] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedType = CONTENT_TYPES.find((t) => t.id === contentType);

  async function handleGenerate() {
    if (!contentType || !subType) {
      toast.error("Seleccioná el tipo de contenido y la estructura");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, subType, topic: topic || undefined }),
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
    attraction: "Atracción", conversion: "Ventas", nurturing: "Nutrición",
  };
  const stageColor: Record<string, string> = {
    attraction: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    nurturing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    conversion: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  };

  return (
    <div className="space-y-6">
      {/* Paso 1: Tipo de contenido */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Nuevo guión con IA
          </CardTitle>
          <CardDescription>Elegí el tipo de contenido y la estructura que querés usar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm font-semibold mb-3 block">1. ¿Qué tipo de contenido querés crear?</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => { setContentType(type.id); setSubType(null); }}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      contentType === type.id ? type.activeColor : type.color
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paso 2: Sub-tipo / estructura */}
          {selectedType && (
            <div>
              <Label className="text-sm font-semibold mb-3 block">2. ¿Qué estructura querés usar?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedType.subtypes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSubType(st.id)}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      subType === st.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <p className="font-semibold text-sm mb-1">{st.label}</p>
                    <p className="text-xs text-muted-foreground mb-2">{st.description}</p>
                    <p className="text-[11px] font-mono text-primary/70 bg-primary/5 rounded px-2 py-1">{st.formula}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Tema opcional */}
          {subType && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">3. Tema o contexto adicional (opcional)</Label>
              <Textarea
                placeholder="Ej: Usar el caso de Elon Musk, hablar sobre disciplina financiera, mi cliente ideal son coaches..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !contentType || !subType}
            className="w-full sm:w-auto"
          >
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
                        <Badge className={cn("text-xs border-0", stageColor[script.stage] || "")}>
                          {stageLabel[script.stage]}
                        </Badge>
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
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">GANCHO (0-3 seg)</p>
                      <p className="text-sm">{script.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">DESARROLLO</p>
                      <p className="text-sm whitespace-pre-line">{script.development}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">CTA</p>
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
