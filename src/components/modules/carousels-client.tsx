"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, Layers, ChevronRight } from "lucide-react";
import type { Carousel } from "@/lib/supabase/types";

type Slide = { slide_number: number; title: string; content: string };
type Props = { initialCarousels: Carousel[] };

export function CarouselsClient({ initialCarousels }: Props) {
  const [carousels, setCarousels] = useState<Carousel[]>(initialCarousels);
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState("7");
  const [loading, setLoading] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Ingresá un tema");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/carousels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slideCount: parseInt(slideCount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCarousels((prev) => [data.carousel, ...prev]);
      setSelectedCarousel(data.carousel);
      toast.success("Carrusel generado");
      setTopic("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setLoading(false);
    }
  }

  function copyCarousel(carousel: Carousel) {
    const slides = carousel.slides as Slide[];
    const text = slides
      .map((s) => `📌 Slide ${s.slide_number}: ${s.title}\n${s.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(`${carousel.topic}\n\n${text}`);
    toast.success("Carrusel copiado al portapapeles");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Panel izquierdo: generador + lista */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Nuevo carrusel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema del carrusel</Label>
              <Input
                placeholder="Ej: 5 errores al hacer contenido, Cómo cerrar ventas sin ser molesto..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad de slides</Label>
              <Select value={slideCount} onValueChange={setSlideCount}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} slides</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Generar
            </Button>
          </CardContent>
        </Card>

        {/* Lista de carruseles */}
        <div className="space-y-2">
          {carousels.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCarousel(c)}
              className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium line-clamp-1">{c.topic}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{(c.slides as Slide[]).length} slides</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel derecho: vista del carrusel */}
      <div>
        {selectedCarousel ? (
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{selectedCarousel.topic}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => copyCarousel(selectedCarousel)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
              {(selectedCarousel.slides as Slide[]).map((slide) => (
                <div key={slide.slide_number} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {slide.slide_number}
                    </span>
                    <p className="font-semibold text-sm">{slide.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line pl-8">{slide.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-48 rounded-lg border border-dashed text-muted-foreground">
            <div className="text-center">
              <Layers className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Seleccioná un carrusel para verlo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
