INSERT INTO public.asignatura_correlativas_aprobadas_para_aprobar (asignatura_id, correlativa_id)
SELECT r.asignatura_id, r.correlativa_id
FROM public.asignatura_correlativas_regularizadas r
LEFT JOIN public.asignatura_correlativas_aprobadas_para_aprobar a
  ON a.asignatura_id = r.asignatura_id AND a.correlativa_id = r.correlativa_id
WHERE a.id IS NULL;