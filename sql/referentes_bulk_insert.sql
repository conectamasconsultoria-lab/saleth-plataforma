-- Videos referentes organizados por nicho para Conecta+
-- Ejecutar en Supabase SQL Editor (pestaña nueva, solo este SQL)
-- Total: 85 videos en 8 nichos

INSERT INTO reference_videos (coach_id, url, title, niche)
WITH coach AS (
  SELECT user_id FROM profiles WHERE role = 'coach' LIMIT 1
)
SELECT coach.user_id, v.url, v.title, v.niche
FROM coach, (VALUES

  -- ── MARCA PERSONAL (11 videos) ────────────────────────────────────────────
  ('https://vt.tiktok.com/ZSQm5Teum/', 'Marca personal - Video 1', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQm5HGub/', 'Marca personal - Video 2', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQm59maX/', 'Marca personal - Video 3', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmafVkn/', 'Marca personal - Video 4', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQma1d1F/', 'Marca personal - Video 5', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmaS1Be/', 'Marca personal - Video 6', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmaekLR/', 'Marca personal - Video 7', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmaAcPw/', 'Marca personal - Video 8', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmarSxj/', 'Marca personal - Video 9', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQmavcro/', 'Marca personal - Video 10', 'Marca personal'),
  ('https://vt.tiktok.com/ZSQma7q7R/', 'Marca personal - Video 11', 'Marca personal'),

  -- ── ASESORES INMOBILIARIOS (15 videos) ────────────────────────────────────
  ('https://vt.tiktok.com/ZSQmaHQ3H/', 'Asesores inmobiliarios - Video 1', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmaxRNF/', 'Asesores inmobiliarios - Video 2', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmaaY5L/', 'Asesores inmobiliarios - Video 3', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmm2V9L/', 'Asesores inmobiliarios - Video 4', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmmJvxd/', 'Asesores inmobiliarios - Video 5', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DWxUNGQkS4N/?igsh=MWszdDhpbGhvZWx2aA==', 'Asesores inmobiliarios - Video 6', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DSJTPJ2Ebdr/?igsh=YjdjMHVhd3JueDlq', 'Vendo mi casita - Instagram', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DYpzoyozKlE/?igsh=OGY5Nmo1d3Zrc2k5', 'America Ahumada - Diferencia entre clases', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DPo-wzsjviy/?igsh=NW52MG4yeDhod2lh', 'Isabel Melin - Multiplicar dinero bienes raíces', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DK5LjC6RwiC/?igsh=M3JsdGpwdW4wOXRn', 'Isabel Melin - ¿Qué prefieres?', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmuPpcQ/', 'Asesores inmobiliarios - Video 11', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmH19Xk/', 'Asesores inmobiliarios - Video 12', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmuv8PW/', 'Asesores inmobiliarios - Video 13', 'Asesores inmobiliarios'),
  ('https://www.instagram.com/reel/DZQ4doeRnL2/?igsh=ZnkwOGFqdGpmN3pq', 'Asesores inmobiliarios - Instagram 14', 'Asesores inmobiliarios'),
  ('https://vt.tiktok.com/ZSQmHftmD/', 'Asesores inmobiliarios - Video 15', 'Asesores inmobiliarios'),

  -- ── AGENCIAS DE VIAJES (8 videos) ─────────────────────────────────────────
  ('https://vt.tiktok.com/ZSQm9LdqX/', 'Agencias de viajes - Video 1', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9HWfA/', 'Agencias de viajes - Video 2', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm95QV5/', 'Agencias de viajes - Video 3', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9BBmv/', 'Agencias de viajes - Video 4', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9gFc2/', 'Agencias de viajes - Video 5', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9Kvu1/', 'Agencias de viajes - Video 6', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9Cco8/', 'Agencias de viajes - Video 7', 'Agencias de viajes'),
  ('https://vt.tiktok.com/ZSQm9wEqy/', 'Agencias de viajes - Video 8', 'Agencias de viajes'),

  -- ── NUTRICIONISTAS Y FITNESS (12 videos) ──────────────────────────────────
  ('https://vt.tiktok.com/ZSQmxsN1d/', 'Nutricionistas y fitness - Video 1', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmxVeCu/', 'Nutricionistas y fitness - Video 2', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmxpYVa/', 'Nutricionistas y fitness - Video 3', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQSvo1/', 'Nutricionistas y fitness - Video 4', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQANy5/', 'Nutricionistas y fitness - Video 5', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQ1vWq/', 'Nutricionistas y fitness - Video 6', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQAYDf/', 'Nutricionistas y fitness - Video 7', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQJ3jN/', 'Nutricionistas y fitness - Video 8', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmQU2YV/', 'Nutricionistas y fitness - Video 9', 'Nutricionistas y fitness'),
  ('https://www.instagram.com/reel/DZQrNdFPhdM/?igsh=MXZ4M3VwY2l2NnVtMw==', 'Coach Joseph León - Déficit calórico mujeres +35', 'Nutricionistas y fitness'),
  ('https://www.instagram.com/reel/DZEBwEXttA7/?igsh=MXF0NzFoNm53OHZqcg==', 'Coach Joseph León - Crono nutrición y tipo de cuerpo', 'Nutricionistas y fitness'),
  ('https://vt.tiktok.com/ZSQmCG6jw/', 'Nutricionistas y fitness - Video 12', 'Nutricionistas y fitness'),

  -- ── PSICÓLOGOS Y COACHES (10 videos) ──────────────────────────────────────
  ('https://vt.tiktok.com/ZSQmCBhUE/', 'Psicólogos y coaches - Video 1', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCBXJD/', 'Psicólogos y coaches - Video 2', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCaeVR/', 'Psicólogos y coaches - Video 3', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmC9npG/', 'Psicólogos y coaches - Video 4', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCy9Bu/', 'Psicólogos y coaches - Video 5', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCg3MT/', 'Psicólogos y coaches - Video 6', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCHuS1/', 'Psicólogos y coaches - Video 7', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmCGJR2/', 'Psicólogos y coaches - Video 8', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmXj4Lw/', 'Psicólogos y coaches - Video 9', 'Psicólogos y coaches'),
  ('https://vt.tiktok.com/ZSQmXNgdr/', 'Psicólogos y coaches - Video 10', 'Psicólogos y coaches'),

  -- ── NEGOCIOS FÍSICOS (14 videos) ──────────────────────────────────────────
  ('https://vt.tiktok.com/ZSQmXNuhH/', 'Negocios físicos - Video 1', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQmXwKUB/', 'Negocios físicos - Video 2', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm41TUQ/', 'Negocios físicos - Video 3', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQmXGo45/', 'Negocios físicos - Video 4', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4Nv7t/', 'Negocios físicos - Video 5', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQmXv88q/', 'Negocios físicos - Video 6', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4k3kw/', 'Negocios físicos - Video 7', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4uL3j/', 'Negocios físicos - Video 8', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4SrCA/', 'Negocios físicos - Video 9', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4DFDY/', 'Negocios físicos - Video 10', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4Aaou/', 'Negocios físicos - Video 11', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm4XMcq/', 'Negocios físicos - Video 12', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQm43qv6/', 'Negocios físicos - Video 13', 'Negocios físicos'),
  ('https://vt.tiktok.com/ZSQmV11XL/', 'Negocios físicos - Video 14', 'Negocios físicos'),

  -- ── AGENCIAS DE MARKETING / FILMMAKERS (10 videos) ────────────────────────
  ('https://vt.tiktok.com/ZSQmq7U66/', 'Marketing y filmmakers - Video 1', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmquQVB/', 'Marketing y filmmakers - Video 2', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmq9FBp/', 'Marketing y filmmakers - Video 3', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmq7BF/', 'Marketing y filmmakers - Video 4', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmqofgG/', 'Marketing y filmmakers - Video 5', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmqKoDT/', 'Marketing y filmmakers - Video 6', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmbYfKB/', 'Marketing y filmmakers - Video 7', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmbDjWg/', 'Marketing y filmmakers - Video 8', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmbmb2S/', 'Marketing y filmmakers - Video 9', 'Agencias de marketing / Filmmakers'),
  ('https://vt.tiktok.com/ZSQmbXpEM/', 'Marketing y filmmakers - Video 10', 'Agencias de marketing / Filmmakers'),

  -- ── COACH (5 videos) ──────────────────────────────────────────────────────
  ('https://vt.tiktok.com/ZSQmbVPhw/', 'Coach - Video 1', 'Coach'),
  ('https://vt.tiktok.com/ZSQmbVPt3/', 'Coach - Video 2', 'Coach'),
  ('https://vt.tiktok.com/ZSQmbD5JV/', 'Coach - Video 3', 'Coach'),
  ('https://vt.tiktok.com/ZSQmbQxqy/', 'Coach - Video 4', 'Coach'),
  ('https://vt.tiktok.com/ZSQmbxoxc/', 'Coach - Video 5', 'Coach')

) AS v(url, title, niche);
