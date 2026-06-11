-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- Tabla de perfiles
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('coach', 'client')) default 'client',
  full_name text not null default '',
  avatar_url text,
  coach_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Tabla de cuestionarios de onboarding
create table public.questionnaires (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  niche text not null default '',
  offer text not null default '',
  content_style text not null default '',
  brand_blueprint jsonb not null default '{}',
  completed_at timestamptz default now() not null
);

-- Tabla de videos virales
create table public.viral_videos (
  id uuid default uuid_generate_v4() primary key,
  tiktok_url text not null,
  title text not null default '',
  hashtags text[] default '{}',
  niche text not null default '',
  views bigint default 0,
  thumbnail_url text,
  transcript text,
  scanned_at timestamptz default now() not null,
  source text not null check (source in ('auto', 'manual')) default 'manual',
  added_by uuid references auth.users(id) on delete set null
);

-- Tabla de guiones
create table public.scripts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  viral_video_id uuid references public.viral_videos(id) on delete set null,
  title text not null default '',
  hook text not null default '',
  development text not null default '',
  cta text not null default '',
  awareness_level text check (awareness_level in ('high', 'medium', 'low')),
  stage text check (stage in ('attraction', 'conversion', 'nurturing')),
  created_at timestamptz default now() not null
);

-- Tabla de carruseles
create table public.carousels (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic text not null default '',
  slides jsonb not null default '[]',
  created_at timestamptz default now() not null
);

-- Tabla de uploads de métricas
create table public.metrics_uploads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  platform text not null default '',
  insights text default '',
  created_at timestamptz default now() not null
);

-- Tabla de transcripciones
create table public.transcriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  video_url text,
  transcript text not null default '',
  created_at timestamptz default now() not null
);

-- Tabla de prompts del coach
create table public.coach_prompts (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references auth.users(id) on delete cascade not null,
  title text not null default '',
  prompt_text text not null default '',
  explanation text not null default '',
  display_order int not null default 0,
  visible_to_clients boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tabla de videos referentes
create table public.reference_videos (
  id uuid default uuid_generate_v4() primary key,
  coach_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null default '',
  niche text not null default '',
  description text,
  created_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.questionnaires enable row level security;
alter table public.viral_videos enable row level security;
alter table public.scripts enable row level security;
alter table public.carousels enable row level security;
alter table public.metrics_uploads enable row level security;
alter table public.transcriptions enable row level security;
alter table public.coach_prompts enable row level security;
alter table public.reference_videos enable row level security;

-- Profiles: cada uno ve el suyo; coach ve sus clientes
create policy "Profiles: ver propio perfil" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Profiles: coach ve sus clientes" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'coach'
    )
  );

create policy "Profiles: insertar propio" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Profiles: actualizar propio" on public.profiles
  for update using (auth.uid() = user_id);

-- Questionnaires: ver y editar el propio
create policy "Questionnaires: ver propio" on public.questionnaires
  for select using (auth.uid() = user_id);

create policy "Questionnaires: insertar propio" on public.questionnaires
  for insert with check (auth.uid() = user_id);

create policy "Questionnaires: actualizar propio" on public.questionnaires
  for update using (auth.uid() = user_id);

-- Viral videos: todos los autenticados pueden ver
create policy "Viral videos: ver todos" on public.viral_videos
  for select using (auth.role() = 'authenticated');

create policy "Viral videos: insertar autenticado" on public.viral_videos
  for insert with check (auth.role() = 'authenticated');

-- Scripts: ver y editar el propio
create policy "Scripts: ver propio" on public.scripts
  for select using (auth.uid() = user_id);

create policy "Scripts: insertar propio" on public.scripts
  for insert with check (auth.uid() = user_id);

create policy "Scripts: eliminar propio" on public.scripts
  for delete using (auth.uid() = user_id);

-- Carousels: ver y editar el propio
create policy "Carousels: ver propio" on public.carousels
  for select using (auth.uid() = user_id);

create policy "Carousels: insertar propio" on public.carousels
  for insert with check (auth.uid() = user_id);

create policy "Carousels: eliminar propio" on public.carousels
  for delete using (auth.uid() = user_id);

-- Metrics: ver y editar el propio
create policy "Metrics: ver propio" on public.metrics_uploads
  for select using (auth.uid() = user_id);

create policy "Metrics: insertar propio" on public.metrics_uploads
  for insert with check (auth.uid() = user_id);

-- Transcriptions: ver y editar el propio
create policy "Transcriptions: ver propio" on public.transcriptions
  for select using (auth.uid() = user_id);

create policy "Transcriptions: insertar propio" on public.transcriptions
  for insert with check (auth.uid() = user_id);

-- Coach prompts: coach edita los suyos; clientes ven los visibles
create policy "Coach prompts: coach ve todos" on public.coach_prompts
  for select using (auth.uid() = coach_id);

create policy "Coach prompts: clientes ven visibles" on public.coach_prompts
  for select using (visible_to_clients = true and auth.role() = 'authenticated');

create policy "Coach prompts: coach inserta" on public.coach_prompts
  for insert with check (auth.uid() = coach_id);

create policy "Coach prompts: coach actualiza" on public.coach_prompts
  for update using (auth.uid() = coach_id);

create policy "Coach prompts: coach elimina" on public.coach_prompts
  for delete using (auth.uid() = coach_id);

-- Reference videos: coach inserta; todos ven
create policy "Reference videos: ver todos" on public.reference_videos
  for select using (auth.role() = 'authenticated');

create policy "Reference videos: coach inserta" on public.reference_videos
  for insert with check (auth.uid() = coach_id);

create policy "Reference videos: coach elimina" on public.reference_videos
  for delete using (auth.uid() = coach_id);

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
