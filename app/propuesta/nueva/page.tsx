"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Propuesta = {
  asignatura: string;
  nombreAsignatura: string;
  anio: string;
  regimen: string;
  horasSemanales: string;
  horasTotales: string;
  correlativasRegularizadasIds: number[];
  correlativasAprobadasIds: number[];
  competenciasGenericas: string[];
  competenciasEspecificas: string[];
  objetivos: string;
  contenidosMinimos: string;
  formacionPractica: string;
  horasFormacionPractica: string;
  comentarios: string;
};

type AsignaturaDB = {
  id: number;
  nombre: string;
  codigo?: string | null;
  anio?: string | null;
  regimen?: string | null;
  horas_semanales?: string | null;
  horas_totales?: string | null;
  horas_semanales_sincronicas?: string | null;
  horas_totales_sincronicas?: string | null;
  objetivos?: string | null;
  contenidos_minimos?: string | null;
  formacion_practica?: string | null;
  horas_formacion_practica?: string | null;
};

const ANIOS = ["Seleccione...", "1º", "2º", "3º", "4º", "5º"];
const REGIMENES = ["Seleccione...", "Anual", "1º Cuatr.", "2º Cuatr."];

type CompetenciaGenerica = { nombre: string; categoria: string | null; activo: boolean };
type CompetenciaEspecifica = { nombre: string; activo: boolean };

function nuevaPropuesta(): Propuesta {
  return {
    asignatura: "",
    nombreAsignatura: "",
    anio: "",
    regimen: "",
    horasSemanales: "",
    horasTotales: "",
    correlativasRegularizadasIds: [],
    correlativasAprobadasIds: [],
    competenciasGenericas: [],
    competenciasEspecificas: [],
    objetivos: "",
    contenidosMinimos: "",
    formacionPractica: "",
    horasFormacionPractica: "",
    comentarios: "",
  };
}

