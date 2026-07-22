import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { MetricChat } from "@/lib/supabase/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_HISTORY_MESSAGES = 20;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: upload } = await supabase
    .from("metrics_uploads")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!upload) return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });

  const { data: chats, error } = await supabase
    .from("metric_chats")
    .select("*")
    .eq("upload_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ chats: chats as MetricChat[] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
  }

  const { data: upload } = await supabase
    .from("metrics_uploads")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!upload) return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 });

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche, offer")
    .eq("user_id", user.id)
    .single();

  const { data: previousChats } = await supabase
    .from("metric_chats")
    .select("role, message")
    .eq("upload_id", id)
    .order("created_at", { ascending: true });

  // Guardamos el mensaje del usuario de inmediato para no perderlo si algo falla después.
  const { error: userInsertError } = await supabase.from("metric_chats").insert({
    upload_id: id,
    user_id: user.id,
    role: "user",
    message,
  });
  if (userInsertError) {
    return NextResponse.json({ error: userInsertError.message }, { status: 500 });
  }

  try {
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("metrics")
      .download(upload.storage_path);
    if (downloadError || !fileBlob) throw new Error("No se pudo recuperar la imagen original");

    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mediaType = (fileBlob.type || "image/png") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const historyText = (previousChats ?? []).slice(-MAX_HISTORY_MESSAGES)
      .map((c) => `${c.role === "user" ? "Usuario" : "Vos"}: ${c.message}`)
      .join("\n");

    const prompt = `Sos un experto analista de métricas de redes sociales para creadores de contenido.

Contexto del creador:
- Nicho: ${questionnaire?.niche || "marketing digital"}
- Oferta: ${questionnaire?.offer || ""}
- Plataforma: ${upload.platform}

Ya generaste este análisis para el screenshot adjunto:
${upload.insights}

${historyText ? `HISTORIAL DE LA CONVERSACIÓN (más antiguo primero):\n${historyText}\n` : ""}
El usuario te pregunta: "${message}"

Respondé en español, de forma concreta, basándote en lo que ves en la imagen adjunta y en el análisis ya hecho. Si la pregunta no se puede responder con la información disponible, decilo claramente en vez de inventar datos.`;

    const claudeMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const reply = claudeMessage.content[0].type === "text" ? claudeMessage.content[0].text : "";

    const { data: assistantChat, error: assistantInsertError } = await supabase
      .from("metric_chats")
      .insert({ upload_id: id, user_id: user.id, role: "assistant", message: reply })
      .select()
      .single();
    if (assistantInsertError) throw assistantInsertError;

    return NextResponse.json({ chat: assistantChat as MetricChat });
  } catch (e) {
    console.error("Error en chat de métricas:", e);
    return NextResponse.json({ error: "Error al responder la pregunta" }, { status: 500 });
  }
}
