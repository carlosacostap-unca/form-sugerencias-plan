-- 1) Añadir columnas a alternativas_planes_asignaturas (idempotente)
alter table public.alternativas_planes_asignaturas add column if not exists regimen text;
alter table public.alternativas_planes_asignaturas add column if not exists horas_semanales text;
alter table public.alternativas_planes_asignaturas add column if not exists horas_totales text;
alter table public.alternativas_planes_asignaturas add column if not exists bloques_conocimiento text;
alter table public.alternativas_planes_asignaturas add column if not exists coeficiente_horas_trabajo_independiente text;
alter table public.alternativas_planes_asignaturas add column if not exists horas_trabajo_independiente_totales text;
alter table public.alternativas_planes_asignaturas add column if not exists horas_trabajo_totales text;

-- 2) Migrar datos desde alternativas_planes a cada asignatura de la alternativa
update public.alternativas_planes_asignaturas s
set
  regimen = coalesce(s.regimen, a.regimen),
  horas_semanales = coalesce(s.horas_semanales, a.horas_semanales),
  horas_totales = coalesce(s.horas_totales, a.horas_totales),
  bloques_conocimiento = coalesce(s.bloques_conocimiento, a.bloques_conocimiento),
  coeficiente_horas_trabajo_independiente = coalesce(s.coeficiente_horas_trabajo_independiente, a.coeficiente_horas_trabajo_independiente),
  horas_trabajo_independiente_totales = coalesce(s.horas_trabajo_independiente_totales, a.horas_trabajo_independiente_totales),
  horas_trabajo_totales = coalesce(s.horas_trabajo_totales, a.horas_trabajo_totales)
from public.alternativas_planes a
where s.alternativa_id = a.id;

-- 3) Eliminar columnas de alternativas_planes (opcionales)
alter table public.alternativas_planes drop column if exists regimen;
alter table public.alternativas_planes drop column if exists horas_semanales;
alter table public.alternativas_planes drop column if exists horas_totales;
alter table public.alternativas_planes drop column if exists bloques_conocimiento;
alter table public.alternativas_planes drop column if exists coeficiente_horas_trabajo_independiente;
alter table public.alternativas_planes drop column if exists horas_trabajo_independiente_totales;
alter table public.alternativas_planes drop column if exists horas_trabajo_totales;