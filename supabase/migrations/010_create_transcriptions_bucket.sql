-- El bucket "transcriptions" nunca se creó (solo existía en migraciones el bucket
-- "metrics"), por lo que el modo "Subir archivo" de la página de Transcripciones
-- fallaba de entrada con "bucket not found" antes de llegar a AssemblyAI.
insert into storage.buckets (id, name, public)
values ('transcriptions', 'transcriptions', false)
on conflict (id) do nothing;

create policy "Transcriptions: upload propio"
  on storage.objects for insert
  with check (
    bucket_id = 'transcriptions' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Transcriptions: ver propio"
  on storage.objects for select
  using (
    bucket_id = 'transcriptions' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
