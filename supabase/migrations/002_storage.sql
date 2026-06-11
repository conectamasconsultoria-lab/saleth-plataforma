-- Crear bucket para métricas (privado, acceso autenticado)
insert into storage.buckets (id, name, public)
values ('metrics', 'metrics', false)
on conflict (id) do nothing;

-- Política: cada usuario solo accede a sus propios archivos
create policy "Metrics: upload propio"
  on storage.objects for insert
  with check (
    bucket_id = 'metrics' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Metrics: ver propio"
  on storage.objects for select
  using (
    bucket_id = 'metrics' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
