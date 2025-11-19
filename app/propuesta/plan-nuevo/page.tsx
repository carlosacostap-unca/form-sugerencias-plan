"use client";
import { useEffect, useState } from "react";
import { getSupabaseAnon } from "../../../lib/supabase";

type AsignaturaDB = {
  id: number;
  nombre: string;
  codigo: string | null;
  anio: string | null;
  regimen: string | null;
  horas_semanales_sincronicas: string | null;
  horas_totales_sincronicas: string | null;
  horas_trabajo_independiente_totales: string | null;
  horas_trabajo_totales: string | null;
  coeficiente_horas_trabajo_independiente: string | null;
  objetivos: string | null;
  contenidos_minimos: string | null;
  formacion_practica: string | null;
  horas_formacion_practica: string | null;
  bloque_conocimiento_id: number | null;
  created_at: string;
};

export default function PropuestaNuevoPlanListadoPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
  const [regMap, setRegMap] = useState<Record<number, number[]>>({});
  const [aprMap, setAprMap] = useState<Record<number, number[]>>({});
  const [genMap, setGenMap] = useState<Record<number, number[]>>({});
  const [espMap, setEspMap] = useState<Record<number, number[]>>({});
  const [genNames, setGenNames] = useState<Record<number, string>>({});
  const [espNames, setEspNames] = useState<Record<number, string>>({});
  const [bloqueNames, setBloqueNames] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchAsignaturas = async () => {
      setCargando(true);
      try {
        const supabase = getSupabaseAnon();
        const { data } = await supabase
          .from("asignaturas")
          .select(
            "id,nombre,codigo,anio,regimen,horas_semanales_sincronicas,horas_totales_sincronicas,horas_trabajo_independiente_totales,horas_trabajo_totales,coeficiente_horas_trabajo_independiente,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,bloque_conocimiento_id,created_at"
          )
          .order("nombre");
        setAsignaturas((data as AsignaturaDB[]) || []);
        const [regs, aprs, gens, esps, genTbl, espTbl, bloquesTbl] = await Promise.all([
          supabase.from("asignatura_correlativas_regularizadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_correlativas_aprobadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_competencias_genericas").select("asignatura_id,competencia_generica_id"),
          supabase.from("asignatura_competencias_especificas").select("asignatura_id,competencia_especifica_id"),
          supabase.from("competencias_genericas").select("id,nombre").order("nombre"),
          supabase.from("competencias_especificas").select("id,nombre").order("nombre"),
          supabase.from("bloques_conocimiento").select("id,nombre").order("nombre"),
        ]);
        const rMap: Record<number, number[]> = {};
        for (const row of (regs.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
          const arr = rMap[row.asignatura_id] || [];
          rMap[row.asignatura_id] = [...arr, row.correlativa_id];
        }
        const aMap: Record<number, number[]> = {};
        for (const row of (aprs.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
          const arr = aMap[row.asignatura_id] || [];
          aMap[row.asignatura_id] = [...arr, row.correlativa_id];
        }
        const gMap: Record<number, number[]> = {};
        for (const row of (gens.data ?? []) as { asignatura_id: number; competencia_generica_id: number }[]) {
          const arr = gMap[row.asignatura_id] || [];
          gMap[row.asignatura_id] = [...arr, row.competencia_generica_id];
        }
        const eMap: Record<number, number[]> = {};
        for (const row of (esps.data ?? []) as { asignatura_id: number; competencia_especifica_id: number }[]) {
          const arr = eMap[row.asignatura_id] || [];
          eMap[row.asignatura_id] = [...arr, row.competencia_especifica_id];
        }
        const gNames: Record<number, string> = {};
        for (const row of (genTbl.data ?? []) as { id: number; nombre: string }[]) gNames[row.id] = row.nombre;
        const eNames: Record<number, string> = {};
        for (const row of (espTbl.data ?? []) as { id: number; nombre: string }[]) eNames[row.id] = row.nombre;
        const bNames: Record<number, string> = {};
        for (const row of (bloquesTbl.data ?? []) as { id: number; nombre: string }[]) bNames[row.id] = row.nombre;
        setRegMap(rMap);
        setAprMap(aMap);
        setGenMap(gMap);
        setEspMap(eMap);
        setGenNames(gNames);
        setEspNames(eNames);
        setBloqueNames(bNames);
      } catch {
      } finally {
        setCargando(false);
      }
    };
    fetchAsignaturas();
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Propuesta de Nuevo Plan de Estudio</h1>
          <p className="mt-2 text-sm">Listado no editable de asignaturas existentes</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo 0: Plan de Estudios Detallado</h2>
          <p className="mt-1 text-sm text-zinc-600">Listado de asignaturas</p>
          {cargando ? (
            <div className="py-10 text-center text-sm text-zinc-600">Cargando asignaturas...</div>
          ) : asignaturas.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-600">No hay asignaturas registradas</div>
          ) : (
            <>
              {["1º", "2º", "3º", "4º", "5º", ""].map((anioKey) => {
                const grupo = asignaturas.filter((a) => (a.anio || "") === anioKey);
                if (grupo.length === 0) return null;
                const titulo = anioKey ? `Año ${anioKey}` : "Sin año";
                return (
                  <section id={`anio-${anioKey || "sin"}`} key={anioKey || "sin-ano"} className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{titulo}</h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700">{grupo.length} asignatura{grupo.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[...grupo]
                        .sort((a, b) => {
                          const ra = (a.regimen || "").toLowerCase();
                          const rb = (b.regimen || "").toLowerCase();
                          const order = (r: string) => {
                            if (r.includes("anual")) return 0;
                            if (r.includes("1º") || r.includes("1°") || r.includes("1er") || r.includes("1er cuatr") || r.includes("1º cuatr")) return 1;
                            if (r.includes("2º") || r.includes("2°") || r.includes("2do") || r.includes("2do cuatr") || r.includes("2º cuatr")) return 2;
                            return 3;
                          };
                          const oa = order(ra);
                          const ob = order(rb);
                          if (oa !== ob) return oa - ob;
                          return (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" });
                        })
                        .map((a) => (
                        <div key={a.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                          {(() => {
                            const abierto = expandidos[a.id] ?? false;
                            return (
                              <>
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="text-base font-semibold text-zinc-900">{a.nombre || ""}</div>
                                  <div className="flex items-center gap-2">
                                    {a.regimen && <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">Régimen {a.regimen}</span>}
                                    {a.bloque_conocimiento_id && (
                                      <span className="rounded-full bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700">{bloqueNames[a.bloque_conocimiento_id] || "Bloque"}</span>
                                    )}
                                    <button
                                      className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                      onClick={() => setExpandidos((prev) => ({ ...prev, [a.id]: !abierto }))}
                                      aria-expanded={abierto}
                                    >
                                      {abierto ? "Ocultar" : "Mostrar"}
                                    </button>
                                  </div>
                                </div>
                                {!abierto ? null : (
                                  <>
                                    <div className="mb-2 flex items-center gap-2">
                                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Año {a.anio || "-"}</span>
                                      <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">ID {String(a.id)}</span>
                                    </div>
                                    <dl className="grid grid-cols-2 gap-4">
                                      <div>
                                        <dt className="text-xs text-zinc-500">Cantidad de horas semanales sincrónicas</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.horas_semanales_sincronicas || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Código</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.codigo || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Bloque de conocimiento</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.bloque_conocimiento_id ? bloqueNames[a.bloque_conocimiento_id] || "" : ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Cantidad total de horas sincrónicas</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.horas_totales_sincronicas || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Coeficiente horas trabajo independiente</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.coeficiente_horas_trabajo_independiente || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Total horas de trabajo independiente</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.horas_trabajo_independiente_totales || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Cantidad total de horas de trabajo</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.horas_trabajo_totales || ""}</dd>
                                      </div>
                                      <div>
                                        <dt className="text-xs text-zinc-500">Fecha de creación</dt>
                                        <dd className="mt-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{new Date(a.created_at).toLocaleDateString()}</dd>
                                      </div>
                                    </dl>
                                    <div className="mt-3">
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Objetivos</div>
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-900 whitespace-pre-line">{a.objetivos || ""}</div>
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Contenidos mínimos</div>
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-900 whitespace-pre-line">{a.contenidos_minimos || ""}</div>
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Formación práctica</div>
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-900 whitespace-pre-line">{a.formacion_practica || ""}</div>
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Correlativas regularizadas</div>
                                        <div className="flex flex-wrap gap-2">
                                          {(regMap[a.id] || []).map((cid) => {
                                            const corr = asignaturas.find((x) => x.id === cid);
                                            return <span key={`r-${a.id}-${cid}`} className="rounded-full bg-violet-50 px-2 py-1 text-xs text-violet-700">{corr?.nombre || String(cid)}</span>;
                                          })}
                                          {(regMap[a.id] || []).length === 0 && <span className="text-xs text-zinc-500">—</span>}
                                        </div>
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Correlativas aprobadas</div>
                                        <div className="flex flex-wrap gap-2">
                                          {(aprMap[a.id] || []).map((cid) => {
                                            const corr = asignaturas.find((x) => x.id === cid);
                                            return <span key={`a-${a.id}-${cid}`} className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{corr?.nombre || String(cid)}</span>;
                                          })}
                                          {(aprMap[a.id] || []).length === 0 && <span className="text-xs text-zinc-500">—</span>}
                                        </div>
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Competencias genéricas</div>
                                        <div className="flex flex-wrap gap-2">
                                          {(genMap[a.id] || []).map((gid) => (
                                            <span key={`g-${a.id}-${gid}`} className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{genNames[gid] || String(gid)}</span>
                                          ))}
                                          {(genMap[a.id] || []).length === 0 && <span className="text-xs text-zinc-500">—</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="mb-1 text-xs text-zinc-500">Competencias específicas</div>
                                        <div className="flex flex-wrap gap-2">
                                          {(espMap[a.id] || []).map((eid) => (
                                            <span key={`e-${a.id}-${eid}`} className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">{espNames[eid] || String(eid)}</span>
                                          ))}
                                          {(espMap[a.id] || []).length === 0 && <span className="text-xs text-zinc-500">—</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="mb-1 text-xs text-zinc-500">Horas formación práctica</div>
                                        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900">{a.horas_formacion_practica || ""}</div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </section>
      </div>
    </div>
  );
}