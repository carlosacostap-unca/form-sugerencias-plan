-- Actualiza estructura de asignaturas: renombra horas sincrónicas y agrega horas de trabajo
begin;

-- Renombrar columnas horas_semanales -> horas_semanales_sincronicas
do $$
declare exists_old boolean; exists_new boolean;
begin
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='asignaturas' and column_name='horas_semanales') into exists_old;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='asignaturas' and column_name='horas_semanales_sincronicas') into exists_new;
  if exists_old and not exists_new then
    execute 'alter table public.asignaturas rename column horas_semanales to horas_semanales_sincronicas';
  end if;
end $$;

-- Renombrar columnas horas_totales -> horas_totales_sincronicas
do $$
declare exists_old boolean; exists_new boolean;
begin
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='asignaturas' and column_name='horas_totales') into exists_old;
  select exists(select 1 from information_schema.columns where table_schema='public' and table_name='asignaturas' and column_name='horas_totales_sincronicas') into exists_new;
  if exists_old and not exists_new then
    execute 'alter table public.asignaturas rename column horas_totales to horas_totales_sincronicas';
  end if;
end $$;

-- Agregar nuevas columnas para trabajo independiente y total (idempotente)
alter table public.asignaturas add column if not exists horas_trabajo_independiente text;
alter table public.asignaturas add column if not exists horas_trabajo_independiente_totales text;
alter table public.asignaturas add column if not exists horas_trabajo_totales text;

commit;