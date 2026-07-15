-- Tipografía de marca personal, usada junto con brand_color/brand_style
-- para personalizar el diseño de los carruseles y otras piezas visuales
alter table public.profiles
  add column if not exists brand_font text not null default 'inter'
  check (brand_font in ('inter', 'grotesk', 'playfair', 'poppins', 'fraunces', 'bebas'));
