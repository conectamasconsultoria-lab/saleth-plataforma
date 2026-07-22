-- Rubros/categorías de la Biblioteca del Coach como entidad propia, para que el
-- coach pueda crear un rubro vacío (esperando videos) sin depender de que ya
-- exista al menos un video con ese "niche" para que aparezca en la grilla.
CREATE TABLE public.reference_niches (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null,
  unique (coach_id, name)
);

ALTER TABLE public.reference_niches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reference niches: ver todos" ON public.reference_niches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Reference niches: coach inserta" ON public.reference_niches
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Reference niches: coach elimina" ON public.reference_niches
  FOR DELETE USING (
    auth.uid() = coach_id
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );
