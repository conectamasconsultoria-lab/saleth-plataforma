-- Nicho específico por guión, referencia a la estructura narrativa exacta usada
-- (necesaria para que el chat de edición reconstruya el contexto original),
-- y formato de grabación libre (antes limitado a 'problema'/'camara'/'pregunta').
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS target_niche text,
  ADD COLUMN IF NOT EXISTS structure_key text;

ALTER TABLE public.scripts DROP CONSTRAINT IF EXISTS scripts_format_check;
ALTER TABLE public.scripts
  ADD CONSTRAINT scripts_format_check
  CHECK (format IS NULL OR char_length(format) BETWEEN 1 AND 80);

-- Historial de edición conversacional de guiones: cada mensaje del usuario y
-- cada revisión del asistente (con snapshot completo del guión resultante).
CREATE TABLE public.script_edits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  script_id uuid REFERENCES public.scripts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL DEFAULT '',
  resulting_title text,
  resulting_hook text,
  resulting_development text,
  resulting_cta text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.script_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Script edits: ver propio" ON public.script_edits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Script edits: insertar propio" ON public.script_edits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS script_edits_script_id_created_at_idx
  ON public.script_edits (script_id, created_at);
