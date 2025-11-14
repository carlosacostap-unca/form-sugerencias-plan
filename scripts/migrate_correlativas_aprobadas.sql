-- Migración: de texto (lista separada por comas) a tablas relacionales para correlativas aprobadas
begin;

-- Asignaturas -> asignatura_correlativas_aprobadas
insert into public.asignatura_correlativas_aprobadas (asignatura_id, correlativa_id)
select a.id as asignatura_id, c.id as correlativa_id
from public.asignaturas a
cross join unnest(string_to_array(coalesce(a.correlativas_aprobadas, ''), ',')) as raw_name
join public.asignaturas c on trim(raw_name) <> '' and c.nombre = trim(raw_name)
on conflict (asignatura_id, correlativa_id) do nothing;

-- Propuestas -> propuestas_plan_correlativas_aprobadas
insert into public.propuestas_plan_correlativas_aprobadas (propuesta_plan_id, correlativa_id)
select p.id as propuesta_plan_id, c.id as correlativa_id
from public.propuestas_plan p
cross join unnest(string_to_array(coalesce(p.correlativas_aprobadas, ''), ',')) as raw_name
join public.asignaturas c on trim(raw_name) <> '' and c.nombre = trim(raw_name)
on conflict (propuesta_plan_id, correlativa_id) do nothing;

commit;