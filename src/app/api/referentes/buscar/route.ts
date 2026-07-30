import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchTikTokVideos } from "@/lib/tiktok-search";

// Búsqueda en vivo de videos virales por palabra clave/nicho, sin persistir
// nada — el usuario elige después cuáles guardar en la biblioteca del coach.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { query } = await req.json();
  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Ingresa una palabra clave o nicho" }, { status: 400 });
  }

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY no configurada" }, { status: 500 });
  }

  try {
    const { videos, error } = await searchTikTokVideos(query, 20);

    if (error && videos.length === 0) {
      return NextResponse.json({ error, videos: [] }, { status: 200 });
    }

    const sorted = [...videos].sort((a, b) => b.views - a.views);

    return NextResponse.json({ videos: sorted, query });
  } catch (e) {
    console.error("Error buscando videos virales:", e);
    return NextResponse.json({ error: "Error al buscar videos", videos: [] }, { status: 200 });
  }
}
