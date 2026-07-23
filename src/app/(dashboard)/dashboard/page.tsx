import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Captions,
  BarChart3,
  ArrowRight,
  Clock,
  Zap,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeName } from "@/lib/archetypes";

const WEEKLY_SCRIPT_GOAL = 3;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { data: profile },
    { data: questionnaire },
    { count: scriptsCount },
    { count: transcriptionsCount },
    { count: metricsCount },
    { data: recentScripts },
    { data: recentTranscriptions },
    { count: scriptsThisWeekCount },
    { data: lastMetricsUpload },
    { data: recentViralVideos },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("questionnaires")
      .select("niche, personality_archetype")
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("scripts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("transcriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("metrics_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("scripts")
      .select("id, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("transcriptions")
      .select("id, created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(2),
    supabase
      .from("scripts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("metrics_uploads")
      .select("created_at")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("viral_videos")
      .select("niche")
      .gte("scanned_at", sevenDaysAgo),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "bienvenido";
  const archetypeName = questionnaire?.personality_archetype as ArchetypeName | undefined;
  const archetype = archetypeName ? ARCHETYPES[archetypeName] : null;
  const totalActions =
    (scriptsCount ?? 0) +
    (transcriptionsCount ?? 0) +
    (metricsCount ?? 0);

  // Panel accionable: sugerencias calculadas a partir de la actividad real,
  // en vez de solo mostrar conteos crudos.
  const scriptsGap = Math.max(0, WEEKLY_SCRIPT_GOAL - (scriptsThisWeekCount ?? 0));
  const lastMetricsDate = lastMetricsUpload?.created_at ? new Date(lastMetricsUpload.created_at) : null;
  const daysSinceLastMetrics = lastMetricsDate
    ? Math.floor((Date.now() - lastMetricsDate.getTime()) / 86400000)
    : null;
  const needsMetricsReview = daysSinceLastMetrics === null || daysSinceLastMetrics > 7;
  const niche = questionnaire?.niche;
  const viralVideosInNicheThisWeek = niche
    ? (recentViralVideos ?? []).filter((v) => v.niche === niche).length
    : 0;

  const suggestions: { icon: typeof FileText; title: string; desc: string; href: string }[] = [];

  if (scriptsGap > 0) {
    suggestions.push({
      icon: FileText,
      title: `Crear ${scriptsGap} guion${scriptsGap > 1 ? "es" : ""}`,
      desc: `Llevas ${scriptsThisWeekCount ?? 0} de ${WEEKLY_SCRIPT_GOAL} esta semana`,
      href: "/dashboard/scripts",
    });
  }
  if (needsMetricsReview) {
    suggestions.push({
      icon: BarChart3,
      title: "Analizar el rendimiento de la semana pasada",
      desc: lastMetricsDate
        ? `Tu último análisis fue hace ${daysSinceLastMetrics} días`
        : "Todavía no subiste ningún análisis de métricas",
      href: "/dashboard/metrics",
    });
  }
  if (viralVideosInNicheThisWeek > 0) {
    suggestions.push({
      icon: TrendingUp,
      title: `Hay ${viralVideosInNicheThisWeek} video${viralVideosInNicheThisWeek > 1 ? "s" : ""} viral${viralVideosInNicheThisWeek > 1 ? "es" : ""} nuevo${viralVideosInNicheThisWeek > 1 ? "s" : ""} en tu nicho`,
      desc: "Mira si podés adaptar alguno a tu contenido",
      href: "/dashboard/viral-scanner",
    });
  }

  const recentActivity = [
    ...(recentScripts ?? []).map((s) => ({
      icon: FileText,
      label: "Guión generado con IA",
      date: s.created_at,
      href: "/dashboard/scripts",
    })),
    ...(recentTranscriptions ?? []).map((t) => ({
      icon: Captions,
      label: "Transcripción completada",
      date: t.created_at,
      href: "/dashboard/transcriptions",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const quickActions = [
    { href: "/dashboard/viral-scanner", label: "Escanear video viral", icon: TrendingUp },
    { href: "/dashboard/scripts", label: "Generar guión con IA", icon: FileText },
    { href: "/dashboard/metrics", label: "Analizar métricas", icon: BarChart3 },
    { href: "/dashboard/transcriptions", label: "Transcribir video", icon: Captions },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {firstName} 👋
          </h1>
          {questionnaire?.niche && (
            <p className="text-sm text-gray-500 mt-1">
              Nicho:{" "}
              <span className="font-semibold text-gray-700">
                {questionnaire.niche}
              </span>
            </p>
          )}
        </div>

        {/* Total badge */}
        <div
          className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-gray-100"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1A6FFF, #00C8FF)",
              boxShadow: "0 4px 12px rgba(26,111,255,0.3)",
            }}
          >
            <Activity className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Acciones totales</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {totalActions}
            </p>
          </div>
        </div>
      </div>

      {/* Arquetipo de marca */}
      {archetype && (
        <Link href="/dashboard/settings">
          <div
            className="rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            style={{
              background: `linear-gradient(135deg, ${archetype.color}18, ${archetype.color}08)`,
              border: `1px solid ${archetype.color}30`,
              boxShadow: `0 2px 12px ${archetype.color}14`,
            }}
          >
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: `${archetype.color}20`,
                border: `1px solid ${archetype.color}30`,
              }}
            >
              {archetype.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: archetype.color }}>
                Tu arquetipo de marca personal
              </p>
              <p className="font-bold text-gray-900 text-base">{archetype.name}</p>
              <p className="text-xs text-gray-500 truncate">{archetype.tagline}</p>
            </div>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </Link>
      )}

      {/* Panel accionable */}
      <div
        className="bg-white rounded-2xl p-5 border border-gray-100"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <h2 className="font-semibold text-gray-900 text-sm mb-4">
          ¿Qué necesitas hacer hoy?
        </h2>

        {suggestions.length === 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-white flex-shrink-0">
              <CheckCircle2 className="h-4.5 w-4.5 text-green-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">¡Vas al día! 🎉</p>
              <p className="text-xs text-gray-500">Ya cumpliste tus objetivos de esta semana</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.href + s.title} href={s.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "#EFF6FF",
                        boxShadow: "0 4px 10px rgba(26,111,255,0.12)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "#1A6FFF" }} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Actividad reciente */}
        <div
          className="bg-white rounded-2xl p-5 border border-gray-100"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "#EFF6FF",
                boxShadow: "0 4px 10px rgba(26,111,255,0.12)",
              }}
            >
              <Clock
                className="h-4 w-4"
                style={{ color: "#1A6FFF" }}
                strokeWidth={1.8}
              />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">
              Actividad reciente
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "#EFF6FF" }}
              >
                <Activity
                  className="h-5 w-5"
                  style={{ color: "#1A6FFF" }}
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                Todavía no hay actividad
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Comienza usando cualquier módulo
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                const date = new Date(item.date);
                const diffMs = Date.now() - date.getTime();
                const diffH = Math.floor(diffMs / 3600000);
                const diffD = Math.floor(diffMs / 86400000);
                const timeAgo =
                  diffD > 0
                    ? `hace ${diffD}d`
                    : diffH > 0
                    ? `hace ${diffH}h`
                    : "ahora";

                return (
                  <li key={i}>
                    <Link href={item.href}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 transition-colors group cursor-pointer">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "#EFF6FF" }}
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: "#1A6FFF" }}
                            strokeWidth={1.8}
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors flex-1 truncate">
                          {item.label}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {timeAgo}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Acciones rápidas */}
        <div
          className="bg-white rounded-2xl p-5 border border-gray-100"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "#EFF6FF",
                boxShadow: "0 4px 10px rgba(26,111,255,0.12)",
              }}
            >
              <Zap
                className="h-4 w-4"
                style={{ color: "#1A6FFF" }}
                strokeWidth={1.8}
              />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">
              Acciones rápidas
            </h2>
          </div>

          <div className="space-y-1.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/60 transition-colors group cursor-pointer">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#EFF6FF" }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: "#1A6FFF" }}
                        strokeWidth={1.8}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors flex-1">
                      {action.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
