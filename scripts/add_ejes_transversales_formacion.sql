CREATE TABLE public.ejes_transversales_formacion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ejes_transversales_formacion_pkey PRIMARY KEY (id)
);

CREATE TABLE public.asignatura_ejes_transversales_formacion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  asignatura_id bigint NOT NULL,
  eje_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT asignatura_ejes_transversales_formacion_pkey PRIMARY KEY (id),
  CONSTRAINT asignatura_ejes_transversales_formacion_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.asignaturas(id),
  CONSTRAINT asignatura_ejes_transversales_formacion_eje_id_fkey FOREIGN KEY (eje_id) REFERENCES public.ejes_transversales_formacion(id),
  CONSTRAINT asignatura_ejes_transversales_formacion_unique UNIQUE (asignatura_id, eje_id)
);

CREATE INDEX asignatura_ejes_transversales_formacion_asignatura_idx ON public.asignatura_ejes_transversales_formacion (asignatura_id);
CREATE INDEX asignatura_ejes_transversales_formacion_eje_idx ON public.asignatura_ejes_transversales_formacion (eje_id);

INSERT INTO public.ejes_transversales_formacion (nombre) VALUES
('Identificación, formulación y resolución de problemas de ingeniería en sistemas de información/informática'),
('Concepción, diseño y desarrollo de proyectos de ingeniería en sistemas de información/informática'),
('Gestión, planificación, ejecución y control de proyectos de ingeniería en sistemas de información/informática'),
('Utilización de técnicas y herramientas de aplicación en la ingeniería en sistemas de información/informática'),
('Generación de desarrollos tecnológicos y/o innovaciones tecnológicas'),
('Fundamentos para el desempeño en equipos de trabajo'),
('Fundamentos para una comunicación efectiva'),
('Fundamentos para una actuación profesional ética y responsable'),
('Fundamentos para evaluar y actuar en relación con el impacto social de su actividad profesional en el contexto global y local'),
('Fundamentos para el aprendizaje continuo'),
('Fundamentos para el desarrollo de una actitud profesional emprendedora')
ON CONFLICT (nombre) DO NOTHING;