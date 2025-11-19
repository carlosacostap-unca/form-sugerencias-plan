-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alternativas_planes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  titulo text NOT NULL,
  fecha_hora timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT alternativas_planes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.alternativas_planes_asignaturas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  alternativa_id bigint NOT NULL,
  anio text,
  codigo text,
  nombre text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  regimen text,
  horas_semanales text,
  horas_totales text,
  bloque_conocimiento text,
  coeficiente_horas_trabajo_independiente text,
  horas_trabajo_independiente_totales text,
  horas_trabajo_totales text,
  CONSTRAINT alternativas_planes_asignaturas_pkey PRIMARY KEY (id),
  CONSTRAINT alternativas_planes_asignaturas_alternativa_id_fkey FOREIGN KEY (alternativa_id) REFERENCES public.alternativas_planes(id)
);
CREATE TABLE public.aportes_generales (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  docente_id bigint NOT NULL,
  tema text,
  detalle text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT aportes_generales_pkey PRIMARY KEY (id),
  CONSTRAINT aportes_generales_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id)
);
CREATE TABLE public.asignatura_competencias_especificas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  competencia_especifica_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_competencias_especificas_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_competencias_especificas_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_competencias_especifi_competencia_especifica_id_fkey FOREIGN KEY (competencia_especifica_id) REFERENCES public.competencias_especificas(id)
);
CREATE TABLE public.asignatura_competencias_genericas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  competencia_generica_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_competencias_genericas_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_competencias_genericas_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_competencias_genericas_competencia_generica_id_fkey FOREIGN KEY (competencia_generica_id) REFERENCES public.competencias_genericas(id)
);
CREATE TABLE public.asignatura_correlativas_aprobadas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  correlativa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_correlativas_aprobadas_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_correlativas_aprobadas_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_correlativas_aprobadas_correlativa_id_fkey FOREIGN KEY (correlativa_id) REFERENCES public.asignaturas(id)
);
CREATE TABLE public.asignatura_correlativas_regularizadas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  correlativa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_correlativas_regularizadas_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_correlativas_regularizadas_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_correlativas_regularizadas_correlativa_id_fkey FOREIGN KEY (correlativa_id) REFERENCES public.asignaturas(id)
);
CREATE TABLE public.asignaturas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  anio text,
  regimen text,
  horas_semanales text,
  horas_totales text,
  objetivos text,
  contenidos_minimos text,
  formacion_practica text,
  horas_formacion_practica text,
  codigo text,
  bloque_conocimiento_id bigint,
  CONSTRAINT asignaturas_pkey PRIMARY KEY (id),
  CONSTRAINT asignaturas_bloque_conocimiento_id_fkey FOREIGN KEY (bloque_conocimiento_id) REFERENCES public.bloques_conocimiento(id)
);
CREATE TABLE public.bloques_conocimiento (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bloques_conocimiento_pkey PRIMARY KEY (id)
);
CREATE TABLE public.competencias_especificas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  codigo text,
  nombre USER-DEFINED NOT NULL UNIQUE,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competencias_especificas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.competencias_genericas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre USER-DEFINED NOT NULL UNIQUE,
  categoria text CHECK (categoria = ANY (ARRAY['tecnologicas'::text, 'sociales'::text])),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT competencias_genericas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.docentes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT docentes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.propuestas_optativas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  docente_id bigint NOT NULL,
  asignatura text,
  objetivos text,
  contenidos_minimos text,
  formacion_practica text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_optativas_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_optativas_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id)
);
CREATE TABLE public.propuestas_plan (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  docente_id bigint NOT NULL,
  asignatura_id bigint,
  nombre_asignatura text,
  anio text,
  regimen text,
  horas_semanales text,
  horas_totales text,
  competencias_genericas ARRAY,
  competencias_especificas ARRAY,
  objetivos text,
  contenidos_minimos text,
  formacion_practica text,
  horas_formacion_practica text,
  comentarios text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_plan_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_plan_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id),
  CONSTRAINT propuestas_plan_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id)
);
CREATE TABLE public.propuestas_plan_competencias_especificas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  propuesta_plan_id bigint NOT NULL,
  competencia_especifica_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_plan_competencias_especificas_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_plan_competencias_especificas_propuesta_plan_id_fkey FOREIGN KEY (propuesta_plan_id) REFERENCES public.propuestas_plan(id),
  CONSTRAINT propuestas_plan_competencias_esp_competencia_especifica_id_fkey FOREIGN KEY (competencia_especifica_id) REFERENCES public.competencias_especificas(id)
);
CREATE TABLE public.propuestas_plan_competencias_genericas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  propuesta_plan_id bigint NOT NULL,
  competencia_generica_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_plan_competencias_genericas_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_plan_competencias_genericas_propuesta_plan_id_fkey FOREIGN KEY (propuesta_plan_id) REFERENCES public.propuestas_plan(id),
  CONSTRAINT propuestas_plan_competencias_gener_competencia_generica_id_fkey FOREIGN KEY (competencia_generica_id) REFERENCES public.competencias_genericas(id)
);
CREATE TABLE public.propuestas_plan_correlativas_aprobadas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  propuesta_plan_id bigint NOT NULL,
  correlativa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_plan_correlativas_aprobadas_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_plan_correlativas_aprobadas_propuesta_plan_id_fkey FOREIGN KEY (propuesta_plan_id) REFERENCES public.propuestas_plan(id),
  CONSTRAINT propuestas_plan_correlativas_aprobadas_correlativa_id_fkey FOREIGN KEY (correlativa_id) REFERENCES public.asignaturas(id)
);
CREATE TABLE public.propuestas_plan_correlativas_regularizadas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  propuesta_plan_id bigint NOT NULL,
  correlativa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT propuestas_plan_correlativas_regularizadas_pkey PRIMARY KEY (id),
  CONSTRAINT propuestas_plan_correlativas_regularizad_propuesta_plan_id_fkey FOREIGN KEY (propuesta_plan_id) REFERENCES public.propuestas_plan(id),
  CONSTRAINT propuestas_plan_correlativas_regularizadas_correlativa_id_fkey FOREIGN KEY (correlativa_id) REFERENCES public.asignaturas(id)
);