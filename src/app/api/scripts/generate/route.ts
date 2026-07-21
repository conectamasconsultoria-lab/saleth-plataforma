import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getStructureByKey, getDefaultStructureForStage, type Stage } from "@/lib/scripts/structures";
import {
  buildSystemPrompt,
  buildCreatorProfileBlock,
  buildGenerationUserPrompt,
  getFormatGuidance,
  DURATION_GUIDANCE,
  AWARENESS_GUIDANCE,
} from "@/lib/scripts/prompt";
import { ENTREGAR_GUION_TOOL, extractToolInput } from "@/lib/scripts/tool-schema";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { viralVideoId, topic, awarenessLevel, stage, contentType, subType, format, duration, targetNiche } = await req.json();

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
- Transcripción: ${video.transcript || "No disponible"}`;
    }
  }

  const brandBlueprint = questionnaire.brand_blueprint as Record<string, string>;
  const structureKey = contentType && subType ? `${contentType}-${subType}` : null;
  const structure = getStructureByKey(structureKey) ?? getDefaultStructureForStage(stage as Stage | undefined);

  const profileBlock = buildCreatorProfileBlock({
    niche: questionnaire.niche,
    offer: questionnaire.offer,
    contentStyle: questionnaire.content_style,
    tone: brandBlueprint?.tone,
    values: brandBlueprint?.values,
    targetAudience: brandBlueprint?.target_audience,
    contentPillars: brandBlueprint?.content_pillars,
    targetNiche: targetNiche || null,
  });

  const userPrompt = buildGenerationUserPrompt({
    profileBlock,
    structure,
    formatGuidance: getFormatGuidance(format),
    durationGuidance: duration ? DURATION_GUIDANCE[duration] : null,
    awarenessGuidance: awarenessLevel ? AWARENESS_GUIDANCE[awarenessLevel] : null,
    videoContext,
    topic,
  });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: buildSystemPrompt(),
      tools: [ENTREGAR_GUION_TOOL],
      tool_choice: { type: "tool", name: "entregar_guion" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const scriptData = extractToolInput(message);

    const effectiveStage = stage || (contentType === "atraccion" ? "attraction" : contentType === "nutricion" ? "nurturing" : contentType === "ventas" ? "conversion" : null);

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
        stage: effectiveStage,
        format: format ?? null,
        duration: duration ?? null,
        target_niche: targetNiche || null,
        structure_key: structureKey,
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
