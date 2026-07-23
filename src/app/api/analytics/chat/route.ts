import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { AnalyticsChat } from "@/lib/supabase/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_HISTORY_MESSAGES = 20;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: chats, error } = await supabase
    .from("analytics_chats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ chats: chats as AnalyticsChat[] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const { error: userInsertError } = await supabase.from("analytics_chats").insert({
    user_id: user.id,
    role: "user",
    message,
  });
  if (userInsertError) {
    return NextResponse.json({ error: userInsertError.message }, { status: 500 });
  }

  try {
    const [
      { data: questionnaire },
      { data: scripts },
      { data: viralVideos },
      { data: metricsUploads },
      { data: previousChats },
    ] = await Promise.all([
      supabase
        .from("questionnaires")
        .select("niche, offer, content_style")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("scripts")
        .select("title, hook, awareness_level, stage, format, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("viral_videos")
        .select("title, views, niche, hashtags, scanned_at")
        .order("views", { ascending: false })
        .limit(15),
      supabase
        .from("metrics_uploads")
        .select("platform, insights, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("analytics_chats")
        .select("role, message")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
    ]);

    const scriptsSummary = (scripts ?? []).length
      ? (scripts ?? [])
          .map(
            (s) =>
              `- "${s.title}" (${s.stage ?? "sin etapa"}, ${s.awareness_level ?? "sin nivel"}, formato: ${s.format ?? "sin formato"}, ${new Date(s.created_at).toLocaleDateString("es-AR")})`
          )
          .join("\n")
      : "El usuario todavía no generó ningún guión.";

    const viralSummary = (viralVideos ?? []).length
      ? (viralVideos ?? [])
          .map(
            (v) =>
              `- "${v.title}" — ${v.views.toLocaleString("es-AR")} vistas, nicho: ${v.niche || "sin nicho"}, hashtags: ${(v.hashtags ?? []).join(", ") || "ninguno"}`
          )
          .join("\n")
      : "No hay videos virales escaneados todavía.";

    const metricsSummary = (metricsUploads ?? []).length
      ? (metricsUploads ?? [])
          .map(
            (m) =>
              `- Análisis de ${m.platform} (${new Date(m.created_at).toLocaleDateString("es-AR")}):\n  ${m.insights}`
          )
          .join("\n\n")
      : "El usuario todavía no subió ningún análisis de métricas.";

    const historyText = (previousChats ?? [])
      .slice(-MAX_HISTORY_MESSAGES)
      .map((c) => `${c.role === "user" ? "Usuario" : "Tú"}: ${c.message}`)
      .join("\n");

    const prompt = `Eres un asistente estratégico de contenido y análisis de métricas para un creador de contenido.

Contexto del creador:
- Nicho: ${questionnaire?.niche || "sin definir"}
- Oferta: ${questionnaire?.offer || "sin definir"}
- Estilo de contenido: ${questionnaire?.content_style || "sin definir"}

GUIONES GENERADOS POR EL USUARIO (más recientes primero):
${scriptsSummary}

VIDEOS VIRALES DE REFERENCIA ESCANEADOS (ordenados por vistas):
${viralSummary}

ANÁLISIS DE MÉTRICAS YA REALIZADOS (más recientes primero, con los insights ya generados sobre las publicaciones reales del usuario):
${metricsSummary}

${historyText ? `HISTORIAL DE LA CONVERSACIÓN (más antiguo primero):\n${historyText}\n` : ""}
El usuario te pregunta: "${message}"

Responde en español, de forma concreta y accionable, basándote únicamente en los datos de arriba. Si la pregunta no se puede responder con la información disponible, decilo claramente en vez de inventar datos.`;

    const claudeMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const reply = claudeMessage.content[0].type === "text" ? claudeMessage.content[0].text : "";

    const { data: assistantChat, error: assistantInsertError } = await supabase
      .from("analytics_chats")
      .insert({ user_id: user.id, role: "assistant", message: reply })
      .select()
      .single();
    if (assistantInsertError) throw assistantInsertError;

    return NextResponse.json({ chat: assistantChat as AnalyticsChat });
  } catch (e) {
    console.error("Error en chat de análisis:", e);
    return NextResponse.json({ error: "Error al responder la pregunta" }, { status: 500 });
  }
}
