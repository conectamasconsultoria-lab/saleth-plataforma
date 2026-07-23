-- Chat de análisis agregado: a diferencia de metric_chats (ligado a un solo
-- screenshot), este chat responde preguntas cruzando toda la actividad del
-- usuario (guiones, videos virales, métricas ya analizadas), por eso no
-- cuelga de ningún registro puntual (sin upload_id).
CREATE TABLE public.analytics_chats (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.analytics_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics chats: ver propio" ON public.analytics_chats
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Analytics chats: insertar propio" ON public.analytics_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analytics_chats_user_id_created_at_idx
  ON public.analytics_chats (user_id, created_at);
