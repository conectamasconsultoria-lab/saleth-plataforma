import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { videoUrl } = await req.json();
  if (!videoUrl) return NextResponse.json({ error: "Falta la URL del video" }, { status: 400 });

  if (!process.env.ASSEMBLYAI_API_KEY) {
    return NextResponse.json({ error: "AssemblyAI no configurado" }, { status: 500 });
  }

  try {
    // Crear transcripción con AssemblyAI
    const submitRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: videoUrl,
        language_detection: true,
      }),
    });

    const submitData = await submitRes.json();
    const transcriptId = submitData.id;

    // Polling hasta que esté lista
    let transcript = "";
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));

      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
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

    if (error) throw error;

    return NextResponse.json({ transcriptionId: transcription.id, transcript });
  } catch (e) {
    console.error("Error en transcripción:", e);
    return NextResponse.json({ error: "Error al transcribir el video" }, { status: 500 });
  }
}
