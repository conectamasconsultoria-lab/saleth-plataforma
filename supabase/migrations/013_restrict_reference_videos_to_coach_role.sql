-- Las políticas de insert/delete de reference_videos solo validaban
-- coach_id = auth.uid(), sin chequear el rol — mismo bug ya corregido para
-- coach_prompts en 007_restrict_coach_prompts_to_coach_role.sql. Ahora que se
-- expone un flujo real de guardado ("Guardar en biblioteca" desde el buscador),
-- hay que evitar que un cliente pueda escribir en la biblioteca compartida.

DROP POLICY IF EXISTS "Reference videos: coach inserta" ON public.reference_videos;
CREATE POLICY "Reference videos: coach inserta" ON public.reference_videos
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

DROP POLICY IF EXISTS "Reference videos: coach elimina" ON public.reference_videos;
CREATE POLICY "Reference videos: coach elimina" ON public.reference_videos
  FOR DELETE USING (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );
