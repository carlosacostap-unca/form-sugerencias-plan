"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

export default function NuevoAportePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tema, setTema] = useState("");
  const [detalle, setDetalle] = useState("");
  const [errores, setErrores] = useState<{ docente?: { nombre?: string; apellido?: string }; aporte?: { detalle?: string } }>({});
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    const errs: typeof errores = {};
    errs.docente = {};
    errs.aporte = {};
    if (!nombre.trim()) errs.docente.nombre = "Nombre requerido";
    if (!apellido.trim()) errs.docente.apellido = "Apellido requerido";
    if (!detalle.trim()) errs.aporte.detalle = "Detalle requerido";
    const hayErr = Boolean(errs.docente?.nombre || errs.docente?.apellido || errs.aporte?.detalle);
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
    const { error: apErr } = await supabase.from("aportes_generales").insert({ docente_id: docenteId, tema: tema || null, detalle: detalle || null });
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
            <p className="text-sm text-zinc-800">Enviando aporte...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Nuevo aporte</h1>
          <p className="mt-2 text-sm">Completa y envía este aporte individual</p>
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
          <h2 className="text-xl font-semibold">Aporte</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tema</label>
              <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ej: Coordinación entre cátedras, evaluación, recursos, etc." value={tema} onChange={(e) => setTema(e.target.value)} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Comentarios / sugerencias / aportes *</label>
              <textarea className="min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600" placeholder="Describa su aporte o sugerencia con el mayor detalle posible" value={detalle} onChange={(e) => { setDetalle(e.target.value); setErrores((prev) => ({ ...prev, aporte: { detalle: undefined } })); }} />
              {errores.aporte?.detalle && <p className="mt-1 text-xs text-red-600">{errores.aporte?.detalle}</p>}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/")}>Cancelar</button>
            <button className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar aporte"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}