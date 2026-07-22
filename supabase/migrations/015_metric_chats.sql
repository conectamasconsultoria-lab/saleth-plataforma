-- Chat de seguimiento sobre un análisis de métricas ya guardado ("preguntarle
-- cosas" a un análisis). Mismo patrón que script_edits (migración 009).
CREATE TABLE public.metric_chats (
  id uuid default uuid_generate_v4() primary key,
  upload_id uuid references public.metrics_uploads(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  message text not null default '',
  created_at timestamptz default now() not null
);

alter table public.metric_chats enable row level security;

create policy "Metric chats: ver propio" on public.metric_chats
  for select using (auth.uid() = user_id);
create policy "Metric chats: insertar propio" on public.metric_chats
  for insert with check (auth.uid() = user_id);

create index if not exists metric_chats_upload_id_created_at_idx
  on public.metric_chats (upload_id, created_at);
