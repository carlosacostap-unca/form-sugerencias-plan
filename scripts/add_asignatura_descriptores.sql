begin;

create table if not exists public.asignatura_descriptores (
  id bigint generated always as identity primary key,
  asignatura_id bigint not null references public.asignaturas(id) on delete cascade,
  descriptor_id bigint not null references public.bloque_descriptores(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (asignatura_id, descriptor_id)
);

create index if not exists idx_ad_asignatura on public.asignatura_descriptores(asignatura_id);
create index if not exists idx_ad_descriptor on public.asignatura_descriptores(descriptor_id);

commit;