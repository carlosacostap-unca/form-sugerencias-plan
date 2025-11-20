begin;

insert into public.bloques_conocimiento(nombre)
select 'Ciencias Básicas de la Ingeniería'
where not exists (select 1 from public.bloques_conocimiento where nombre = 'Ciencias Básicas de la Ingeniería');

with d(nombre) as (
  values
    ('Álgebra'),
    ('Análisis Matemático'),
    ('Geometría Analítica'),
    ('Física'),
    ('Probabilidad y Estadística')
),
ins as (
  insert into public.bloque_descriptores(nombre)
  select nombre from d
  on conflict (nombre) do nothing
  returning id, nombre
),
all_desc as (
  select id, nombre from ins
  union all
  select bd.id, bd.nombre from public.bloque_descriptores bd where bd.nombre in (select nombre from d)
),
blk as (
  select id from public.bloques_conocimiento where nombre = 'Ciencias Básicas de la Ingeniería'
)
insert into public.bloques_conocimiento_descriptores(bloque_conocimiento_id, descriptor_id)
select blk.id, all_desc.id from blk cross join all_desc
on conflict (bloque_conocimiento_id, descriptor_id) do nothing;

commit;