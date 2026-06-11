import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { level, stage } = await req.json();

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche, offer")
    .eq("user_id", user.id)
    .single();

  const levelMap: Record<string, string> = {
    low: "baja conciencia (no sabe que tiene el problema)",
    medium: "conciencia media (sabe el problema pero no la solución)",
    high: "conciencia alta (ya conoce al creador y evalúa comprar)",
  };
  const stageMap: Record<string, string> = {
    attraction: "atracción (generar alcance y nuevos seguidores)",
    nurturing: "nutrición (educar y generar autoridad)",
    conversion: "conversión (generar ventas o consultas)",
  };

  const prompt = `Sos un estratega de contenidos para redes sociales.

Nicho: ${questionnaire?.niche || "marketing digital"}
Oferta: ${questionnaire?.offer || ""}

Nivel de conciencia del cliente: ${levelMap[level] || level}
Etapa del funnel: ${stageMap[stage] || stage}

Generá 5 temas de contenido específicos y originales para esta combinación. Que sean accionables y adaptados al nicho.

Respondé SOLO con un array JSON de 5 strings. Sin explicaciones adicionales. Ejemplo:
["Tema 1", "Tema 2", "Tema 3", "Tema 4", "Tema 5"]`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada");

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json({ topics });
  } catch (e) {
    console.error("Error generando temas:", e);
    return NextResponse.json({ topics: [] });
  }
}
