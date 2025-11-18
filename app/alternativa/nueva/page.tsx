"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type AsigAlt = { anio: string; codigo: string; nombre: string };

export default function NuevaAlternativaPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [items, setItems] = useState<AsigAlt[]>([{ anio: "", codigo: "", nombre: "" }]);
  const [errores, setErrores] = useState<{ alternativa?: { titulo?: string; fechaHora?: string; asignaturas?: string } }>({});
  const [enviando, setEnviando] = useState(false);

  const agregarItem = () => {
    setItems((prev) => [...prev, { anio: "", codigo: "", nombre: "" }]);
  };

  const quitarItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const actualizarItem = (idx: number, campo: keyof AsigAlt, valor: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [campo]: valor } : it)));
  };

  const enviar = async () => {
    const errs: typeof errores = {};
    errs.alternativa = {};
    if (!titulo.trim()) errs.alternativa.titulo = "Título requerido";
    if (!fechaHora.trim()) errs.alternativa.fechaHora = "Fecha y hora requeridas";
    const hayAsignaturas = items.length > 0 && items.some((x) => x.nombre.trim());
    if (!hayAsignaturas) errs.alternativa.asignaturas = "Agregue al menos una asignatura";
    const hayErr = Boolean(errs.alternativa?.titulo || errs.alternativa?.fechaHora || errs.alternativa?.asignaturas);
    if (hayErr) {
      setErrores(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEnviando(true);
    try {
      const supabase = getSupabaseAnon();
      const iso = new Date(fechaHora).toISOString();
      const { data: alt, error: altErr } = await supabase.from("alternativas_planes").insert({ titulo, fecha_hora: iso }).select().single();
      if (altErr) throw new Error(altErr.message);
      const alternativaId = (alt as { id: number }).id;
      for (const it of items) {
        if (!it.nombre.trim()) continue;
        const { error: asigErr } = await supabase
          .from("alternativas_planes_asignaturas")
          .insert({ alternativa_id: alternativaId, anio: it.anio || null, codigo: it.codigo || null, nombre: it.nombre });
        if (asigErr) throw new Error(asigErr.message);
      }
      setEnviando(false);
      router.push("/gracias");
    } catch (e: any) {
      alert(e?.message || "Error al guardar la alternativa");
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      {enviando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white px-6 py-4 text-center shadow">
            <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-zinc-800">Enviando alternativa...</p>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Nueva alternativa de plan de estudio</h1>
          <p className="mt-2 text-sm">Complete los datos y agregue las asignaturas</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Alternativa</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Título *</label>
              <input
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Ej: Plan alternativo 2026"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  setErrores((prev) => ({ ...prev, alternativa: { ...(prev.alternativa || {}), titulo: undefined } }));
                }}
              />
              {errores.alternativa?.titulo && <p className="mt-1 text-xs text-red-600">{errores.alternativa?.titulo}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Fecha y hora *</label>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600"
                value={fechaHora}
                onChange={(e) => {
                  setFechaHora(e.target.value);
                  setErrores((prev) => ({ ...prev, alternativa: { ...(prev.alternativa || {}), fechaHora: undefined } }));
                }}
              />
              {errores.alternativa?.fechaHora && <p className="mt-1 text-xs text-red-600">{errores.alternativa?.fechaHora}</p>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Asignaturas</h2>
          <div className="mt-4 space-y-4">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Año</label>
                  <input
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Ej: 1º, 2º"
                    value={it.anio}
                    onChange={(e) => actualizarItem(idx, "anio", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Código</label>
                  <input
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Código interno"
                    value={it.codigo}
                    onChange={(e) => actualizarItem(idx, "codigo", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Nombre *</label>
                  <input
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Nombre de la asignatura"
                    value={it.nombre}
                    onChange={(e) => actualizarItem(idx, "nombre", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4 flex items-center justify-end gap-2">
                  {items.length > 1 && (
                    <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => quitarItem(idx)}>Quitar</button>
                  )}
                  {idx === items.length - 1 && (
                    <button className="rounded-md bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={agregarItem}>Agregar asignatura</button>
                  )}
                </div>
              </div>
            ))}
            {errores.alternativa?.asignaturas && <p className="mt-1 text-xs text-red-600">{errores.alternativa?.asignaturas}</p>}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/")}>Cancelar</button>
            <button className="rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Guardar alternativa"}</button>
          </div>
        </section>
      </div>
    </div>
  );
}