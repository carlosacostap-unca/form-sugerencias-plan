import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase";

type Docente = { nombre: string; apellido: string };
type Propuesta = {
  asignatura: string;
  nombreAsignatura: string;
  anio: string;
  regimen: string;
  horasSemanales: string;
  horasTotales: string;
  correlativasRegularizadas: string;
  correlativasAprobadas: string;
  competenciasGenericas: string[];
  competenciasEspecificas: string[];
  objetivos: string;
  contenidosMinimos: string;
  formacionPractica: string;
  horasFormacionPractica: string;
  comentarios: string;
};
type Optativa = { asignatura: string; objetivos: string; contenidosMinimos: string; formacionPractica: string };
type Aporte = { tema: string; detalle: string };

export async function POST(req: Request) {
  const supabase = getSupabaseServer();
  const body = await req.json();
  const docente: Docente = body?.docente;
  const propuestas: Propuesta[] = body?.propuestas ?? [];
  const optativas: Optativa[] = body?.optativas ?? [];
  const aportes: Aporte[] = body?.aportes ?? [];

  if (!docente?.nombre || !docente?.apellido) return NextResponse.json({ error: "docente inválido" }, { status: 400 });

  const { data: docenteRow, error: docenteErr } = await supabase
    .from("docentes")
    .insert({ nombre: docente.nombre, apellido: docente.apellido })
    .select()
    .single();
  if (docenteErr) return NextResponse.json({ error: docenteErr.message }, { status: 500 });
  const docenteId = docenteRow.id;

  for (const p of propuestas) {
    let asignaturaId: number | null = null;
    const nombre = (p.asignatura || "").trim();
    if (nombre) {
      const { data: asig } = await supabase.from("asignaturas").upsert({ nombre }, { onConflict: "nombre" }).select().single();
      asignaturaId = asig?.id ?? null;
    }
    await supabase.from("propuestas_plan").insert({
      docente_id: docenteId,
      asignatura_id: asignaturaId,
      nombre_asignatura: p.nombreAsignatura || null,
      anio: p.anio || null,
      regimen: p.regimen || null,
      horas_semanales: p.horasSemanales || null,
      horas_totales: p.horasTotales || null,
      correlativas_regularizadas: p.correlativasRegularizadas || null,
      correlativas_aprobadas: p.correlativasAprobadas || null,
      competencias_genericas: p.competenciasGenericas ?? [],
      competencias_especificas: p.competenciasEspecificas ?? [],
      objetivos: p.objetivos || null,
      contenidos_minimos: p.contenidosMinimos || null,
      formacion_practica: p.formacionPractica || null,
      horas_formacion_practica: p.horasFormacionPractica || null,
      comentarios: p.comentarios || null,
    });
  }

  for (const o of optativas) {
    await supabase.from("propuestas_optativas").insert({
      docente_id: docenteId,
      asignatura: o.asignatura || null,
      objetivos: o.objetivos || null,
      contenidos_minimos: o.contenidosMinimos || null,
      formacion_practica: o.formacionPractica || null,
    });
  }

  for (const a of aportes) {
    await supabase.from("aportes_generales").insert({
      docente_id: docenteId,
      tema: a.tema || null,
      detalle: a.detalle || null,
    });
  }

  return NextResponse.json({ ok: true });
}