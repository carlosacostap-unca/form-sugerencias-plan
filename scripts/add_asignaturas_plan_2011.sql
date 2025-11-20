begin;

create table if not exists public.asignaturas_plan_2011 (
  id bigint generated always as identity primary key,
  numero text not null unique,
  nombre text not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.asignatura_equivalencias_plan_2011 (
  id bigint generated always as identity primary key,
  asignatura_id bigint not null references public.asignaturas(id) on delete cascade,
  plan_2011_asignatura_id bigint not null references public.asignaturas_plan_2011(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (asignatura_id, plan_2011_asignatura_id)
);

commit;