"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Wand2, Copy, Layers, ChevronLeft, ChevronRight, Clock, Download, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Carousel } from "@/lib/supabase/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Slide = { slide_number: number; title: string; content: string };
type BrandProfile = {
  full_name: string;
  avatar_url?: string;
  brand_color?: string;
  brand_style?: "dark" | "light";
} | null;
type Props = { initialCarousels: Carousel[]; profile?: BrandProfile };

// ─── Helpers de marca y formato ────────────────────────────────────────────────

function toHandle(name?: string) {
  if (!name) return "tu_marca";
  const clean = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return clean || "tu_marca";
}

function initialsOf(name?: string) {
  if (!name) return "TU";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stripHighlight(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

function renderHighlighted(text: string, accent: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={i} style={{ color: accent, fontWeight: 800 }}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ─── Fórmulas virales ─────────────────────────────────────────────────────────

const FORMULAS = [
  {
    id: "errores",
    emoji: "🚨",
    label: "Errores fatales",
    desc: "Los N errores que cometen [audiencia] al [tema]",
    color: "#DC2626",
    bg: "#FEF2F2",
    gradient: "linear-gradient(145deg, #DC2626 0%, #7C1414 100%)",
  },
  {
    id: "secreto",
    emoji: "🤫",
    label: "Secreto revelado",
    desc: "La verdad que nadie te dice sobre [tema]",
    color: "#7C3AED",
    bg: "#F5F3FF",
    gradient: "linear-gradient(145deg, #7C3AED 0%, #4C1D95 100%)",
  },
  {
    id: "pasos",
    emoji: "📋",
    label: "Paso a paso",
    desc: "Cómo lograr [resultado] en N pasos",
    color: "#059669",
    bg: "#ECFDF5",
    gradient: "linear-gradient(145deg, #059669 0%, #064E3B 100%)",
  },
  {
    id: "mitos",
    emoji: "💥",
    label: "Mitos vs Realidad",
    desc: "N mitos sobre [tema] que necesitás dejar de creer",
    color: "#EA580C",
    bg: "#FFF7ED",
    gradient: "linear-gradient(145deg, #EA580C 0%, #7C2D12 100%)",
  },
  {
    id: "metodo",
    emoji: "🎯",
    label: "El método",
    desc: "El método exacto que uso para [resultado]",
    color: "#0369A1",
    bg: "#F0F9FF",
    gradient: "linear-gradient(145deg, #0369A1 0%, #0C4A6E 100%)",
  },
  {
    id: "antes_despues",
    emoji: "⚡",
    label: "Antes vs Después",
    desc: "Cómo cambió todo cuando empecé a [hacer X]",
    color: "#B45309",
    bg: "#FFFBEB",
    gradient: "linear-gradient(145deg, #B45309 0%, #713F12 100%)",
  },
  {
    id: "lista_valor",
    emoji: "💎",
    label: "Lista de valor",
    desc: "N aprendizajes sobre [tema] que cambiaron todo",
    color: "#1A6FFF",
    bg: "#EFF6FF",
    gradient: "linear-gradient(145deg, #1A6FFF 0%, #1e3a8a 100%)",
  },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export function CarouselsClient({ initialCarousels, profile }: Props) {
  const [carousels, setCarousels] = useState<Carousel[]>(initialCarousels);
  const [idea, setIdea] = useState("");
  const [formula, setFormula] = useState("lista_valor");
  const [slideCount, setSlideCount] = useState("7");
  const [loading, setLoading] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState<Carousel | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const slideRef = useRef<HTMLDivElement>(null);
  const selectedFormula = FORMULAS.find((f) => f.id === formula)!;
  // Para el preview: usa la fórmula guardada del carrusel del historial, o la seleccionada si es nuevo
  const activeFormula =
    (selectedCarousel && FORMULAS.find((f) => f.id === selectedCarousel.formula)) ??
    selectedFormula;

  // ── Identidad de marca del cliente: define el look real del carrusel exportado ──
  const accent = profile?.brand_color || activeFormula.color;
  const isDark = (profile?.brand_style ?? "dark") === "dark";
  const handle = toHandle(profile?.full_name);
  const theme = {
    bg: isDark ? "#0A0A0C" : "#FAFAF8",
    shadow: isDark ? "0 12px 48px rgba(0,0,0,0.5)" : "0 12px 40px rgba(15,23,42,0.14)",
    textPrimary: isDark ? "#FFFFFF" : "#0F172A",
    textSecondary: isDark ? "rgba(255,255,255,0.72)" : "rgba(15,23,42,0.65)",
    textMuted: isDark ? "rgba(255,255,255,0.4)" : "rgba(15,23,42,0.4)",
    dotActive: isDark ? "rgba(255,255,255,0.95)" : "#0F172A",
    dotInactive: isDark ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.2)",
    gridDot: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    glow: `radial-gradient(ellipse 640px 460px at 82% -8%, ${accent}3d, transparent 62%)`,
    badgeBg: isDark ? `${accent}22` : `${accent}14`,
    badgeBorder: `${accent}55`,
  };

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
    const slidesData = carousel.slides as Slide[];
    const text = slidesData
      .map((s) => `【Slide ${s.slide_number}】${stripHighlight(s.title)}\n${stripHighlight(s.content)}`)
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Todo el carrusel copiado");
  }

  function copySlide(slide: Slide) {
    navigator.clipboard.writeText(`${stripHighlight(slide.title)}\n\n${stripHighlight(slide.content)}`);
    toast.success(`Slide ${slide.slide_number} copiado`);
  }

  async function downloadSlide() {
    if (!slideRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `slide-${currentSlide + 1}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
      toast.success("Slide descargado");
    } catch {
      toast.error("Error al descargar");
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAll() {
    if (!selectedCarousel || !slideRef.current) return;
    setDownloading(true);
    setDownloadProgress(0);
    const slidesData = selectedCarousel.slides as Slide[];
    try {
      const [{ default: html2canvas }, { default: JSZip }] = await Promise.all([
        import("html2canvas"),
        import("jszip"),
      ]);
      const zip = new JSZip();

      for (let i = 0; i < slidesData.length; i++) {
        setCurrentSlide(i);
        // Wait for React to re-render and browser to paint
        await new Promise((r) => setTimeout(r, 400));
        setDownloadProgress(Math.round(((i + 1) / slidesData.length) * 85));

        const canvas = await html2canvas(slideRef.current!, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
        });

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92);
        });
        zip.file(`slide-${String(i + 1).padStart(2, "0")}.jpg`, blob);
      }

      setDownloadProgress(95);
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `carrusel-${selectedCarousel.topic.slice(0, 25).replace(/\s+/g, "-")}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success(`${slidesData.length} slides descargados en ZIP`);
    } catch {
      toast.error("Error al descargar");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }

  const slides = selectedCarousel ? (selectedCarousel.slides as Slide[]) : [];
  const totalSlides = slides.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

      {/* ── Panel izquierdo: generador + historial ─────────────────────── */}
      <div className="xl:col-span-2 space-y-4">

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="h-4 w-4" style={{ color: "#1A6FFF" }} strokeWidth={1.8} />
              Generador de carrusel viral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tu idea o tema</Label>
              <Input
                placeholder="Ej: cómo conseguir tus primeros clientes, el dinero y el miedo..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                className="text-sm"
              />
            </div>

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

            <Button
              onClick={handleGenerate}
              disabled={loading || !idea.trim()}
              className="w-full h-11 font-semibold text-white gap-2 rounded-xl"
              style={{
                background:
                  loading || !idea.trim()
                    ? undefined
                    : selectedFormula.gradient,
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
                <>{selectedFormula.emoji} Generar carrusel viral</>
              )}
            </Button>
          </CardContent>
        </Card>

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
                      <p className={cn("text-sm font-medium truncate", isSelected ? "text-blue-700" : "text-gray-700")}>
                        {c.topic}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {(c.slides as Slide[]).length} slides ·{" "}
                        {new Date(c.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Panel derecho: preview IG-ready ────────────────────────────── */}
      <div className="xl:col-span-3">
        {selectedCarousel ? (
          <div className="space-y-4 sticky top-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {selectedCarousel.topic}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{totalSlides} slides · listo para IG</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyAll(selectedCarousel)}
                className="gap-1.5 flex-shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar texto
              </Button>
            </div>

            {/* ── Slide IG-ready (4:5, estilo de marca del cliente) ── */}
            <div className="relative">
              {/* Este div es lo que se captura para el JPG */}
              <div
                ref={slideRef}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "16px",
                  background: theme.bg,
                  boxShadow: theme.shadow,
                  userSelect: "none",
                }}
              >
                {/* Resplandor de marca */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: theme.glow,
                    pointerEvents: "none",
                  }}
                />
                {/* Textura de puntos */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(${theme.gridDot} 1px, transparent 1px)`,
                    backgroundSize: "22px 22px",
                    pointerEvents: "none",
                  }}
                />

                {/* Layout interior */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    padding: "7% 8%",
                  }}
                >
                  {/* Fila superior: identidad del alumno */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatar_url}
                          alt=""
                          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: accent,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {initialsOf(profile?.full_name)}
                        </div>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary }}>@{handle}</span>
                      <BadgeCheck size={14} style={{ color: "#3B82F6", flexShrink: 0 }} />
                    </div>
                    <div
                      style={{
                        color: theme.textMuted,
                        fontSize: "12px",
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currentSlide + 1} / {totalSlides}
                    </div>
                  </div>

                  {/* Contenido central */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    {/* Badge de paso / fórmula */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignSelf: "flex-start",
                        alignItems: "center",
                        gap: 6,
                        background: theme.badgeBg,
                        border: `1px solid ${theme.badgeBorder}`,
                        borderRadius: "100px",
                        padding: "5px 13px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: accent,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      {currentSlide === 0
                        ? `${activeFormula.emoji} ${activeFormula.label}`
                        : currentSlide === totalSlides - 1
                        ? "✦ Tu turno"
                        : `Paso ${currentSlide}`}
                    </div>

                    {/* Línea acento */}
                    <div
                      style={{
                        width: "40px",
                        height: "3px",
                        borderRadius: "2px",
                        background: accent,
                        margin: "16px 0",
                      }}
                    />

                    {/* Título */}
                    <h2
                      style={{
                        color: theme.textPrimary,
                        fontSize: "27px",
                        fontWeight: 900,
                        lineHeight: 1.22,
                        margin: "0 0 14px 0",
                        wordBreak: "break-word",
                      }}
                    >
                      {renderHighlighted(slides[currentSlide]?.title ?? "", accent)}
                    </h2>

                    {/* Contenido */}
                    <p
                      style={{
                        color: theme.textSecondary,
                        fontSize: "15px",
                        lineHeight: 1.75,
                        margin: 0,
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {renderHighlighted(slides[currentSlide]?.content ?? "", accent)}
                    </p>
                  </div>

                  {/* Fila inferior */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {/* Dots de progreso */}
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          style={{
                            width: i === currentSlide ? 20 : 6,
                            height: 6,
                            borderRadius: "3px",
                            background: i === currentSlide ? theme.dotActive : theme.dotInactive,
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        />
                      ))}
                    </div>
                    {/* Hint de swipe */}
                    <div
                      style={{
                        color: theme.textMuted,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {currentSlide === totalSlides - 1 ? "" : "Deslizá →"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Flechas de navegación (fuera del área de captura) */}
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

            {/* Botones de descarga */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSlide}
                disabled={downloading}
                className="gap-1.5 flex-1"
              >
                {downloading && downloadProgress === 0 ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Descargar slide
              </Button>
              <Button
                size="sm"
                onClick={downloadAll}
                disabled={downloading}
                className="gap-1.5 flex-1 font-semibold text-white"
                style={{
                  background: downloading ? undefined : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                  boxShadow: downloading ? undefined : `0 4px 14px ${accent}45`,
                }}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {downloadProgress > 0 ? `${downloadProgress}%` : "Preparando..."}
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Descargar todos (.zip)
                  </>
                )}
              </Button>
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
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        currentSlide === i
                          ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                          : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                    }}
                  >
                    {slide.slide_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-tight truncate",
                        currentSlide === i ? "text-blue-700" : "text-gray-800"
                      )}
                    >
                      {stripHighlight(slide.title)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {stripHighlight(slide.content)}
                    </p>
                  </div>
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
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl border border-dashed border-gray-200 bg-white text-center p-8">
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
