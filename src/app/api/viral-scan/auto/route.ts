import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Este endpoint es llamado tanto manualmente como por el cron job de Vercel
export async function POST(req: NextRequest) {
  // Verificar secret para llamadas desde cron
  const authHeader = req.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  const supabase = await createClient();

  if (!isCron) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { niche } = await req.json();

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "API key de RapidAPI no configurada", count: 0 });
  }

  const searchQuery = niche || "marketing digital";
  let newCount = 0;

  try {
    // Buscar videos trending por hashtag relacionado al nicho
    const response = await fetch(
      `https://tiktok-api23.p.rapidapi.com/api/search/video?keywords=${encodeURIComponent(searchQuery)}&count=20&cursor=0`,
      {
        headers: {
          "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
      }
    );

    const data = await response.json();
    const videoList = data?.itemList || data?.data?.videos || [];

    for (const item of videoList) {
      const tiktokUrl = `https://www.tiktok.com/@${item.author?.uniqueId}/video/${item.id}`;
      const views = item.stats?.playCount || item.statistics?.playCount || 0;

      // Solo guardar videos con más de 100k vistas
      if (views < 100000) continue;

      const { data: existing } = await supabase
        .from("viral_videos")
        .select("id")
        .eq("tiktok_url", tiktokUrl)
        .single();

      if (existing) continue;

      const hashtags = (item.challenges || item.textExtra || [])
        .filter((t: Record<string, unknown>) => t.hashtagName || t.title)
        .map((t: Record<string, unknown>) => (t.hashtagName || t.title) as string)
        .slice(0, 10);

      await supabase.from("viral_videos").insert({
        tiktok_url: tiktokUrl,
        title: item.desc || item.contents?.[0]?.desc || "Video viral",
        hashtags,
        niche: searchQuery,
        views,
        thumbnail_url: item.video?.cover || item.video?.originCover || null,
        source: "auto",
        scanned_at: new Date().toISOString(),
      });

      newCount++;
    }
  } catch (e) {
    console.error("Error en escaneo automático:", e);
    return NextResponse.json({ error: "Error al escanear TikTok", count: 0 }, { status: 500 });
  }

  return NextResponse.json({ count: newCount });
}
