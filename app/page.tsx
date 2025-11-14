"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../lib/supabase";

type Propuesta = {
  id: number;
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

type Optativa = {
  id: number;
  asignatura: string;
  objetivos: string;
  contenidosMinimos: string;
  formacionPractica: string;
};

type Aporte = {
  id: number;
  tema: string;
  detalle: string;
};

type AsignaturaDB = {
  id: number;
  nombre: string;
  anio?: string | null;
  regimen?: string | null;
  horas_semanales?: string | null;
  horas_totales?: string | null;
  correlativas_regularizadas?: string | null;
  correlativas_aprobadas?: string | null;
  objetivos?: string | null;
  contenidos_minimos?: string | null;
  formacion_practica?: string | null;
  horas_formacion_practica?: string | null;
};

const ANIOS = ["Seleccione...", "1º", "2º", "3º", "4º", "5º"];
const REGIMENES = ["Seleccione...", "Anual", "1º Cuatr.", "2º Cuatr."];

const COMP_TEC = [
  "Identificar, formular y resolver problemas de ingeniería.",
  "Concebir, diseñar y desarrollar proyectos de ingeniería.",
  "Gestionar, planificar, ejecutar y controlar proyectos de ingeniería.",
  "Utilizar de manera efectiva las técnicas y herramientas de aplicación en la ingeniería.",
  "Contribuir a la generación de desarrollos tecnológicos y/o innovaciones tecnológicas.",
];

const COMP_SOC = [
  "Desempeñarse de manera efectiva en equipos de trabajo.",
  "Comunicarse con efectividad.",
  "Actuar con ética, responsabilidad profesional y compromiso social, considerando el impacto económico, social y ambiental de su actividad en el contexto local y global.",
  "Aprender en forma continua y autónoma.",
  "Actuar con espíritu emprendedor.",
];

const COMP_ESP = [
  "1.1 Especificar, proyectar y desarrollar sistemas de información.",
  "1.2 Especificar, proyectar y desarrollar sistemas de comunicación de datos.",
  "1.3 Especificar, proyectar y desarrollar software.",
  "2.1 Proyectar y dirigir lo referido a seguridad informática.",
  "3.1 Establecer métricas y normas de calidad de software.",
  "4.1 Certificar el funcionamiento, condición de uso o estado de sistemas de información, sistemas de comunicación de datos, software, seguridad informática y calidad de software.",
  "5.1 Dirigir y controlar la implementación, operación y mantenimiento de sistemas de información, sistemas de comunicación de datos, software, seguridad informática y calidad de software.",
];

function nuevaPropuesta(id: number): Propuesta {
  return {
    id,
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

function nuevaOptativa(id: number): Optativa {
  return {
    id,
    asignatura: "",
    objetivos: "",
    contenidosMinimos: "",
    formacionPractica: "",
  };
}

export default function Home() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [optativas, setOptativas] = useState<Optativa[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [errores, setErrores] = useState<{ docente: { nombre?: string; apellido?: string }; propuestas: Record<number, { asignatura?: string; competenciasGenericas?: string; competenciasEspecificas?: string }>; optativas: Record<number, { asignatura?: string }>; aportes: Record<number, { detalle?: string }> }>({ docente: {}, propuestas: {}, optativas: {}, aportes: {} });
  const [enviando, setEnviando] = useState(false);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const supabase = getSupabaseAnon();
        const { data, error } = await supabase
          .from("asignaturas")
          .select("id,nombre")
          .order("nombre");
        if (!error && data) setAsignaturas(data as AsignaturaDB[]);
      } catch {}
    };
    fetchAsignaturas();
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

  const rellenarDesdeAsignatura = async (propuestaId: number, nombreAsig: string) => {
    const n = (nombreAsig || "").trim();
    if (!n) return;
    const supabase = getSupabaseAnon();
    setCargandoAsignaturas((prev) => ({ ...prev, [propuestaId]: true }));
    const { data, error } = await supabase
      .from("asignaturas")
      .select("id,anio,regimen,horas_semanales,horas_totales,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica")
      .eq("nombre", n)
      .single();
    if (error) return;
    const d = data as AsignaturaDB | null;
    if (!d) return;
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
    setPropuestas((prev) =>
      prev.map((p) => {
        if (p.id !== propuestaId) return p;
        return {
          ...p,
          anio: normalizarAnio(d.anio || ""),
          regimen: d.regimen || "",
          horasSemanales: d.horas_semanales || "",
          horasTotales: d.horas_totales || "",
          correlativasRegularizadasIds: ids,
          correlativasAprobadasIds: idsAprob,
          objetivos: d.objetivos || "",
          contenidosMinimos: d.contenidos_minimos || "",
          formacionPractica: d.formacion_practica || "",
          horasFormacionPractica: d.horas_formacion_practica || "",
        };
      })
    );
    setCargandoAsignaturas((prev) => {
      const next = { ...prev };
      delete next[propuestaId];
      return next;
    });
  };

  const agregarPropuesta = () => {
    setPropuestas((prev) => [...prev, nuevaPropuesta(prev.length + 1)]);
  };

  const eliminarPropuesta = (id: number) => {
    setPropuestas((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarCampo = (id: number, campo: keyof Propuesta, valor: string) => {
    setPropuestas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  const agregarOptativa = () => {
    setOptativas((prev) => [...prev, nuevaOptativa(prev.length + 1)]);
  };

  const eliminarOptativa = (id: number) => {
    setOptativas((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarOptativa = (id: number, campo: keyof Optativa, valor: string) => {
    setOptativas((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const agregarAporte = () => {
    setAportes((prev) => [...prev, { id: prev.length + 1, tema: "", detalle: "" }]);
  };

  const eliminarAporte = (id: number) => {
    setAportes((prev) => prev.filter((p) => p.id !== id));
  };

  const actualizarAporte = (id: number, campo: keyof Aporte, valor: string) => {
    setAportes((prev) => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const enviarTodo = async () => {
    const nuevosErrores: typeof errores = { docente: {}, propuestas: {}, optativas: {}, aportes: {} };
    if (!nombre.trim()) nuevosErrores.docente.nombre = "Nombre requerido";
    if (!apellido.trim()) nuevosErrores.docente.apellido = "Apellido requerido";
    for (const p of propuestas) {
      const e: { asignatura?: string; competenciasGenericas?: string; competenciasEspecificas?: string } = {};
      if (!p.asignatura.trim()) e.asignatura = "Seleccione una asignatura";
      if ((p.competenciasGenericas?.length ?? 0) === 0) e.competenciasGenericas = "Seleccione al menos una competencia genérica";
      if ((p.competenciasEspecificas?.length ?? 0) === 0) e.competenciasEspecificas = "Seleccione al menos una competencia específica";
      if (Object.keys(e).length) nuevosErrores.propuestas[p.id] = e;
    }
    for (const o of optativas) {
      if (!o.asignatura.trim()) nuevosErrores.optativas[o.id] = { asignatura: "Ingrese la asignatura optativa" };
    }
    for (const a of aportes) {
      if (!a.detalle.trim()) nuevosErrores.aportes[a.id] = { detalle: "Detalle requerido" };
    }
    const hayErrores = Boolean(nuevosErrores.docente.nombre || nuevosErrores.docente.apellido || Object.keys(nuevosErrores.propuestas).length || Object.keys(nuevosErrores.optativas).length || Object.keys(nuevosErrores.aportes).length);
    if (hayErrores) {
      setErrores(nuevosErrores);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEnviando(true);
    const supabase = getSupabaseAnon();
    const erroresEnvio: string[] = [];
    const { data: docenteRow, error: docenteErr } = await supabase
      .from("docentes")
      .insert({ nombre, apellido })
      .select()
      .single();
    if (docenteErr) {
      alert(docenteErr.message);
      setEnviando(false);
      return;
    }
    const docenteId = (docenteRow as { id: number }).id;

    const getAsignaturaId = async (nombreA: string) => {
      const n = (nombreA || "").trim();
      if (!n) return null;
      const { data: found } = await supabase
        .from("asignaturas")
        .select("id")
        .eq("nombre", n)
        .single();
      if (found?.id) return found.id as number;
      const { data: inserted } = await supabase
        .from("asignaturas")
        .insert({ nombre: n })
        .select()
        .single();
      return (inserted as { id: number } | null)?.id ?? null;
    };

    for (const p of propuestas) {
      const asignaturaId = await getAsignaturaId(p.asignatura);
      const { data: propuestaRow, error: propuestaErr } = await supabase.from("propuestas_plan").insert({
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
      }).select().single();
      if (propuestaErr) {
        erroresEnvio.push(`Propuesta plan #${p.id}: ${propuestaErr.message}`);
        continue;
      }
      const propuestaId = (propuestaRow as { id: number } | null)?.id ?? null;
      if (propuestaId) {
        for (const corrId of p.correlativasRegularizadasIds) {
          await supabase.from("propuestas_plan_correlativas_regularizadas").insert({ propuesta_plan_id: propuestaId, correlativa_id: corrId });
        }
        for (const corrId of p.correlativasAprobadasIds) {
          await supabase.from("propuestas_plan_correlativas_aprobadas").insert({ propuesta_plan_id: propuestaId, correlativa_id: corrId });
        }
      }
    }

    for (const o of optativas) {
      const { error: optErr } = await supabase.from("propuestas_optativas").insert({
        docente_id: docenteId,
        asignatura: o.asignatura || null,
        objetivos: o.objetivos || null,
        contenidos_minimos: o.contenidosMinimos || null,
        formacion_practica: o.formacionPractica || null,
      });
      if (optErr) erroresEnvio.push(`Optativa #${o.id}: ${optErr.message}`);
    }

    for (const a of aportes) {
      const { error: apErr } = await supabase.from("aportes_generales").insert({
        docente_id: docenteId,
        tema: a.tema || null,
        detalle: a.detalle || null,
      });
      if (apErr) erroresEnvio.push(`Aporte #${a.id}: ${apErr.message}`);
    }
    setEnviando(false);
    if (erroresEnvio.length) {
      alert(erroresEnvio.join("\n"));
      return;
    }
    const d = `${nombre} ${apellido}`.trim();
    setNombre("");
    setApellido("");
    setPropuestas([]);
    setOptativas([]);
    setAportes([]);
    setErrores({ docente: {}, propuestas: {}, optativas: {}, aportes: {} });
    setCargandoAsignaturas({});
    router.push(`/gracias?docente=${encodeURIComponent(d)}`);
  };

  const toggleCheck = (id: number, campo: "competenciasGenericas" | "competenciasEspecificas", item: string) => {
    setPropuestas((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const lista = p[campo];
        const existe = lista.includes(item);
        const nueva = existe ? lista.filter((x) => x !== item) : [...lista, item];
        return { ...p, [campo]: nueva } as Propuesta;
      })
    );
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {enviando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-center shadow">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-zinc-800">Enviando propuestas...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Formulario de Propuestas - Plan de Estudios 2026</h1>
          <p className="mt-2 text-sm">Ingeniería en Informática - Facultad de Tecnología y Ciencias Aplicadas - UNCA</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Datos del Docente</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre/s *</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese su/s nombre/s" value={nombre} onChange={(e) => { setNombre(e.target.value); setErrores((prev) => ({ ...prev, docente: { ...prev.docente, nombre: undefined } })); }} />
              {errores.docente.nombre && <p className="mt-1 text-xs text-red-600">{errores.docente.nombre}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Apellido/s *</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese su/s apellido/s" value={apellido} onChange={(e) => { setApellido(e.target.value); setErrores((prev) => ({ ...prev, docente: { ...prev.docente, apellido: undefined } })); }} />
              {errores.docente.apellido && <p className="mt-1 text-xs text-red-600">{errores.docente.apellido}</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">1. Plan de Estudio y Programas Sintéticos</h2>
          <p className="mt-1 text-sm text-zinc-600">Propuestas sobre estructura general, contenidos, correlatividades y carga horaria.</p>
          <hr className="my-4 border-zinc-200" />
          <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 text-sm text-zinc-900">
            Para cada asignatura, presente una propuesta tomando como referencia la elaborada por la Comisión de Seguimiento Curricular. Complete únicamente los campos en los que propone modificaciones. Si sugiere un ajuste concreto, escriba el texto final tal como, a su criterio, debería quedar.
          </div>

          <div className="mt-6 space-y-6">
            {propuestas.length === 0 && (
              <p className="text-center text-sm text-zinc-600">No hay propuestas agregadas. Haga clic en Agregar Propuesta para comenzar.</p>
            )}

            {propuestas.map((p, idx) => (
              <div key={p.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">Propuesta #{idx + 1}</span>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => eliminarPropuesta(p.id)}>Eliminar</button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="text-zinc-900">
                    <label className="mb-1 block text-sm font-medium">Asignatura *</label>
                    <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.asignatura} onChange={(e) => { const v = e.target.value; actualizarCampo(p.id, "asignatura", v); setErrores((prev) => ({ ...prev, propuestas: { ...prev.propuestas, [p.id]: { ...(prev.propuestas[p.id] || {}), asignatura: undefined } } })); rellenarDesdeAsignatura(p.id, v); }}>
                      <option value="">Seleccione...</option>
                      {asignaturas.map((a) => (
                        <option key={a.id} value={a.nombre}>{a.nombre}</option>
                      ))}
                </select>
                    {cargandoAsignaturas[p.id] && (
                      <div className="mt-2 flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700" aria-live="polite">
                        <svg className="h-4 w-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                        </svg>
                        <span>Cargando datos de la asignatura...</span>
                      </div>
                    )}
                    {errores.propuestas[p.id]?.asignatura && <p className="mt-1 text-xs text-red-600">{errores.propuestas[p.id]?.asignatura}</p>}
              </div>

                  <div className="text-zinc-900">
                    <label className="mb-1 block text-sm font-medium">Nombre de la Asignatura</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ingrese un nuevo nombre si propone cambiarlo" value={p.nombreAsignatura} onChange={(e) => actualizarCampo(p.id, "nombreAsignatura", e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Año</label>
                      <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.anio} onChange={(e) => actualizarCampo(p.id, "anio", e.target.value)}>
                        {ANIOS.map((a) => (
                          <option key={a} value={a === "Seleccione..." ? "" : a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Régimen</label>
                      <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={p.regimen} onChange={(e) => actualizarCampo(p.id, "regimen", e.target.value)}>
                        {REGIMENES.map((r) => (
                          <option key={r} value={r === "Seleccione..." ? "" : r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Cantidad de horas semanales sincrónicas</label>
                      <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 4" value={p.horasSemanales} onChange={(e) => actualizarCampo(p.id, "horasSemanales", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Cantidad total de horas sincrónicas</label>
                      <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 60" value={p.horasTotales} onChange={(e) => actualizarCampo(p.id, "horasTotales", e.target.value)} />
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
                              setPropuestas((prev) => prev.map((x) => {
                                if (x.id !== p.id) return x;
                                const sel = x.correlativasRegularizadasIds;
                                const has = sel.includes(a.id);
                                return { ...x, correlativasRegularizadasIds: has ? sel.filter((y) => y !== a.id) : [...sel, a.id] };
                              }));
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
                              setPropuestas((prev) => prev.map((x) => {
                                if (x.id !== p.id) return x;
                                const sel = x.correlativasAprobadasIds;
                                const has = sel.includes(a.id);
                                return { ...x, correlativasAprobadasIds: has ? sel.filter((y) => y !== a.id) : [...sel, a.id] };
                              }));
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
                        {COMP_TEC.map((c) => (
                          <label key={c} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-1" checked={p.competenciasGenericas.includes(c)} onChange={() => { toggleCheck(p.id, "competenciasGenericas", c); setErrores((prev) => ({ ...prev, propuestas: { ...prev.propuestas, [p.id]: { ...(prev.propuestas[p.id] || {}), competenciasGenericas: undefined } } })); }} />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                      {errores.propuestas[p.id]?.competenciasGenericas && <p className="mt-2 text-xs text-red-600">{errores.propuestas[p.id]?.competenciasGenericas}</p>}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold">Competencias sociales, políticas y actitudinales</p>
                      <div className="mt-2 space-y-2">
                        {COMP_SOC.map((c) => (
                          <label key={c} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" className="mt-1" checked={p.competenciasGenericas.includes(c)} onChange={() => { toggleCheck(p.id, "competenciasGenericas", c); setErrores((prev) => ({ ...prev, propuestas: { ...prev.propuestas, [p.id]: { ...(prev.propuestas[p.id] || {}), competenciasGenericas: undefined } } })); }} />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="my-2 border-zinc-200" />
                  <div>
                    <p className="text-sm font-medium">Competencias específicas (Libro Rojo)</p>
                    <p className="text-xs text-zinc-600">Seleccione al menos una opción</p>
                    <div className="mt-2 space-y-2">
                      {COMP_ESP.map((c) => (
                        <label key={c} className="flex items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-1" checked={p.competenciasEspecificas.includes(c)} onChange={() => { toggleCheck(p.id, "competenciasEspecificas", c); setErrores((prev) => ({ ...prev, propuestas: { ...prev.propuestas, [p.id]: { ...(prev.propuestas[p.id] || {}), competenciasEspecificas: undefined } } })); }} />
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>
                    {errores.propuestas[p.id]?.competenciasEspecificas && <p className="mt-2 text-xs text-red-600">{errores.propuestas[p.id]?.competenciasEspecificas}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Objetivos</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Redacte los objetivos de la asignatura..." value={p.objetivos} onChange={(e) => actualizarCampo(p.id, "objetivos", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Contenidos mínimos</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa los contenidos mínimos de la asignatura..." value={p.contenidosMinimos} onChange={(e) => actualizarCampo(p.id, "contenidosMinimos", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Formación práctica</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa las actividades de formación práctica propuestas..." value={p.formacionPractica} onChange={(e) => actualizarCampo(p.id, "formacionPractica", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Cantidad de horas de formación práctica</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: 30" value={p.horasFormacionPractica} onChange={(e) => actualizarCampo(p.id, "horasFormacionPractica", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Comentarios</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Agregue comentarios adicionales sobre esta propuesta" value={p.comentarios} onChange={(e) => actualizarCampo(p.id, "comentarios", e.target.value)} />
                  </div>
                </div>

                <div className="mt-4">
                  <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarPropuesta}>Agregar Propuesta</button>
                </div>
              </div>
            ))}
          </div>

          {propuestas.length === 0 && (
            <div className="mt-6">
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarPropuesta}>Agregar Propuesta</button>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">2. Asignaturas Optativas</h2>
          <p className="mt-1 text-sm text-zinc-600">Propuestas de nuevas optativas o modificaciones a las existentes.</p>
          <hr className="my-4 border-zinc-200" />
          <div className="rounded-md border-l-4 border-blue-500 bg-blue-50 p-4 text-sm text-zinc-900">
            Para cada optativa, presente una propuesta tomando como referencia las propuestas por la Comisión de Seguimiento Curricular. Complete únicamente los campos en los que propone modificaciones o aportes. Si sugiere un ajuste concreto, escriba el texto final tal como, a su criterio, debería quedar. Puede sugerir modificaciones a asignaturas optativas propuestas por la Comisión, o sugerir nuevas asignaturas optativas.
          </div>

          <div className="mt-6 space-y-6">
            {optativas.length === 0 && (
              <p className="text-center text-sm text-zinc-600">No hay propuestas agregadas. Haga clic en Agregar Propuesta para comenzar.</p>
            )}

            {optativas.map((o, idx) => (
              <div key={o.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">Propuesta #{idx + 1}</span>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => eliminarOptativa(o.id)}>Eliminar</button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Asignatura (optativa) *</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: Blockchain y Criptomonedas" value={o.asignatura} onChange={(e) => { actualizarOptativa(o.id, "asignatura", e.target.value); setErrores((prev) => ({ ...prev, optativas: { ...prev.optativas, [o.id]: { asignatura: undefined } } })); }} />
                    {errores.optativas[o.id]?.asignatura && <p className="mt-1 text-xs text-red-600">{errores.optativas[o.id]?.asignatura}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Objetivos</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Liste los objetivos de la optativa..." value={o.objetivos} onChange={(e) => actualizarOptativa(o.id, "objetivos", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Contenidos mínimos</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa los contenidos mínimos de la optativa..." value={o.contenidosMinimos} onChange={(e) => actualizarOptativa(o.id, "contenidosMinimos", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Formación práctica</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa las actividades de formación práctica de la optativa..." value={o.formacionPractica} onChange={(e) => actualizarOptativa(o.id, "formacionPractica", e.target.value)} />
                  </div>
                </div>

                <div className="mt-4">
                  <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarOptativa}>Agregar Propuesta</button>
                </div>
              </div>
            ))}
          </div>

          {optativas.length === 0 && (
            <div className="mt-6">
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarOptativa}>Agregar Propuesta</button>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">3. Otros comentarios, sugerencias y/o aportes</h2>
          <p className="mt-1 text-sm text-zinc-600">Espacio para aportes generales no contemplados en secciones anteriores</p>
          <hr className="my-4 border-zinc-200" />

          <div className="mt-6 space-y-6">
            {aportes.length === 0 && (
              <p className="text-center text-sm text-zinc-600">No hay propuestas agregadas. Haga clic en Agregar Propuesta para comenzar.</p>
            )}

            {aportes.map((a, idx) => (
              <div key={a.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">Propuesta #{idx + 1}</span>
                  <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => eliminarAporte(a.id)}>Eliminar</button>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Tema</label>
                    <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: Coordinación entre cátedras, evaluación, recursos, etc." value={a.tema} onChange={(e) => actualizarAporte(a.id, "tema", e.target.value)} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Comentarios / sugerencias / aportes *</label>
                    <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa su aporte o sugerencia con el mayor detalle posible" value={a.detalle} onChange={(e) => { actualizarAporte(a.id, "detalle", e.target.value); setErrores((prev) => ({ ...prev, aportes: { ...prev.aportes, [a.id]: { detalle: undefined } } })); }} />
                    {errores.aportes[a.id]?.detalle && <p className="mt-1 text-xs text-red-600">{errores.aportes[a.id]?.detalle}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarAporte}>Agregar Propuesta</button>
                </div>
              </div>
            ))}
          </div>

          {aportes.length === 0 && (
            <div className="mt-6">
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={agregarAporte}>Agregar Propuesta</button>
            </div>
          )}
        </section>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-12">
        <hr className="my-6 border-zinc-200" />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={enviarTodo}
            className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={enviando || (propuestas.length === 0 && optativas.length === 0 && aportes.length === 0)}
          >
            {enviando ? "Enviando..." : "Enviar Todas las Propuestas"}
          </button>
        </div>
      </div>
    </div>
  );
}
