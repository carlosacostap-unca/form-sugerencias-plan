import { NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAnon } from "../../../../lib/supabase";

export async function POST(req: Request) {
  const b = await req.json();
  const id = Number(b?.id ?? 0);
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const hasServerCreds = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = hasServerCreds ? getSupabaseServer() : getSupabaseAnon();
  const updateData = {
    nombre: b?.nombre ?? null,
    codigo: b?.codigo ?? null,
    anio: b?.anio ?? null,
    regimen: b?.regimen ?? null,
    horas_semanales_sincronicas: b?.horas_semanales_sincronicas ?? null,
    horas_totales_sincronicas: b?.horas_totales_sincronicas ?? null,
    horas_trabajo_independiente_totales: b?.horas_trabajo_independiente_totales ?? null,
    horas_trabajo_totales: b?.horas_trabajo_totales ?? null,
    coeficiente_horas_trabajo_independiente: b?.coeficiente_horas_trabajo_independiente ?? null,
    objetivos: b?.objetivos ?? null,
    contenidos_minimos: b?.contenidos_minimos ?? null,
    formacion_practica: b?.formacion_practica ?? null,
    horas_formacion_practica: b?.horas_formacion_practica ?? null,
    bloque_conocimiento_id: b?.bloque_conocimiento_id ?? null,
  } as const;
  const { error: upErr } = await supabase.from("asignaturas").update(updateData).eq("id", id);
  if (upErr) {
    const hint = hasServerCreds
      ? undefined
      : "Falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local";
    return NextResponse.json({ error: upErr.message, hint }, { status: 500 });
  }

  const regs: number[] | undefined = Array.isArray(b?.correlativas_regularizadas_ids) ? b.correlativas_regularizadas_ids : undefined;
  const aprs: number[] | undefined = Array.isArray(b?.correlativas_aprobadas_ids) ? b.correlativas_aprobadas_ids : undefined;
  const gens: number[] | undefined = Array.isArray(b?.competencias_genericas_ids) ? b.competencias_genericas_ids : undefined;
  const esps: number[] | undefined = Array.isArray(b?.competencias_especificas_ids) ? b.competencias_especificas_ids : undefined;
  const descs: number[] | undefined = Array.isArray(b?.descriptores_ids) ? b.descriptores_ids : undefined;

  if (regs) {
    await supabase.from("asignatura_correlativas_regularizadas").delete().eq("asignatura_id", id);
    if (regs.length) {
      const rows = regs.map((correlativa_id) => ({ asignatura_id: id, correlativa_id }));
      await supabase.from("asignatura_correlativas_regularizadas").insert(rows);
    }
  }
  if (aprs) {
    await supabase.from("asignatura_correlativas_aprobadas").delete().eq("asignatura_id", id);
    if (aprs.length) {
      const rows = aprs.map((correlativa_id) => ({ asignatura_id: id, correlativa_id }));
      await supabase.from("asignatura_correlativas_aprobadas").insert(rows);
    }
  }
  if (gens) {
    await supabase.from("asignatura_competencias_genericas").delete().eq("asignatura_id", id);
    if (gens.length) {
      const rows = gens.map((competencia_generica_id) => ({ asignatura_id: id, competencia_generica_id }));
      await supabase.from("asignatura_competencias_genericas").insert(rows);
    }
  }
  if (esps) {
    await supabase.from("asignatura_competencias_especificas").delete().eq("asignatura_id", id);
    if (esps.length) {
      const rows = esps.map((competencia_especifica_id) => ({ asignatura_id: id, competencia_especifica_id }));
      await supabase.from("asignatura_competencias_especificas").insert(rows);
    }
  }
  if (descs) {
    await supabase.from("asignatura_descriptores").delete().eq("asignatura_id", id);
    if (descs.length) {
      const rows = descs.map((descriptor_id) => ({ asignatura_id: id, descriptor_id }));
      await supabase.from("asignatura_descriptores").insert(rows);
    }
  }

  const { data } = await supabase.from("asignaturas").select("*").eq("id", id).single();
  return NextResponse.json({ ok: true, asignatura: data });
}