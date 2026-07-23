import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getStructureByKey, getDefaultStructureForStage, type Stage } from "@/lib/scripts/structures";
import { buildSystemPrompt, buildCreatorProfileBlock, buildEditUserPrompt } from "@/lib/scripts/prompt";
import { ENTREGAR_GUION_TOOL, extractToolInput } from "@/lib/scripts/tool-schema";
import type { ScriptEdit } from "@/lib/supabase/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MAX_HISTORY_MESSAGES = 20;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: script } = await supabase
    .from("scripts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!script) return NextResponse.json({ error: "Guión no encontrado" }, { status: 404 });

  const { data: edits, error } = await supabase
    .from("script_edits")
    .select("*")
    .eq("script_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ edits: edits as ScriptEdit[] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { message } = await req.json();
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Falta el mensaje de edición" }, { status: 400 });
  }

  const { data: script } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!script) return NextResponse.json({ error: "Guión no encontrado" }, { status: 404 });

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!questionnaire) {
    return NextResponse.json({ error: "Completa tu perfil primero" }, { status: 400 });
  }

  const { data: previousEdits } = await supabase
    .from("script_edits")
    .select("role, message")
    .eq("script_id", id)
    .order("created_at", { ascending: true });

  // Guardamos el mensaje del usuario de inmediato para no perderlo si la llamada a Claude falla.
  const { error: userInsertError } = await supabase.from("script_edits").insert({
    script_id: id,
    user_id: user.id,
    role: "user",
    message,
  });
  if (userInsertError) {
    return NextResponse.json({ error: userInsertError.message }, { status: 500 });
  }

  const brandBlueprint = questionnaire.brand_blueprint as Record<string, string>;
  const structure = getStructureByKey(script.structure_key) ?? getDefaultStructureForStage(script.stage as Stage | undefined);

  const profileBlock = buildCreatorProfileBlock({
    niche: questionnaire.niche,
    offer: questionnaire.offer,
    contentStyle: questionnaire.content_style,
    tone: brandBlueprint?.tone,
    values: brandBlueprint?.values,
    targetAudience: brandBlueprint?.target_audience,
    contentPillars: brandBlueprint?.content_pillars,
    targetNiche: script.target_niche || null,
    archetype: questionnaire.personality_archetype || null,
  });

  const editHistory = (previousEdits ?? []).slice(-MAX_HISTORY_MESSAGES) as Array<{ role: "user" | "assistant"; message: string }>;

  const userPrompt = buildEditUserPrompt({
    profileBlock,
    structure,
    currentScript: {
      title: script.title,
      hook: script.hook,
      development: script.development,
      cta: script.cta,
    },
    editHistory,
    instruction: message,
  });

  try {
    const claudeMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: buildSystemPrompt(),
      tools: [ENTREGAR_GUION_TOOL],
      tool_choice: { type: "tool", name: "entregar_guion" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const revised = extractToolInput(claudeMessage);

    const { data: assistantEdit, error: assistantInsertError } = await supabase
      .from("script_edits")
      .insert({
        script_id: id,
        user_id: user.id,
        role: "assistant",
        message: revised.resumen_cambio || "Guión actualizado",
        resulting_title: revised.title,
        resulting_hook: revised.hook,
        resulting_development: revised.development,
        resulting_cta: revised.cta,
      })
      .select()
      .single();
    if (assistantInsertError) throw assistantInsertError;

    const { data: updatedScript, error: updateError } = await supabase
      .from("scripts")
      .update({
        title: revised.title,
        hook: revised.hook,
        development: revised.development,
        cta: revised.cta,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (updateError) throw updateError;

    return NextResponse.json({ edit: assistantEdit, script: updatedScript });
  } catch (e) {
    console.error("Error editando guión:", e);
    return NextResponse.json({ error: "Error al editar el guión" }, { status: 500 });
  }
}
