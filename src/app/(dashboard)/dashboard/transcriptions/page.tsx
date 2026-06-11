"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Captions, Copy, Link2 } from "lucide-react";

export default function TranscriptionsPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);

  async function handleTranscribe() {
    if (!videoUrl.trim()) {
      toast.error("Ingresá la URL del video");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transcripciones</h1>
        <p className="text-muted-foreground mt-1">Transcribí cualquier video a texto en segundos</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Transcribir video
          </CardTitle>
          <CardDescription>
            Pegá la URL directa del audio/video (TikTok, YouTube, Loom, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL del video</Label>
            <div className="flex gap-3">
              <Input
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTranscribe} disabled={loading || !videoUrl.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Captions className="h-4 w-4" />}
                {loading ? "Transcribiendo..." : "Transcribir"}
              </Button>
            </div>
          </div>
          {loading && (
            <p className="text-sm text-muted-foreground">
              Esto puede tardar 1-2 minutos dependiendo del largo del video...
            </p>
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
