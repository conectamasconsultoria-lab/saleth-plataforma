"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Video, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ReferenceVideo } from "@/lib/supabase/types";

type Props = { initialVideos: ReferenceVideo[]; isCoach: boolean };

export function ReferentesClient({ initialVideos, isCoach }: Props) {
  const [videos, setVideos] = useState<ReferenceVideo[]>(initialVideos);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: "", title: "", niche: "", description: "" });
  const supabase = createClient();

  async function handleAdd() {
    if (!form.url || !form.title) {
      toast.error("URL y título son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reference_videos")
        .insert({
          coach_id: user!.id,
          url: form.url,
          title: form.title,
          niche: form.niche,
          description: form.description,
        })
        .select()
        .single();
      if (error) throw error;
      setVideos((prev) => [data, ...prev]);
      setForm({ url: "", title: "", niche: "", description: "" });
      setAdding(false);
      toast.success("Video agregado");
    } catch {
      toast.error("Error al agregar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("reference_videos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success("Video eliminado");
  }

  return (
    <div className="space-y-4">
      {isCoach && (
        <div className="flex justify-end">
          <Button onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar referente
          </Button>
        </div>
      )}

      {adding && isCoach && (
        <Card className="border-primary/30">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>URL del video</Label>
                <Input
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  placeholder="Nombre descriptivo"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Nicho</Label>
                <Input
                  placeholder="Ej: Coaching, Fitness..."
                  value={form.niche}
                  onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descripción (opcional)</Label>
                <Input
                  placeholder="Por qué es un buen referente..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Aún no hay videos referentes</p>
          {isCoach && <p className="text-sm mt-1">Agregá el primero con el botón de arriba</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                    {video.niche && (
                      <Badge variant="secondary" className="text-xs mt-2">{video.niche}</Badge>
                    )}
                  </div>
                  {isCoach && (
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(video.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {video.description && (
                  <CardDescription className="text-xs mt-2">{video.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Ver video
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
