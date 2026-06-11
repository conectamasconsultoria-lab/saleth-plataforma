import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { viralVideoId, topic, awarenessLevel, stage } = await req.json();

  // Obtener el blueprint del usuario
  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!questionnaire) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  let videoContext = "";
  if (viralVideoId) {
    const { data: video } = await supabase
      .from("viral_videos")
      .select("title, transcript, hashtags")
      .eq("id", viralVideoId)
      .single();
    if (video) {
      videoContext = `
Video viral de referencia:
- Título: ${video.title}
- Hashtags: ${video.hashtags?.join(", ")}
- Transcripción: ${video.transcript || "No disponible"}
      `;
    }
  }

  const brandBlueprint = questionnaire.brand_blueprint as Record<string, string>;

  const prompt = `Sos un experto en marketing de contenidos y copywriting para redes sociales, especialmente TikTok e Instagram.

PERFIL DEL CREADOR:
- Nicho: ${questionnaire.niche}
- Oferta principal: ${questionnaire.offer}
- Estilo de contenido actual: ${questionnaire.content_style}
- Tono de comunicación: ${brandBlueprint?.tone}
- Valores de marca: ${brandBlueprint?.values}
- Cliente ideal: ${brandBlueprint?.target_audience}
- Pilares de contenido: ${brandBlueprint?.content_pillars}

${videoContext}

${topic ? `Tema del guión: ${topic}` : ""}
${awarenessLevel ? `Nivel de conciencia del cliente: ${awarenessLevel === "high" ? "Alto (ya sabe que te conoce)" : awarenessLevel === "medium" ? "Medio (sabe del problema pero no de la solución)" : "Bajo (no sabe que tiene el problema)"}` : ""}
${stage ? `Etapa del funnel: ${stage === "attraction" ? "Atracción" : stage === "conversion" ? "Conversión" : "Nutrición"}` : ""}

Generá un guión completo para un video corto (60-90 segundos) adaptado al perfil anterior.

Respondé en formato JSON con esta estructura exacta:
{
  "title": "Título descriptivo del guión",
  "hook": "El gancho de los primeros 3 segundos (debe ser irresistible, genera curiosidad o genera identificación)",
  "development": "El desarrollo del contenido (3-5 puntos clave, natural, auténtico)",
  "cta": "La llamada a la acción final (específica y accionable)"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada de Claude");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear el guión");

    const scriptData = JSON.parse(jsonMatch[0]);

    const { data: script, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        viral_video_id: viralVideoId ?? null,
        title: scriptData.title,
        hook: scriptData.hook,
        development: scriptData.development,
        cta: scriptData.cta,
        awareness_level: awarenessLevel ?? null,
        stage: stage ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ scriptId: script.id, script });
  } catch (e) {
    console.error("Error generando guión:", e);
    return NextResponse.json({ error: "Error al generar el guión" }, { status: 500 });
  }
}
