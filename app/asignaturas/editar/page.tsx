"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseAnon } from "../../../lib/supabase";

type Asig = {
  id: number;
  nombre: string;
  codigo: string | null;
  anio: string | null;
  regimen: string | null;
  horas_semanales_sincronicas: string | null;
  horas_totales_sincronicas: string | null;
  horas_trabajo_independiente: string | null;
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

export default function EditarAsignaturasPage() {
  const [items, setItems] = useState<Asig[]>([]);
  const [cargando, setCargando] = useState(false);
  const [exp, setExp] = useState<Record<number, boolean>>({});
  const [bloques, setBloques] = useState<{ id: number; nombre: string }[]>([]);
  const [asigs, setAsigs] = useState<{ id: number; nombre: string }[]>([]);
  const [regR, setRegR] = useState<Record<number, number[]>>({});
  const [aprR, setAprR] = useState<Record<number, number[]>>({});
  const [genOps, setGenOps] = useState<{ id: number; nombre: string }[]>([]);
  const [espOps, setEspOps] = useState<{ id: number; nombre: string }[]>([]);
  const [genR, setGenR] = useState<Record<number, number[]>>({});
  const [espR, setEspR] = useState<Record<number, number[]>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [savedOk, setSavedOk] = useState<Record<number, boolean>>({});
  const bloqueName = useMemo(() => Object.fromEntries(bloques.map((b) => [b.id, b.nombre])), [bloques]);

  useEffect(() => {
    const run = async () => {
      setCargando(true);
      try {
        const s = getSupabaseAnon();
        const [a, b, rreg, rapr, grel, erel, gops, eops] = await Promise.all([
          s.from("asignaturas").select("id,nombre,codigo,anio,regimen,horas_semanales_sincronicas,horas_totales_sincronicas,horas_trabajo_independiente_totales,horas_trabajo_totales,coeficiente_horas_trabajo_independiente,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,bloque_conocimiento_id,created_at").order("nombre"),
          s.from("bloques_conocimiento").select("id,nombre").order("nombre"),
          s.from("asignatura_correlativas_regularizadas").select("asignatura_id,correlativa_id"),
          s.from("asignatura_correlativas_aprobadas").select("asignatura_id,correlativa_id"),
          s.from("asignatura_competencias_genericas").select("asignatura_id,competencia_generica_id"),
          s.from("asignatura_competencias_especificas").select("asignatura_id,competencia_especifica_id"),
          s.from("competencias_genericas").select("id,nombre").order("nombre"),
          s.from("competencias_especificas").select("id,nombre").order("nombre"),
        ]);
        setItems((a.data as Asig[]) || []);
        setBloques((b.data as { id: number; nombre: string }[]) || []);
        setAsigs(((a.data as Asig[]) || []).map((x) => ({ id: x.id, nombre: x.nombre })));
        const rr: Record<number, number[]> = {};
        for (const row of (rreg.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) rr[row.asignatura_id] = [...(rr[row.asignatura_id] || []), row.correlativa_id];
        setRegR(rr);
        const ar: Record<number, number[]> = {};
        for (const row of (rapr.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) ar[row.asignatura_id] = [...(ar[row.asignatura_id] || []), row.correlativa_id];
        setAprR(ar);
        const gr: Record<number, number[]> = {};
        for (const row of (grel.data ?? []) as { asignatura_id: number; competencia_generica_id: number }[]) gr[row.asignatura_id] = [...(gr[row.asignatura_id] || []), row.competencia_generica_id];
        setGenR(gr);
        const er: Record<number, number[]> = {};
        for (const row of (erel.data ?? []) as { asignatura_id: number; competencia_especifica_id: number }[]) er[row.asignatura_id] = [...(er[row.asignatura_id] || []), row.competencia_especifica_id];
        setEspR(er);
        setGenOps((gops.data as { id: number; nombre: string }[]) || []);
        setEspOps((eops.data as { id: number; nombre: string }[]) || []);
      } finally {
        setCargando(false);
      }
    };
    run();
  }, []);

  function setField(id: number, k: keyof Asig, v: any) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  }
  async function save(id: number) {
    const x = items.find((y) => y.id === id);
    if (!x) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    const body = {
      id: x.id,
      nombre: x.nombre,
      codigo: x.codigo,
      anio: x.anio,
      regimen: x.regimen,
      horas_semanales_sincronicas: x.horas_semanales_sincronicas,
      horas_totales_sincronicas: x.horas_totales_sincronicas,
      horas_trabajo_independiente_totales: x.horas_trabajo_independiente_totales,
      horas_trabajo_totales: x.horas_trabajo_totales,
      coeficiente_horas_trabajo_independiente: x.coeficiente_horas_trabajo_independiente,
      objetivos: x.objetivos,
      contenidos_minimos: x.contenidos_minimos,
      formacion_practica: x.formacion_practica,
      horas_formacion_practica: x.horas_formacion_practica,
      bloque_conocimiento_id: x.bloque_conocimiento_id,
      correlativas_regularizadas_ids: regR[id] || [],
      correlativas_aprobadas_ids: aprR[id] || [],
      competencias_genericas_ids: genR[id] || [],
      competencias_especificas_ids: espR[id] || [],
    };
    try {
      const res = await fetch("/api/asignaturas/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const t = await res.text();
        alert(t || "Error al guardar la asignatura");
      } else {
        const { asignatura } = await res.json();
        setItems((prev) => prev.map((z) => (z.id === id ? asignatura : z)));
        setSavedOk((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => setSavedOk((prev) => ({ ...prev, [id]: false })), 2000);
      }
    } catch (e: any) {
      alert(e?.message || String(e));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  function toggle(arr: number[], id: number) {
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  }

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Editar Asignaturas</h1>
          <p className="mt-2 text-sm">Modifica todos los campos y relaciones</p>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          {cargando ? (
            <div className="py-10 text-center text-sm text-zinc-600">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-600">No hay asignaturas</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((a) => (
                <div key={a.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <input className="w-full max-w-md rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.nombre || ""} onChange={(e) => setField(a.id, "nombre", e.target.value)} />
                    <div className="flex items-center gap-2">
                      {a.regimen && <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">{a.regimen}</span>}
                      {a.bloque_conocimiento_id && <span className="rounded-full bg-fuchsia-50 px-2 py-1 text-xs font-medium text-fuchsia-700">{bloqueName[a.bloque_conocimiento_id] || ""}</span>}
                      <button className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50" onClick={() => setExp((p) => ({ ...p, [a.id]: !(p[a.id] ?? false) }))}>{exp[a.id] ? "Ocultar" : "Mostrar"}</button>
                    </div>
                  </div>
                  {!exp[a.id] ? null : (
                    <>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-xs text-zinc-500">Código</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.codigo || ""} onChange={(e) => setField(a.id, "codigo", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Año</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.anio || ""} onChange={(e) => setField(a.id, "anio", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Régimen</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.regimen || ""} onChange={(e) => setField(a.id, "regimen", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Bloque de conocimiento</dt>
                          <dd>
                            <select className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.bloque_conocimiento_id || ""} onChange={(e) => setField(a.id, "bloque_conocimiento_id", e.target.value ? Number(e.target.value) : null)}>
                              <option value="">Seleccionar…</option>
                              {bloques.map((b) => (
                                <option key={b.id} value={b.id}>{b.nombre}</option>
                              ))}
                            </select>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Horas semanales sincrónicas</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.horas_semanales_sincronicas || ""} onChange={(e) => setField(a.id, "horas_semanales_sincronicas", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Total horas sincrónicas</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.horas_totales_sincronicas || ""} onChange={(e) => setField(a.id, "horas_totales_sincronicas", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Coeficiente horas trabajo independiente</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.coeficiente_horas_trabajo_independiente || ""} onChange={(e) => setField(a.id, "coeficiente_horas_trabajo_independiente", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Total horas trabajo independiente</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.horas_trabajo_independiente_totales || ""} onChange={(e) => setField(a.id, "horas_trabajo_independiente_totales", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Total horas de trabajo</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.horas_trabajo_totales || ""} onChange={(e) => setField(a.id, "horas_trabajo_totales", e.target.value)} /></dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">Horas formación práctica</dt>
                          <dd><input className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm" value={a.horas_formacion_practica || ""} onChange={(e) => setField(a.id, "horas_formacion_practica", e.target.value)} /></dd>
                        </div>
                      </dl>
                      <div className="mt-3">
                        <div className="mb-2">
                          <div className="mb-1 text-xs text-zinc-500">Objetivos</div>
                          <textarea className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" rows={4} value={a.objetivos || ""} onChange={(e) => setField(a.id, "objetivos", e.target.value)} />
                        </div>
                        <div className="mb-2">
                          <div className="mb-1 text-xs text-zinc-500">Contenidos mínimos</div>
                          <textarea className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" rows={4} value={a.contenidos_minimos || ""} onChange={(e) => setField(a.id, "contenidos_minimos", e.target.value)} />
                        </div>
                        <div className="mb-2">
                          <div className="mb-1 text-xs text-zinc-500">Formación práctica</div>
                          <textarea className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" rows={3} value={a.formacion_practica || ""} onChange={(e) => setField(a.id, "formacion_practica", e.target.value)} />
                        </div>
                        <div className="mb-3">
                          <div className="mb-1 text-sm font-medium">Correlativas regularizadas</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {(asigs || []).map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={(regR[a.id] || []).includes(opt.id)} onChange={() => setRegR((p) => ({ ...p, [a.id]: toggle(p[a.id] || [], opt.id) }))} />
                                <span>{opt.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="mb-1 text-sm font-medium">Correlativas aprobadas</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {(asigs || []).map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={(aprR[a.id] || []).includes(opt.id)} onChange={() => setAprR((p) => ({ ...p, [a.id]: toggle(p[a.id] || [], opt.id) }))} />
                                <span>{opt.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="mb-1 text-sm font-medium">Competencias genéricas</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {genOps.map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={(genR[a.id] || []).includes(opt.id)} onChange={() => setGenR((p) => ({ ...p, [a.id]: toggle(p[a.id] || [], opt.id) }))} />
                                <span>{opt.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="mb-1 text-sm font-medium">Competencias específicas</div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {espOps.map((opt) => (
                              <label key={opt.id} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={(espR[a.id] || []).includes(opt.id)} onChange={() => setEspR((p) => ({ ...p, [a.id]: toggle(p[a.id] || [], opt.id) }))} />
                                <span>{opt.nombre}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-3">
                          {savedOk[a.id] && <span className="text-xs text-emerald-700">Guardado ✓</span>}
                          <button
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={!!saving[a.id]}
                            onClick={() => save(a.id)}
                          >
                            {saving[a.id] ? "Guardando..." : "Guardar cambios"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}