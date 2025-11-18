"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../lib/supabase";

type Alternativa = { id: number; titulo: string; fecha_hora: string; created_at: string };

export default function AlternativasPage() {
  const router = useRouter();
  const [alternativas, setAlternativas] = useState<Alternativa[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = getSupabaseAnon();
        const { data } = await supabase
          .from("alternativas_planes")
          .select("id,titulo,fecha_hora,created_at")
          .order("fecha_hora", { ascending: false });
        setAlternativas((data as Alternativa[]) || []);
      } finally {
        setCargando(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Alternativas de planes de estudio</h1>
          <div className="mt-4 flex items-center gap-3">
            <button
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-zinc-100"
              onClick={() => router.push("/alternativa/nueva")}
            >
              Nueva alternativa
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          {cargando ? (
            <p className="text-sm">Cargando...</p>
          ) : alternativas.length === 0 ? (
            <p className="text-sm text-zinc-600">No hay alternativas registradas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {alternativas.map((alt) => (
                <div key={alt.id} className="rounded-lg border border-zinc-200 p-4">
                  <h3 className="text-base font-semibold text-zinc-900">{alt.titulo}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{new Date(alt.fecha_hora).toLocaleString()}</p>
                  <div className="mt-3">
                    <button
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={() => router.push(`/alternativas/${alt.id}`)}
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}