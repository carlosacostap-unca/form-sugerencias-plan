alter table public.alternativas_planes add column if not exists regimen text;
alter table public.alternativas_planes add column if not exists horas_semanales text;
alter table public.alternativas_planes add column if not exists horas_totales text;
alter table public.alternativas_planes add column if not exists bloques_conocimiento text;
alter table public.alternativas_planes add column if not exists coeficiente_horas_trabajo_independiente text;
alter table public.alternativas_planes add column if not exists horas_trabajo_independiente_totales text;
alter table public.alternativas_planes add column if not exists horas_trabajo_totales text;