"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Optativa = {
  asignatura: string;
  objetivos: string;
  contenidosMinimos: string;
  formacionPractica: string;
};

export default function NuevaOptativaPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [o, setO] = useState<Optativa>({ asignatura: "", objetivos: "", contenidosMinimos: "", formacionPractica: "" });
  const [errores, setErrores] = useState<{ docente?: { nombre?: string; apellido?: string }; optativa?: { asignatura?: string } }>({});
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    const errs: typeof errores = {};
    errs.docente = {};
    errs.optativa = {};
    if (!nombre.trim()) errs.docente.nombre = "Nombre requerido";
    if (!apellido.trim()) errs.docente.apellido = "Apellido requerido";
    if (!o.asignatura.trim()) errs.optativa.asignatura = "Ingrese la asignatura optativa";
    const hayErr = Boolean(errs.docente?.nombre || errs.docente?.apellido || errs.optativa?.asignatura);
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
    const { error: optErr } = await supabase.from("propuestas_optativas").insert({
      docente_id: docenteId,
      asignatura: o.asignatura || null,
      objetivos: o.objetivos || null,
      contenidos_minimos: o.contenidosMinimos || null,
      formacion_practica: o.formacionPractica || null,
    });
    if (optErr) {
      alert(optErr.message);
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
            <p className="text-sm text-zinc-800">Enviando propuesta optativa...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Nueva propuesta optativa</h1>
          <p className="mt-2 text-sm">Completa y envía esta propuesta de optativa</p>
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
          <h2 className="text-xl font-semibold">Optativa</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Asignatura (optativa) *</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: Blockchain y Criptomonedas" value={o.asignatura} onChange={(e) => { setO((prev) => ({ ...prev, asignatura: e.target.value })); setErrores((prev) => ({ ...prev, optativa: { asignatura: undefined } })); }} />
              {errores.optativa?.asignatura && <p className="mt-1 text-xs text-red-600">{errores.optativa?.asignatura}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Objetivos</label>
              <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Liste los objetivos de la optativa..." value={o.objetivos} onChange={(e) => setO((prev) => ({ ...prev, objetivos: e.target.value }))} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Contenidos mínimos</label>
              <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa los contenidos mínimos de la optativa..." value={o.contenidosMinimos} onChange={(e) => setO((prev) => ({ ...prev, contenidosMinimos: e.target.value }))} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Formación práctica</label>
              <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa las actividades de formación práctica de la optativa..." value={o.formacionPractica} onChange={(e) => setO((prev) => ({ ...prev, formacionPractica: e.target.value }))} />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/")}>Cancelar</button>
            <button className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar propuesta optativa"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}