"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Sugerencia = { id: number; docente_id: number | null; seccion: string; detalle: string; created_at: string };
type Docente = { id: number; nombre: string; apellido: string };
type SugerenciaRow = { id: number | string; docente_id?: number | string | null; seccion?: string | null; detalle?: string | null; created_at?: string | null };
type DocenteRow = { id: number | string; nombre?: string | null; apellido?: string | null };

function SugerenciaDetalleInner() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const id = Number(idParam);
  const supabase = useMemo(() => getSupabaseAnon(), []);
  const [item, setItem] = useState<Sugerencia | null>(null);
  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("sugerencias_documento").select("id,docente_id,seccion,detalle,created_at").eq("id", id).single();
        if (data) {
          const sug: Sugerencia = {
            id: Number((data as SugerenciaRow).id),
            docente_id: (data as SugerenciaRow).docente_id ? Number((data as SugerenciaRow).docente_id as number | string) : null,
            seccion: String((data as SugerenciaRow).seccion || ""),
            detalle: String((data as SugerenciaRow).detalle || ""),
            created_at: String((data as SugerenciaRow).created_at || ""),
          };
          setItem(sug);
          if (sug.docente_id) {
            const { data: drow } = await supabase.from("docentes").select("id,nombre,apellido").eq("id", sug.docente_id).single();
            if (drow) setDocente({ id: Number((drow as DocenteRow).id), nombre: String((drow as DocenteRow).nombre || ""), apellido: String((drow as DocenteRow).apellido || "") });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    if (!Number.isNaN(id)) fetch();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-700">Cargando sugerencia...</div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen w-full bg-zinc-100">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">No se encontró la sugerencia.</div>
          <button className="mt-4 rounded-md bg-zinc-200 px-4 py-2 text-sm text-zinc-900" onClick={() => router.push("/sugerencias/listado")}>Volver</button>
        </div>
      </div>
    );
  }

  const fecha = new Date(item.created_at).toLocaleString();
  const nombre = docente ? `${docente.apellido}, ${docente.nombre}` : "-";

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Detalle de sugerencia</h1>
          <p className="mt-2 text-sm">#{item.id}</p>
        </section>
        <section className="mt-6 space-y-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="text-sm text-zinc-600">{fecha}</div>
            <div className="mt-1 text-sm font-medium text-zinc-900">{nombre}</div>
            <div className="mt-2 text-xs rounded bg-blue-100 px-2 py-0.5 text-blue-800 inline-block">{item.seccion}</div>
            <div className="mt-4 whitespace-pre-wrap text-sm text-zinc-800">{item.detalle}</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-md bg-zinc-200 px-4 py-2 text-sm text-zinc-900" onClick={() => router.push("/sugerencias/listado")}>Volver al listado</button>
            <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" href={`/sugerencias/documento?seccion=${encodeURIComponent(item.seccion)}`} target="_blank" rel="noopener noreferrer">Sugerir nueva idea para esta sección</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SugerenciaDetallePage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-zinc-100"><div className="mx-auto max-w-4xl px-4 py-10"><div className="rounded-xl border border-zinc-300 bg-white p-6 text-sm text-zinc-700 shadow">Cargando…</div></div></div>}>
      <SugerenciaDetalleInner />
    </Suspense>
  );
}