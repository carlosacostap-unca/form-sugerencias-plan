begin;

create table if not exists public.bloque_descriptores (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.bloques_conocimiento_descriptores (
  id bigint generated always as identity primary key,
  bloque_conocimiento_id bigint not null references public.bloques_conocimiento(id) on delete cascade,
  descriptor_id bigint not null references public.bloque_descriptores(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (bloque_conocimiento_id, descriptor_id)
);

create index if not exists idx_bcd_bloque on public.bloques_conocimiento_descriptores(bloque_conocimiento_id);
create index if not exists idx_bcd_descriptor on public.bloques_conocimiento_descriptores(descriptor_id);

commit;