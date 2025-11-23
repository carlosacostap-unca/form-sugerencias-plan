"use client";
import { useEffect, useState } from "react";
import { getSupabaseAnon } from "../../../lib/supabase";
import { ReactFlow, Background, Controls, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type AsignaturaDB = {
  id: number;
  nombre: string;
  codigo: string | null;
  anio: string | null;
  regimen: string | null;
  horas_semanales_sincronicas: string | null;
  horas_totales_sincronicas: string | null;
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

type AsigNodeData = { label: string; expanded: boolean; related: boolean; onToggle: () => void };
function AsigNode({ data }: { data: AsigNodeData }) {
  return (
    <div
      className={
        `rounded-md border px-3 py-2 text-sm shadow-sm cursor-pointer ` +
        (data.expanded
          ? "bg-black text-white border-black"
          : data.related
          ? "bg-zinc-200 text-zinc-900 border-zinc-300"
          : "bg-white text-zinc-900 border-zinc-300")
      }
      onClick={data.onToggle}
    >
      <div className="font-medium">{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  );
}

export default function PropuestaNuevoPlanListadoPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
  const [editMap, setEditMap] = useState<Record<number, Partial<AsignaturaDB> & { correlativas_regularizadas_ids?: number[]; correlativas_aprobadas_ids?: number[]; competencias_genericas_ids?: number[]; competencias_especificas_ids?: number[]; descriptores_ids?: number[]; ejes_transversales_ids?: number[] }>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [regMap, setRegMap] = useState<Record<number, number[]>>({});
  const [aprMap, setAprMap] = useState<Record<number, number[]>>({});
  const [aprParaMap, setAprParaMap] = useState<Record<number, number[]>>({});
  const [genMap, setGenMap] = useState<Record<number, number[]>>({});
  const [espMap, setEspMap] = useState<Record<number, number[]>>({});
  const [genNames, setGenNames] = useState<Record<number, string>>({});
  const [espNames, setEspNames] = useState<Record<number, string>>({});
  const [ejeNames, setEjeNames] = useState<Record<number, string>>({});
  const [bloqueNames, setBloqueNames] = useState<Record<number, string>>({});
  const [bloqueMins, setBloqueMins] = useState<Record<number, number>>({});
  const [optativas, setOptativas] = useState<{ id: number; nombre: string; objetivos?: string | null; contenidos_minimos?: string | null; formacion_practica?: string | null }[]>([]);
  const [descNames, setDescNames] = useState<Record<number, string>>({});
  const [descMap, setDescMap] = useState<Record<number, number[]>>({});
  const [ejeMap, setEjeMap] = useState<Record<number, number[]>>({});
  const [blockDescMap, setBlockDescMap] = useState<Record<number, number[]>>({});
  const [plan2011Nombre, setPlan2011Nombre] = useState<Record<number, string>>({});
  const [plan2011Numero, setPlan2011Numero] = useState<Record<number, string>>({});
  const [eq2011Map, setEq2011Map] = useState<Record<number, number[]>>({});
  const [filtroAnioMapa, setFiltroAnioMapa] = useState<string>("Todos");
  const [soloConexionesSeleccion, setSoloConexionesSeleccion] = useState<boolean>(false);
  const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const ANIOS = ["1º", "2º", "3º", "4º", "5º"]; 
  const REGIMENES = ["Anual", "1º Cuatr.", "2º Cuatr."];

  useEffect(() => {
    const fetchAsignaturas = async () => {
      setCargando(true);
      try {
        const supabase = getSupabaseAnon();
        const { data } = await supabase
          .from("asignaturas")
          .select(
            "id,nombre,codigo,anio,regimen,horas_semanales_sincronicas,horas_totales_sincronicas,horas_trabajo_independiente_totales,horas_trabajo_totales,coeficiente_horas_trabajo_independiente,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,bloque_conocimiento_id,created_at"
          )
          .order("nombre");
        setAsignaturas((data as AsignaturaDB[]) || []);
        const nextEditMap: Record<number, Partial<AsignaturaDB> & { correlativas_regularizadas_ids?: number[]; correlativas_aprobadas_ids?: number[]; competencias_genericas_ids?: number[]; competencias_especificas_ids?: number[] }> = {};
        for (const a of ((data as AsignaturaDB[]) || [])) {
          const initial: Partial<AsignaturaDB> = {
            nombre: a.nombre,
            codigo: a.codigo,
            anio: a.anio,
            regimen: a.regimen,
            horas_semanales_sincronicas: a.horas_semanales_sincronicas,
            horas_totales_sincronicas: a.horas_totales_sincronicas,
            horas_trabajo_independiente_totales: a.horas_trabajo_independiente_totales,
            horas_trabajo_totales: a.horas_trabajo_totales,
            coeficiente_horas_trabajo_independiente: a.coeficiente_horas_trabajo_independiente,
            objetivos: a.objetivos,
            contenidos_minimos: a.contenidos_minimos,
            formacion_practica: a.formacion_practica,
            horas_formacion_practica: a.horas_formacion_practica,
            bloque_conocimiento_id: a.bloque_conocimiento_id,
          };
          nextEditMap[a.id] = initial;
        }
        setEditMap(nextEditMap);
        const [regs, aprs, aprsPara, gens, esps, genTbl, espTbl, bloquesTbl, descTbl, bcdRel, adRel, ejeTbl, aeRel, optTbl, p11Tbl, eqTbl] = await Promise.all([
          supabase.from("asignatura_correlativas_regularizadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_correlativas_aprobadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_correlativas_aprobadas_para_aprobar").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_competencias_genericas").select("asignatura_id,competencia_generica_id"),
          supabase.from("asignatura_competencias_especificas").select("asignatura_id,competencia_especifica_id"),
          supabase.from("competencias_genericas").select("id,nombre").order("nombre"),
          supabase.from("competencias_especificas").select("id,nombre").order("nombre"),
          supabase.from("bloques_conocimiento").select("id,nombre,horas_minimas").order("nombre"),
          supabase.from("bloque_descriptores").select("id,nombre").order("nombre"),
          supabase.from("bloques_conocimiento_descriptores").select("bloque_conocimiento_id,descriptor_id"),
          supabase.from("asignatura_descriptores").select("asignatura_id,descriptor_id"),
          supabase.from("ejes_transversales_formacion").select("id,nombre").order("nombre"),
          supabase.from("asignatura_ejes_transversales_formacion").select("asignatura_id,eje_id"),
          supabase.from("asignaturas_optativas").select("id,nombre,objetivos,contenidos_minimos,formacion_practica").order("nombre"),
          supabase.from("asignaturas_plan_2011").select("id,numero,nombre").order("numero"),
          supabase.from("asignatura_equivalencias_plan_2011").select("asignatura_id,plan_2011_asignatura_id"),
        ]);
        const rMap: Record<number, number[]> = {};
        for (const row of (regs.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
          const arr = rMap[row.asignatura_id] || [];
          rMap[row.asignatura_id] = [...arr, row.correlativa_id];
        }
        const aMap: Record<number, number[]> = {};
        for (const row of (aprs.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
          const arr = aMap[row.asignatura_id] || [];
          aMap[row.asignatura_id] = [...arr, row.correlativa_id];
        }
        const apMap: Record<number, number[]> = {};
        for (const row of (aprsPara.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
          const arr = apMap[row.asignatura_id] || [];
          apMap[row.asignatura_id] = [...arr, row.correlativa_id];
        }
        const gMap: Record<number, number[]> = {};
        for (const row of (gens.data ?? []) as { asignatura_id: number; competencia_generica_id: number }[]) {
          const arr = gMap[row.asignatura_id] || [];
          gMap[row.asignatura_id] = [...arr, row.competencia_generica_id];
        }
        const eMap: Record<number, number[]> = {};
        for (const row of (esps.data ?? []) as { asignatura_id: number; competencia_especifica_id: number }[]) {
          const arr = eMap[row.asignatura_id] || [];
          eMap[row.asignatura_id] = [...arr, row.competencia_especifica_id];
        }
        const gNames: Record<number, string> = {};
        for (const row of (genTbl.data ?? []) as { id: number; nombre: string }[]) gNames[row.id] = row.nombre;
        const eNames: Record<number, string> = {};
        for (const row of (espTbl.data ?? []) as { id: number; nombre: string }[]) eNames[row.id] = row.nombre;
        const etNames: Record<number, string> = {};
        for (const row of (ejeTbl.data ?? []) as { id: number; nombre: string }[]) etNames[row.id] = row.nombre;
        const bNames: Record<number, string> = {};
        const bMins: Record<number, number> = {};
        for (const row of (bloquesTbl.data ?? []) as { id: number; nombre: string; horas_minimas?: number | null }[]) {
          bNames[row.id] = row.nombre;
          const val = row.horas_minimas ?? null;
          if (val !== null && val !== undefined) bMins[row.id] = Number(val) || 0;
        }
        const dNames: Record<number, string> = {};
        for (const row of (descTbl.data ?? []) as { id: number; nombre: string }[]) dNames[row.id] = row.nombre;
        const bdMap: Record<number, number[]> = {};
        for (const row of (bcdRel.data ?? []) as { bloque_conocimiento_id: number; descriptor_id: number }[]) {
          const arr = bdMap[row.bloque_conocimiento_id] || [];
          bdMap[row.bloque_conocimiento_id] = [...arr, row.descriptor_id];
        }
        const dMap: Record<number, number[]> = {};
        for (const row of (adRel.data ?? []) as { asignatura_id: number; descriptor_id: number }[]) {
          const arr = dMap[row.asignatura_id] || [];
          dMap[row.asignatura_id] = [...arr, row.descriptor_id];
        }
        const ejMap: Record<number, number[]> = {};
        for (const row of (aeRel.data ?? []) as { asignatura_id: number; eje_id: number }[]) {
          const arr = ejMap[row.asignatura_id] || [];
          ejMap[row.asignatura_id] = [...arr, row.eje_id];
        }
        setRegMap(rMap);
        setAprMap(aMap);
        setAprParaMap(apMap);
        setGenMap(gMap);
        setEspMap(eMap);
        setGenNames(gNames);
        setEspNames(eNames);
        setEjeNames(etNames);
        setBloqueNames(bNames);
        setBloqueMins(bMins);
        setDescNames(dNames);
        setBlockDescMap(bdMap);
        setDescMap(dMap);
        setEjeMap(ejMap);
        setOptativas(((optTbl.data ?? []) as any[]).map((x) => ({ id: Number(x.id), nombre: String(x.nombre || ""), objetivos: x.objetivos ?? null, contenidos_minimos: x.contenidos_minimos ?? null, formacion_practica: x.formacion_practica ?? null })));
        const pNames: Record<number, string> = {};
        const pNums: Record<number, string> = {};
        for (const row of (p11Tbl.data ?? []) as { id: number; numero: string; nombre: string }[]) {
          pNames[row.id] = row.nombre;
          pNums[row.id] = row.numero;
        }
        const eqMap: Record<number, number[]> = {};
        for (const row of (eqTbl.data ?? []) as { asignatura_id: number; plan_2011_asignatura_id: number }[]) {
          const aid = row.asignatura_id;
          const pid = row.plan_2011_asignatura_id;
          eqMap[aid] = [...(eqMap[aid] || []), pid];
        }
        setPlan2011Nombre(pNames);
        setPlan2011Numero(pNums);
        setEq2011Map(eqMap);
      } catch {
      } finally {
        setCargando(false);
      }
    };
    fetchAsignaturas();
  }, []);

  useEffect(() => {
    const factorForRegimen = (r?: string | null) => {
      const rx = (r || "").toLowerCase();
      if (!rx) return null;
      if (rx.includes("anual")) return 30;
      if (rx.includes("cuatr")) return 15;
      return null;
    };
    const coefForBloque = (bid?: number | null) => {
      if (!bid) return null;
      const name = bloqueNames[bid] || "";
      if (name === "Ciencias Básicas de la Ingeniería") return 1.25;
      if (name === "Tecnologías Básicas") return 1.5;
      if (name === "Tecnologías Aplicadas") return 2.0;
      if (name === "Ciencias y Tecnologías Complementarias") return 1.0;
      return null;
    };
    const next: typeof editMap = {};
    let changed = false;
    for (const [idStr, curr] of Object.entries(editMap)) {
      const id = Number(idStr);
      const hsSem = Number(curr.horas_semanales_sincronicas || 0) || 0;
      const factor = factorForRegimen(curr.regimen);
      const hsTot = factor ? hsSem * factor : 0;
      const coef = coefForBloque(curr.bloque_conocimiento_id);
      const tiTot = hsTot && coef ? hsTot * coef : 0;
      const trabTot = hsTot && tiTot ? hsTot + tiTot : 0;
      const desired = {
        horas_totales_sincronicas: hsTot ? String(hsTot) : "",
        coeficiente_horas_trabajo_independiente: coef ? String(coef) : "",
        horas_trabajo_independiente_totales: tiTot ? String(tiTot) : "",
        horas_trabajo_totales: trabTot ? String(trabTot) : "",
      } as Partial<AsignaturaDB>;
      const prevVals = {
        horas_totales_sincronicas: curr.horas_totales_sincronicas || "",
        coeficiente_horas_trabajo_independiente: curr.coeficiente_horas_trabajo_independiente || "",
        horas_trabajo_independiente_totales: curr.horas_trabajo_independiente_totales || "",
        horas_trabajo_totales: curr.horas_trabajo_totales || "",
      };
      const needUpdate =
        desired.horas_totales_sincronicas !== prevVals.horas_totales_sincronicas ||
        desired.coeficiente_horas_trabajo_independiente !== prevVals.coeficiente_horas_trabajo_independiente ||
        desired.horas_trabajo_independiente_totales !== prevVals.horas_trabajo_independiente_totales ||
        desired.horas_trabajo_totales !== prevVals.horas_trabajo_totales;
      if (needUpdate) {
        changed = true;
        next[id] = { ...curr, ...desired };
      } else {
        next[id] = curr;
      }
    }
    if (changed) setEditMap(next);
  }, [editMap, bloqueNames]);

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Propuesta de Nuevo Plan de Estudio</h1>
          <p className="mt-2 text-sm">Listado no editable de asignaturas existentes</p>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo 0: Plan de Estudios Detallado</h2>
          <p className="mt-1 text-sm text-zinc-600">Listado de asignaturas</p>
          {cargando ? (
            <div className="py-10 text-center text-sm text-zinc-600">Cargando asignaturas...</div>
          ) : asignaturas.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-600">No hay asignaturas registradas</div>
          ) : (
            <>
              {["1º", "2º", "3º", "4º", "5º", ""].map((anioKey) => {
                const grupo = asignaturas.filter((a) => (a.anio || "") === anioKey);
                if (grupo.length === 0) return null;
                const titulo = anioKey ? `Año ${anioKey}` : "Sin año";
                return (
                  <section id={`anio-${anioKey || "sin"}`} key={anioKey || "sin-ano"} className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{titulo}</h3>
                      <div />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[...grupo]
                        .sort((a, b) => {
                          const ra = (a.regimen || "").toLowerCase();
                          const rb = (b.regimen || "").toLowerCase();
                          const order = (r: string) => {
                            if (r.includes("anual")) return 0;
                            if (r.includes("1º") || r.includes("1°") || r.includes("1er") || r.includes("1er cuatr") || r.includes("1º cuatr")) return 1;
                            if (r.includes("2º") || r.includes("2°") || r.includes("2do") || r.includes("2do cuatr") || r.includes("2º cuatr")) return 2;
                            return 3;
                          };
                          const oa = order(ra);
                          const ob = order(rb);
                          if (oa !== ob) return oa - ob;
                          return (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" });
                        })
                        .map((a) => (
                        <div key={a.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                          {(() => {
                            const abierto = expandidos[a.id] ?? false;
                            return (
                              <>
                                <div className="mb-3 flex items-center justify-between">
                                  <div className="text-base font-semibold text-zinc-900">{a.nombre || ""}</div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                                      onClick={() => setExpandidos((prev) => ({ ...prev, [a.id]: !abierto }))}
                                      aria-expanded={abierto}
                                    >
                                      {abierto ? "Ocultar" : "Mostrar"}
                                    </button>
                                  </div>
                                </div>
                                {!abierto ? null : (
                                  <>
                                    <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                      <div>
                                        <label className="text-xs text-zinc-500">Año</label>
                                        <select className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.anio || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], anio: e.target.value } }))}>
                                          <option value="">Sin año</option>
                                          {ANIOS.map((x) => (<option key={x} value={x}>{x}</option>))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Código</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.codigo || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], codigo: e.target.value } }))} />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Nombre</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.nombre || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], nombre: e.target.value } }))} />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Régimen</label>
                                        <select className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.regimen || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], regimen: e.target.value } }))}>
                                          <option value="">Sin régimen</option>
                                          {REGIMENES.map((r) => (<option key={r} value={r}>{r}</option>))}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                      <div>
                                        <label className="text-xs text-zinc-500">Cantidad de horas semanales sincrónicas</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.horas_semanales_sincronicas || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], horas_semanales_sincronicas: e.target.value } }))} />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Cantidad total de horas sincrónicas</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.horas_totales_sincronicas || ""} readOnly />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Bloque de conocimiento</label>
                                        <select className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.bloque_conocimiento_id ?? ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], bloque_conocimiento_id: e.target.value ? Number(e.target.value) : null } }))}>
                                          <option value="">Sin bloque</option>
                                          {Object.entries(bloqueNames).map(([bid, name]) => (<option key={bid} value={bid}>{name}</option>))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Coeficiente de horas de trabajo independiente</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.coeficiente_horas_trabajo_independiente || ""} readOnly />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Cantidad total de horas de trabajo independiente</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.horas_trabajo_independiente_totales || ""} readOnly />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Cantidad total de horas de trabajo</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.horas_trabajo_totales || ""} readOnly />
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                          <div className="mb-1 text-xs text-zinc-500">Correlativas regularizadas</div>
                                          <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                            {asignaturas
                                              .filter((x) => {
                                                const idxA = ANIOS.indexOf(a.anio || "");
                                                const idxX = ANIOS.indexOf(x.anio || "");
                                                return idxA === -1 || idxX === -1 ? true : idxX <= idxA;
                                              })
                                              .map((x) => {
                                              const curr = (editMap[a.id]?.correlativas_regularizadas_ids ?? regMap[a.id] ?? []);
                                              const checked = curr.includes(x.id);
                                              return (
                                                <label key={`reg-${x.id}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.correlativas_regularizadas_ids ?? regMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, x.id] : base.filter((id) => id !== x.id);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], correlativas_regularizadas_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{x.nombre}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="mb-1 text-xs text-zinc-500">Correlativas aprobadas</div>
                                          <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                            {asignaturas
                                              .filter((x) => {
                                                const idxA = ANIOS.indexOf(a.anio || "");
                                                const idxX = ANIOS.indexOf(x.anio || "");
                                                return idxA === -1 || idxX === -1 ? true : idxX <= idxA;
                                              })
                                              .map((x) => {
                                              const curr = (editMap[a.id]?.correlativas_aprobadas_ids ?? aprMap[a.id] ?? []);
                                              const checked = curr.includes(x.id);
                                              return (
                                                <label key={`apr-${x.id}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.correlativas_aprobadas_ids ?? aprMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, x.id] : base.filter((id) => id !== x.id);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], correlativas_aprobadas_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{x.nombre}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    <div className="mt-3">
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Objetivos</div>
                                        <textarea className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={editMap[a.id]?.objetivos || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], objetivos: e.target.value } }))} />
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Contenidos mínimos</div>
                                        <textarea className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={editMap[a.id]?.contenidos_minimos || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], contenidos_minimos: e.target.value } }))} />
                                      </div>
                                      <div className="mb-2">
                                        <div className="mb-1 text-xs text-zinc-500">Formación práctica</div>
                                        <textarea className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={editMap[a.id]?.formacion_practica || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], formacion_practica: e.target.value } }))} />
                                      </div>
                                      <div>
                                        <label className="text-xs text-zinc-500">Cantidad de horas de formación práctica</label>
                                        <input className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm" value={editMap[a.id]?.horas_formacion_practica || ""} onChange={(e) => setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], horas_formacion_practica: e.target.value } }))} />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                                        <div>
                                          <div className="mb-1 text-xs text-zinc-500">Competencias genéricas</div>
                                          <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                            {Object.entries(genNames).map(([gid, name]) => {
                                              const idNum = Number(gid);
                                              const curr = (editMap[a.id]?.competencias_genericas_ids ?? genMap[a.id] ?? []);
                                              const checked = curr.includes(idNum);
                                              return (
                                                <label key={`gen-${gid}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.competencias_genericas_ids ?? genMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, idNum] : base.filter((id) => id !== idNum);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], competencias_genericas_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{name}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="mb-1 text-xs text-zinc-500">Competencias específicas</div>
                                          <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                            {Object.entries(espNames).map(([eid, name]) => {
                                              const idNum = Number(eid);
                                              const curr = (editMap[a.id]?.competencias_especificas_ids ?? espMap[a.id] ?? []);
                                              const checked = curr.includes(idNum);
                                              return (
                                                <label key={`esp-${eid}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.competencias_especificas_ids ?? espMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, idNum] : base.filter((id) => id !== idNum);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], competencias_especificas_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{name}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-3">
                                        <div className="mb-1 text-xs text-zinc-500">Descriptores</div>
                                        <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                          {(() => {
                                            const bid = editMap[a.id]?.bloque_conocimiento_id ?? a.bloque_conocimiento_id ?? null;
                                            const allowed = bid && blockDescMap[bid] && blockDescMap[bid]?.length ? blockDescMap[bid]! : Object.keys(descNames).map((x) => Number(x));
                                            const items = allowed
                                              .map((id) => ({ id, nombre: descNames[id] }))
                                              .filter((x) => !!x.nombre)
                                              .sort((x, y) => (x.nombre || "").localeCompare(y.nombre || "", "es", { sensitivity: "base" }));
                                            const curr = (editMap[a.id]?.descriptores_ids ?? descMap[a.id] ?? []);
                                            return items.map((it) => {
                                              const checked = curr.includes(it.id);
                                              return (
                                                <label key={`desc-${it.id}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.descriptores_ids ?? descMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, it.id] : base.filter((id) => id !== it.id);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], descriptores_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{it.nombre}</span>
                                                </label>
                                              );
                                            });
                                          })()}
                                        </div>
                                      </div>
                                      <div className="mt-3">
                                        <div className="mb-1 text-xs text-zinc-500">Ejes transversales de formación</div>
                                        <div className="max-h-48 overflow-y-auto rounded-md border border-zinc-200 bg-white px-3 py-2">
                                          {Object.entries(ejeNames)
                                            .map(([eid, nombre]) => ({ id: Number(eid), nombre }))
                                            .filter((x) => !!x.nombre)
                                            .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }))
                                            .map((it) => {
                                              const curr = (editMap[a.id]?.ejes_transversales_ids ?? ejeMap[a.id] ?? []);
                                              const checked = curr.includes(it.id);
                                              return (
                                                <label key={`eje-${it.id}`} className="flex items-center gap-2 py-0.5 text-sm">
                                                  <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                      const base = (editMap[a.id]?.ejes_transversales_ids ?? ejeMap[a.id] ?? []);
                                                      const next = e.target.checked ? [...base, it.id] : base.filter((id) => id !== it.id);
                                                      setEditMap((prev) => ({ ...prev, [a.id]: { ...prev[a.id], ejes_transversales_ids: next } }));
                                                    }}
                                                  />
                                                  <span>{it.nombre}</span>
                                                </label>
                                              );
                                            })}
                                        </div>
                                      </div>
                                      <div className="mt-4 flex items-center gap-2">
                                        <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50" disabled={!!saving[a.id]} onClick={async () => {
                                          setSaving((prev) => ({ ...prev, [a.id]: true }));
                                          const payload = {
                                            id: a.id,
                                            nombre: editMap[a.id]?.nombre ?? a.nombre,
                                            codigo: editMap[a.id]?.codigo ?? a.codigo,
                                            anio: editMap[a.id]?.anio ?? a.anio,
                                            regimen: editMap[a.id]?.regimen ?? a.regimen,
                                            horas_semanales_sincronicas: editMap[a.id]?.horas_semanales_sincronicas ?? a.horas_semanales_sincronicas,
                                            horas_totales_sincronicas: editMap[a.id]?.horas_totales_sincronicas ?? a.horas_totales_sincronicas,
                                            coeficiente_horas_trabajo_independiente: editMap[a.id]?.coeficiente_horas_trabajo_independiente ?? a.coeficiente_horas_trabajo_independiente,
                                            horas_trabajo_independiente_totales: editMap[a.id]?.horas_trabajo_independiente_totales ?? a.horas_trabajo_independiente_totales,
                                            horas_trabajo_totales: editMap[a.id]?.horas_trabajo_totales ?? a.horas_trabajo_totales,
                                            objetivos: editMap[a.id]?.objetivos ?? a.objetivos,
                                            contenidos_minimos: editMap[a.id]?.contenidos_minimos ?? a.contenidos_minimos,
                                            formacion_practica: editMap[a.id]?.formacion_practica ?? a.formacion_practica,
                                            horas_formacion_practica: editMap[a.id]?.horas_formacion_practica ?? a.horas_formacion_practica,
                                            bloque_conocimiento_id: editMap[a.id]?.bloque_conocimiento_id ?? a.bloque_conocimiento_id,
                                            correlativas_regularizadas_ids: editMap[a.id]?.correlativas_regularizadas_ids ?? regMap[a.id] ?? [],
                                            correlativas_aprobadas_ids: editMap[a.id]?.correlativas_aprobadas_ids ?? aprMap[a.id] ?? [],
                                            competencias_genericas_ids: editMap[a.id]?.competencias_genericas_ids ?? genMap[a.id] ?? [],
                                            competencias_especificas_ids: editMap[a.id]?.competencias_especificas_ids ?? espMap[a.id] ?? [],
                                            descriptores_ids: editMap[a.id]?.descriptores_ids ?? descMap[a.id] ?? [],
                                            ejes_transversales_ids: editMap[a.id]?.ejes_transversales_ids ?? ejeMap[a.id] ?? [],
                                          };
                                          const res = await fetch("/api/asignaturas/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                                          const j = await res.json();
                                          if (!res.ok) {
                                            alert(j?.error || "Error al guardar");
                                            setSaving((prev) => ({ ...prev, [a.id]: false }));
                                            return;
                                          }
                                          const updated = j?.asignatura as AsignaturaDB;
                                          setAsignaturas((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
                                          setDescMap((prev) => ({ ...prev, [a.id]: payload.descriptores_ids }));
                                          setSaving((prev) => ({ ...prev, [a.id]: false }));
                                        }}>
                                          {saving[a.id] ? "Guardando..." : "Guardar cambios"}
                                        </button>
                                        <button
                                          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                                          onClick={() => {
                                            const initial: Partial<AsignaturaDB> & { correlativas_regularizadas_ids?: number[]; correlativas_aprobadas_ids?: number[]; competencias_genericas_ids?: number[]; competencias_especificas_ids?: number[]; descriptores_ids?: number[] } = {
                                              nombre: a.nombre,
                                              codigo: a.codigo,
                                              anio: a.anio,
                                              regimen: a.regimen,
                                              horas_semanales_sincronicas: a.horas_semanales_sincronicas,
                                              horas_totales_sincronicas: a.horas_totales_sincronicas,
                                              horas_trabajo_independiente_totales: a.horas_trabajo_independiente_totales,
                                              horas_trabajo_totales: a.horas_trabajo_totales,
                                              coeficiente_horas_trabajo_independiente: a.coeficiente_horas_trabajo_independiente,
                                              objetivos: a.objetivos,
                                              contenidos_minimos: a.contenidos_minimos,
                                              formacion_practica: a.formacion_practica,
                                              horas_formacion_practica: a.horas_formacion_practica,
                                              bloque_conocimiento_id: a.bloque_conocimiento_id,
                                              correlativas_regularizadas_ids: regMap[a.id] ?? [],
                                              correlativas_aprobadas_ids: aprMap[a.id] ?? [],
                                              competencias_genericas_ids: genMap[a.id] ?? [],
                                              competencias_especificas_ids: espMap[a.id] ?? [],
                                              descriptores_ids: descMap[a.id] ?? [],
                                            };
                                            setEditMap((prev) => ({ ...prev, [a.id]: initial }));
                                            setExpandidos((prev) => ({ ...prev, [a.id]: false }));
                                          }}
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo I: Grilla</h2>
          <div className="mt-4 space-y-8">
            {["1º", "2º", "3º", "4º", "5º"].map((anioLabel) => {
              const items = asignaturas.filter((x) => (x.anio || "") === anioLabel);
              if (items.length === 0) return null;
              const fmt = (v: string | number | null | undefined) => {
                if (v === "" || v === null || v === undefined) return "-";
                const num = Number(v);
                if (!isFinite(num)) return String(v);
                return Number.isInteger(num) ? String(num) : num.toFixed(2);
              };
              const sum = (arr: (string | null | undefined)[]) => arr.reduce((acc, v) => acc + (Number(v || 0) || 0), 0);
              const totalSincronicas = sum(items.map((x) => x.horas_totales_sincronicas));
              const totalTI = sum(items.map((x) => x.horas_trabajo_independiente_totales));
              const totalTrabajo = sum(items.map((x) => x.horas_trabajo_totales));
              const abbr = (n: string) =>
                n === "Ciencias Básicas de la Ingeniería"
                  ? "CBI"
                  : n === "Tecnologías Básicas"
                  ? "TB"
                  : n === "Tecnologías Aplicadas"
                  ? "TA"
                  : n === "Ciencias y Tecnologías Complementarias"
                  ? "CTC"
                  : n || "";
              return (
                <div key={anioLabel}>
                  <h3 className="text-lg font-semibold">{anioLabel} Año</h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full table-fixed border border-zinc-300 text-sm">
                      <colgroup>
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                        <col style={{ width: "8.33%" }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="border border-zinc-300 px-2 py-1 text-center">Código</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Rég.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Hs. Sem. Sinc.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Sinc.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Bloq. Con.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Coef. Hs. Trab. Indep.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Trab. Indep.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Trab.</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Correlativas regularizadas para cursar</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Correlativas aprobadas para cursar</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Correlativas aprobadas para aprobar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...items]
                          .sort((a, b) => {
                            const ra = (a.regimen || "").toLowerCase();
                            const rb = (b.regimen || "").toLowerCase();
                            const order = (r: string) => {
                              if (r.includes("anual")) return 0;
                              if (r.includes("1º") || r.includes("1°") || r.includes("1er") || r.includes("1er cuatr") || r.includes("1º cuatr")) return 1;
                              if (r.includes("2º") || r.includes("2°") || r.includes("2do") || r.includes("2do cuatr") || r.includes("2º cuatr")) return 2;
                              return 3;
                            };
                            const oa = order(ra);
                            const ob = order(rb);
                            if (oa !== ob) return oa - ob;
                            return (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" });
                          })
                          .map((x) => {
                            const hsSem = x.horas_semanales_sincronicas || "";
                            const hsTot = x.horas_totales_sincronicas || "";
                            const coef = x.coeficiente_horas_trabajo_independiente || "";
                            const tiTot = x.horas_trabajo_independiente_totales || (coef && hsTot ? String(Number(coef) * Number(hsTot)) : "");
                            const trabTot = x.horas_trabajo_totales || (hsTot && tiTot ? String(Number(hsTot) + Number(tiTot)) : "");
                            const bname = x.bloque_conocimiento_id ? bloqueNames[x.bloque_conocimiento_id] || "" : "";
                            const regs = (regMap[x.id] || [])
                              .map((id) => asignaturas.find((g) => g.id === id)?.codigo || asignaturas.find((g) => g.id === id)?.nombre || "")
                              .filter(Boolean)
                              .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
                              .join("\n");
                            const aprs = (aprMap[x.id] || [])
                              .map((id) => asignaturas.find((g) => g.id === id)?.codigo || asignaturas.find((g) => g.id === id)?.nombre || "")
                              .filter(Boolean)
                              .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
                              .join("\n");
                            const aprsPara = (aprParaMap[x.id] || [])
                              .map((id) => asignaturas.find((g) => g.id === id)?.codigo || asignaturas.find((g) => g.id === id)?.nombre || "")
                              .filter(Boolean)
                              .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }))
                              .join("\n");
                            return (
                              <tr key={x.id}>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{x.codigo || "-"}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-left">{x.nombre}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{x.regimen || "-"}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(hsSem)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(hsTot)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{abbr(bname)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(coef)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(tiTot)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(trabTot)}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center"><div className="whitespace-pre-wrap">{regs || "-"}</div></td>
                              <td className="border border-zinc-300 px-2 py-1 text-center"><div className="whitespace-pre-wrap">{aprs || "-"}</div></td>
                              <td className="border border-zinc-300 px-2 py-1 text-center"><div className="whitespace-pre-wrap">{aprsPara || "-"}</div></td>
                            </tr>
                            );
                          })}
                        <tr className="bg-zinc-50 font-medium">
                          <td className="border border-zinc-300 px-2 py-1" colSpan={3}>Total Horas {anioLabel} Año</td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalSincronicas)}</td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalTI)}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalTrabajo)}</td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                          <td className="border border-zinc-300 px-2 py-1"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {(() => {
              const labels = ["1º", "2º", "3º", "4º", "5º"];
              const fmt = (v: string | number | null | undefined) => {
                if (v === "" || v === null || v === undefined) return "-";
                const num = Number(v);
                if (!isFinite(num)) return String(v);
                return Number.isInteger(num) ? String(num) : num.toFixed(2);
              };
              const sum = (arr: (string | null | undefined)[]) => arr.reduce((acc, v) => acc + (Number(v || 0) || 0), 0);
              const rows = labels.map((l) => {
                const items = asignaturas.filter((x) => (x.anio || "") === l);
                const sinc = sum(items.map((x) => x.horas_totales_sincronicas));
                const indep = sum(items.map((x) => x.horas_trabajo_independiente_totales));
                const trabajo = sum(items.map((x) => x.horas_trabajo_totales));
                return { anio: l, sinc, indep, trabajo };
              });
              const totalSinc = rows.reduce((a, r) => a + r.sinc, 0);
              const totalInd = rows.reduce((a, r) => a + r.indep, 0);
              const totalTrab = rows.reduce((a, r) => a + r.trabajo, 0);
              return (
                <div className="mt-8 overflow-x-auto">
                  <table className="min-w-full border border-zinc-300 text-sm">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-zinc-300 px-2 py-1 text-center">Año</th>
                        <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Sinc.</th>
                        <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Trab. Indep.</th>
                        <th className="border border-zinc-300 px-2 py-1 text-center">Cant. Total Hs. Trab.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={`sum-${r.anio}`}>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{r.anio}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.sinc)}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.indep)}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.trabajo)}</td>
                        </tr>
                      ))}
                      <tr className="bg-zinc-50 font-medium">
                        <td className="border border-zinc-300 px-2 py-1 text-center">TOTAL</td>
                        <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalSinc)}</td>
                        <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalInd)}</td>
                        <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalTrab)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}
            {(() => {
              const grupo: Record<string, number> = {};
              const nameFor = (bid?: number | null) => (bid ? bloqueNames[bid] || "" : "");
              const abbr = (n: string) =>
                n === "Ciencias Básicas de la Ingeniería"
                  ? "CBI"
                  : n === "Tecnologías Básicas"
                  ? "TB"
                  : n === "Tecnologías Aplicadas"
                  ? "TA"
                  : n === "Ciencias y Tecnologías Complementarias"
                  ? "CTC"
                  : n || "Sin bloque";
              const factorForRegimen = (r?: string | null) => {
                const rx = (r || "").toLowerCase();
                if (rx.includes("anual")) return 30;
                if (rx.includes("cuatr")) return 15;
                return 0;
              };
              for (const x of asignaturas) {
                const nombre = nameFor(x.bloque_conocimiento_id);
                const key = abbr(nombre);
                const hsSem = Number(x.horas_semanales_sincronicas || 0) || 0;
                const factor = factorForRegimen(x.regimen);
                const calcTot = hsSem && factor ? hsSem * factor : 0;
                const hsTot = Number(x.horas_totales_sincronicas || calcTot || 0) || 0;
                grupo[key] = (grupo[key] || 0) + hsTot;
              }
              const entries = Object.entries(grupo).filter(([, v]) => v > 0);
              if (entries.length === 0) return null;
              const total = entries.reduce((a, [, v]) => a + v, 0);
              const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));
              const palette: Record<string, string> = { CBI: "#3b82f6", TB: "#10b981", TA: "#f59e0b", CTC: "#ef4444", "Sin bloque": "#6b7280" };
              const r = 60;
              const c = 2 * Math.PI * r;
              let acc = 0;
              const arcs = entries.map(([k, v]) => {
                const frac = v / total;
                const seg = frac * c;
                const off = -acc * c;
                acc += frac;
                return { k, seg, off, color: palette[k] || "#6366f1" };
              });
              return (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Distribución de horas sincrónicas por bloque</h3>
                  <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-zinc-300 text-sm">
                        <thead>
                          <tr className="bg-zinc-100">
                            <th className="border border-zinc-300 px-2 py-1 text-center">Bloque</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Total Hs. Sinc.</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries
                            .sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }))
                            .map(([k, v]) => (
                              <tr key={`dist-${k}`}>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{k}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(v)}</td>
                                <td className="border border-zinc-300 px-2 py-1 text-center">{((v / total) * 100).toFixed(2)}%</td>
                              </tr>
                            ))}
                          <tr className="bg-zinc-50 font-medium">
                            <td className="border border-zinc-300 px-2 py-1 text-center">TOTAL</td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(total)}</td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-6">
                        <svg width="180" height="180" viewBox="0 0 160 160">
                          <g transform="translate(80,80)">
                            <circle r="60" cx="0" cy="0" fill="none" stroke="#e5e7eb" strokeWidth="24" />
                            {arcs.map((a) => (
                              <circle key={`arc-${a.k}`} r={r} cx="0" cy="0" fill="none" stroke={a.color} strokeWidth="24" strokeDasharray={`${a.seg} ${c}`} strokeDashoffset={a.off} transform="rotate(-90)" />
                            ))}
                          </g>
                        </svg>
                        <div className="space-y-2 text-sm">
                          {entries
                            .sort((a, b) => a[0].localeCompare(b[0], "es", { sensitivity: "base" }))
                            .map(([k, v]) => (
                              <div key={`legend-${k}`} className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: palette[k] || "#6366f1" }}></span>
                                <span>{k}</span>
                                <span className="text-zinc-500">{((v / total) * 100).toFixed(2)}%</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {(() => {
              const anios = ["1º", "2º", "3º", "4º", "5º"];
              const byYear: Record<string, AsignaturaDB[]> = {};
              for (const a of asignaturas) {
                const y = a.anio || "";
                byYear[y] = [...(byYear[y] || []), a];
              }
              const xGap = 220;
              const yGap = 120;
              const edgesAll = [] as { id: string; source: string; target: string }[];
              for (const t of asignaturas) {
                const regs = regMap[t.id] || [];
                for (const sId of regs) {
                  if (!asignaturas.find((x) => x.id === sId)) continue;
                  edgesAll.push({ id: `e-${sId}-${t.id}`, source: String(sId), target: String(t.id) });
                }
              }
              const years = filtroAnioMapa === "Todos" ? anios : [filtroAnioMapa];
              const baseNodes = [] as { id: string; position: { x: number; y: number }; type: "asignatura"; data: { label: string; expanded: boolean; related: boolean; onToggle: () => void } }[];
              for (let col = 0; col < years.length; col++) {
                const year = years[col];
                const list = (byYear[year] || []).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
                for (let row = 0; row < list.length; row++) {
                  const a = list[row];
                  const id = String(a.id);
                  const label = a.nombre;
                  baseNodes.push({
                    id,
                    position: { x: row * xGap, y: col * yGap },
                    type: "asignatura",
                    data: {
                      label,
                      expanded: !!expandedMap[id],
                      related: false,
                      onToggle: () => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }))
                    }
                  });
                }
              }
              let nodes = baseNodes;
              if (nodoSeleccionado) {
                const sel = nodoSeleccionado;
                const incoming = edgesAll.filter((e) => e.target === sel).map((e) => e.source);
                const aprChildren = (aprMap[Number(sel)] || []).map((id) => String(id));
                const center = baseNodes.find((n) => n.id === sel)?.position || { x: 0, y: 0 };
                const xStep = Math.max(140, xGap * 0.75);
                const posRegY = center.y + yGap;
                const posAprY = center.y + 2 * yGap;
                const makeRowPositions = (count: number) => {
                  const half = (count - 1) / 2;
                  return Array.from({ length: count }, (_, i) => center.x + (i - half) * xStep);
                };
                nodes = [];
                // selected node stays in place
                nodes.push({
                  id: sel,
                  position: center,
                  type: "asignatura",
                  data: { label: asignaturas.find((a) => String(a.id) === sel)?.nombre || sel, expanded: true, related: false, onToggle: () => setExpandedMap((prev) => ({ ...prev, [sel]: !prev[sel] })) }
                });
                const regXs = makeRowPositions(incoming.length);
                incoming
                  .sort((a, b) => {
                    const an = asignaturas.find((x) => String(x.id) === a)?.nombre || "";
                    const bn = asignaturas.find((x) => String(x.id) === b)?.nombre || "";
                    return an.localeCompare(bn, "es", { sensitivity: "base" });
                  })
                  .forEach((id, i) => {
                    nodes.push({
                      id,
                      position: { x: regXs[i], y: posRegY },
                      type: "asignatura",
                      data: { label: asignaturas.find((a) => String(a.id) === id)?.nombre || id, expanded: !!expandedMap[id], related: true, onToggle: () => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] })) }
                    });
                  });
                const aprXs = makeRowPositions(aprChildren.length);
                aprChildren
                  .sort((a, b) => {
                    const an = asignaturas.find((x) => String(x.id) === a)?.nombre || "";
                    const bn = asignaturas.find((x) => String(x.id) === b)?.nombre || "";
                    return an.localeCompare(bn, "es", { sensitivity: "base" });
                  })
                  .forEach((id, i) => {
                    nodes.push({
                      id,
                      position: { x: aprXs[i], y: posAprY },
                      type: "asignatura",
                      data: { label: asignaturas.find((a) => String(a.id) === id)?.nombre || id, expanded: !!expandedMap[id], related: true, onToggle: () => setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] })) }
                    });
                  });
              }
              const nodeIds = new Set(nodes.map((n) => n.id));
              let edges = edgesAll.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
              const relatedIds = new Set<string>();
              for (const e of edges) {
                if (expandedMap[e.source]) relatedIds.add(e.target);
                if (expandedMap[e.target]) relatedIds.add(e.source);
              }
              const nodesStyled = nodes.map((n) => ({
                ...n,
                data: { ...n.data, related: relatedIds.has(n.id) && !n.data.expanded },
              }));
              if (nodoSeleccionado) {
                const sel = nodoSeleccionado;
                const regEdges = (regMap[Number(sel)] || []).map((id) => ({ id: `e-reg-${id}-${sel}`, source: String(id), target: sel }));
                const aprEdges = (aprMap[Number(sel)] || []).map((id) => ({ id: `e-apr-${id}-${sel}`, source: String(id), target: sel }));
                edges = [...regEdges, ...aprEdges];
              } else {
                edges = edges.filter((e) => (expandedMap[e.source] || expandedMap[e.target]));
              }
              if (soloConexionesSeleccion && nodoSeleccionado) {
                edges = edges.filter((e) => e.source === nodoSeleccionado || e.target === nodoSeleccionado);
              }
              if (!nodes.length) return null;
              return (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Mapa mental de correlativas regulares</h3>
                  <div className="mt-3 rounded-lg border border-zinc-200">
                    <div className="flex flex-wrap items-center gap-3 px-3 py-2">
                      <label className="text-sm">
                        <span className="mr-2">Año:</span>
                        <select className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" value={filtroAnioMapa} onChange={(e) => setFiltroAnioMapa(e.target.value)}>
                          <option>Todos</option>
                          {anios.map((a) => (
                            <option key={`opt-${a}`}>{a}</option>
                          ))}
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={soloConexionesSeleccion} onChange={(e) => setSoloConexionesSeleccion(e.target.checked)} />
                        <span>Mostrar solo conexiones del nodo seleccionado</span>
                      </label>
                      <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" onClick={() => setNodoSeleccionado(null)}>Limpiar selección</button>
                      <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" onClick={() => setExpandedMap((prev) => {
                        const next: Record<string, boolean> = {};
                        nodes.forEach((n) => { next[n.id] = true; });
                        return next;
                      })}>Expandir todo</button>
                      <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm" onClick={() => setExpandedMap((prev) => {
                        const next: Record<string, boolean> = {};
                        nodes.forEach((n) => { next[n.id] = false; });
                        return next;
                      })}>Contraer todo</button>
                    </div>
                    <div style={{ width: "100%", height: 500 }}>
                      <ReactFlow
                        nodes={nodesStyled}
                        edges={edges}
                        fitView
                        defaultEdgeOptions={{ type: "straight" }}
                        onNodeClick={(_, n) => {
                          setNodoSeleccionado((curr) => {
                            if (curr === n.id) return null;
                            setExpandedMap((prev) => ({ ...prev, [n.id]: true }));
                            return n.id;
                          });
                        }}
                        onPaneClick={() => setNodoSeleccionado(null)}
                        nodeTypes={{ asignatura: AsigNode }}
                      >
                        <Controls />
                        <Background />
                      </ReactFlow>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">Cada flecha indica una correlativa regular requerida.</p>
                </div>
              );
            })()}
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo II: Núcleos temáticos agrupados por Bloques de Conocimiento, sobre la base de lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación</h2>
          <div className="mt-4 space-y-8">
            {(() => {
              const blockIds = Object.keys(bloqueNames).map((x) => Number(x));
              const byBlock: Record<number, AsignaturaDB[]> = {};
              for (const a of asignaturas) {
                const bid = a.bloque_conocimiento_id ?? 0;
                byBlock[bid] = [...(byBlock[bid] || []), a];
              }
              const factorForRegimen = (r?: string | null) => {
                const rx = (r || "").toLowerCase();
                if (rx.includes("anual")) return 30;
                if (rx.includes("cuatr")) return 15;
                return 0;
              };
              const fmt = (v: number | string | null | undefined) => {
                const n = Number(v ?? 0);
                return n ? (Number.isInteger(n) ? String(n) : n.toFixed(2)) : "-";
              };
              const blocksWithItems = blockIds.filter((bid) => (byBlock[bid] || []).length > 0);
              const sections = blocksWithItems.map((bid) => {
                  const nombreBloque = bloqueNames[bid];
                  const items = [...(byBlock[bid] || [])].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
                  const rows = items.flatMap((x) => {
                    const descIds = descMap[x.id] || [];
                    const descList = descIds
                      .map((id) => descNames[id])
                      .filter(Boolean)
                      .sort((a, b) => (a || "").localeCompare(b || "", "es", { sensitivity: "base" }));
                    const hsSem = Number(x.horas_semanales_sincronicas || 0) || 0;
                    const factor = factorForRegimen(x.regimen);
                    const calcTot = hsSem && factor ? hsSem * factor : 0;
                    const hsTot = Number(x.horas_totales_sincronicas || calcTot || 0) || 0;
                    const hsMin = null; // Pendiente de norma; se deja vacía
                    if (descList.length === 0) {
                      return [{ nombre: x.nombre, descriptor: "-", hsMin, hsTot, first: true, span: 1 }];
                    }
                    return descList.map((d, i) => ({ nombre: x.nombre, descriptor: d as string, hsMin, hsTot, first: i === 0, span: descList.length }));
                  });
                  const totalOfrecidas = items.reduce((a, x) => {
                    const hsSem = Number(x.horas_semanales_sincronicas || 0) || 0;
                    const factor = factorForRegimen(x.regimen);
                    const calcTot = hsSem && factor ? hsSem * factor : 0;
                    const hsTot = Number(x.horas_totales_sincronicas || calcTot || 0) || 0;
                    return a + hsTot;
                  }, 0);
                  const totalMin = Number(bloqueMins[bid] || 0);
                  return (
                    <div key={`bloque-${bid}`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed border border-zinc-300 text-sm">
                          <colgroup>
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "25%" }} />
                            <col style={{ width: "35%" }} />
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "10%" }} />
                          </colgroup>
                          <thead>
                            <tr className="bg-zinc-100">
                              <th className="border border-zinc-300 px-2 py-1 text-center">Bloque de Conocimiento</th>
                              <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                              <th className="border border-zinc-300 px-2 py-1 text-center">Descriptores</th>
                              <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Min.</th>
                              <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Ofrecidas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r, idx) => (
                              <tr key={`row-${bid}-${idx}`}>
                                {idx === 0 ? (
                                  <td className="border border-zinc-300 px-2 py-1 align-top text-left" rowSpan={rows.length + 1}>{nombreBloque}</td>
                                ) : null}
                                {r.first ? (
                                  <td className="border border-zinc-300 px-2 py-1 text-left" rowSpan={r.span}>{r.nombre}</td>
                                ) : null}
                                <td className={`border border-zinc-300 px-2 py-1 ${r.descriptor === "-" ? "text-center" : "text-left"}`}>{r.descriptor}</td>
                                {r.first ? (
                                  <td className="border border-zinc-300 px-2 py-1 text-center" rowSpan={r.span}>{fmt(r.hsMin)}</td>
                                ) : null}
                                {r.first ? (
                                  <td className="border border-zinc-300 px-2 py-1 text-center" rowSpan={r.span}>{fmt(r.hsTot)}</td>
                                ) : null}
                              </tr>
                            ))}
                            <tr className="bg-zinc-50 font-medium">
                              <td className="border border-zinc-300 px-2 py-1" colSpan={2}>TOTAL DE {nombreBloque.toUpperCase()}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalMin)}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalOfrecidas)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                });
              const sumForBlock = (bid: number) => {
                const items = byBlock[bid] || [];
                const offered = items.reduce((a, x) => {
                  const hsSem = Number(x.horas_semanales_sincronicas || 0) || 0;
                  const factor = factorForRegimen(x.regimen);
                  const calcTot = hsSem && factor ? hsSem * factor : 0;
                  const hsTot = Number(x.horas_totales_sincronicas || calcTot || 0) || 0;
                  return a + hsTot;
                }, 0);
                const min = Number(bloqueMins[bid] || 0);
                return { min, offered };
              };
              const summaryRows = blocksWithItems.map((bid) => ({ bid, nombre: bloqueNames[bid], ...sumForBlock(bid) }));
              const totalMinAll = summaryRows.reduce((a, r) => a + r.min, 0);
              const totalOfferedAll = summaryRows.reduce((a, r) => a + r.offered, 0);
              return (
                <>
                  {sections}
                  <div className="overflow-x-auto">
                    <table className="mt-6 min-w-full border border-zinc-300 text-sm">
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="border border-zinc-300 px-2 py-1 text-center">Bloque de Conocimiento</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Mínimas</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Ofrecidas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryRows
                          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }))
                          .map((r) => (
                            <tr key={`sum-block-${r.bid}`}>
                              <td className="border border-zinc-300 px-2 py-1 text-left">{r.nombre}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.min)}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.offered)}</td>
                            </tr>
                          ))}
                        <tr className="bg-zinc-50 font-medium">
                          <td className="border border-zinc-300 px-2 py-1 text-left">TOTAL</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalMinAll)}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalOfferedAll)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo III: Criterios de intensidad de la Formación Práctica según lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación</h2>
          <div className="mt-4 space-y-8">
            {(() => {
              const blockIds = Object.keys(bloqueNames).map((x) => Number(x));
              const byBlock: Record<number, AsignaturaDB[]> = {};
              for (const a of asignaturas) {
                const bid = a.bloque_conocimiento_id ?? 0;
                byBlock[bid] = [...(byBlock[bid] || []), a];
              }
              const fmt = (v: number | string | null | undefined) => {
                const n = Number(v ?? 0);
                return n ? (Number.isInteger(n) ? String(n) : n.toFixed(2)) : "-";
              };
              const blocksWithItems = blockIds.filter((bid) => (byBlock[bid] || []).length > 0);
              const sections = blocksWithItems.map((bid) => {
                const nombreBloque = bloqueNames[bid];
                const items = [...(byBlock[bid] || [])].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
                const rows = items.map((x) => {
                  const fp = x.formacion_practica || "";
                  const hsOf = Number(x.horas_formacion_practica || 0) || 0;
                  const hsMin = null;
                  return { nombre: x.nombre, fp, hsMin, hsOf };
                });
                const totalOfrecidas = rows.reduce((a, r) => a + (Number(r.hsOf || 0) || 0), 0);
                const totalMin = rows.reduce((a, r) => a + (Number(r.hsMin || 0) || 0), 0);
                return (
                  <div key={`fp-bloque-${bid}`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed border border-zinc-300 text-sm">
                        <colgroup>
                          <col style={{ width: "20%" }} />
                          <col style={{ width: "25%" }} />
                          <col style={{ width: "35%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "10%" }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-zinc-100">
                            <th className="border border-zinc-300 px-2 py-1 text-center">Bloque de Conocimiento</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Formación Práctica</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Min. de Formación Práctica</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Ofrecidas de Formación Práctica</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, idx) => (
                            <tr key={`fp-row-${bid}-${idx}`}>
                              {idx === 0 ? (
                                <td className="border border-zinc-300 px-2 py-1 align-top text-left" rowSpan={rows.length + 1}>{nombreBloque}</td>
                              ) : null}
                              <td className="border border-zinc-300 px-2 py-1 text-left">{r.nombre}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-left">{r.fp || "-"}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.hsMin)}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.hsOf)}</td>
                            </tr>
                          ))}
                          <tr className="bg-zinc-50 font-medium">
                            <td className="border border-zinc-300 px-2 py-1 text-center" colSpan={2}>TOTAL DE HORAS DE FORMACIÓN PRÁCTICA EN {nombreBloque.toUpperCase()}</td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalMin)}</td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalOfrecidas)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              });
              const sumForBlock = (bid: number) => {
                const items = byBlock[bid] || [];
                const offered = items.reduce((a, x) => a + (Number(x.horas_formacion_practica || 0) || 0), 0);
                const min = 0;
                return { min, offered };
              };
              const summaryRows = blocksWithItems.map((bid) => ({ bid, nombre: bloqueNames[bid], ...sumForBlock(bid) }));
              const totalMinAll = 750;
              const totalOfferedAll = summaryRows.reduce((a, r) => a + r.offered, 0);
              return (
                <>
                  {sections}
                  <div className="overflow-x-auto">
                    <table className="mt-6 min-w-full border border-zinc-300 text-sm">
                        <thead>
                          <tr className="bg-zinc-100">
                            <th className="border border-zinc-300 px-2 py-1 text-center">Bloque de Conocimiento</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Min. de Formación Práctica</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Hs. Ofrecidas de Formación Práctica</th>
                          </tr>
                        </thead>
                      <tbody>
                        {summaryRows
                          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }))
                          .map((r) => (
                            <tr key={`fp-sum-block-${r.bid}`}>
                              <td className="border border-zinc-300 px-2 py-1 text-left">{r.nombre}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.min)}</td>
                              <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.offered)}</td>
                            </tr>
                          ))}
                        <tr className="bg-zinc-50 font-medium">
                          <td className="border border-zinc-300 px-2 py-1 text-left">TOTAL</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalMinAll)}</td>
                          <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(totalOfferedAll)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo IV: Programas Sintéticos</h2>
          <div className="mt-4 space-y-8">
            {(() => {
              const fmt = (v: number | string | null | undefined) => {
                const n = Number(v ?? 0);
                return n ? (Number.isInteger(n) ? String(n) : n.toFixed(2)) : "-";
              };
              const factorForRegimen = (r?: string | null) => {
                const rx = (r || "").toLowerCase();
                if (rx.includes("anual")) return 30;
                if (rx.includes("cuatr")) return 15;
                return 0;
              };
              const coefForBloque = (bid?: number | null) => {
                const name = bid ? (bloqueNames[bid] || "") : "";
                if (name === "Ciencias Básicas de la Ingeniería") return 1.25;
                if (name === "Tecnologías Básicas") return 1.5;
                if (name === "Tecnologías Aplicadas") return 2.0;
                if (name === "Ciencias y Tecnologías Complementarias") return 1.0;
                return 0;
              };
              const aNames: Record<number, string> = {};
              const aCodes: Record<number, string> = {};
              for (const a of asignaturas) {
                aNames[a.id] = a.nombre || String(a.id);
                aCodes[a.id] = (a.codigo || "").trim();
              }
              const items = [...asignaturas].sort((a, b) => {
                const ac = (a.codigo || "").trim();
                const bc = (b.codigo || "").trim();
                const byCode = ac.localeCompare(bc, "es", { sensitivity: "base" });
                if (byCode !== 0) return byCode;
                return (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" });
              });
              return items.map((a) => {
                const bid = a.bloque_conocimiento_id ?? null;
                const bloque = bid ? (bloqueNames[bid] || "-") : "-";
                const hsSem = Number(a.horas_semanales_sincronicas || 0) || 0;
                const factor = factorForRegimen(a.regimen);
                const hsTotSync = Number(a.horas_totales_sincronicas || 0) || (hsSem && factor ? hsSem * factor : 0);
                const coefTI = Number(a.coeficiente_horas_trabajo_independiente || 0) || coefForBloque(bid);
                const hsTI = Number(a.horas_trabajo_independiente_totales || 0) || (hsTotSync && coefTI ? hsTotSync * coefTI : 0);
                const hsTrabTot = Number(a.horas_trabajo_totales || 0) || (hsTotSync + hsTI);
                const corrReg = (regMap[a.id] || [])
                  .map((id) => aCodes[id])
                  .filter((x) => !!x)
                  .sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }))
                  .join(", ");
                const corrApr = (aprMap[a.id] || [])
                  .map((id) => aCodes[id])
                  .filter((x) => !!x)
                  .sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }))
                  .join(", ");
                const compsGenArr = (genMap[a.id] || []).map((id) => genNames[id]).filter(Boolean).sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }));
                const compsEspArr = (espMap[a.id] || []).map((id) => espNames[id]).filter(Boolean).sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }));
                const ejesArr = (ejeMap[a.id] || []).map((id) => ejeNames[id]).filter(Boolean).sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }));
                const descArr = (descMap[a.id] || []).map((id) => descNames[id]).filter(Boolean).sort((x, y) => x.localeCompare(y, "es", { sensitivity: "base" }));
                const objetivosArr = String(a.objetivos || "")
                  .split(/\r?\n+/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <div key={`prog-${a.id}`} className="overflow-x-auto">
                    <table className="min-w-full table-fixed border border-zinc-300 text-sm">
                      <colgroup>
                        <col style={{ width: "33.3333%" }} />
                        <col style={{ width: "33.3333%" }} />
                        <col style={{ width: "33.3333%" }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Asignatura: <span className="font-semibold">{a.nombre}</span></td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Año: {a.anio || "-"}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Código: <span className="font-semibold">{a.codigo || "-"}</span></td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Régimen: {a.regimen || "-"}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad de Horas Semanales Sincrónicas: {fmt(a.horas_semanales_sincronicas)}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad Total de Horas Sincrónicas: {fmt(hsTotSync)}</td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Bloque de Conocimiento: {bloque}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Coeficiente de Horas de Trabajo Independiente: {fmt(coefTI)}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad Total de Horas de Trabajo Independiente: {fmt(hsTI)}</td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad Total de Horas de Trabajo: {fmt(hsTrabTot)}</td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">
                            <div>Asignaturas correlativas para cursar:</div>
                            <div className="mt-1">
                              <ul className="list-disc pl-5">
                                <li>
                                  Correlativas regularizadas:
                                  {(() => {
                                    const arr = (regMap[a.id] || [])
                                      .map((id) => ({ code: (aCodes[id] || "").trim(), name: aNames[id] }))
                                      .filter((p) => p.code || p.name)
                                      .sort((x, y) => (x.code || "").localeCompare(y.code || "", "es", { sensitivity: "base" }));
                                    return arr.length ? (
                                      <ul className="list-disc pl-5">
                                        {arr.map((p, i) => (
                                          <li key={`cr-${a.id}-${i}`}>{p.code ? `${p.code} - ${p.name || ""}` : `${p.name || ""}`}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span> -</span>
                                    );
                                  })()}
                                </li>
                                <li>
                                  Correlativas aprobadas:
                                  {(() => {
                                    const arr = (aprMap[a.id] || [])
                                      .map((id) => ({ code: (aCodes[id] || "").trim(), name: aNames[id] }))
                                      .filter((p) => p.code || p.name)
                                      .sort((x, y) => (x.code || "").localeCompare(y.code || "", "es", { sensitivity: "base" }));
                                    return arr.length ? (
                                      <ul className="list-disc pl-5">
                                        {arr.map((p, i) => (
                                          <li key={`ca-${a.id}-${i}`}>{p.code ? `${p.code} - ${p.name || ""}` : `${p.name || ""}`}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span> -</span>
                                    );
                                  })()}
                                </li>
                              </ul>
                            </div>
                          </td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">
                            <div>Asignaturas correlativas aprobadas para aprobar:</div>
                            <div className="mt-1">
                              {(() => {
                                const arr = (aprParaMap[a.id] || [])
                                  .map((id) => ({ code: (aCodes[id] || "").trim(), name: aNames[id] }))
                                  .filter((p) => p.code || p.name)
                                  .sort((x, y) => (x.code || "").localeCompare(y.code || "", "es", { sensitivity: "base" }));
                                return arr.length ? (
                                  <ul className="list-disc pl-5">
                                    {arr.map((p, i) => (
                                      <li key={`ca-${a.id}-${i}`}>{p.code ? `${p.code} - ${p.name || ""}` : `${p.name || ""}`}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>-</span>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top">
                            <div>Descriptores de conocimiento:</div>
                            <div>
                              {descArr.length ? (
                                <ul className="list-disc pl-5">
                                  {descArr.map((x, i) => (
                                    <li key={`desc-${a.id}-${i}`}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">
                            <div>Ejes transversales de formación:</div>
                            <div>
                              {ejesArr.length ? (
                                <ul className="list-disc pl-5">
                                  {ejesArr.map((x, i) => (
                                    <li key={`eje-${a.id}-${i}`}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">
                            <div>Objetivos:</div>
                            <div>
                              {objetivosArr.length ? (
                                <ul className="list-disc pl-5">
                                  {objetivosArr.map((x, i) => (
                                    <li key={`obj-${a.id}-${i}`}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-1 align-top"><div className="whitespace-pre-wrap">Contenidos Mínimos: {a.contenidos_minimos || "-"}</div></td>
                          <td className="border border-zinc-300 px-2 py-1 align-top"><div className="whitespace-pre-wrap">Formación Práctica: {a.formacion_practica || "-"}</div></td>
                          <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad de horas de formación práctica: {fmt(a.horas_formacion_practica)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              });
            })()}
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo V: Oferta de Asignaturas Optativas</h2>
          <div className="mt-4 space-y-8">
            {optativas.length === 0 ? (
              <div className="text-sm text-zinc-500">No hay asignaturas optativas cargadas.</div>
            ) : (
              optativas.map((o) => {
                const objs = String(o.objetivos || "")
                  .split(/\r?\n+/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <div key={`opt-${o.id}`} className="overflow-x-auto">
                    <table className="min-w-full border border-zinc-300 text-sm">
                      <tbody>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 font-semibold">{o.nombre}</td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div>Objetivos:</div>
                            <div>
                              {objs.length ? (
                                <ul className="list-disc pl-5">
                                  {objs.map((x, i) => (
                                    <li key={`opt-obj-${o.id}-${i}`}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div>Contenidos Mínimos:</div>
                            <div className="whitespace-pre-wrap">{o.contenidos_minimos || "-"}</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div>Formación Práctica:</div>
                            <div className="whitespace-pre-wrap">{o.formacion_practica || "-"}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo VI: Equivalencias entre Plan 2026 y Plan 2011</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full table-fixed border border-zinc-300 text-sm">
              <colgroup>
                <col style={{ width: "15%" }} />
                <col style={{ width: "35%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "35%" }} />
              </colgroup>
              <thead>
                <tr className="bg-zinc-100">
                  <th className="border border-zinc-300 px-2 py-1 text-center" colSpan={2}>Plan 2026</th>
                  <th className="border border-zinc-300 px-2 py-1 text-center" colSpan={2}>Plan 2011</th>
                </tr>
                <tr className="bg-zinc-50">
                  <th className="border border-zinc-300 px-2 py-1 text-center">Código</th>
                  <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                  <th className="border border-zinc-300 px-2 py-1 text-center">Nº</th>
                  <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                </tr>
              </thead>
              <tbody>
                {[...asignaturas]
                  .sort((a, b) => (a.codigo || "").localeCompare(b.codigo || "", "es", { sensitivity: "base" }))
                  .map((a) => {
                    const eqIds = eq2011Map[a.id] || [];
                    const pairs = eqIds.map((pid) => ({
                      num: (plan2011Numero[pid] || "").trim(),
                      nom: (plan2011Nombre[pid] || "").trim(),
                    })).filter((p) => p.num || p.nom);
                    const rows = pairs.length ? pairs : [{ num: "-", nom: "-" }];
                    return rows.map((p, i) => (
                      <tr key={`eq-${a.id}-${i}`}>
                        {i === 0 ? (
                          <td className="border border-zinc-300 px-2 py-1 text-center" rowSpan={rows.length}>{a.codigo || "-"}</td>
                        ) : null}
                        {i === 0 ? (
                          <td className="border border-zinc-300 px-2 py-1 text-left" rowSpan={rows.length}>{a.nombre}</td>
                        ) : null}
                        <td className="border border-zinc-300 px-2 py-1 text-center">{p.num || "-"}</td>
                        <td className="border border-zinc-300 px-2 py-1 text-left">{p.nom || "-"}</td>
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}