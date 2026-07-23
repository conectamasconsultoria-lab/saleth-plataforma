import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RAPIDAPI_HOST = "tiktok-api23.p.rapidapi.com";

function rapidApiHeaders(): Record<string, string> {
  return {
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
  };
}

// El endpoint de posts requiere el secUid interno de TikTok, no el @username —
// hay que resolverlo primero vía "Get User Info".
async function resolveSecUid(username: string): Promise<string | null> {
  const res = await fetch(
    `https://${RAPIDAPI_HOST}/api/user/info?uniqueId=${encodeURIComponent(username)}`,
    { headers: rapidApiHeaders() }
  );
  if (!res.ok) {
    console.error("TikTok cuenta resolver: error HTTP en user/info", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data?.userInfo?.user?.secUid || null;
}

// Obtiene los videos más recientes/virales de una cuenta de TikTok
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: "Username requerido" }, { status: 400 });

  const cleanUsername = username.replace(/^@/, "");

  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY no configurada" }, { status: 500 });
  }

  try {
    const secUid = await resolveSecUid(cleanUsername);
    if (!secUid) {
      return NextResponse.json(
        { error: `No se encontró la cuenta @${cleanUsername} en TikTok`, videos: [] },
        { status: 200 }
      );
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/api/user/posts?secUid=${encodeURIComponent(secUid)}&count=20&cursor=0`,
      { headers: rapidApiHeaders() }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("TikTok cuenta resolver: error HTTP", response.status, errorBody);
      const authIssue = response.status === 401 || response.status === 403;
      return NextResponse.json(
        {
          error: authIssue
            ? "RapidAPI rechazó la consulta (revisa que la suscripción a tiktok-api23 esté activa en tu cuenta de RapidAPI)"
            : `Error al consultar la API de TikTok (status ${response.status})`,
          videos: [],
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const items = data?.itemList || data?.data?.itemList || data?.data?.videos || [];

    if (items.length === 0) {
      console.error("TikTok cuenta resolver: respuesta sin videos para", cleanUsername, JSON.stringify(data).slice(0, 800));
    }

    const videos = items
      .map((item: Record<string, unknown>) => {
        const stats = (item.stats || item.statistics || {}) as Record<string, number>;
        const video = (item.video || {}) as Record<string, string>;
        const id = (item.id || item.video_id || "") as string;
        return {
          video_id: id,
          url: `https://www.tiktok.com/@${cleanUsername}/video/${id}`,
          title: (item.desc || (Array.isArray(item.contents) ? item.contents[0] : "") || "Sin título") as string,
          views: stats.playCount || stats.play_count || 0,
          likes: stats.diggCount || stats.like_count || 0,
          thumbnail_url: video.cover || video.originCover || null,
        };
      })
      .filter((v: { video_id: string }) => v.video_id)
      .sort((a: { views: number }, b: { views: number }) => b.views - a.views)
      .slice(0, 12);

    return NextResponse.json({ videos, username: cleanUsername });
  } catch (e) {
    console.error("Error fetching TikTok user videos:", e);
    return NextResponse.json({ error: "Error al obtener videos", videos: [] }, { status: 200 });
  }
}
