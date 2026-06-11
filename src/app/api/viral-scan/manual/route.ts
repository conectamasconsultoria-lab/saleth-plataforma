import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { url } = await req.json();
  if (!url || !url.includes("tiktok.com")) {
    return NextResponse.json({ error: "URL de TikTok inválida" }, { status: 400 });
  }

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche")
    .eq("user_id", user.id)
    .single();

  // Obtener metadata del video via RapidAPI
  let videoData = {
    title: "Video de TikTok",
    hashtags: [] as string[],
    views: 0,
    thumbnail_url: null as string | null,
    transcript: null as string | null,
  };

  if (process.env.RAPIDAPI_KEY) {
    try {
      const response = await fetch(
        `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`,
        {
          headers: {
            "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          },
        }
      );
      const data = await response.json();
      if (data?.data) {
        videoData.title = data.data.title || videoData.title;
        videoData.views = data.data.play_count || 0;
        videoData.thumbnail_url = data.data.cover || null;
        const tags = data.data.title?.match(/#[\w]+/g) || [];
        videoData.hashtags = tags.map((t: string) => t.replace("#", ""));
      }
    } catch (e) {
      console.error("Error fetching TikTok metadata:", e);
    }
  }

  const { data: video, error } = await supabase
    .from("viral_videos")
    .insert({
      tiktok_url: url,
      title: videoData.title,
      hashtags: videoData.hashtags,
      niche: questionnaire?.niche || "",
      views: videoData.views,
      thumbnail_url: videoData.thumbnail_url,
      transcript: videoData.transcript,
      source: "manual",
      added_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ video });
}
