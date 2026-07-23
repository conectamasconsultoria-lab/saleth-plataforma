import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { username, videoTitles, count = 3 } = await req.json();
  if (!username || !videoTitles?.length) {
    return NextResponse.json({ error: "Username y videos son requeridos" }, { status: 400 });
  }

  const [{ data: questionnaire }, { data: strategy }] = await Promise.all([
    supabase.from("questionnaires").select("niche, offer, brand_blueprint, personality_archetype, content_style").eq("user_id", user.id).single(),
    supabase.from("brand_strategy").select("brand_elements, communication_framework, identity_framework").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!questionnaire) {
    return NextResponse.json({ error: "Completa tu perfil primero" }, { status: 400 });
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
    cf.mensaje_central && `Mensaje central: ${cf.mensaje_central}`,
    idf.posicionamiento && `Posicionamiento: ${idf.posicionamiento}`,
    Array.isArray(idf.dolores) && idf.dolores.filter(Boolean).length > 0 && `Dolores del avatar: ${(idf.dolores as string[]).filter(Boolean).join(" / ")}`,
  ].filter(Boolean).join("\n");

  const prompt = `Eres un experto en marketing de contenidos y guiones virales para TikTok e Instagram Reels.

Tu tarea: analizar el estilo de contenido del referente @${username} y generar ${count} guiones ORIGINALES inspirados en sus patrones, adaptados al nicho y marca personal de este creador.

VIDEOS DEL REFERENTE @${username}:
${videoTitles.slice(0, 12).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}

MARCA PERSONAL DEL CREADOR:
${brandContext}

INSTRUCCIONES:
- Analiza los patrones del referente: temas, estilo de hooks, estructura narrativa, tipo de engagement
- Genera ${count} guiones ORIGINALES que tomen inspiración del ESTILO del referente
- Cada guión debe estar 100% adaptado al nicho y oferta del creador
- Los hooks deben ser de ROOM ALTO (interés universal: dinero, amor, éxito, poder, polémica)
- Cada guión debe usar una estructura distinta (polémico, storytelling, educativo, dolor, deseo)
- Usa lenguaje natural, como hablando a cámara
- NO copies los videos del referente — inspírate en su ESTILO y patrones
- NO uses emojis en los guiones

Responde en formato JSON exacto:
{
  "scripts": [
    {
      "title": "Título descriptivo del guión",
      "hook": "Hook de los primeros 3 segundos — impacto máximo",
      "development": "Desarrollo completo del contenido (3-5 puntos o párrafos)",
      "cta": "Llamada a la acción con palabra clave para comentar",
      "inspiration": "Qué patrón del referente usaste y cómo lo adaptaste"
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear la respuesta");

    const result = JSON.parse(jsonMatch[0]);
    const scripts = result.scripts || [];

    const savedScripts = [];
    for (const s of scripts) {
      const { data, error } = await supabase.from("scripts").insert({
        user_id: user.id,
        title: `Inspirado en @${username}: ${s.title}`,
        hook: s.hook,
        development: s.development,
        cta: s.cta,
        stage: "attraction",
      }).select().single();
      if (!error && data) savedScripts.push({ ...data, inspiration: s.inspiration });
    }

    return NextResponse.json({ scripts: savedScripts });
  } catch (e) {
    console.error("Error generando guiones inspirados:", e);
    return NextResponse.json({ error: "Error al generar guiones" }, { status: 500 });
  }
}
