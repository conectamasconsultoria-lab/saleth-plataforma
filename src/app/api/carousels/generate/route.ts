import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { topic, slideCount = 7 } = await req.json();
  if (!topic) return NextResponse.json({ error: "Falta el tema" }, { status: 400 });

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!questionnaire) return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });

  const brandBlueprint = questionnaire.brand_blueprint as Record<string, string>;

  const prompt = `Sos un experto en marketing de contenidos y carruseles para redes sociales (Instagram y LinkedIn).

PERFIL DEL CREADOR:
- Nicho: ${questionnaire.niche}
- Oferta: ${questionnaire.offer}
- Tono: ${brandBlueprint?.tone}
- Cliente ideal: ${brandBlueprint?.target_audience}

Creá un carrusel de ${slideCount} slides sobre el tema: "${topic}"

El carrusel debe:
- Tener un slide de portada irresistible (hace que quieran seguir pasando)
- Aportar valor real en cada slide
- Terminar con un CTA claro
- Usar el tono definido en el perfil
- Estar en español

Respondé con este JSON exacto:
{
  "topic": "${topic}",
  "slides": [
    {
      "slide_number": 1,
      "title": "Título de la portada",
      "content": "Texto/bullet points del slide"
    }
  ]
}

Generá exactamente ${slideCount} slides. El slide 1 es la portada, el último slide es el CTA.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear el carrusel");

    const carouselData = JSON.parse(jsonMatch[0]);

    const { data: carousel, error } = await supabase
      .from("carousels")
      .insert({
        user_id: user.id,
        topic,
        slides: carouselData.slides,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ carouselId: carousel.id, carousel });
  } catch (e) {
    console.error("Error generando carrusel:", e);
    return NextResponse.json({ error: "Error al generar el carrusel" }, { status: 500 });
  }
}
