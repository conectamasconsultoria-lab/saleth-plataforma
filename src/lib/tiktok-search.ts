// Búsqueda de videos de TikTok por palabra clave, con 2 proveedores de RapidAPI:
// ScrapTik como principal, tiktok-api23 como respaldo automático si el principal
// falla o no trae resultados. Ambos comparten la misma RAPIDAPI_KEY (misma app).
export type TikTokSearchVideo = {
  video_id: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  thumbnail_url: string | null;
  hashtags: string[];
};

type SearchResult = { videos: TikTokSearchVideo[]; error?: string };

function describeRapidApiError(status: number, providerLabel: string): string {
  const authIssue = status === 401 || status === 403;
  const rateLimited = status === 429;
  return authIssue
    ? `RapidAPI rechazó la consulta a ${providerLabel} (revisá la suscripción)`
    : rateLimited
      ? `Límite de la API de ${providerLabel} alcanzado, esperá o revisá tu plan`
      : `Error al consultar ${providerLabel} (status ${status})`;
}

async function searchScrapTik(keyword: string, count: number): Promise<SearchResult> {
  const response = await fetch(
    `https://scraptik.p.rapidapi.com/search-posts?keyword=${encodeURIComponent(keyword)}&count=${count}&offset=0&use_filters=0&publish_time=0&sort_type=0&region=US&compact=0`,
    {
      headers: {
        "content-type": "application/json",
        "x-rapidapi-host": "scraptik.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("ScrapTik search-posts: error HTTP", response.status, errorBody);
    return { videos: [], error: describeRapidApiError(response.status, "ScrapTik") };
  }

  const data = await response.json();
  const items = (data?.search_item_list || []) as Record<string, unknown>[];

  const videos = items
    .map((entry) => {
      const item = (entry.aweme_info || {}) as Record<string, unknown>;
      const author = (item.author || {}) as Record<string, unknown>;
      const stats = (item.statistics || {}) as Record<string, number>;
      const video = (item.video || {}) as Record<string, unknown>;
      const cover = (video.cover || video.origin_cover || {}) as Record<string, unknown>;
      const coverUrls = (cover.url_list || []) as string[];
      const id = (item.aweme_id || "") as string;
      const uniqueId = (author.unique_id || "") as string;
      const hashtags = ((item.text_extra || []) as Record<string, unknown>[])
        .filter((t) => t.hashtag_name)
        .map((t) => t.hashtag_name as string)
        .slice(0, 10);

      return {
        video_id: id,
        url: uniqueId && id ? `https://www.tiktok.com/@${uniqueId}/video/${id}` : "",
        title: (item.desc || "Video viral") as string,
        views: stats.play_count || 0,
        likes: stats.digg_count || 0,
        thumbnail_url: coverUrls[0] || null,
        hashtags,
      };
    })
    .filter((v) => v.video_id && v.url);

  if (videos.length === 0) {
    console.error("ScrapTik search-posts: respuesta sin videos para", keyword, JSON.stringify(data).slice(0, 800));
  }

  return { videos };
}

async function searchTikTokApi23(keyword: string, count: number): Promise<SearchResult> {
  const response = await fetch(
    `https://tiktok-api23.p.rapidapi.com/api/search/video?keyword=${encodeURIComponent(keyword)}&count=${count}&cursor=0`,
    {
      headers: {
        "x-rapidapi-host": "tiktok-api23.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("tiktok-api23 search: error HTTP", response.status, errorBody);
    return { videos: [], error: describeRapidApiError(response.status, "tiktok-api23") };
  }

  const data = await response.json();
  const items = (data?.item_list || data?.itemList || data?.data?.itemList || data?.data?.videos || []) as Record<
    string,
    unknown
  >[];

  const videos = items
    .map((item) => {
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
        url: author.uniqueId && id ? `https://www.tiktok.com/@${author.uniqueId}/video/${id}` : "",
        title: (item.desc || "Video viral") as string,
        views: stats.playCount || stats.play_count || 0,
        likes: stats.diggCount || stats.like_count || 0,
        thumbnail_url: video.cover || video.originCover || null,
        hashtags,
      };
    })
    .filter((v) => v.video_id && v.url);

  if (videos.length === 0) {
    console.error("tiktok-api23 search: respuesta sin videos para", keyword, JSON.stringify(data).slice(0, 800));
  }

  return { videos };
}

// ScrapTik como principal (mejor mantenida); si falla o no trae nada, respalda con tiktok-api23.
export async function searchTikTokVideos(keyword: string, count = 20): Promise<SearchResult> {
  const primary = await searchScrapTik(keyword, count);
  if (primary.videos.length > 0) return primary;

  const fallback = await searchTikTokApi23(keyword, count);
  if (fallback.videos.length > 0) return fallback;

  return { videos: [], error: primary.error || fallback.error };
}
