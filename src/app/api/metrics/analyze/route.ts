import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const platform = formData.get("platform") as string || "Instagram";

  if (!file) return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 });

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche, offer")
    .eq("user_id", user.id)
    .single();

  // Subir imagen a Supabase Storage
  const fileExt = file.name.split(".").pop();
  const storagePath = `${user.id}/${Date.now()}.${fileExt}`;
  const fileBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("metrics")
    .upload(storagePath, fileBuffer, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: "Error subiendo imagen" }, { status: 500 });

  // Convertir imagen a base64 para Claude Vision
  const base64 = Buffer.from(fileBuffer).toString("base64");
  const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const prompt = `Sos un experto analista de métricas de redes sociales para creadores de contenido.

Contexto del creador:
- Nicho: ${questionnaire?.niche || "marketing digital"}
- Oferta: ${questionnaire?.offer || ""}
- Plataforma: ${platform}

Analizá el screenshot de métricas que te comparto y devolvé un análisis detallado en español que incluya:

1. **Resumen ejecutivo** (2-3 oraciones sobre el estado general)
2. **Métricas destacadas** (qué números son buenos, qué números necesitan mejora)
3. **Insights accionables** (3-5 recomendaciones concretas para mejorar el rendimiento)
4. **Contenido que está funcionando** (qué tipo de contenido está generando mejores resultados según los datos)
5. **Próximos pasos** (qué debería hacer primero esta semana)

Sé específico con los números que veas en la imagen.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const insights = message.content[0].type === "text" ? message.content[0].text : "";

    const { data: metricsUpload, error } = await supabase
      .from("metrics_uploads")
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        platform,
        insights,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ uploadId: metricsUpload.id, insights, upload: metricsUpload });
  } catch (e) {
    console.error("Error analizando métricas:", e);
    return NextResponse.json({ error: "Error al analizar la imagen" }, { status: 500 });
  }
}
