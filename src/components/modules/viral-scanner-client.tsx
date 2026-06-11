"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Link2, TrendingUp, Eye, FileText } from "lucide-react";
import type { ViralVideo } from "@/lib/supabase/types";

type Props = {
  initialVideos: ViralVideo[];
  userNiche: string;
};

export function ViralScannerClient({ initialVideos, userNiche }: Props) {
  const router = useRouter();
  const [videos, setVideos] = useState<ViralVideo[]>(initialVideos);
  const [url, setUrl] = useState("");
  const [loadingManual, setLoadingManual] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);

  async function handleAddManual() {
    if (!url.trim()) return;
    setLoadingManual(true);
    try {
      const res = await fetch("/api/viral-scan/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVideos((prev) => [data.video, ...prev]);
      setUrl("");
      toast.success("Video agregado correctamente");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al agregar video");
    } finally {
      setLoadingManual(false);
    }
  }

  async function handleAutoScan() {
    setLoadingScan(true);
    try {
      const res = await fetch("/api/viral-scan/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: userNiche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Se encontraron ${data.count} videos nuevos`);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error en el escaneo");
    } finally {
      setLoadingScan(false);
    }
  }

  async function handleGenerateScript(video: ViralVideo) {
    setGeneratingScript(video.id);
    try {
      const res = await fetch("/api/scripts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viralVideoId: video.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Guión generado. Podés verlo en la sección Guiones.");
      router.push(`/dashboard/scripts?new=${data.scriptId}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al generar guión");
    } finally {
      setGeneratingScript(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Agregar URL manual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Agregar video manualmente
          </CardTitle>
          <CardDescription>Pegá la URL de un video de TikTok para transformarlo en guión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="https://www.tiktok.com/@usuario/video/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddManual} disabled={loadingManual || !url}>
              {loadingManual && <Loader2 className="h-4 w-4 animate-spin" />}
              Agregar
            </Button>
            <Button variant="outline" onClick={handleAutoScan} disabled={loadingScan}>
              {loadingScan ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Escaneo automático
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed de videos */}
      {videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Aún no hay videos</p>
          <p className="text-sm mt-1">Pegá una URL o hacé un escaneo automático</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="flex flex-col">
              {video.thumbnail_url && (
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm line-clamp-2">{video.title || "Sin título"}</CardTitle>
                  <Badge variant={video.source === "auto" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                    {video.source === "auto" ? "Auto" : "Manual"}
                  </Badge>
                </div>
                {video.views > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {video.views.toLocaleString()} vistas
                  </div>
                )}
                {video.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {video.hashtags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-primary">#{tag}</span>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleGenerateScript(video)}
                  disabled={generatingScript === video.id}
                >
                  {generatingScript === video.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  Convertir en guión
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
