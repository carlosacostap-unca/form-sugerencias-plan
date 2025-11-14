"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../lib/supabase";

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
  objetivos: string | null;
  contenidos_minimos: string | null;
  formacion_practica: string | null;
  horas_formacion_practica: string | null;
  comentarios: string | null;
  created_at: string;
};
type PropuestaOptativa = {
  id: number;
  docente_id: number;
  asignatura: string | null;
  objetivos: string | null;
  contenidos_minimos: string | null;
  formacion_practica: string | null;
  created_at: string;
};
type AporteGeneral = {
  id: number;
  docente_id: number;
  tema: string | null;
  detalle: string | null;
  created_at: string;
};
 

function fmtFecha(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
}

export default function PropuestasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [plan, setPlan] = useState<PropuestaPlan[]>([]);
  const [optativas, setOptativas] = useState<PropuestaOptativa[]>([]);
  const [aportes, setAportes] = useState<AporteGeneral[]>([]);
 

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
    const loadAll = async () => {
      setLoading(true);
      const supabase = getSupabaseAnon();
      try {
        const [dcs, asigs, pp, po, ag] = await Promise.all([
          supabase.from("docentes").select("id,nombre,apellido"),
          supabase.from("asignaturas").select("id,nombre"),
          supabase
            .from("propuestas_plan")
            .select(
              "id,docente_id,asignatura_id,nombre_asignatura,anio,regimen,horas_semanales,horas_totales,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,comentarios,created_at"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("propuestas_optativas")
            .select("id,docente_id,asignatura,objetivos,contenidos_minimos,formacion_practica,created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("aportes_generales")
            .select("id,docente_id,tema,detalle,created_at")
            .order("created_at", { ascending: false }),
        ]);
        if (!dcs.error && dcs.data) setDocentes(dcs.data as Docente[]);
        if (!asigs.error && asigs.data) setAsignaturas(asigs.data as Asignatura[]);
        if (!pp.error && pp.data) setPlan(pp.data as PropuestaPlan[]);
        if (!po.error && po.data) setOptativas(po.data as PropuestaOptativa[]);
        if (!ag.error && ag.data) setAportes(ag.data as AporteGeneral[]);
        
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Propuestas recibidas</h1>
          <p className="mt-2 text-sm">Listado general de Plan, Optativas y Aportes</p>
        </section>

        {loading && (
          <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-700">
            Cargando información...
          </div>
        )}

        {!loading && (
          <div className="mt-6 space-y-8">
            <section className="rounded-xl bg-white p-6 text-zinc-900 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Propuestas del Plan</h2>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">{plan.length}</span>
              </div>
              <div className="mt-4 space-y-4">
                {plan.map((p) => {
                  const docente = docentesMap[p.docente_id] || "";
                  const asignaturaNombre = p.asignatura_id ? asigMap[p.asignatura_id] || "" : p.nombre_asignatura || "";
                  return (
                    <article
                      key={p.id}
                      className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100"
                      onClick={() => router.push(`/propuestas/${p.id}`)}
                    >
                      <div className="text-sm text-zinc-600">{fmtFecha(p.created_at)}</div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-zinc-500">Docente</p>
                          <p className="text-sm font-medium">{docente}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Asignatura</p>
                          <p className="text-sm font-medium">{asignaturaNombre}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 text-zinc-900 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Propuestas Optativas</h2>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">{optativas.length}</span>
              </div>
              <div className="mt-4 space-y-4">
                {optativas.map((o) => (
                  <article
                    key={o.id}
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100"
                    onClick={() => router.push(`/propuestas/optativa/${o.id}`)}
                  >
                    <div className="text-sm text-zinc-600">{fmtFecha(o.created_at)}</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-zinc-500">Docente</p>
                        <p className="text-sm font-medium">{docentesMap[o.docente_id] || ""}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Asignatura</p>
                        <p className="text-sm font-medium">{o.asignatura || ""}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 text-zinc-900 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Aportes generales</h2>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">{aportes.length}</span>
              </div>
              <div className="mt-4 space-y-4">
                {aportes.map((a) => (
                  <article
                    key={a.id}
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100"
                    onClick={() => router.push(`/propuestas/aporte/${a.id}`)}
                  >
                    <div className="text-sm text-zinc-600">{fmtFecha(a.created_at)}</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-zinc-500">Docente</p>
                        <p className="text-sm font-medium">{docentesMap[a.docente_id] || ""}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Tema</p>
                        <p className="text-sm font-medium">{a.tema || ""}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}