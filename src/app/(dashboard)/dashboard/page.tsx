import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileText,
  TrendingUp,
  Captions,
  BarChart3,
  BookOpen,
  Video,
  ArrowRight,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeName } from "@/lib/archetypes";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: questionnaire },
    { count: scriptsCount },
    { count: viralCount },
    { count: transcriptionsCount },
    { count: metricsCount },
    { count: promptsCount },
    { count: referentesCount },
    { data: recentScripts },
    { data: recentTranscriptions },
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
      .from("viral_videos")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("transcriptions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("metrics_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("coach_prompts")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("reference_videos")
      .select("*", { count: "exact", head: true }),
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
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "bienvenido";
  const archetypeName = questionnaire?.personality_archetype as ArchetypeName | undefined;
  const archetype = archetypeName ? ARCHETYPES[archetypeName] : null;
  const totalActions =
    (scriptsCount ?? 0) +
    (transcriptionsCount ?? 0) +
    (metricsCount ?? 0);

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

  const stats = [
    {
      label: "Guiones",
      value: scriptsCount ?? 0,
      icon: FileText,
      href: "/dashboard/scripts",
      desc: "generados con IA",
    },
    {
      label: "Videos virales",
      value: viralCount ?? 0,
      icon: TrendingUp,
      href: "/dashboard/viral-scanner",
      desc: "escaneados",
    },
    {
      label: "Transcripciones",
      value: transcriptionsCount ?? 0,
      icon: Captions,
      href: "/dashboard/transcriptions",
      desc: "realizadas",
    },
    {
      label: "Análisis de métricas",
      value: metricsCount ?? 0,
      icon: BarChart3,
      href: "/dashboard/metrics",
      desc: "subidos",
    },
    {
      label: "Prompts disponibles",
      value: promptsCount ?? 0,
      icon: BookOpen,
      href: "/dashboard/prompts",
      desc: "en biblioteca",
    },
    {
      label: "Videos referentes",
      value: referentesCount ?? 0,
      icon: Video,
      href: "/dashboard/referentes",
      desc: "de industria",
    },
  ];

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

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <div
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md cursor-pointer group"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: "#EFF6FF",
                      boxShadow: "0 4px 10px rgba(26,111,255,0.12)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: "#1A6FFF" }}
                      strokeWidth={1.8}
                    />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 transition-colors mt-0.5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400">{stat.desc}</p>
              </div>
            </Link>
          );
        })}
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
                Comenzá usando cualquier módulo
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
