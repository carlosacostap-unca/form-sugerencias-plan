begin;

alter table public.bloques_conocimiento add column if not exists horas_minimas numeric;

commit;