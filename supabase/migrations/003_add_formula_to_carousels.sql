-- Agregar columna formula a carousels para persistir el estilo visual
ALTER TABLE public.carousels
  ADD COLUMN IF NOT EXISTS formula text NOT NULL DEFAULT 'lista_valor';
