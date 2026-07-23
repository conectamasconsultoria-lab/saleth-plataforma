"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import {
  QUIZ_QUESTIONS,
  ARCHETYPES,
  calculateArchetype,
  type ArchetypeName,
} from "@/lib/archetypes";

const QUESTIONS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(QUIZ_QUESTIONS.length / QUESTIONS_PER_PAGE);

type Phase = "quiz" | "result";

export default function PersonalityPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [phase, setPhase] = useState<Phase>("quiz");
  const [result, setResult] = useState<ArchetypeName | null>(null);
  const [saving, setSaving] = useState(false);

  const pageQuestions = QUIZ_QUESTIONS.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

  const pageAnswered = pageQuestions.every((q) => answers[q.id] !== undefined);
  const totalAnswered = Object.keys(answers).length;
  const progress = phase === "result" ? 100 : (totalAnswered / QUIZ_QUESTIONS.length) * 100;

  function answer(questionId: number, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleFinish() {
    setSaving(true);
    const { archetype, scores } = calculateArchetype(answers);
    setResult(archetype);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from("questionnaires")
        .update({
          personality_archetype: archetype,
          personality_scores: scores,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setPhase("result");
    } catch {
      toast.error("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (page < TOTAL_PAGES - 1) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleFinish();
    }
  }

  if (phase === "result" && result) {
    const archetype = ARCHETYPES[result];
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)",
        }}
      >
        <div className="w-full max-w-xl">
          {/* Resultado */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header del resultado */}
            <div
              className="p-8 text-center"
              style={{
                background: `linear-gradient(135deg, ${archetype.color}22, ${archetype.color}11)`,
                borderBottom: `1px solid ${archetype.color}33`,
              }}
            >
              <div className="text-6xl mb-4">{archetype.emoji}</div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: archetype.color }}
              >
                Tu arquetipo de marca personal
              </p>
              <h1 className="text-4xl font-bold text-white mb-3">{archetype.name}</h1>
              <p className="text-white/70 text-base leading-relaxed">
                {archetype.tagline}
              </p>
            </div>

            {/* Descripción */}
            <div className="p-8 space-y-6">
              <div>
                <p className="text-white/80 text-sm leading-relaxed">{archetype.description}</p>
              </div>

              {/* Fortalezas */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: archetype.color }}
                >
                  Tus fortalezas de contenido
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {archetype.strengths.map((s) => (
                    <div
                      key={s}
                      className="flex items-start gap-2 p-2.5 rounded-xl text-xs text-white/80"
                      style={{ background: `${archetype.color}18` }}
                    >
                      <span style={{ color: archetype.color }} className="mt-0.5 flex-shrink-0">
                        ✓
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tono y marcas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: archetype.color }}
                  >
                    Estilo de contenido
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed">{archetype.contentStyle}</p>
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: archetype.color }}
                  >
                    Marcas de referencia
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {archetype.referenceBrands.map((b) => (
                      <span
                        key={b}
                        className="text-xs px-2 py-1 rounded-lg text-white/70"
                        style={{ background: `${archetype.color}20` }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-2 text-white font-semibold h-12 rounded-xl text-base"
                style={{
                  background: `linear-gradient(135deg, ${archetype.color}, ${archetype.color}cc)`,
                  boxShadow: `0 4px 20px ${archetype.color}44`,
                }}
                onClick={() => router.push("/dashboard")}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Ir a mi dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #0d2154 0%, #061228 70%)",
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
          >
            <span className="text-white font-bold text-lg">C+</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Descubre tu arquetipo de marca</h1>
          <p className="text-white/50 mt-1 text-sm">
            Página {page + 1} de {TOTAL_PAGES} · {QUIZ_QUESTIONS.length} preguntas en total
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Preguntas */}
        <div className="space-y-4 mb-8">
          {pageQuestions.map((q) => {
            const selected = answers[q.id];
            return (
              <div
                key={q.id}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
                  {q.id}. ¿Con cuál te identificás más?
                </p>

                {/* Las dos afirmaciones enfrentadas */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <p className="text-white/70 text-xs leading-relaxed bg-white/5 rounded-xl p-3">
                    {q.left}
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed bg-white/5 rounded-xl p-3 text-right">
                    {q.right}
                  </p>
                </div>

                {/* Escala forzada 1-4, sin punto medio neutral */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        onClick={() => answer(q.id, val)}
                        className="flex flex-col items-center gap-1.5 flex-1 group"
                      >
                        <div
                          className="rounded-full transition-all duration-200 flex items-center justify-center font-semibold text-sm"
                          style={{
                            width: 40,
                            height: 40,
                            background:
                              selected === val
                                ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                                : "rgba(255,255,255,0.08)",
                            border:
                              selected === val
                                ? "none"
                                : "1.5px solid rgba(255,255,255,0.15)",
                            color: selected === val ? "white" : "rgba(255,255,255,0.4)",
                            transform:
                              selected === val ? "scale(1.15)" : "scale(1)",
                            boxShadow:
                              selected === val
                                ? "0 4px 16px rgba(26,111,255,0.4)"
                                : "none",
                          }}
                        >
                          {val}
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Labels */}
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-white/30 text-xs">Más cerca de la izquierda</span>
                    <span className="text-white/30 text-xs">Más cerca de la derecha</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navegación */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              setPage((p) => p - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={page === 0}
            className="border-white/20 text-white/70 hover:bg-white/10 bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <Button
            onClick={goNext}
            disabled={!pageAnswered || saving}
            style={{
              background: pageAnswered
                ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                : "rgba(255,255,255,0.1)",
              boxShadow: pageAnswered ? "0 4px 16px rgba(26,111,255,0.35)" : "none",
            }}
            className="text-white font-semibold px-6"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : page === TOTAL_PAGES - 1 ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <ArrowRight className="ml-2 h-4 w-4 order-last" />
            )}
            {saving
              ? "Calculando..."
              : page === TOTAL_PAGES - 1
              ? "Ver mi arquetipo"
              : "Siguiente"}
          </Button>
        </div>
      </div>
    </div>
  );
}
