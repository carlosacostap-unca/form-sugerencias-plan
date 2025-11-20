"use client";
import { useEffect, useState } from "react";
import { getSupabaseAnon } from "../../lib/supabase";

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

export default function PresentacionPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [cargando, setCargando] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});
  const [editMap, setEditMap] = useState<Record<number, Partial<AsignaturaDB> & { correlativas_regularizadas_ids?: number[]; correlativas_aprobadas_ids?: number[]; competencias_genericas_ids?: number[]; competencias_especificas_ids?: number[]; descriptores_ids?: number[] }>>({});
  const [regMap, setRegMap] = useState<Record<number, number[]>>({});
  const [aprMap, setAprMap] = useState<Record<number, number[]>>({});
  const [genMap, setGenMap] = useState<Record<number, number[]>>({});
  const [espMap, setEspMap] = useState<Record<number, number[]>>({});
  const [genNames, setGenNames] = useState<Record<number, string>>({});
  const [espNames, setEspNames] = useState<Record<number, string>>({});
  const [bloqueNames, setBloqueNames] = useState<Record<number, string>>({});
  const [bloqueMins, setBloqueMins] = useState<Record<number, number>>({});
  const [optativas, setOptativas] = useState<{ id: number; nombre: string; objetivos?: string | null; contenidos_minimos?: string | null; formacion_practica?: string | null }[]>([]);
  const [descNames, setDescNames] = useState<Record<number, string>>({});
  const [descMap, setDescMap] = useState<Record<number, number[]>>({});
  const [blockDescMap, setBlockDescMap] = useState<Record<number, number[]>>({});
  const [plan2011Nombre, setPlan2011Nombre] = useState<Record<number, string>>({});
  const [plan2011Numero, setPlan2011Numero] = useState<Record<number, string>>({});
  const [eq2011Map, setEq2011Map] = useState<Record<number, number[]>>({});

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
        const nextEditMap: Record<number, Partial<AsignaturaDB>> = {};
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
        const [regs, aprs, gens, esps, genTbl, espTbl, bloquesTbl, descTbl, bcdRel, adRel, optTbl, p11Tbl, eqTbl] = await Promise.all([
          supabase.from("asignatura_correlativas_regularizadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_correlativas_aprobadas").select("asignatura_id,correlativa_id"),
          supabase.from("asignatura_competencias_genericas").select("asignatura_id,competencia_generica_id"),
          supabase.from("asignatura_competencias_especificas").select("asignatura_id,competencia_especifica_id"),
          supabase.from("competencias_genericas").select("id,nombre").order("nombre"),
          supabase.from("competencias_especificas").select("id,nombre").order("nombre"),
          supabase.from("bloques_conocimiento").select("id,nombre,horas_minimas").order("nombre"),
          supabase.from("bloque_descriptores").select("id,nombre").order("nombre"),
          supabase.from("bloques_conocimiento_descriptores").select("bloque_conocimiento_id,descriptor_id"),
          supabase.from("asignatura_descriptores").select("asignatura_id,descriptor_id"),
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
        setRegMap(rMap);
        setAprMap(aMap);
        setGenMap(gMap);
        setEspMap(eMap);
        setGenNames(gNames);
        setEspNames(eNames);
        setBloqueNames(bNames);
        setBloqueMins(bMins);
        setDescNames(dNames);
        setBlockDescMap(bdMap);
        setDescMap(dMap);
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

  return (
    <div className="min-h-screen w-full bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow">
          <h1 className="text-2xl font-semibold">Presentación de la Adecuación del Plan de Estudios de Ingeniería en Informática</h1>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 text-zinc-900 shadow">
          <h2 className="text-xl font-semibold">Anexo I: Grilla</h2>
          <div className="mt-4 space-y-8">
            {(() => {
              const ANIOS = ["1º", "2º", "3º", "4º", "5º"];
              const labels = ANIOS;
              const fmt = (v: string | number | null | undefined) => {
                if (v === "" || v === null || v === undefined) return "-";
                const num = Number(v);
                if (!isFinite(num)) return String(v);
                return Number.isInteger(num) ? String(num) : num.toFixed(2);
              };
              const sum = (arr: (string | null | undefined)[]) => arr.reduce((acc, v) => acc + (Number(v || 0) || 0), 0);
              return labels.map((anioLabel) => {
                const items = asignaturas.filter((x) => (x.anio || "") === anioLabel);
                if (items.length === 0) return null;
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
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
                          <col style={{ width: "9.09%" }} />
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
                            <th className="border border-zinc-300 px-2 py-1 text-center">Correlativas regularizadas</th>
                            <th className="border border-zinc-300 px-2 py-1 text-center">Correlativas aprobadas</th>
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
                              const fmt2 = (v: string | number | null | undefined) => {
                                if (v === "" || v === null || v === undefined) return "-";
                                const num = Number(v);
                                if (!isFinite(num)) return String(v);
                                return Number.isInteger(num) ? String(num) : num.toFixed(2);
                              };
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
                              return (
                                <tr key={x.id}>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{x.codigo || "-"}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-left">{x.nombre}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{x.regimen || "-"}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{fmt2(hsSem)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{fmt2(hsTot)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{abbr(bname)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{fmt2(coef)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{fmt2(tiTot)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center">{fmt2(trabTot)}</td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center"><div className="whitespace-pre-wrap">{regs || "-"}</div></td>
                                  <td className="border border-zinc-300 px-2 py-1 text-center"><div className="whitespace-pre-wrap">{aprs || "-"}</div></td>
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
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              });
            })()}
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
                  const hsMin = null;
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
                                <td className="border border-zinc-300 px-2 py-1 text-center" rowSpan={r.span}>{fmt(totalMin ? r.hsMin : r.hsMin)}</td>
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
              const items = asignaturas;
              if (!items.length) return null;
              const fmtArr = (s?: string | null) => {
                const t = String(s || "").trim();
                if (!t) return [] as string[];
                return t
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean);
              };
              return items
                .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }))
                .map((a) => {
                  const objetivosArr = fmtArr(a.objetivos);
                  return (
                    <div key={`prog-${a.id}`} className="overflow-x-auto">
                      <table className="min-w-full border border-zinc-300 text-sm">
                        <thead>
                          <tr className="bg-zinc-100">
                            <th className="border border-zinc-300 px-2 py-1 text-left">Asignatura</th>
                            <th className="border border-zinc-300 px-2 py-1 text-left">Competencias</th>
                            <th className="border border-zinc-300 px-2 py-1 text-left">Contenidos Mínimos</th>
                            <th className="border border-zinc-300 px-2 py-1 text-left">Formación Práctica</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-zinc-300 px-2 py-1 align-top">{a.nombre}</td>
                            <td className="border border-zinc-300 px-2 py-1 align-top">
                              <div>Competencias Genéricas:</div>
                              <div>
                                {(genMap[a.id] || []).length ? (
                                  <ul className="list-disc pl-5">
                                    {(genMap[a.id] || [])
                                      .map((id) => genNames[id])
                                      .filter(Boolean)
                                      .sort((a, b) => (a || "").localeCompare(b || "", "es", { sensitivity: "base" }))
                                      .map((x, i) => (
                                        <li key={`gen-${a.id}-${i}`}>{x}</li>
                                      ))}
                                  </ul>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                              <div className="mt-2">Competencias Específicas:</div>
                              <div>
                                {(espMap[a.id] || []).length ? (
                                  <ul className="list-disc pl-5">
                                    {(espMap[a.id] || [])
                                      .map((id) => espNames[id])
                                      .filter(Boolean)
                                      .sort((a, b) => (a || "").localeCompare(b || "", "es", { sensitivity: "base" }))
                                      .map((x, i) => (
                                        <li key={`esp-${a.id}-${i}`}>{x}</li>
                                      ))}
                                  </ul>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                            </td>
                            <td className="border border-zinc-300 px-2 py-1 align-top">
                              <div className="whitespace-pre-wrap">{a.contenidos_minimos || "-"}</div>
                            </td>
                            <td className="border border-zinc-300 px-2 py-1 align-top">
                              <div className="whitespace-pre-wrap">{a.formacion_practica || "-"}</div>
                            </td>
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
              <div className="rounded-md border border-zinc-300 p-3 text-sm text-zinc-600">No hay asignaturas optativas registradas</div>
            ) : (
              optativas.map((o) => {
                return (
                  <div key={`opt-${o.id}`} className="overflow-x-auto">
                    <table className="min-w-full border border-zinc-300 text-sm">
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="border border-zinc-300 px-2 py-1 text-left">Asignatura</th>
                          <th className="border border-zinc-300 px-2 py-1 text-left">Objetivos</th>
                          <th className="border border-zinc-300 px-2 py-1 text-left">Contenidos Mínimos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 align-top">{o.nombre}</td>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div className="whitespace-pre-wrap">{o.objetivos || "-"}</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div>Formación Práctica:</div>
                            <div className="whitespace-pre-wrap">{o.formacion_practica || "-"}</div>
                          </td>
                          <td className="border border-zinc-300 px-2 py-2 align-top">
                            <div className="whitespace-pre-wrap">{o.contenidos_minimos || "-"}</div>
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