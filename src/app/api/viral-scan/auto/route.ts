import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchTikTokVideos } from "@/lib/tiktok-search";

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
    const { videos, error } = await searchTikTokVideos(searchQuery, 20);

    if (error && videos.length === 0) {
      return NextResponse.json({ error, count: 0 }, { status: 200 });
    }

    for (const item of videos) {
      // Solo guardar videos con más de 100k vistas
      if (item.views < 100000) continue;

      const { data: existing } = await supabase
        .from("viral_videos")
        .select("id")
        .eq("tiktok_url", item.url)
        .single();

      if (existing) continue;

      await supabase.from("viral_videos").insert({
        tiktok_url: item.url,
        title: item.title,
        hashtags: item.hashtags,
        niche: searchQuery,
        views: item.views,
        thumbnail_url: item.thumbnail_url,
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
