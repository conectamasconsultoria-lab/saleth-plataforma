import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { resolveTikTokUrl } from "@/lib/video-resolver";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Obtiene la URL de descarga del video via RapidAPI y luego transcribe + adapta con Claude
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { tiktokUrl, videoTitle, topic } = await req.json();
  if (!tiktokUrl) return NextResponse.json({ error: "URL requerida" }, { status: 400 });

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY no configurada" }, { status: 500 });
  }
  if (!process.env.ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: "ASSEMBLYAI_API_KEY no configurada" }, { status: 500 });
  }

  // ── 1. Obtener URL de audio/video sin marca de agua ────────────────────────
  const audioUrl = await resolveTikTokUrl(tiktokUrl);

  if (!audioUrl) {
    return NextResponse.json({ error: "No se pudo obtener el audio del video. Prueba con otro video." }, { status: 400 });
  }

  // ── 2. Transcribir con AssemblyAI ─────────────────────────────────────────
  let transcript = "";
  try {
    const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({ audio_url: audioUrl, language_detection: true }),
    });
    const submitData = await submitRes.json();
    const transcriptId = submitData.id;

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
      });
      const pollData = await pollRes.json();
      if (pollData.status === "completed") { transcript = pollData.text; break; }
      if (pollData.status === "error") throw new Error("AssemblyAI error: " + pollData.error);
    }
  } catch (e) {
    console.error("Error en transcripción:", e);
    return NextResponse.json({ error: "Error al transcribir el video" }, { status: 500 });
  }

  if (!transcript) {
    return NextResponse.json({ error: "No se pudo transcribir el video" }, { status: 400 });
  }

  // ── 3. Obtener datos de marca del usuario ─────────────────────────────────
  const [{ data: questionnaire }, { data: strategy }] = await Promise.all([
    supabase.from("questionnaires").select("niche, offer, brand_blueprint, personality_archetype").eq("user_id", user.id).single(),
    supabase.from("brand_strategy").select("brand_elements, communication_framework, identity_framework").eq("user_id", user.id).maybeSingle(),
  ]);

  const bp = (questionnaire?.brand_blueprint as Record<string, string>) ?? {};
  const be = (strategy?.brand_elements as Record<string, string>) ?? {};
  const cf = (strategy?.communication_framework as Record<string, string | string[]>) ?? {};
  const idf = (strategy?.identity_framework as Record<string, string | string[]>) ?? {};

  const brandContext = [
    questionnaire?.niche && `Nicho: ${questionnaire.niche}`,
    questionnaire?.offer && `Oferta: ${questionnaire.offer}`,
    bp.tone && `Tono de voz: ${bp.tone}`,
    bp.target_audience && `Audiencia: ${bp.target_audience}`,
    questionnaire?.personality_archetype && `Arquetipo: ${questionnaire.personality_archetype}`,
    be.promesa && `Promesa de marca: ${be.promesa}`,
    be.diferencial && `Diferencial: ${be.diferencial}`,
    cf.uvp && `UVP: ${cf.uvp}`,
    cf.mensaje_central && `Mensaje central: ${cf.mensaje_central}`,
    idf.posicionamiento && `Posicionamiento: ${idf.posicionamiento}`,
    idf.avatar_nombre && `Avatar: ${idf.avatar_nombre}`,
    Array.isArray(idf.promesas) && idf.promesas.filter(Boolean).length > 0 && `Promesas: ${(idf.promesas as string[]).filter(Boolean).join(" / ")}`,
    Array.isArray(idf.dolores) && idf.dolores.filter(Boolean).length > 0 && `Dolores del avatar: ${(idf.dolores as string[]).filter(Boolean).join(" / ")}`,
  ].filter(Boolean).join("\n");

  // ── 4. Adaptar con Claude ─────────────────────────────────────────────────
  const prompt = `Eres un experto en guiones virales para TikTok e Instagram Reels.

Tu tarea: tomar el guión viral de abajo y ADAPTARLO completamente al nicho y marca personal de este creador.
Mantén la ESTRUCTURA que lo hace viral (ritmo, mecánica del hook, forma de presentar info), pero cambia el CONTENIDO para que encaje perfectamente.

VIDEO VIRAL DE REFERENCIA:
Título: "${videoTitle}"
Transcripción:
${transcript}

MARCA PERSONAL DEL CREADOR:
${brandContext || "(Perfil de marca aún no completado — usa criterio general)"}

${topic ? `TEMA/ÁNGULO ESPECÍFICO PARA ESTA ADAPTACIÓN: ${topic}\nAdapta el guión para que hable puntualmente de este tema, manteniendo la mecánica viral del video original.` : ""}

ENTREGÁ en formato JSON exacto:
{
  "hook": "Los primeros 3 segundos — impacto máximo, genera curiosidad o identificación inmediata",
  "development": "El cuerpo del video — 3 a 5 puntos adaptados al nicho, en lenguaje natural y auténtico",
  "cta": "La llamada a la acción final — específica, accionable, coherente con la marca",
  "insight": "Una frase breve explicando qué mecánica viral tomaste del original y cómo la adaptaste"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear la respuesta de Claude");

    const adapted = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      transcript,
      hook: adapted.hook ?? "",
      development: adapted.development ?? "",
      cta: adapted.cta ?? "",
      insight: adapted.insight ?? "",
    });
  } catch (e) {
    console.error("Error con Claude:", e);
    return NextResponse.json({ error: "Error al adaptar el guión" }, { status: 500 });
  }
}
