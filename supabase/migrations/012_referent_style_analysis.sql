-- Análisis de estilo/marca personal por cuenta referente ("Referentes IA"):
-- se cachea por cuenta para no tener que regenerarlo cada vez que se visita.
ALTER TABLE public.user_referent_accounts
  ADD COLUMN IF NOT EXISTS style_analysis text,
  ADD COLUMN IF NOT EXISTS style_analysis_generated_at timestamptz;
