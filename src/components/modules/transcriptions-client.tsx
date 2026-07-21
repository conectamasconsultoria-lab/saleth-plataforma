"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Captions,
  Copy,
  Link2,
  Upload,
  FileAudio,
  X,
  ChevronDown,
  ChevronUp,
  Wand2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transcription } from "@/lib/supabase/types";

type Props = { initialTranscriptions: Transcription[] };

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  file: "Archivo subido",
  link: "Link directo",
};

const MAX_PREFILL_LENGTH = 4000;

export function TranscriptionsClient({ initialTranscriptions }: Props) {
  const router = useRouter();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>(initialTranscriptions);
  const [mode, setMode] = useState<"url" | "file">("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleTranscribe() {
    if (mode === "url" && !videoUrl.trim()) {
      toast.error("Ingresá la URL del video");
      return;
    }
    if (mode === "file" && !file) {
      toast.error("Seleccioná un archivo");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      let audioUrl: string;

      if (mode === "file" && file) {
        setStatus("Subiendo archivo...");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No autorizado");

        const ext = file.name.split(".").pop() || "mp4";
        const filePath = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("transcriptions")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Error al subir el archivo: " + uploadError.message);
        }

        const { data: signedData } = await supabase.storage
          .from("transcriptions")
          .createSignedUrl(filePath, 3600);

        if (!signedData?.signedUrl) throw new Error("Error al obtener URL del archivo");

        audioUrl = signedData.signedUrl;
      } else {
        audioUrl = videoUrl;
      }

      setStatus("Transcribiendo... esto puede tardar 1-2 minutos");

      const res = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: audioUrl, sourceType: mode }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Error del servidor. Verificá que el deploy haya terminado e intentá de nuevo.");
      }

      if (!res.ok) throw new Error(data.error || "Error al transcribir");

      if (data.transcription) {
        setTranscriptions((prev) => [data.transcription, ...prev]);
        setExpanded(data.transcription.id);
      }
      toast.success("Transcripción completada");
      setVideoUrl("");
      removeFile();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Payload too large") || msg.includes("Request En") || msg.includes("413")) {
        toast.error("El archivo es muy grande para subir. Probá con uno más pequeño (máx. 50MB).");
      } else {
        toast.error(msg || "Error al transcribir");
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  function copyTranscript(transcript: string) {
    navigator.clipboard.writeText(transcript);
    toast.success("Transcripción copiada");
  }

  function useInScripts(transcript: string) {
    router.push(`/dashboard/scripts?prefillTopic=${encodeURIComponent(transcript.slice(0, MAX_PREFILL_LENGTH))}`);
  }

  function useInCarousels(transcript: string) {
    router.push(`/dashboard/carousels?prefillTopic=${encodeURIComponent(transcript.slice(0, MAX_PREFILL_LENGTH))}`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      const maxSize = 50 * 1024 * 1024;
      if (selected.size > maxSize) {
        toast.error("El archivo es muy grande. Máximo 50MB. Podés aumentar el límite en Supabase Storage.");
        return;
      }
      setFile(selected);
    }
  }

  function removeFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const canSubmit = mode === "url" ? videoUrl.trim().length > 0 : !!file;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Captions className="h-4 w-4 text-primary" />
            Transcribir audio/video
          </CardTitle>
          <CardDescription>
            Subí un archivo, o pegá un link de TikTok, Instagram Reels, o una URL directa a un archivo de audio/video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                mode === "file" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Upload className="h-4 w-4" />
              Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                mode === "url" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Link2 className="h-4 w-4" />
              Pegar link
            </button>
          </div>

          {mode === "file" ? (
            <div className="space-y-2">
              <Label>Archivo de audio o video</Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <FileAudio className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button onClick={removeFile} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Hacé click para seleccionar</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, MP4, WAV, M4A, WebM — máx. 50MB
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg,.flac"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Link de TikTok, Instagram Reels o URL directa</Label>
              <Input
                placeholder="https://www.tiktok.com/@usuario/video/... o https://ejemplo.com/audio.mp3"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pegá el link de un video de TikTok o Instagram Reels, o un link directo a un archivo
                (.mp3, .mp4, .wav, etc.). YouTube todavía no está soportado.
              </p>
            </div>
          )}

          <Button onClick={handleTranscribe} disabled={loading || !canSubmit} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Captions className="h-4 w-4 mr-2" />}
            {loading ? "Procesando..." : "Transcribir"}
          </Button>

          {status && (
            <p className="text-sm text-muted-foreground text-center animate-pulse">{status}</p>
          )}
        </CardContent>
      </Card>

      {transcriptions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aún no generaste ninguna transcripción</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transcriptions.map((t) => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {t.transcript.slice(0, 80)}{t.transcript.length > 80 ? "..." : ""}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {t.source_platform && (
                        <Badge variant="outline" className="text-xs">
                          {PLATFORM_LABEL[t.source_platform] ?? t.source_platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => copyTranscript(t.transcript)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                    >
                      {expanded === t.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expanded === t.id && (
                <CardContent className="pt-0 space-y-4">
                  <div className="rounded-lg bg-muted p-4 max-h-96 overflow-y-auto">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.transcript}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => useInScripts(t.transcript)}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Usar en Guion
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => useInCarousels(t.transcript)}>
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Usar en Carrusel
                    </Button>
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
