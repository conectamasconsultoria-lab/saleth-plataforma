-- Las políticas de insert/update/delete de coach_prompts solo validaban
-- coach_id = auth.uid(), sin chequear el rol. Eso permitía que un cliente
-- insertara/editara/borrara filas propias (coach_id = su propio user id),
-- que además aparecían visibles para todos por la política de select con
-- visible_to_clients = true. Se agrega el chequeo de rol = 'coach'.

DROP POLICY IF EXISTS "Coach prompts: coach inserta" ON public.coach_prompts;
CREATE POLICY "Coach prompts: coach inserta" ON public.coach_prompts
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

DROP POLICY IF EXISTS "Coach prompts: coach actualiza" ON public.coach_prompts;
CREATE POLICY "Coach prompts: coach actualiza" ON public.coach_prompts
  FOR UPDATE USING (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

DROP POLICY IF EXISTS "Coach prompts: coach elimina" ON public.coach_prompts;
CREATE POLICY "Coach prompts: coach elimina" ON public.coach_prompts
  FOR DELETE USING (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );
