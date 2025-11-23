"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Sugerencia = { id: number; docente_id: number | null; seccion: string; detalle: string; created_at: string };
type Docente = { id: number; nombre: string; apellido: string };

export default function ListadoSugerenciasPage() {
  const router = useRouter();
  const [items, setItems] = useState<Sugerencia[]>([]);
  const [docentes, setDocentes] = useState<Record<number, Docente>>({});
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState("");
  const [q, setQ] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const supabase = useMemo(() => getSupabaseAnon(), []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("sugerencias_documento")
          .select("id,docente_id,seccion,detalle,created_at")
          .order("created_at", { ascending: false });
        const arr = (data as { id: number | string; docente_id?: number | string | null; seccion?: string | null; detalle?: string | null; created_at?: string | null }[])?.map((x) => ({
          id: Number(x.id),
          docente_id: x.docente_id ? Number(x.docente_id) : null,
          seccion: String(x.seccion || ""),
          detalle: String(x.detalle || ""),
          created_at: String(x.created_at || ""),
        })) || [];
        setItems(arr);
        const ids = Array.from(new Set(arr.map((r) => r.docente_id).filter((v): v is number => typeof v === "number")));
        if (ids.length) {
          const { data: drows } = await supabase.from("docentes").select("id,nombre,apellido").in("id", ids);
          const map: Record<number, Docente> = {};
          for (const d of (drows as { id: number | string; nombre?: string | null; apellido?: string | null }[]) || []) map[Number(d.id)] = { id: Number(d.id), nombre: String(d.nombre || ""), apellido: String(d.apellido || "") };
          setDocentes(map);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supabase]);

  const filtered = items.filter((r) => {
    if (seccion && r.seccion !== seccion) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!r.detalle.toLowerCase().includes(s)) return false;
    }
    if (desde) {
      const d = new Date(desde);
      const rd = new Date(r.created_at);
      if (rd < d) return false;
    }
    if (hasta) {
      const h = new Date(hasta);
      const rd = new Date(r.created_at);
      if (rd > h) return false;
    }
    return true;
  });

  const secciones = useMemo(() => Array.from(new Set(items.map((r) => r.seccion))).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })), [items]);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Sugerencias del documento</h1>
          <p className="mt-2 text-sm">Listado con filtros por sección, fecha y texto</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Sección</label>
              <select className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" value={seccion} onChange={(e) => setSeccion(e.target.value)}>
                <option value="">Todas</option>
                {secciones.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Desde</label>
              <input type="date" className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hasta</label>
              <input type="date" className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Buscar por texto</label>
            <input className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Filtrar por texto del detalle" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-700">Cargando sugerencias...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-zinc-300 bg-white p-6 text-sm text-zinc-500 shadow">No hay sugerencias que coincidan con los filtros.</div>
          ) : (
            filtered.map((r) => {
              const d = r.docente_id ? docentes[r.docente_id] : undefined;
              const nombre = d ? `${d.apellido}, ${d.nombre}` : "-";
              const fecha = new Date(r.created_at).toLocaleString();
              return (
                <button
                  key={`card-${r.id}`}
                  className="block w-full rounded-xl border border-zinc-300 bg-white p-5 text-left shadow hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={() => router.push(`/sugerencias/${r.id}`)}
               >
                  <div className="flex items-start justify-between">
                    <div className="text-sm text-zinc-600">{fecha}</div>
                    <div className="text-xs rounded bg-blue-100 px-2 py-0.5 text-blue-800">{r.seccion}</div>
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-900">{nombre}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{r.detalle}</div>
                </button>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}