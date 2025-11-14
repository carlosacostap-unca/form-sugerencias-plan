"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../../lib/supabase";

type Docente = { id: number; nombre: string; apellido: string };
type Aporte = { id: number; docente_id: number; tema: string | null; detalle: string | null; created_at: string };

function fmtFecha(s: string) {
  try {
    const d = new Date(s);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return s;
  }
}

export default function AporteDetallePage() {
  const params = useParams();
  const router = useRouter();
  const idStr = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  const id = Number(idStr);
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [aporte, setAporte] = useState<Aporte | null>(null);

  const docentesMap = useMemo(() => {
    const m: Record<number, string> = {};
    for (const d of docentes) m[d.id] = `${d.nombre} ${d.apellido}`.trim();
    return m;
  }, [docentes]);

  useEffect(() => {
    const load = async () => {
      if (!id || Number.isNaN(id)) return;
      setLoading(true);
      const supabase = getSupabaseAnon();
      try {
        const [dcs, ag] = await Promise.all([
          supabase.from("docentes").select("id,nombre,apellido"),
          supabase.from("aportes_generales").select("id,docente_id,tema,detalle,created_at").eq("id", id).single(),
        ]);
        if (!dcs.error && dcs.data) setDocentes(dcs.data as Docente[]);
        if (!ag.error && ag.data) setAporte(ag.data as Aporte);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const docenteNombre = aporte ? docentesMap[aporte.docente_id] || "" : "";

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Detalle de aporte</h1>
        </section>
        {loading && <div className="mt-6 rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-700">Cargando aporte...</div>}
        {!loading && aporte && (
          <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow">
            <div className="text-sm text-zinc-600">{fmtFecha(aporte.created_at)}</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Docente</p>
                <p className="text-sm font-medium">{docenteNombre}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Tema</p>
                <p className="text-sm font-medium">{aporte.tema || ""}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-zinc-500">Detalle</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{aporte.detalle || ""}</p>
            </div>
            <div className="mt-6">
              <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300" onClick={() => router.push("/propuestas")}>
                Volver al listado
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}