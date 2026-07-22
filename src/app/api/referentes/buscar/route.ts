import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Búsqueda en vivo de videos virales por palabra clave/nicho, sin persistir
// nada — el usuario elige después cuáles guardar en la biblioteca del coach.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { query } = await req.json();
  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Ingresá una palabra clave o nicho" }, { status: 400 });
  }

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY no configurada" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/search/video?keyword=${encodeURIComponent(query)}&count=20&cursor=0`,
      {
        headers: {
          "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Buscador de referentes: error HTTP", response.status, errorBody);
      const authIssue = response.status === 401 || response.status === 403;
      return NextResponse.json(
        {
          error: authIssue
            ? "RapidAPI rechazó la consulta (revisá la suscripción a tiktok-api23)"
            : `Error al consultar la API de TikTok (status ${response.status})`,
          videos: [],
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const videoList = data?.item_list || data?.itemList || data?.data?.itemList || data?.data?.videos || [];

    if (videoList.length === 0) {
      console.error("Buscador de referentes: respuesta sin videos para", query, JSON.stringify(data).slice(0, 800));
    }

    const videos = videoList
      .map((item: Record<string, unknown>) => {
        const author = (item.author || {}) as Record<string, string>;
        const stats = (item.stats || item.statistics || {}) as Record<string, number>;
        const video = (item.video || {}) as Record<string, string>;
        const id = (item.id || "") as string;
        const hashtags = ((item.challenges || item.textExtra || []) as Record<string, unknown>[])
          .filter((t) => t.hashtagName || t.title)
          .map((t) => (t.hashtagName || t.title) as string)
          .slice(0, 10);
        return {
          video_id: id,
          url: `https://www.tiktok.com/@${author.uniqueId}/video/${id}`,
          title: (item.desc || "Video viral") as string,
          views: stats.playCount || stats.play_count || 0,
          likes: stats.diggCount || stats.like_count || 0,
          thumbnail_url: video.cover || video.originCover || null,
          hashtags,
        };
      })
      .filter((v: { video_id: string }) => v.video_id)
      .sort((a: { views: number }, b: { views: number }) => b.views - a.views);

    return NextResponse.json({ videos, query });
  } catch (e) {
    console.error("Error buscando videos virales:", e);
    return NextResponse.json({ error: "Error al buscar videos", videos: [] }, { status: 200 });
  }
}
