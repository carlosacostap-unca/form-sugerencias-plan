"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

const SECCIONES = [
  "Fundamentación de la propuesta",
  "Objetivos del Proyecto",
  "Identificación del Plan de estudio",
  "Anexo I: Plan de Estudio",
  "Anexo II: Núcleos temáticos agrupados por Bloques de Conocimiento, sobre la base de lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación",
  "Anexo III: Criterios de intensidad de la Formación Práctica según lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación",
  "Anexo IV: Programas Sintéticos",
  "Anexo V: Oferta de Asignaturas Optativas",
  "Anexo VI: Equivalencias entre Plan 2026 y Plan 2011",
];

function SugerenciasDocumentoInner() {
  const router = useRouter();
  const params = useSearchParams();
  const qSec = params?.get("seccion") || "";
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const initialSeccion = useMemo(() => {
    const match = SECCIONES.find((s) => s === qSec);
    return match || "";
  }, [qSec]);
  const [seccion, setSeccion] = useState(initialSeccion);
  const [detalle, setDetalle] = useState("");
  const [errores, setErrores] = useState<{ docente?: { nombre?: string; apellido?: string }; sugerencia?: { seccion?: string; detalle?: string } }>({});
  const [enviando, setEnviando] = useState(false);

  const opciones = useMemo(() => SECCIONES, []);

  

  const enviar = async () => {
    const errs: typeof errores = {};
    errs.docente = {};
    errs.sugerencia = {};
    if (!nombre.trim()) errs.docente.nombre = "Nombre requerido";
    if (!apellido.trim()) errs.docente.apellido = "Apellido requerido";
    if (!seccion.trim()) errs.sugerencia.seccion = "Sección requerida";
    if (!detalle.trim()) errs.sugerencia.detalle = "Detalle requerido";
    const hayErr = Boolean(errs.docente?.nombre || errs.docente?.apellido || errs.sugerencia?.seccion || errs.sugerencia?.detalle);
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
    const { error: apErr } = await supabase.from("sugerencias_documento").insert({ docente_id: docenteId, seccion, detalle });
    if (apErr) {
      alert(apErr.message);
      setEnviando(false);
      return;
    }
    setEnviando(false);
    router.push("/gracias");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {enviando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-center shadow">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-zinc-800">Enviando sugerencia...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Nueva sugerencia sobre el documento</h1>
          <p className="mt-2 text-sm">Selecciona la sección y describe tu sugerencia</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Datos del aportante</h2>
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
          <h2 className="text-xl font-semibold">Sugerencia por sección</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Sección *</label>
              <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600" value={seccion} onChange={(e) => { setSeccion(e.target.value); setErrores((prev) => ({ ...prev, sugerencia: { ...(prev.sugerencia || {}), seccion: undefined } })); }}>
                <option value="">Seleccione una sección</option>
                {opciones.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errores.sugerencia?.seccion && <p className="mt-1 text-xs text-red-600">{errores.sugerencia?.seccion}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Detalle de la sugerencia *</label>
              <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa su sugerencia con el mayor detalle posible" value={detalle} onChange={(e) => { setDetalle(e.target.value); setErrores((prev) => ({ ...prev, sugerencia: { ...(prev.sugerencia || {}), detalle: undefined } })); }} />
              {errores.sugerencia?.detalle && <p className="mt-1 text-xs text-red-600">{errores.sugerencia?.detalle}</p>}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/")}>Cancelar</button>
            <button className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar sugerencia"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SugerenciasDocumentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-zinc-100"><div className="mx-auto max-w-5xl px-4 py-10"><div className="rounded-xl border border-zinc-300 bg-white p-6 text-sm text-zinc-700 shadow">Cargando sugerencias…</div></div></div>}>
      <SugerenciasDocumentoInner />
    </Suspense>
  );
}