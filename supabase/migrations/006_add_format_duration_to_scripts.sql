-- Formato de grabación y duración objetivo del guión
ALTER TABLE public.scripts
  ADD COLUMN IF NOT EXISTS format text CHECK (format IN ('problema', 'camara', 'pregunta')),
  ADD COLUMN IF NOT EXISTS duration integer CHECK (duration IN (15, 30, 60));
