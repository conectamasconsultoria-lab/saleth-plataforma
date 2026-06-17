-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: brand_strategy + Marcos de Marca + Referentes IA
-- Ejecutar en Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Crear tabla brand_strategy (si no existe)
CREATE TABLE IF NOT EXISTS brand_strategy (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_elements           JSONB       DEFAULT '{}'::jsonb,
  content_planner          JSONB       DEFAULT '{}'::jsonb,
  story_planner            JSONB       DEFAULT '{}'::jsonb,
  resources                JSONB       DEFAULT '[]'::jsonb,
  communication_framework    JSONB       DEFAULT '{}'::jsonb,
  identity_framework         JSONB       DEFAULT '{}'::jsonb,
  avatar_content_framework   JSONB       DEFAULT '{}'::jsonb,
  updated_at                 TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- 2. Si ya existía, agregar las columnas nuevas sin romper datos existentes
ALTER TABLE brand_strategy
  ADD COLUMN IF NOT EXISTS communication_framework    JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS identity_framework         JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS avatar_content_framework   JSONB DEFAULT '{}'::jsonb;

-- 3. RLS para brand_strategy
ALTER TABLE brand_strategy ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own brand strategy" ON brand_strategy;
CREATE POLICY "Users manage their own brand strategy"
  ON brand_strategy FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Tabla para cuentas de TikTok referentes por usuario
CREATE TABLE IF NOT EXISTS user_referent_accounts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT        NOT NULL,
  platform    TEXT        NOT NULL DEFAULT 'tiktok',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, username, platform)
);

-- 5. RLS para user_referent_accounts
ALTER TABLE user_referent_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own referent accounts" ON user_referent_accounts;
CREATE POLICY "Users manage their own referent accounts"
  ON user_referent_accounts FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Tabla para videos personales del alumno (sección "Mis Videos")
CREATE TABLE IF NOT EXISTS personal_videos (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personal_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own personal videos" ON personal_videos;
CREATE POLICY "Users manage their own personal videos"
  ON personal_videos FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Tabla para auditorías (una fila por usuario, columnas JSONB por pestaña)
CREATE TABLE IF NOT EXISTS auditorias (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ofertas       JSONB       DEFAULT '[]'::jsonb,
  vision        JSONB       DEFAULT '{}'::jsonb,
  promesas      JSONB       DEFAULT '{}'::jsonb,
  avatar        JSONB       DEFAULT '{}'::jsonb,
  adquisicion   JSONB       DEFAULT '{}'::jsonb,
  clasificador  JSONB       DEFAULT '{}'::jsonb,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE auditorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own auditorias" ON auditorias;
CREATE POLICY "Users manage their own auditorias"
  ON auditorias FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
