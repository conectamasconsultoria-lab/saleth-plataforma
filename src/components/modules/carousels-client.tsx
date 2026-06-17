"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, Layers, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Carousel } from "@/lib/supabase/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Slide = { slide_number: number; title: string; content: string };
type Props = { initialCarousels: Carousel[] };

// ─── Fórmulas virales ─────────────────────────────────────────────────────────

const FORMULAS = [
  {
    id: "errores",
    emoji: "🚨",
    label: "Errores fatales",
    desc: "Los N errores que cometen [audiencia] al [tema]",
    color: "#DC2626",
    bg: "#FEF2F2",
  },
  {
    id: "secreto",
    emoji: "🤫",
    label: "Secreto revelado",
    desc: "La verdad que nadie te dice sobre [tema]",
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    id: "pasos",
    emoji: "📋",
    label: "Paso a paso",
    desc: "Cómo lograr [resultado] en N pasos",
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    id: "mitos",
    emoji: "💥",
    label: "Mitos vs Realidad",
    desc: "N mitos sobre [tema] que necesitás dejar de creer",
    color: "#EA580C",
    bg: "#FFF7ED",
  },
  {
    id: "metodo",
    emoji: "🎯",
    label: "El método",
    desc: "El método exacto que uso para [resultado]",
    color: "#0369A1",
    bg: "#F0F9FF",
  },
  {
    id: "antes_despues",
    emoji: "⚡",
    label: "Antes vs Después",
    desc: "Cómo cambió todo cuando empecé a [hacer X]",
    color: "#B45309",
    bg: "#FFFBEB",
  },
  {
    id: "lista_valor",
    emoji: "💎",
    label: "Lista de valor",
    desc: "N aprendizajes sobre [tema] que cambiaron todo",
    color: "#1A6FFF",
    bg: "#EFF6FF",
  },
];

// ─── Gradients para la preview ────────────────────────────────────────────────

const SLIDE_GRADIENTS = [
  "linear-gradient(135deg, #061228 0%, #0d2154 100%)",
  "linear-gradient(135deg, #1A6FFF 0%, #00C8FF 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #1A6FFF 100%)",
  "linear-gradient(135deg, #059669 0%, #1A6FFF 100%)",
  "linear-gradient(135deg, #DC2626 0%, #7C3AED 100%)",
  "linear-gradient(135deg, #B45309 0%, #EA580C 100%)",
  "linear-gradient(135deg, #0369A1 0%, #059669 100%)",
];

// ─── Componente principal ──────────────────────────────────────────────────────

