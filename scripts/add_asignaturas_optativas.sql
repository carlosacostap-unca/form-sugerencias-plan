begin;

create table if not exists public.asignaturas_optativas (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  objetivos text,
  contenidos_minimos text,
  formacion_practica text,
  created_at timestamp with time zone not null default now()
);

commit;