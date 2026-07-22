import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type VideoInput = {
  title: string;
  views: number;
  likes: number;
  thumbnail_url: string | null;
};

type ImageBlock = {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp"; data: string };
};

async function fetchThumbnailAsBase64(url: string): Promise<ImageBlock | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const mediaType = contentType.includes("png")
      ? "image/png"
      : contentType.includes("webp")
        ? "image/webp"
        : "image/jpeg";
    const buffer = await res.arrayBuffer();
    const data = Buffer.from(buffer).toString("base64");
    return { type: "image", source: { type: "base64", media_type: mediaType, data } };
  } catch (e) {
    console.error("Error descargando thumbnail:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { accountId, username, videos } = (await req.json()) as {
    accountId: string;
    username: string;
    videos: VideoInput[];
  };
  if (!accountId || !username || !videos?.length) {
    return NextResponse.json({ error: "Faltan datos de la cuenta o videos" }, { status: 400 });
  }

  const [{ data: questionnaire }, { data: strategy }] = await Promise.all([
    supabase.from("questionnaires").select("niche, offer, brand_blueprint, personality_archetype, content_style").eq("user_id", user.id).single(),
    supabase.from("brand_strategy").select("brand_elements, communication_framework, identity_framework").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!questionnaire) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  const bp = (questionnaire.brand_blueprint as Record<string, string>) ?? {};
  const be = (strategy?.brand_elements as Record<string, string>) ?? {};
  const cf = (strategy?.communication_framework as Record<string, string | string[]>) ?? {};
  const idf = (strategy?.identity_framework as Record<string, string | string[]>) ?? {};

  const brandContext = [
    `Nicho: ${questionnaire.niche}`,
    `Oferta: ${questionnaire.offer}`,
    `Estilo: ${questionnaire.content_style}`,
    bp.tone && `Tono: ${bp.tone}`,
    bp.target_audience && `Audiencia: ${bp.target_audience}`,
    questionnaire.personality_archetype && `Arquetipo: ${questionnaire.personality_archetype}`,
    be.promesa && `Promesa de marca: ${be.promesa}`,
    be.diferencial && `Diferencial: ${be.diferencial}`,
    cf.uvp && `UVP: ${cf.uvp}`,
    idf.posicionamiento && `Posicionamiento: ${idf.posicionamiento}`,
  ].filter(Boolean).join("\n");

  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 12);
  const videosWithThumbs = topVideos.filter((v) => v.thumbnail_url).slice(0, 6);

  const imageBlocks = (
    await Promise.all(videosWithThumbs.map((v) => fetchThumbnailAsBase64(v.thumbnail_url!)))
  ).filter((b): b is ImageBlock => b !== null);

  const videoListText = topVideos
    .map((v, i) => `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes`)
    .join("\n");

  const visualInstruction = imageBlocks.length > 0
    ? "Tenés adjuntas las miniaturas reales de sus videos más vistos — basá la sección de Elementos Visuales en lo que efectivamente se ve en esas imágenes (iluminación, encuadre, fondo/escenografía, edición, colores)."
    : "No hay miniaturas disponibles para esta cuenta — en la sección de Elementos Visuales aclará explícitamente que es una estimación general basada solo en los títulos, sin inventar detalles visuales específicos que no podés verificar.";

  const prompt = `Sos un experto en análisis de contenido viral y marca personal para creadores de TikTok/Instagram.

Tu tarea: analizar por qué el estilo de @${username} funciona, para que otro creador entienda qué elementos replicar.

VIDEOS MÁS VISTOS DE @${username}:
${videoListText}

${visualInstruction}

PERFIL DE MARCA DE QUIEN VA A LEER ESTE ANÁLISIS (para la sección final):
${brandContext}

Devolvé un análisis en español, con estos encabezados exactos:

**Formato y estructura**
(Tipo de video, ritmo, duración aparente, forma en que arma cada pieza de contenido)

**Comunicación**
(Tono, energía, forma de hablarle a cámara, lenguaje que usa)

**Elementos visuales**
(Iluminación, encuadre, fondo/escenografía, edición — según la instrucción de arriba)

**Por qué funciona**
(Qué conexión genera con su audiencia, qué necesidad o deseo toca)

**Cómo podrías aplicarlo vos**
(3-5 recomendaciones concretas conectadas al nicho, oferta y tono del perfil de marca de arriba — no genéricas)

No uses emojis. Sé específico y concreto, evitá frases vacías.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [...imageBlocks, { type: "text", text: prompt }],
        },
      ],
    });

    const analysis = message.content[0].type === "text" ? message.content[0].text : "";
    const generatedAt = new Date().toISOString();

    const { error } = await supabase
      .from("user_referent_accounts")
      .update({ style_analysis: analysis, style_analysis_generated_at: generatedAt })
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ analysis, generatedAt });
  } catch (e) {
    console.error("Error analizando estilo del referente:", e);
    return NextResponse.json({ error: "Error al analizar el estilo" }, { status: 500 });
  }
}
