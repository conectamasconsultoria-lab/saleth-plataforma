"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Captions, Copy, Link2, Upload, FileAudio, X } from "lucide-react";

export default function TranscriptionsPage() {
  const [mode, setMode] = useState<"url" | "file">("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState<string | null>(null);
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
        body: JSON.stringify({ videoUrl: audioUrl }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Error del servidor. Verificá que el deploy haya terminado e intentá de nuevo.");
      }

      if (!res.ok) throw new Error(data.error || "Error al transcribir");
      setTranscript(data.transcript);
      toast.success("Transcripción completada");
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

  function copyTranscript() {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    toast.success("Transcripción copiada");
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
      <div>
        <h1 className="text-2xl font-bold">Transcripciones</h1>
        <p className="text-muted-foreground mt-1">Transcribí cualquier audio o video a texto en segundos</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Captions className="h-4 w-4 text-primary" />
            Transcribir audio/video
          </CardTitle>
          <CardDescription>
            Subí un archivo de audio/video o pegá una URL directa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "file"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Upload className="h-4 w-4" />
              Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "url"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Link2 className="h-4 w-4" />
              Pegar URL
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
              <Label>URL directa al archivo de audio/video</Label>
              <Input
                placeholder="https://ejemplo.com/audio.mp3"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Debe ser un link directo a un archivo (.mp3, .mp4, .wav, etc.).
                URLs de TikTok, YouTube o Instagram no funcionan — usá &quot;Subir archivo&quot; en su lugar.
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

      {transcript && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transcripción</CardTitle>
              <Button variant="ghost" size="sm" onClick={copyTranscript}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 max-h-96 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
