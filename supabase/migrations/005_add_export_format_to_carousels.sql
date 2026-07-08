-- Recordar el formato de exportación elegido por el usuario para cada carrusel
ALTER TABLE public.carousels
  ADD COLUMN IF NOT EXISTS export_format text NOT NULL DEFAULT '4:5' CHECK (export_format IN ('4:5', '3:4'));

-- Faltaba política de UPDATE para carousels (solo existía select/insert/delete)
DROP POLICY IF EXISTS "Carousels: actualizar propio" ON public.carousels;
CREATE POLICY "Carousels: actualizar propio" ON public.carousels
  FOR UPDATE USING (auth.uid() = user_id);
