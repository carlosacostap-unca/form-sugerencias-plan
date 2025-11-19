-- Políticas RLS para permitir actualización con cliente anónimo
begin;

-- Habilitar RLS donde aplique
alter table public.asignaturas enable row level security;
alter table public.asignatura_correlativas_regularizadas enable row level security;
alter table public.asignatura_correlativas_aprobadas enable row level security;
alter table public.asignatura_competencias_genericas enable row level security;
alter table public.asignatura_competencias_especificas enable row level security;
alter table public.bloques_conocimiento enable row level security;

-- Asignaturas: select, insert, update
drop policy if exists asignaturas_select_public on public.asignaturas;
create policy asignaturas_select_public on public.asignaturas for select to public using (true);

drop policy if exists asignaturas_insert_public on public.asignaturas;
create policy asignaturas_insert_public on public.asignaturas for insert to public with check (true);

drop policy if exists asignaturas_update_public on public.asignaturas;
create policy asignaturas_update_public on public.asignaturas for update to public using (true) with check (true);

-- Bloques de conocimiento: select
drop policy if exists bloques_conocimiento_select_public on public.bloques_conocimiento;
create policy bloques_conocimiento_select_public on public.bloques_conocimiento for select to public using (true);

-- Relaciones de correlativas y competencias: select, insert, delete
drop policy if exists acr_select_public on public.asignatura_correlativas_regularizadas;
create policy acr_select_public on public.asignatura_correlativas_regularizadas for select to public using (true);
drop policy if exists acr_insert_public on public.asignatura_correlativas_regularizadas;
create policy acr_insert_public on public.asignatura_correlativas_regularizadas for insert to public with check (true);
drop policy if exists acr_delete_public on public.asignatura_correlativas_regularizadas;
create policy acr_delete_public on public.asignatura_correlativas_regularizadas for delete to public using (true);

drop policy if exists aca_select_public on public.asignatura_correlativas_aprobadas;
create policy aca_select_public on public.asignatura_correlativas_aprobadas for select to public using (true);
drop policy if exists aca_insert_public on public.asignatura_correlativas_aprobadas;
create policy aca_insert_public on public.asignatura_correlativas_aprobadas for insert to public with check (true);
drop policy if exists aca_delete_public on public.asignatura_correlativas_aprobadas;
create policy aca_delete_public on public.asignatura_correlativas_aprobadas for delete to public using (true);

drop policy if exists acg_select_public on public.asignatura_competencias_genericas;
create policy acg_select_public on public.asignatura_competencias_genericas for select to public using (true);
drop policy if exists acg_insert_public on public.asignatura_competencias_genericas;
create policy acg_insert_public on public.asignatura_competencias_genericas for insert to public with check (true);
drop policy if exists acg_delete_public on public.asignatura_competencias_genericas;
create policy acg_delete_public on public.asignatura_competencias_genericas for delete to public using (true);

drop policy if exists ace_select_public on public.asignatura_competencias_especificas;
create policy ace_select_public on public.asignatura_competencias_especificas for select to public using (true);
drop policy if exists ace_insert_public on public.asignatura_competencias_especificas;
create policy ace_insert_public on public.asignatura_competencias_especificas for insert to public with check (true);
drop policy if exists ace_delete_public on public.asignatura_competencias_especificas;
create policy ace_delete_public on public.asignatura_competencias_especificas for delete to public using (true);

commit;