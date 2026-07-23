"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Wand2,
  Copy,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Heart,
  ShoppingCart,
  AlertTriangle,
  Camera,
  HelpCircle,
  Timer,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Script } from "@/lib/supabase/types";
import { getStructuresByContentType, STAGE_MAP, type ContentType } from "@/lib/scripts/structures";
import { ScriptEditChat } from "@/components/modules/script-edit-chat";
import { ARCHETYPES, type ArchetypeName } from "@/lib/archetypes";

type Props = { initialScripts: Script[]; archetype: string | null };

const AWARENESS_LEVELS = [
  {
    id: "low",
    label: "Conciencia Baja",
    emoji: "😴",
    activeColor: "border-orange-500 bg-orange-100 dark:bg-orange-900 ring-2 ring-orange-500/30",
    color: "border-border bg-card hover:border-orange-300",
    description: "No sabe que tiene el problema. Hay que despertar conciencia.",
  },
  {
    id: "medium",
    label: "Conciencia Media",
    emoji: "🤔",
    activeColor: "border-blue-500 bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500/30",
    color: "border-border bg-card hover:border-blue-300",
    description: "Sabe el problema pero no tu solución. Hay que educar y posicionar.",
  },
  {
    id: "high",
    label: "Conciencia Alta",
    emoji: "🎯",
    activeColor: "border-green-500 bg-green-100 dark:bg-green-900 ring-2 ring-green-500/30",
    color: "border-border bg-card hover:border-green-300",
    description: "Te conoce y evalúa comprar. Hay que convertir con prueba social.",
  },
];

const CONTENT_TYPE_META: Record<ContentType, { label: string; icon: typeof Megaphone; color: string; activeColor: string; description: string }> = {
  atraccion: {
    label: "Atracción",
    icon: Megaphone,
    color: "border-violet-300 bg-violet-50 dark:bg-violet-950 dark:border-violet-800",
    activeColor: "border-violet-500 bg-violet-100 dark:bg-violet-900 ring-2 ring-violet-500/30",
    description: "Generar alcance, atraer audiencia nueva con temas universales",
  },
  nutricion: {
    label: "Nutrición",
    icon: Heart,
    color: "border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
    activeColor: "border-blue-500 bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500/30",
    description: "Educar, generar confianza y posicionarte como experto",
  },
  ventas: {
    label: "Ventas",
    icon: ShoppingCart,
    color: "border-emerald-300 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800",
    activeColor: "border-emerald-500 bg-emerald-100 dark:bg-emerald-900 ring-2 ring-emerald-500/30",
    description: "Generar deseo, eliminar objeciones y llevar a la acción",
  },
};

const CONTENT_TYPES = (Object.keys(CONTENT_TYPE_META) as ContentType[]).map((id) => ({
  id,
  ...CONTENT_TYPE_META[id],
  subtypes: getStructuresByContentType(id).map((s) => ({
    id: s.subType,
    label: s.label,
    description: s.description,
    formula: s.formula,
  })),
}));

const FORMATS = [
  {
    id: "problema",
    label: "Formato de Problema",
    icon: AlertTriangle,
    activeColor: "border-red-500 bg-red-100 dark:bg-red-900 ring-2 ring-red-500/30",
    color: "border-border bg-card hover:border-red-300",
    description: "Escena cotidiana incómoda que el cliente reconoce al instante (\"eso me pasa a mí\")",
  },
  {
    id: "camara",
    label: "Hablando a Cámara",
    icon: Camera,
    activeColor: "border-cyan-500 bg-cyan-100 dark:bg-cyan-900 ring-2 ring-cyan-500/30",
    color: "border-border bg-card hover:border-cyan-300",
    description: "Directo y auténtico, de principio a fin frente a cámara",
  },
  {
    id: "pregunta",
    label: "Pregunta de Instagram",
    icon: HelpCircle,
    activeColor: "border-amber-500 bg-amber-100 dark:bg-amber-900 ring-2 ring-amber-500/30",
    color: "border-border bg-card hover:border-amber-300",
    description: "Responde una pregunta real de la caja de preguntas de Instagram",
  },
  {
    id: "otro",
    label: "Otro",
    icon: Sparkles,
    activeColor: "border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900 ring-2 ring-fuchsia-500/30",
    color: "border-border bg-card hover:border-fuchsia-300",
    description: "Escribe tu propio formato de grabación (unboxing, POV, duet...)",
  },
];

const DURATIONS = [
  { id: 15, label: "15 segundos", description: "Un solo golpe: gancho + 1 idea + CTA" },
  { id: 30, label: "30 segundos", description: "Gancho + una idea de desarrollo + CTA" },
  { id: 60, label: "1 minuto", description: "Gancho + desarrollo completo + CTA" },
];

const formatLabel: Record<string, string> = {
  problema: "Formato de Problema",
  camara: "Hablando a Cámara",
  pregunta: "Pregunta de Instagram",
};

