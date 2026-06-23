import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ASSEMBLYAI_BASE = "https://api.assemblyai.com/v2";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: "AssemblyAI no configurado" }, { status: 500 });
  }

  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  try {
    const { videoUrl } = await req.json();
    if (!videoUrl) {
      return NextResponse.json({ error: "Falta la URL del audio/video" }, { status: 400 });
    }

    const submitRes = await fetch(`${ASSEMBLYAI_BASE}/transcript`, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_detection: true,
      }),
    });

    const submitData = await submitRes.json();

    if (!submitRes.ok) {
      console.error("AssemblyAI submit error:", submitData);
      throw new Error(submitData.error || "Error al iniciar transcripción");
    }

    const transcriptId = submitData.id;

    let transcript = "";
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const pollRes = await fetch(`${ASSEMBLYAI_BASE}/transcript/${transcriptId}`, {
        headers: { authorization: apiKey },
      });
      const pollData = await pollRes.json();

      if (pollData.status === "completed") {
        transcript = pollData.text;
        break;
      }
      if (pollData.status === "error") {
        throw new Error("Error en AssemblyAI: " + pollData.error);
      }
    }

    if (!transcript) throw new Error("Timeout: la transcripción tardó demasiado");

    const { data: transcription, error } = await supabase
      .from("transcriptions")
      .insert({
        user_id: user.id,
        video_url: videoUrl,
        transcript,
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      return NextResponse.json({ transcript });
    }

    return NextResponse.json({ transcriptionId: transcription.id, transcript });
  } catch (e) {
    console.error("Error en transcripción:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al transcribir" },
      { status: 500 }
    );
  }
}
