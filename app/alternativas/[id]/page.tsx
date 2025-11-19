"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseAnon } from "../../../lib/supabase";

type Alternativa = { id: number; titulo: string; fecha_hora: string; created_at: string };
type AsignaturaAlt = {
  id: number;
  alternativa_id: number;
  anio: string | null;
  codigo: string | null;
  nombre: string;
  regimen: string | null;
  horas_semanales: string | null;
  horas_totales: string | null;
  bloque_conocimiento: string | null;
  coeficiente_horas_trabajo_independiente: string | null;
  horas_trabajo_independiente_totales: string | null;
  horas_trabajo_totales: string | null;
  created_at: string;
};

export default function AlternativaDetallePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id || 0);
  const [alt, setAlt] = useState<Alternativa | null>(null);
  const [asigs, setAsigs] = useState<AsignaturaAlt[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!idNum) return;
    const fetch = async () => {
      try {
        const supabase = getSupabaseAnon();
        const { data: a } = await supabase.from("alternativas_planes").select("id,titulo,fecha_hora,created_at").eq("id", idNum).single();
        setAlt((a as Alternativa) || null);
        const { data: s } = await supabase
          .from("alternativas_planes_asignaturas")
          .select(
            "id,alternativa_id,anio,codigo,nombre,regimen,horas_semanales,horas_totales,bloque_conocimiento,coeficiente_horas_trabajo_independiente,horas_trabajo_independiente_totales,horas_trabajo_totales,created_at"
          )
          .eq("alternativa_id", idNum)
          .order("nombre");
        setAsigs((s as AsignaturaAlt[]) || []);
      } finally {
        setCargando(false);
      }
    };
    fetch();
  }, [idNum]);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Detalle de alternativa</h1>
          <div className="mt-4 flex items-center gap-3">
            <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-zinc-100" onClick={() => router.push("/alternativas")}>
              Volver al listado
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          {cargando ? (
            <p className="text-sm">Cargando...</p>
          ) : !alt ? (
            <p className="text-sm text-red-600">Alternativa no encontrada.</p>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">{alt.titulo}</h2>
              <p className="mt-1 text-sm text-zinc-600">{new Date(alt.fecha_hora).toLocaleString()}</p>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Asignaturas</h3>
                {asigs.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-600">Sin asignaturas.</p>
                ) : (
                  <div className="mt-2 divide-y divide-zinc-200 border border-zinc-200">
                    {asigs.map((s) => (
                      <div key={s.id} className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-zinc-500">Año</p>
                          <p className="text-sm text-zinc-900">{s.anio || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Código</p>
                          <p className="text-sm text-zinc-900">{s.codigo || "-"}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs text-zinc-500">Nombre</p>
                          <p className="text-sm text-zinc-900">{s.nombre}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Régimen</p>
                          <p className="text-sm text-zinc-900">{s.regimen || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Horas semanales sincrónicas</p>
                          <p className="text-sm text-zinc-900">{s.horas_semanales || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Total horas sincrónicas</p>
                          <p className="text-sm text-zinc-900">{s.horas_totales || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Coef. trabajo independiente</p>
                          <p className="text-sm text-zinc-900">{s.coeficiente_horas_trabajo_independiente || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Total horas trabajo independiente</p>
                          <p className="text-sm text-zinc-900">{s.horas_trabajo_independiente_totales || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Total horas de trabajo</p>
                          <p className="text-sm text-zinc-900">{s.horas_trabajo_totales || "-"}</p>
                        </div>
                        <div className="sm:col-span-4">
                          <p className="text-xs text-zinc-500">Bloque de conocimiento</p>
                          <p className="text-sm text-zinc-900 whitespace-pre-wrap">{s.bloque_conocimiento || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}