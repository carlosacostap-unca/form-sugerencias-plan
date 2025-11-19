-- Añade el campo 'codigo' a la tabla asignaturas (idempotente)
alter table public.asignaturas add column if not exists codigo text;