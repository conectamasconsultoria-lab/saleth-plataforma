"use client";

import { useState, useRef } from "react";
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
    try {
      let res: Response;

      if (mode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("/api/transcriptions", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/transcriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTranscript(data.transcript);
      toast.success("Transcripción completada");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al transcribir");
    } finally {
      setLoading(false);
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
      const maxSize = 100 * 1024 * 1024;
      if (selected.size > maxSize) {
        toast.error("El archivo es muy grande. Máximo 100MB.");
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
                    MP3, MP4, WAV, M4A, WebM — máx. 100MB
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
              <Label>URL del video o audio</Label>
              <Input
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                YouTube, Loom, o cualquier URL directa a un archivo de audio/video
              </p>
            </div>
          )}

          <Button onClick={handleTranscribe} disabled={loading || !canSubmit} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Captions className="h-4 w-4 mr-2" />}
            {loading ? "Transcribiendo... (esto puede tardar 1-2 min)" : "Transcribir"}
          </Button>
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
