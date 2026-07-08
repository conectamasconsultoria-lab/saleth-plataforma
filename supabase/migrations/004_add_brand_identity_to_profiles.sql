-- Identidad visual de marca personal, usada para personalizar el diseño de los carruseles
alter table public.profiles
  add column if not exists brand_color text not null default '#1A6FFF',
  add column if not exists brand_style text not null default 'dark' check (brand_style in ('dark', 'light'));
