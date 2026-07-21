-- Guarda el link original que pegó el usuario (TikTok/Instagram/link directo) y
-- de qué plataforma es, para mostrarlo en el historial. "video_url" sigue
-- guardando la URL efectivamente mandada a AssemblyAI (ya resuelta/descargable).
ALTER TABLE public.transcriptions
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_platform text
    CHECK (source_platform IS NULL OR source_platform IN ('tiktok', 'instagram', 'file', 'link'));
