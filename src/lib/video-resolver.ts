// Detecta la plataforma de un link pegado por el usuario y lo resuelve a una URL
// de audio/video descargable que se le pueda pasar a AssemblyAI. Centraliza la
// lógica que antes vivía duplicada e inline en src/app/api/referentes/adaptar/route.ts.

export type VideoPlatform = "tiktok" | "instagram" | "file" | "link";

const INSTAGRAM_RAPIDAPI_HOST =
  process.env.INSTAGRAM_RAPIDAPI_HOST || "instagram-post-reels-stories-downloader-api.p.rapidapi.com";

export function detectPlatform(url: string): VideoPlatform {
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com\/(reel|p|tv)\//i.test(url)) return "instagram";
  return "link";
}

export async function resolveTikTokUrl(url: string): Promise<string | null> {
  if (!process.env.RAPIDAPI_KEY) return null;
  try {
    const res = await fetch(
      `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`,
      {
        headers: {
          "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
      }
    );
    const data = await res.json();
    return data?.data?.play || data?.data?.wmplay || data?.data?.music_info?.play || null;
  } catch (e) {
    console.error("Error resolviendo URL de TikTok:", e);
    return null;
  }
}

export async function resolveInstagramUrl(url: string): Promise<string | null> {
  if (!process.env.RAPIDAPI_KEY) return null;
  try {
    const res = await fetch(
      `https://${INSTAGRAM_RAPIDAPI_HOST}/instagram/?url=${encodeURIComponent(url)}`,
      {
        headers: {
          "x-rapidapi-host": INSTAGRAM_RAPIDAPI_HOST,
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        },
      }
    );
    const data = await res.json();
    const resolved =
      data?.video_url ||
      data?.video ||
      data?.media_url ||
      data?.download_url ||
      data?.data?.video_url ||
      data?.medias?.[0]?.url ||
      null;
    if (!resolved) {
      // Ningún campo conocido matcheó — se loguea la respuesta completa para
      // poder ajustar el nombre del campo una vez que se vea un caso real.
      console.error("Instagram resolver: respuesta sin campo de video reconocido:", JSON.stringify(data));
    }
    return resolved;
  } catch (e) {
    console.error("Error resolviendo URL de Instagram:", e);
    return null;
  }
}

export async function resolveDownloadableUrl(url: string): Promise<{ url: string; platform: VideoPlatform }> {
  const platform = detectPlatform(url);

  if (platform === "tiktok") {
    const resolved = await resolveTikTokUrl(url);
    if (!resolved) throw new Error("No se pudo obtener el video de TikTok. Verificá que el link sea público.");
    return { url: resolved, platform };
  }

  if (platform === "instagram") {
    const resolved = await resolveInstagramUrl(url);
    if (!resolved) throw new Error("No se pudo obtener el video de Instagram. Verificá que el link sea público.");
    return { url: resolved, platform };
  }

  return { url, platform };
}
