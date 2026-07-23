"use client";

import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, BarChart3, Image, ChevronDown, ChevronUp } from "lucide-react";
import type { MetricsUpload } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { MetricsChat } from "@/components/modules/metrics-chat";

type Props = { initialUploads: MetricsUpload[] };

export function MetricsClient({ initialUploads }: Props) {
  const [uploads, setUploads] = useState<MetricsUpload[]>(initialUploads);
  const [platform, setPlatform] = useState("Instagram");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentInsights, setCurrentInsights] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Los uploads ya vienen ordenados por fecha desc (fetch inicial + prepend al
  // analizar uno nuevo), así que agrupar por mes preserva ese orden sin resortear.
  const groupedUploads = useMemo(() => {
    const groups = new Map<string, MetricsUpload[]>();
    for (const upload of uploads) {
      const label = new Date(upload.created_at).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
      const key = label.charAt(0).toUpperCase() + label.slice(1);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(upload);
    }
    return groups;
  }, [uploads]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Solo se aceptan imágenes");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleAnalyze() {
    if (!file) {
      toast.error("Selecciona una imagen primero");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", platform);

      const res = await fetch("/api/metrics/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentInsights(data.insights);
      setUploads((prev) => [data.upload as MetricsUpload, ...prev]);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Análisis completado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al analizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Uploader */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Subir screenshot de métricas
          </CardTitle>
          <CardDescription>
            Captura la pantalla de métricas de tu red social y súbela aquí
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Instagram", "TikTok", "LinkedIn", "YouTube", "Facebook"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              preview ? "border-primary/50" : "border-border hover:border-primary/50"
            )}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <div className="space-y-2">
                <Image className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
                <p className="text-sm font-medium">Haz clic para subir imagen</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <Button onClick={handleAnalyze} disabled={loading || !file} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            {loading ? "Analizando con IA..." : "Analizar métricas"}
          </Button>
        </CardContent>
      </Card>

      {/* Insights actuales */}
      {currentInsights && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">✨ Insights del análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{currentInsights}</div>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      {uploads.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-sm font-semibold">Historial de análisis</h2>
          {Array.from(groupedUploads.entries()).map(([monthLabel, monthUploads]) => (
            <div key={monthLabel} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{monthLabel}</h3>
              <div className="space-y-3">
                {monthUploads.map((upload) => {
                  const isExpanded = expanded === upload.id;
                  return (
                    <Card key={upload.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{upload.platform}</CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(upload.created_at).toLocaleDateString("es-AR")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpanded(isExpanded ? null : upload.id)}
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {upload.insights && (
                        <CardContent className="pt-0 space-y-4">
                          <p className={cn("text-sm text-muted-foreground whitespace-pre-wrap", !isExpanded && "line-clamp-3")}>
                            {upload.insights}
                          </p>
                          {isExpanded && <MetricsChat uploadId={upload.id} />}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
