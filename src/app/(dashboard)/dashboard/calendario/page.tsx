"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Megaphone, Heart, ShoppingCart, Calendar, Zap, Flame, Rocket } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type ContentSlot = { type: "atraccion" | "nutricion" | "venta"; label: string };

const LEVELS = [
  {
    id: "basico",
    label: "Básico",
    icon: Zap,
    posts: "1 publicación diaria",
    description: "Ideal para personas que tienen poco tiempo o están comenzando. Crea el hábito de publicar sin sentirte abrumado.",
    distribution: "60% Atracción · 30% Nutrición · 10% Venta",
    color: "border-blue-300 bg-blue-50 dark:bg-blue-950",
    activeColor: "border-blue-500 bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500/30",
    schedule: [
      [{ type: "atraccion", label: "Atracción" }],
      [{ type: "atraccion", label: "Atracción" }],
      [{ type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }],
      [{ type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }],
      [{ type: "venta", label: "Venta" }],
    ] as ContentSlot[][],
  },
  {
    id: "intermedio",
    label: "Intermedio",
    icon: Flame,
    posts: "3 publicaciones diarias",
    description: "Ideal para negocios que buscan acelerar resultados. Aumenta el alcance mientras construyes autoridad.",
    distribution: "2 Atracción · 1 Nutrición · 1 Venta cada ciertos días",
    color: "border-orange-300 bg-orange-50 dark:bg-orange-950",
    activeColor: "border-orange-500 bg-orange-100 dark:bg-orange-900 ring-2 ring-orange-500/30",
    schedule: [
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "venta", label: "Venta" }, { type: "nutricion", label: "Nutrición" }],
    ] as ContentSlot[][],
  },
  {
    id: "avanzado",
    label: "Avanzado",
    icon: Rocket,
    posts: "5 publicaciones diarias",
    description: "Para personas que quieren crecer agresivamente. Domina la atención del mercado y acelera el posicionamiento.",
    distribution: "3 Atracción · 1 Nutrición · 1 Venta",
    color: "border-red-300 bg-red-50 dark:bg-red-950",
    activeColor: "border-red-500 bg-red-100 dark:bg-red-900 ring-2 ring-red-500/30",
    schedule: [
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
      [{ type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "atraccion", label: "Atracción" }, { type: "nutricion", label: "Nutrición" }, { type: "venta", label: "Venta" }],
    ] as ContentSlot[][],
  },
];

const typeColors: Record<string, string> = {
  atraccion: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900 dark:text-violet-200 dark:border-violet-700",
  nutricion: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  venta: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700",
};

const typeIcons: Record<string, typeof Megaphone> = {
  atraccion: Megaphone,
  nutricion: Heart,
  venta: ShoppingCart,
};

export default function CalendarioPage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const level = LEVELS.find((l) => l.id === selectedLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendario de Publicación</h1>
        <p className="text-muted-foreground mt-1">
          Elegí tu nivel de ejecución y seguí el plan semanal. Eliminá la improvisación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEVELS.map((lvl) => {
          const Icon = lvl.icon;
          return (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={cn(
                "text-left p-5 rounded-xl border-2 transition-all",
                selectedLevel === lvl.id ? lvl.activeColor : lvl.color
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5" />
                <span className="font-bold text-lg">{lvl.label}</span>
              </div>
              <p className="font-semibold text-sm mb-1">{lvl.posts}</p>
              <p className="text-xs text-muted-foreground mb-3">{lvl.description}</p>
              <p className="text-xs font-mono text-muted-foreground">{lvl.distribution}</p>
            </button>
          );
        })}
      </div>

      {level && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Plan semanal — {level.label}
              </CardTitle>
              <CardDescription>{level.posts} · {level.distribution}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, i) => (
                  <div key={day} className="space-y-2">
                    <p className="text-xs font-bold text-center uppercase tracking-wider text-muted-foreground">{day.slice(0, 3)}</p>
                    <div className="space-y-1.5">
                      {level.schedule[i].map((slot, j) => {
                        const Icon = typeIcons[slot.type];
                        return (
                          <div
                            key={j}
                            className={cn("rounded-lg border px-2 py-2 text-center", typeColors[slot.type])}
                          >
                            <Icon className="h-3.5 w-3.5 mx-auto mb-0.5" />
                            <p className="text-[10px] font-semibold leading-tight">{slot.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Temas de alto alcance para Atracción</CardTitle>
              <CardDescription>Los videos de atracción deben usar temas de ROOM ALTO — temas universales que le interesan a todos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { topic: "Dinero", examples: "Ganar más, crisis, hacerse rico" },
                  { topic: "Amor y Relaciones", examples: "Infidelidades, rupturas, matrimonio" },
                  { topic: "Salud", examples: "Longevidad, energía, hábitos" },
                  { topic: "Desarrollo Personal", examples: "Éxito, fracaso, disciplina" },
                  { topic: "Sexo y Atracción", examples: "Belleza, confianza, apariencia" },
                  { topic: "Poder y Estatus", examples: "Fama, influencia, liderazgo" },
                  { topic: "Chisme y Polémica", examples: "Escándalos, celebridades, casos virales" },
                  { topic: "Reinvención", examples: "Fracasos famosos, comebacks, historias" },
                ].map((item) => (
                  <div key={item.topic} className="rounded-lg border p-3">
                    <p className="font-semibold text-sm">{item.topic}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.examples}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-semibold mb-1">Regla de Oro</p>
            <p className="text-sm text-muted-foreground">
              No empieces por tu nicho. Empieza por un tema de ROOM ALTO (temas universales).
              Después conecta esa historia con el problema de tu cliente ideal.
              La mayoría empieza hablando de su producto. Los mejores empiezan hablando de algo que le importa a todo el mundo.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
