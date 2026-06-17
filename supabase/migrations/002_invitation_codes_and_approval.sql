-- ============================================================
-- MIGRACIÓN: Sistema de códigos de invitación + aprobación
-- ============================================================

-- 1. Agregar columna is_approved a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- 2. Aprobar todos los usuarios existentes
UPDATE public.profiles SET is_approved = true;

-- 3. Crear tabla de códigos de invitación
CREATE TABLE public.invitation_codes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL
);

-- 4. RLS para invitation_codes
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Codes: coach ve todos" ON public.invitation_codes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Codes: coach crea" ON public.invitation_codes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Codes: coach actualiza" ON public.invitation_codes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

CREATE POLICY "Codes: coach elimina" ON public.invitation_codes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

-- 5. Política para que coach pueda aprobar clientes (actualizar otros perfiles)
CREATE POLICY "Profiles: coach aprueba clientes" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'coach')
  );

-- 6. Actualizar trigger para que nuevos usuarios tengan is_approved = false
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, is_approved)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