export function CarouselsClient({ initialCarousels }: Props) {
  const [carousels, setCarousels] = useState<Carousel[]>(initialCarousels);
  const [idea, setIdea] = useState("");
  const [formula, setFormula] = useState("lista_valor");
  const [slideCount, setSlideCount] = useState("7");
  const [loading, setLoading] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const selectedFormula = FORMULAS.find((f) => f.id === formula)!;

  async function handleGenerate() {
    if (!idea.trim()) {
      toast.error("Ingresá tu idea");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/carousels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: idea, slideCount: parseInt(slideCount), formula }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCarousels((prev) => [data.carousel, ...prev]);
      setSelectedCarousel(data.carousel);
      setCurrentSlide(0);
      toast.success("¡Carrusel viral generado!");
      setIdea("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setLoading(false);
    }
  }

  function selectCarousel(c: Carousel) {
    setSelectedCarousel(c);
    setCurrentSlide(0);
  }

  function copyAll(carousel: Carousel) {
    const slides = carousel.slides as Slide[];
    const text = slides
      .map((s) => `【Slide ${s.slide_number}】${s.title}\n${s.content}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Todo el carrusel copiado");
  }

  function copySlide(slide: Slide) {
    navigator.clipboard.writeText(`${slide.title}\n\n${slide.content}`);
    toast.success(`Slide ${slide.slide_number} copiado`);
  }

  const slides = selectedCarousel ? (selectedCarousel.slides as Slide[]) : [];
  const totalSlides = slides.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

      {/* ── Panel izquierdo: generador + historial ─────────────────────── */}
      <div className="xl:col-span-2 space-y-4">

        {/* Formulario */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4" style={{ color: "#1A6FFF" }} strokeWidth={1.8} />
              Generador de carrusel viral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Idea */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tu idea o tema</Label>
              <Input
                placeholder="Ej: cómo conseguir tus primeros clientes, el dinero y el miedo, hábitos que arruinan tu marca..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="text-sm"
              />
            </div>

            {/* Fórmula */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Fórmula viral</Label>
              <div className="grid grid-cols-1 gap-2">
                {FORMULAS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormula(f.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150",
                      formula === f.id
                        ? "border-transparent shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                    style={formula === f.id ? { background: f.bg, border: `1.5px solid ${f.color}40` } : {}}
                  >
                    <span className="text-lg flex-shrink-0">{f.emoji}</span>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: formula === f.id ? f.color : "#374151" }}
                      >
                        {f.label}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{f.desc}</p>
                    </div>
                    {formula === f.id && (
                      <div
                        className="ml-auto h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: f.color }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Slides */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Cantidad de slides</Label>
              <Select value={slideCount} onValueChange={setSlideCount}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} slides
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="w-full h-11 font-semibold text-white gap-2 rounded-xl"
              style={{
                background:
                  loading || !idea.trim()
                    ? undefined
                    : `linear-gradient(135deg, ${selectedFormula.color}, ${selectedFormula.color}cc)`,
                boxShadow:
                  loading || !idea.trim()
                    ? undefined
                    : `0 4px 14px ${selectedFormula.color}40`,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  {selectedFormula.emoji} Generar carrusel viral
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Historial */}
        {carousels.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
              Carruseles anteriores
            </p>
            <div className="space-y-1.5">
              {carousels.map((c) => {
                const isSelected = selectedCarousel?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectCarousel(c)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 flex items-center gap-3",
                      isSelected
                        ? "border-blue-200 bg-blue-50"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                    )}
                  >
                    <Layers
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: isSelected ? "#1A6FFF" : "#9CA3AF" }}
                      strokeWidth={1.8}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isSelected ? "text-blue-700" : "text-gray-700"
                        )}
                      >
                        {c.topic}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {(c.slides as Slide[]).length} slides ·{" "}
                        {new Date(c.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Panel derecho: preview visual ──────────────────────────────── */}
      <div className="xl:col-span-3">
        {selectedCarousel ? (
          <div className="space-y-4 sticky top-6">
            {/* Título + copiar todo */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {selectedCarousel.topic}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{totalSlides} slides generados</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyAll(selectedCarousel)}
                className="gap-1.5 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar todo
              </Button>
            </div>

            {/* Slide visual */}
            <div className="relative">
              <div
                className="w-full rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-white min-h-[340px] select-none"
                style={{
                  background:
                    SLIDE_GRADIENTS[currentSlide % SLIDE_GRADIENTS.length],
                  boxShadow: "0 8px 32px rgba(6,18,40,0.25)",
                }}
              >
                {/* Número del slide */}
                <div className="absolute top-4 right-4 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  {currentSlide + 1} / {totalSlides}
                </div>

                {/* Contenido */}
                <div className="text-center max-w-sm">
                  <p className="text-2xl font-bold leading-tight mb-4">
                    {slides[currentSlide]?.title}
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
                    {slides[currentSlide]?.content}
                  </p>
                </div>

                {/* Dots */}
                <div className="absolute bottom-4 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className="rounded-full transition-all duration-200"
                      style={{
                        width: i === currentSlide ? 20 : 6,
                        height: 6,
                        background:
                          i === currentSlide ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Flechas de navegación */}
              <button
                onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                disabled={currentSlide === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
                disabled={currentSlide === totalSlides - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-white transition-all"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Lista de slides */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {slides.map((slide, i) => (
                <button
                  key={slide.slide_number}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 group",
                    currentSlide === i
                      ? "border-blue-200 bg-blue-50"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  )}
                >
                  {/* Número */}
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        currentSlide === i
                          ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                          : SLIDE_GRADIENTS[i % SLIDE_GRADIENTS.length],
                    }}
                  >
                    {slide.slide_number}
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight truncate",
                        currentSlide === i ? "text-blue-700" : "text-gray-800"
                      )}
                    >
                      {slide.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {slide.content}
                    </p>
                  </div>

                  {/* Copiar slide */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copySlide(slide);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1 rounded-lg hover:bg-gray-100"
                  >
                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Estado vacío */
          <div
            className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl border border-dashed border-gray-200 bg-white text-center p-8"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
              style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" }}
            >
              ✨
            </div>
            <p className="font-semibold text-gray-700">Tu carrusel viral aparece acá</p>
            <p className="text-sm text-gray-400 mt-1.5 max-w-xs">
              Elegí una fórmula, ingresá tu idea y generá un carrusel optimizado para
              máximos guardados y compartidos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
