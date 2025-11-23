CREATE TABLE public.asignatura_correlativas_aprobadas_para_aprobar (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  correlativa_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_correlativas_aprobadas_para_aprobar_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_correlativas_aprobadas_para_aprobar_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_correlativas_aprobadas_para_aprobar_correlativa_id_fkey FOREIGN KEY (correlativa_id) REFERENCES public.asignaturas(id)
);

CREATE INDEX asignatura_correlativas_aprobadas_para_aprobar_asignatura_idx ON public.asignatura_correlativas_aprobadas_para_aprobar (asignatura_id);
CREATE INDEX asignatura_correlativas_aprobadas_para_aprobar_correlativa_idx ON public.asignatura_correlativas_aprobadas_para_aprobar (correlativa_id);