export function ScriptsClient({ initialScripts, archetype }: Props) {
  const archetypeInfo = archetype ? ARCHETYPES[archetype as ArchetypeName] : null;
  const searchParams = useSearchParams();
  const [scripts, setScripts] = useState<Script[]>(initialScripts);
  const [awarenessLevel, setAwarenessLevel] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [subType, setSubType] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [customFormat, setCustomFormat] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [targetNiche, setTargetNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const prefillTopic = searchParams.get("prefillTopic");
    if (prefillTopic) {
      setTopic(prefillTopic);
      toast.success("Transcripción cargada como contexto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedType = CONTENT_TYPES.find((t) => t.id === contentType);
  const effectiveFormat = format === "otro" ? customFormat.trim() : format;
  const canGenerate = Boolean(awarenessLevel && contentType && subType && effectiveFormat && duration);

  async function handleGenerate() {
    if (!canGenerate) {
      toast.error("Completa los 4 pasos: nivel de conciencia, etapa, formato y duración");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          subType,
          topic: topic || undefined,
          awarenessLevel,
          stage: STAGE_MAP[contentType as ContentType],
          format: effectiveFormat,
          duration,
          targetNiche: targetNiche || undefined,
        }),
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

  function updateScript(updated: Script) {
    setScripts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  const stageLabel: Record<string, string> = {
    attraction: "Atracción", conversion: "Ventas", nurturing: "Nutrición",
  };
  const stageColor: Record<string, string> = {
    attraction: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    nurturing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    conversion: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  };
  const awarenessLabel: Record<string, string> = {
    low: "Conciencia Baja", medium: "Conciencia Media", high: "Conciencia Alta",
  };

  return (
    <div className="space-y-6">
      {archetypeInfo && (
        <div
          className="flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm"
          style={{ background: archetypeInfo.bgColor, borderColor: `${archetypeInfo.color}30`, color: archetypeInfo.color }}
        >
          <span className="text-lg leading-none">{archetypeInfo.emoji}</span>
          <span>
            Tus guiones se adaptan a tu arquetipo de marca: <strong>{archetypeInfo.name}</strong> — {archetypeInfo.contentStyle.toLowerCase()}
          </span>
        </div>
      )}

      {/* Generador */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Nuevo guión con IA
          </CardTitle>
          <CardDescription>Define nivel de conciencia, etapa, formato y duración para tu guión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Paso 1: Nivel de conciencia */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">1. ¿En qué nivel de conciencia está tu cliente?</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AWARENESS_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setAwarenessLevel(level.id)}
                  className={cn(
                    "text-left p-4 rounded-lg border-2 transition-all",
                    awarenessLevel === level.id ? level.activeColor : level.color
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{level.emoji}</span>
                    <span className="font-semibold text-sm">{level.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Etapa del funnel */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">2. ¿Cuál es la etapa del funnel?</Label>
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

          {/* Paso 3: Estructura narrativa */}
          {selectedType && (
            <div>
              <Label className="text-sm font-semibold mb-3 block">3. ¿Qué estructura narrativa quieres usar?</Label>
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

          {/* Paso 4: Formato de grabación */}
          {subType && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold mb-3 block">4. ¿Con qué formato lo vas a grabar?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FORMATS.map((f) => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={cn(
                        "text-left p-4 rounded-lg border-2 transition-all",
                        format === f.id ? f.activeColor : f.color
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="h-4 w-4" />
                        <span className="font-semibold text-sm">{f.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </button>
                  );
                })}
              </div>
              {format === "otro" && (
                <Input
                  placeholder="Ej: Unboxing, POV, Duet, Reacción..."
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Paso 5: Duración */}
          {effectiveFormat && (
            <div>
              <Label className="text-sm font-semibold mb-3 block">5. ¿Cuánto va a durar el video?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DURATIONS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDuration(d.id)}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all flex items-start gap-2.5",
                      duration === d.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <Timer className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">{d.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 6: Nicho específico + tema opcional */}
          {duration && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">6. ¿A qué nicho o audiencia específica va dirigido? (opcional)</Label>
                <Input
                  placeholder="Ej: mamás primerizas de 25-35 años, coaches que recién empiezan..."
                  value={targetNiche}
                  onChange={(e) => setTargetNiche(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">7. Tema o contexto adicional (opcional)</Label>
                <Textarea
                  placeholder="Ej: Usar el caso de Elon Musk, hablar sobre disciplina financiera, mi cliente ideal son coaches..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
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
                      {script.awareness_level && (
                        <Badge variant="outline" className="text-xs">
                          {awarenessLabel[script.awareness_level]}
                        </Badge>
                      )}
                      {script.format && (
                        <Badge variant="outline" className="text-xs">
                          {formatLabel[script.format] ?? script.format}
                        </Badge>
                      )}
                      {script.duration && (
                        <Badge variant="outline" className="text-xs">
                          {script.duration === 60 ? "1 min" : `${script.duration}s`}
                        </Badge>
                      )}
                      {script.target_niche && (
                        <Badge variant="outline" className="text-xs">
                          🎯 {script.target_niche}
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
                  <ScriptEditChat scriptId={script.id} onScriptUpdated={updateScript} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
