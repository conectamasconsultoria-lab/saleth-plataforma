// Detecta la plataforma de un link pegado por el usuario y lo resuelve a una URL
// de audio/video descargable que se le pueda pasar a AssemblyAI. Centraliza la
// lógica que antes vivía duplicada e inline en src/app/api/referentes/adaptar/route.ts.

export type VideoPlatform = "tiktok" | "instagram" | "file" | "link";

const INSTAGRAM_RAPIDAPI_HOST =
  process.env.INSTAGRAM_RAPIDAPI_HOST || "instagram-post-reels-stories-downloader-api.p.rapidapi.com";

const INSTAGRAM_CONTENT_PATH = /instagram\.com\/(reel|p|tv)\//i;

export function detectPlatform(url: string): VideoPlatform {
  if (/tiktok\.com/i.test(url)) return "tiktok";
  if (/instagram\.com/i.test(url)) return "instagram";
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
    if (!res.ok) {
      console.error("TikTok resolver: error HTTP", res.status, JSON.stringify(data));
      return null;
    }
    const resolved = data?.data?.play || data?.data?.wmplay || data?.data?.music_info?.play || null;
    if (!resolved) {
      console.error("TikTok resolver: respuesta sin campo de video reconocido:", JSON.stringify(data));
    }
    return resolved;
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
    if (!res.ok) {
      console.error("Instagram resolver: error HTTP", res.status, JSON.stringify(data));
      return null;
    }
    // La API responde { status, result: [{ url, type: "video/mp4", ... }] } —
    // en posts tipo carrusel puede haber varios items (fotos + video mezclados),
    // así que se prioriza el primero cuyo "type" sea de video.
    const results = Array.isArray(data?.result) ? data.result : [];
    const resolved =
      results.find((item: { type?: string; url?: string }) => item?.type?.startsWith("video"))?.url ||
      results[0]?.url ||
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

  if ((platform === "tiktok" || platform === "instagram") && !process.env.RAPIDAPI_KEY) {
    throw new Error(
      "RAPIDAPI_KEY no está configurada en el servidor de producción. Avisale al administrador de la plataforma."
    );
  }

  if (platform === "tiktok") {
    const resolved = await resolveTikTokUrl(url);
    if (!resolved) throw new Error("No se pudo obtener el video de TikTok. Verifica que el link sea público.");
    return { url: resolved, platform };
  }

  if (platform === "instagram") {
    if (!INSTAGRAM_CONTENT_PATH.test(url)) {
      throw new Error(
        "Ese link parece ser de un perfil de Instagram, no de un Reel o post. Pega el link específico del Reel (ej: instagram.com/reel/ABC123)."
      );
    }
    const resolved = await resolveInstagramUrl(url);
    if (!resolved) throw new Error("No se pudo obtener el video de Instagram. Verifica que el link sea público.");
    return { url: resolved, platform };
  }

  return { url, platform };
}
