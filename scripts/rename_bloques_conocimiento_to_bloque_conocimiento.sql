do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'alternativas_planes_asignaturas'
      and column_name = 'bloques_conocimiento'
  ) then
    execute 'alter table public.alternativas_planes_asignaturas rename column bloques_conocimiento to bloque_conocimiento';
  end if;
end $$;