export default function NuevaPropuestaPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [p, setP] = useState<Propuesta>(nuevaPropuesta());
  const [errores, setErrores] = useState<{ docente?: { nombre?: string; apellido?: string }; propuesta?: { asignatura?: string; competenciasGenericas?: string; competenciasEspecificas?: string } }>({});
  const [enviando, setEnviando] = useState(false);
  const [cargandoAsignatura, setCargandoAsignatura] = useState(false);
  const [compTec, setCompTec] = useState<string[]>([]);
  const [compSoc, setCompSoc] = useState<string[]>([]);
  const [compEsp, setCompEsp] = useState<string[]>([]);

  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const supabase = getSupabaseAnon();
        const { data } = await supabase.from("asignaturas").select("id,nombre").order("nombre");
        setAsignaturas((data as AsignaturaDB[]) || []);
      } catch {}
    };
    const fetchCompetencias = async () => {
      try {
        const supabase = getSupabaseAnon();
        const { data: gen } = await supabase.from("competencias_genericas").select("nombre,categoria,activo").eq("activo", true).order("nombre");
        const items = (gen as CompetenciaGenerica[]) || [];
        setCompTec(items.filter((x) => (x.categoria || "").toLowerCase() === "tecnologicas").map((x) => x.nombre));
        setCompSoc(items.filter((x) => (x.categoria || "").toLowerCase() === "sociales").map((x) => x.nombre));
        const { data: esp } = await supabase.from("competencias_especificas").select("nombre,activo").eq("activo", true).order("nombre");
        setCompEsp(((esp as CompetenciaEspecifica[]) || []).map((x) => x.nombre));
      } catch {}
    };
    fetchAsignaturas();
    fetchCompetencias();
  }, []);

  function normalizarAnio(v: string) {
    const t = v.trim();
    if (t === "1" || t === "1º" || t === "1°") return "1º";
    if (t === "2" || t === "2º" || t === "2°") return "2º";
    if (t === "3" || t === "3º" || t === "3°") return "3º";
    if (t === "4" || t === "4º" || t === "4°") return "4º";
    if (t === "5" || t === "5º" || t === "5°") return "5º";
    return t;
  }

  const rellenarDesdeAsignatura = async (nombreAsig: string) => {
    const n = (nombreAsig || "").trim();
    if (!n) return;
    const supabase = getSupabaseAnon();
    setCargandoAsignatura(true);
    let data: any = null;
    let error: any = null;
    {
      const res = await supabase
        .from("asignaturas")
        .select("id,anio,regimen,horas_semanales_sincronicas,horas_totales_sincronicas,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica")
        .eq("nombre", n)
        .single();
      data = res.data;
      error = res.error;
    }
    if (error) {
      const res = await supabase
        .from("asignaturas")
        .select("id,anio,regimen,horas_semanales,horas_totales,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica")
        .eq("nombre", n)
        .single();
      data = res.data;
      error = res.error;
    }
    if (!error && data) {
      const d = data as AsignaturaDB;
      const { data: corr } = await supabase
        .from("asignatura_correlativas_regularizadas")
        .select("correlativa_id")
        .eq("asignatura_id", d.id);
      const ids = (corr ?? []).map((x: { correlativa_id: number }) => x.correlativa_id);
      const { data: corrApr } = await supabase
        .from("asignatura_correlativas_aprobadas")
        .select("correlativa_id")
        .eq("asignatura_id", d.id);
      const idsAprob = (corrApr ?? []).map((x: { correlativa_id: number }) => x.correlativa_id);
      setP((prev) => ({
        ...prev,
        anio: normalizarAnio(d.anio || ""),
        regimen: d.regimen || "",
        horasSemanales: d.horas_semanales_sincronicas ?? d.horas_semanales ?? "",
        horasTotales: d.horas_totales_sincronicas ?? d.horas_totales ?? "",
        correlativasRegularizadasIds: ids,
        correlativasAprobadasIds: idsAprob,
        objetivos: d.objetivos || "",
        contenidosMinimos: d.contenidos_minimos || "",
        formacionPractica: d.formacion_practica || "",
        horasFormacionPractica: d.horas_formacion_practica || "",
      }));
    }
    setCargandoAsignatura(false);
  };

  const toggleCheck = (campo: "competenciasGenericas" | "competenciasEspecificas", item: string) => {
    setP((prev) => {
      const lista = prev[campo];
      const existe = lista.includes(item);
      const nueva = existe ? lista.filter((x) => x !== item) : [...lista, item];
      return { ...prev, [campo]: nueva } as Propuesta;
    });
  };

  const enviar = async () => {
    const errs: typeof errores = {};
    errs.docente = {};
    errs.propuesta = {};
    if (!nombre.trim()) errs.docente.nombre = "Nombre requerido";
    if (!apellido.trim()) errs.docente.apellido = "Apellido requerido";
    const tieneAsignatura = Boolean(p.asignatura.trim());
    if (!tieneAsignatura) errs.propuesta.asignatura = "Seleccione una asignatura";
    if (tieneAsignatura && p.competenciasGenericas.length === 0) errs.propuesta.competenciasGenericas = "Seleccione al menos una competencia genérica";
    const hayErr = Boolean(errs.docente?.nombre || errs.docente?.apellido || errs.propuesta?.asignatura || errs.propuesta?.competenciasGenericas);
    if (hayErr) {
      setErrores(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEnviando(true);
    const supabase = getSupabaseAnon();
    const { data: docenteRow, error: docenteErr } = await supabase.from("docentes").insert({ nombre, apellido }).select().single();
    if (docenteErr) {
      alert(docenteErr.message);
      setEnviando(false);
      return;
    }
    const docenteId = (docenteRow as { id: number }).id;
    const getAsignaturaId = async (nombreA: string) => {
      const n = (nombreA || "").trim();
      if (!n) return null;
      const { data: found } = await supabase.from("asignaturas").select("id").eq("nombre", n).single();
      if (found?.id) return found.id as number;
      const { data: inserted } = await supabase.from("asignaturas").insert({ nombre: n }).select().single();
      return (inserted as { id: number } | null)?.id ?? null;
    };
    const asignaturaId = await getAsignaturaId(p.asignatura);
    let propuestaRow: unknown = null;
    let propuestaErr: { message: string } | null = null;
    {
      const res1 = await supabase
        .from("propuestas_plan")
        .insert({
          docente_id: docenteId,
          asignatura_id: asignaturaId,
          nombre_asignatura: p.nombreAsignatura || null,
          anio: p.anio || null,
          regimen: p.regimen || null,
          horas_semanales: p.horasSemanales || null,
          horas_totales: p.horasTotales || null,
          competencias_genericas: p.competenciasGenericas ?? [],
          competencias_especificas: p.competenciasEspecificas ?? [],
          objetivos: p.objetivos || null,
          contenidos_minimos: p.contenidosMinimos || null,
          formacion_practica: p.formacionPractica || null,
          horas_formacion_practica: p.horasFormacionPractica || null,
          comentarios: p.comentarios || null,
        })
        .select()
        .single();
      propuestaRow = res1.data;
      propuestaErr = res1.error as { message: string } | null;
    }
    if (propuestaErr) {
      const res2 = await supabase
        .from("propuestas_plan")
        .insert({
          docente_id: docenteId,
          asignatura_id: asignaturaId,
          nombre_asignatura: p.nombreAsignatura || null,
          anio: p.anio || null,
          regimen: p.regimen || null,
          horas_semanales_sincronicas: p.horasSemanales || null,
          horas_totales_sincronicas: p.horasTotales || null,
          competencias_genericas: p.competenciasGenericas ?? [],
          competencias_especificas: p.competenciasEspecificas ?? [],
          objetivos: p.objetivos || null,
          contenidos_minimos: p.contenidosMinimos || null,
          formacion_practica: p.formacionPractica || null,
          horas_formacion_practica: p.horasFormacionPractica || null,
          comentarios: p.comentarios || null,
        })
        .select()
        .single();
      propuestaRow = res2.data;
      propuestaErr = res2.error as { message: string } | null;
    }
    if (propuestaErr) {
      alert(propuestaErr.message);
      setEnviando(false);
      return;
    }
    const propuestaId = (propuestaRow as { id: number } | null)?.id ?? null;
    if (propuestaId) {
      for (const corrId of p.correlativasRegularizadasIds) {
        await supabase.from("propuestas_plan_correlativas_regularizadas").insert({ propuesta_plan_id: propuestaId, correlativa_id: corrId });
      }
      for (const corrId of p.correlativasAprobadasIds) {
        await supabase.from("propuestas_plan_correlativas_aprobadas").insert({ propuesta_plan_id: propuestaId, correlativa_id: corrId });
      }

      for (const nombreComp of p.competenciasGenericas) {
        const { data: genRow } = await supabase
          .from("competencias_genericas")
          .select("id")
          .eq("nombre", nombreComp)
          .single();
        let genId = (genRow as { id: number } | null)?.id ?? null;
        if (!genId) {
          const { data: ins } = await supabase.from("competencias_genericas").insert({ nombre: nombreComp }).select().single();
          genId = (ins as { id: number } | null)?.id ?? null;
        }
        if (genId) {
          await supabase.from("propuestas_plan_competencias_genericas").insert({ propuesta_plan_id: propuestaId, competencia_generica_id: genId });
        }
      }

      for (const nombreComp of p.competenciasEspecificas) {
        const { data: espRow } = await supabase
          .from("competencias_especificas")
          .select("id")
          .eq("nombre", nombreComp)
          .single();
        let espId = (espRow as { id: number } | null)?.id ?? null;
        if (!espId) {
          const { data: ins } = await supabase.from("competencias_especificas").insert({ nombre: nombreComp }).select().single();
          espId = (ins as { id: number } | null)?.id ?? null;
        }
        if (espId) {
          await supabase.from("propuestas_plan_competencias_especificas").insert({ propuesta_plan_id: propuestaId, competencia_especifica_id: espId });
        }
      }
    }
    setEnviando(false);
    const d = `${nombre} ${apellido}`.trim();
    router.push(`/gracias?docente=${encodeURIComponent(d)}`);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {enviando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-center shadow">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-zinc-800">Enviando propuesta...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Nueva propuesta</h1>
          <p className="mt-2 text-sm">Completa y envía esta propuesta individual</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Datos del Docente</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre/s *</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese su/s nombre/s" value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, docente: { ...(prev.docente || {}), nombre: undefined } })); }} />
              {errores.docente?.nombre && <p className="mt-1 text-xs text-red-600">{errores.docente?.nombre}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Apellido/s *</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese su/s apellido/s" value={apellido} onChange={(e) => { setApellido(e.target.value); setErrores((prev) => ({ ...prev, docente: { ...(prev.docente || {}), apellido: undefined } })); }} />
              {errores.docente?.apellido && <p className="mt-1 text-xs text-red-600">{errores.docente?.apellido}</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Propuesta</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="text-zinc-900">
              <label className="mb-1 block text-sm font-medium">Asignatura *</label>
              <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.asignatura} onChange={(e) => { const v = e.target.value; setP((prev) => ({ ...prev, asignatura: v })); setErrores((prev) => ({ ...prev, propuesta: { ...(prev.propuesta || {}), asignatura: undefined } })); rellenarDesdeAsignatura(v); }}>
                <option value="">Seleccione...</option>
                {asignaturas.map((a) => (
                  <option key={a.id} value={a.nombre}>{a.nombre}</option>
                ))}
              </select>
              {cargandoAsignatura && (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700" aria-live="polite">
                  <svg className="h-4 w-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  <span>Cargando datos de la asignatura...</span>
                </div>
              )}
              {errores.propuesta?.asignatura && <p className="mt-1 text-xs text-red-600">{errores.propuesta?.asignatura}</p>}
              {!p.asignatura.trim() && (
                <p className="mt-2 text-xs text-zinc-600">Seleccione una asignatura para continuar con los campos de la propuesta.</p>
              )}
            </div>

            {p.asignatura.trim() && (
              <>
                <div className="text-zinc-900">
                  <label className="mb-1 block text-sm font-medium">Nombre de la Asignatura</label>
                  <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese un nuevo nombre si propone cambiarlo" value={p.nombreAsignatura} onChange={(e) => setP((prev) => ({ ...prev, nombreAsignatura: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Año</label>
                    <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.anio} onChange={(e) => setP((prev) => ({ ...prev, anio: e.target.value }))}>
                      {ANIOS.map((a) => (
                        <option key={a} value={a === "Seleccione..." ? "" : a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Régimen</label>
                    <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.regimen} onChange={(e) => setP((prev) => ({ ...prev, regimen: e.target.value }))}>
                      {REGIMENES.map((r) => (
                        <option key={r} value={r === "Seleccione..." ? "" : r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Cantidad de horas semanales sincrónicas</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 4" value={p.horasSemanales} onChange={(e) => setP((prev) => ({ ...prev, horasSemanales: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Cantidad total de horas sincrónicas</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 60" value={p.horasTotales} onChange={(e) => setP((prev) => ({ ...prev, horasTotales: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Asignaturas regularizadas correlativas</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {asignaturas.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.correlativasRegularizadasIds.includes(a.id)}
                          onChange={() => {
                            setP((prev) => {
                              const sel = prev.correlativasRegularizadasIds;
                              const has = sel.includes(a.id);
                              return { ...prev, correlativasRegularizadasIds: has ? sel.filter((y) => y !== a.id) : [...sel, a.id] };
                            });
                          }}
                        />
                        <span>{a.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Asignaturas aprobadas correlativas</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {asignaturas.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.correlativasAprobadasIds.includes(a.id)}
                          onChange={() => {
                            setP((prev) => {
                              const sel = prev.correlativasAprobadasIds;
                              const has = sel.includes(a.id);
                              return { ...prev, correlativasAprobadasIds: has ? sel.filter((y) => y !== a.id) : [...sel, a.id] };
                            });
                          }}
                        />
                        <span>{a.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="my-2 border-zinc-200" />
                <div>
                  <p className="text-sm font-medium">Competencias genéricas (Libro Rojo)</p>
                  <p className="text-xs text-zinc-600">Seleccione al menos una opción</p>
                  <div className="mt-3">
                    <p className="text-sm font-semibold">Competencias tecnológicas</p>
                    <div className="mt-2 space-y-2">
                      {compTec.map((c) => (
                        <label key={c} className="flex items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-1" checked={p.competenciasGenericas.includes(c)} onChange={() => { toggleCheck("competenciasGenericas", c); setErrores((prev) => ({ ...prev, propuesta: { ...(prev.propuesta || {}), competenciasGenericas: undefined } })); }} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold">Competencias sociales, políticas y actitudinales</p>
                    <div className="mt-2 space-y-2">
                      {compSoc.map((c) => (
                        <label key={c} className="flex items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-1" checked={p.competenciasGenericas.includes(c)} onChange={() => { toggleCheck("competenciasGenericas", c); setErrores((prev) => ({ ...prev, propuesta: { ...(prev.propuesta || {}), competenciasGenericas: undefined } })); }} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                    {errores.propuesta?.competenciasGenericas && <p className="mt-2 text-xs text-red-600">{errores.propuesta?.competenciasGenericas}</p>}
                  </div>
                </div>

                <hr className="my-2 border-zinc-200" />
                <div>
                  <p className="text-sm font-medium">Competencias específicas (Libro Rojo)</p>
                  <p className="text-xs text-zinc-600">Opcional</p>
                  <div className="mt-2 space-y-2">
                      {compEsp.map((c) => (
                        <label key={c} className="flex items-start gap-2 text-sm">
                        <input type="checkbox" className="mt-1" checked={p.competenciasEspecificas.includes(c)} onChange={() => { toggleCheck("competenciasEspecificas", c); }} />
                          <span>{c}</span>
                        </label>
                      ))}
                  </div>
                  
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Objetivos</label>
                  <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Redacte los objetivos de la asignatura..." value={p.objetivos} onChange={(e) => setP((prev) => ({ ...prev, objetivos: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Contenidos mínimos</label>
                  <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa los contenidos mínimos de la asignatura..." value={p.contenidosMinimos} onChange={(e) => setP((prev) => ({ ...prev, contenidosMinimos: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Formación práctica</label>
                  <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa las actividades de formación práctica propuestas..." value={p.formacionPractica} onChange={(e) => setP((prev) => ({ ...prev, formacionPractica: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Cantidad de horas de formación práctica</label>
                  <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 30" value={p.horasFormacionPractica} onChange={(e) => setP((prev) => ({ ...prev, horasFormacionPractica: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Comentarios</label>
                  <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Agregue comentarios adicionales sobre esta propuesta" value={p.comentarios} onChange={(e) => setP((prev) => ({ ...prev, comentarios: e.target.value }))} />
                </div>
              </>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/")}>Cancelar</button>
            <button className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar propuesta"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}