"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Docente = { id: number; nombre: string; apellido: string };
type Asignatura = { id: number; nombre: string };
type PropuestaPlan = {
  id: number;
  docente_id: number;
  asignatura_id: number | null;
  nombre_asignatura: string | null;
  anio: string | null;
  regimen: string | null;
  horas_semanales: string | null;
  horas_totales: string | null;
  competencias_genericas: string[] | null;
  competencias_especificas: string[] | null;
  objetivos: string | null;
  contenidos_minimos: string | null;
  formacion_practica: string | null;
  horas_formacion_practica: string | null;
  comentarios: string | null;
  created_at: string;
};

export default function PropuestaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const idStr = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const id = Number(idStr);
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [plan, setPlan] = useState<PropuestaPlan | null>(null);
  const [corrReg, setCorrReg] = useState<number[]>([]);
  const [corrApr, setCorrApr] = useState<number[]>([]);

  const docentesMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const d of docentes) m[d.id] = `${d.nombre} ${d.apellido}`.trim();
    return m;
  }, [docentes]);
  const asigMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const a of asignaturas) m[a.id] = a.nombre;
    return m;
  }, [asignaturas]);

  useEffect(() => {
    const loadOne = async () => {
      if (!id || Number.isNaN(id)) return;
      setLoading(true);
      const supabase = getSupabaseAnon();
      try {
        const [dcs, asigs, pp, rr, ra] = await Promise.all([
          supabase.from("docentes").select("id,nombre,apellido"),
          supabase.from("asignaturas").select("id,nombre"),
          supabase
            .from("propuestas_plan")
            .select(
              "id,docente_id,asignatura_id,nombre_asignatura,anio,regimen,horas_semanales,horas_totales,competencias_genericas,competencias_especificas,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,comentarios,created_at"
            )
            .eq("id", id)
            .single(),
          supabase
            .from("propuestas_plan_correlativas_regularizadas")
            .select("correlativa_id")
            .eq("propuesta_plan_id", id),
          supabase
            .from("propuestas_plan_correlativas_aprobadas")
            .select("correlativa_id")
            .eq("propuesta_plan_id", id),
        ]);
        if (!dcs.error && dcs.data) setDocentes(dcs.data as Docente[]);
        if (!asigs.error && asigs.data) setAsignaturas(asigs.data as Asignatura[]);
        if (!pp.error && pp.data) setPlan(pp.data as PropuestaPlan);
        if (!rr.error && rr.data) setCorrReg((rr.data as { correlativa_id: number }[]).map((x) => x.correlativa_id));
        if (!ra.error && ra.data) setCorrApr((ra.data as { correlativa_id: number }[]).map((x) => x.correlativa_id));
      } finally {
        setLoading(false);
      }
    };
    loadOne();
  }, [id]);

  const docenteNombre = plan ? docentesMap[plan.docente_id] || "" : "";
  const asignaturaNombre = plan ? (plan.asignatura_id ? asigMap[plan.asignatura_id] || "" : plan.nombre_asignatura || "") : "";
  const corrRegNames = corrReg.map((cid) => asigMap[cid] || String(cid));
  const corrAprNames = corrApr.map((cid) => asigMap[cid] || String(cid));
  const compGen = plan?.competencias_genericas || [];
  const compEsp = plan?.competencias_especificas || [];

  function fmtFecha(s: string) {
    try {
      const d = new Date(s);
      const pad = (n: number) => String(n).padStart(2, "0");
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return s;
    }
  }

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Detalle de propuesta</h1>
        </section>

        {loading && (
          <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-700">Cargando propuesta...</div>
        )}

        {!loading && plan && (
          <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow">
            <div className="text-sm text-zinc-600">{fmtFecha(plan.created_at)}</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Docente</p>
                <p className="text-sm font-medium">{docenteNombre}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Asignatura</p>
                <p className="text-sm font-medium">{asignaturaNombre}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Año</p>
                <p className="text-sm">{plan.anio || ""}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Régimen</p>
                <p className="text-sm">{plan.regimen || ""}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Horas semanales</p>
                <p className="text-sm">{plan.horas_semanales || ""}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Horas totales</p>
                <p className="text-sm">{plan.horas_totales || ""}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Formación práctica</p>
                <p className="text-sm">{plan.formacion_practica || ""}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Horas formación práctica</p>
                <p className="text-sm">{plan.horas_formacion_practica || ""}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-zinc-500">Objetivos</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{plan.objetivos || ""}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-500">Contenidos mínimos</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{plan.contenidos_minimos || ""}</p>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-500">Competencias genéricas</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {compGen.length ? (
                  compGen.map((r) => (
                    <span key={r} className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">Sin datos</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-500">Competencias específicas</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {compEsp.length ? (
                  compEsp.map((r) => (
                    <span key={r} className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-700">
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">Sin datos</span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-500">Comentarios</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{plan.comentarios || ""}</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Correlativas regularizadas</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {corrRegNames.length ? (
                    corrRegNames.map((r) => (
                      <span key={r} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">Sin datos</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Correlativas aprobadas</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {corrAprNames.length ? (
                    corrAprNames.map((r) => (
                      <span key={r} className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-500">Sin datos</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300"
                onClick={() => router.push("/propuestas")}
              >
                Volver al listado
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}