begin;

create table if not exists public.sugerencias_documento (
  id bigint generated always as identity primary key,
  docente_id bigint references public.docentes(id) on delete set null,
  seccion text not null,
  detalle text not null,
  created_at timestamp with time zone default now()
);

alter table public.sugerencias_documento enable row level security;

drop policy if exists sugerencias_documento_select_public on public.sugerencias_documento;
create policy sugerencias_documento_select_public on public.sugerencias_documento
  for select to public using (true);

drop policy if exists sugerencias_documento_insert_public on public.sugerencias_documento;
create policy sugerencias_documento_insert_public on public.sugerencias_documento
  for insert to public with check (true);

commit;