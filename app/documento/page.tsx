"use client";
import { useEffect, useState, useRef } from "react";
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

type HtmlDocxModule = {
  default?: { asBlob: (html: string) => Blob };
  asBlob: (html: string) => Blob;
};

type OptativaDB = {
  id: number | string;
  nombre: string | null;
  objetivos?: string | null;
  contenidos_minimos?: string | null;
  formacion_practica?: string | null;
};

export default function DocumentoPage() {
  const [asignaturas, setAsignaturas] = useState<AsignaturaDB[]>([]);
  const [regMap, setRegMap] = useState<Record<number, number[]>>({});
  const [aprMap, setAprMap] = useState<Record<number, number[]>>({});
  const [aprParaMap, setAprParaMap] = useState<Record<number, number[]>>({});
  const [bloqueNames, setBloqueNames] = useState<Record<number, string>>({});
  const [bloqueMins, setBloqueMins] = useState<Record<number, number>>({});
  const [descNames, setDescNames] = useState<Record<number, string>>({});
  const [descMap, setDescMap] = useState<Record<number, number[]>>({});
  const [ejeNames, setEjeNames] = useState<Record<number, string>>({});
  const [ejeMap, setEjeMap] = useState<Record<number, number[]>>({});
  const [optativas, setOptativas] = useState<{ id: number; nombre: string; objetivos?: string | null; contenidos_minimos?: string | null; formacion_practica?: string | null }[]>([]);
  const [plan2011Nombre, setPlan2011Nombre] = useState<Record<number, string>>({});
  const [plan2011Numero, setPlan2011Numero] = useState<Record<number, string>>({});
  const [eq2011Map, setEq2011Map] = useState<Record<number, number[]>>({});
  const fecha = "SAN FERNANDO DEL VALLE DE CATAMARCA, 22 SEP 2023";
  const docRef = useRef<HTMLDivElement>(null);
  const handleDownloadDocx = async () => {
    const node = docRef.current;
    if (!node) return;
    const css = `
      body { font-family: Arial, sans-serif; font-size: 12pt; color: #111; }
      h1 { font-size: 22pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      p { line-height: 1.5; }
      table, th, td { border: 1px solid #000; border-collapse: collapse; }
      th, td { padding: 6px; }
      ul, ol { margin-left: 18px; }
      table * { font-size: 10pt; }
    `;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${node.innerHTML}</body></html>`;
    const mod = (await import("html-docx-js/dist/html-docx")) as HtmlDocxModule;
    const blob = (mod.default?.asBlob ? mod.default.asBlob(html) : mod.asBlob(html));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "documento.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseAnon();
      const { data } = await supabase
        .from("asignaturas")
        .select(
          "id,nombre,codigo,anio,regimen,horas_semanales_sincronicas,horas_totales_sincronicas,horas_trabajo_independiente_totales,horas_trabajo_totales,coeficiente_horas_trabajo_independiente,objetivos,contenidos_minimos,formacion_practica,horas_formacion_practica,bloque_conocimiento_id,created_at"
        )
        .order("nombre");
      setAsignaturas((data as AsignaturaDB[]) || []);
      const [regs, aprs, aprsPara, bloquesTbl, descTbl, adRel, ejeTbl, aeRel, optTbl, p11Tbl, eqTbl] = await Promise.all([
        supabase.from("asignatura_correlativas_regularizadas").select("asignatura_id,correlativa_id"),
        supabase.from("asignatura_correlativas_aprobadas").select("asignatura_id,correlativa_id"),
        supabase.from("asignatura_correlativas_aprobadas_para_aprobar").select("asignatura_id,correlativa_id"),
        supabase.from("bloques_conocimiento").select("id,nombre,horas_minimas").order("nombre"),
        supabase.from("bloque_descriptores").select("id,nombre").order("nombre"),
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
        arr.push(row.correlativa_id);
        rMap[row.asignatura_id] = arr;
      }
      setRegMap(rMap);
      const aMap: Record<number, number[]> = {};
      for (const row of (aprs.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
        const arr = aMap[row.asignatura_id] || [];
        arr.push(row.correlativa_id);
        aMap[row.asignatura_id] = arr;
      }
      setAprMap(aMap);
      const apMap: Record<number, number[]> = {};
      for (const row of (aprsPara.data ?? []) as { asignatura_id: number; correlativa_id: number }[]) {
        const arr = apMap[row.asignatura_id] || [];
        arr.push(row.correlativa_id);
        apMap[row.asignatura_id] = arr;
      }
      setAprParaMap(apMap);
      const bNames: Record<number, string> = {};
      const bMins: Record<number, number> = {};
      for (const b of (bloquesTbl.data ?? []) as { id: number; nombre: string; horas_minimas?: number | null }[]) {
        bNames[b.id] = b.nombre;
        const val = b.horas_minimas ?? null;
        if (val !== null && val !== undefined) bMins[b.id] = Number(val) || 0;
      }
      setBloqueNames(bNames);
      setBloqueMins(bMins);

      const dNames: Record<number, string> = {};
      for (const row of (descTbl.data ?? []) as { id: number; nombre: string }[]) dNames[row.id] = row.nombre;
      setDescNames(dNames);
      const dMap: Record<number, number[]> = {};
      for (const row of (adRel.data ?? []) as { asignatura_id: number; descriptor_id: number }[]) {
        const arr = dMap[row.asignatura_id] || [];
        dMap[row.asignatura_id] = [...arr, row.descriptor_id];
      }
      setDescMap(dMap);
      const etNames: Record<number, string> = {};
      for (const row of (ejeTbl.data ?? []) as { id: number; nombre: string }[]) etNames[row.id] = row.nombre;
      setEjeNames(etNames);
      const ejMap: Record<number, number[]> = {};
      for (const row of (aeRel.data ?? []) as { asignatura_id: number; eje_id: number }[]) {
        const arr = ejMap[row.asignatura_id] || [];
        ejMap[row.asignatura_id] = [...arr, row.eje_id];
      }
      setEjeMap(ejMap);
      setOptativas(((optTbl.data ?? []) as OptativaDB[]).map((x) => ({ id: Number(x.id), nombre: String(x.nombre || ""), objetivos: x.objetivos ?? null, contenidos_minimos: x.contenidos_minimos ?? null, formacion_practica: x.formacion_practica ?? null })));
      const pNames: Record<number, string> = {};
      const pNums: Record<number, string> = {};
      for (const row of ((p11Tbl.data ?? []) as { id: number; numero: string; nombre: string }[])) {
        pNames[row.id] = row.nombre;
        pNums[row.id] = row.numero;
      }
      const eqMap: Record<number, number[]> = {};
      for (const row of ((eqTbl.data ?? []) as { asignatura_id: number; plan_2011_asignatura_id: number }[])) {
        const aid = row.asignatura_id;
        const pid = row.plan_2011_asignatura_id;
        eqMap[aid] = [...(eqMap[aid] || []), pid];
      }
      setPlan2011Nombre(pNames);
      setPlan2011Numero(pNums);
      setEq2011Map(eqMap);

    };
    run();
  }, []);
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl mb-4 flex justify-end">
        <button onClick={handleDownloadDocx} className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm">Descargar DOCX</button>
      </div>
      <div ref={docRef}>
      <div className="mx-auto w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h1 className="mb-6 text-3xl font-semibold">Proyecto Ordenanza</h1>
        <div className="-mt-4 mb-4"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Proyecto Ordenanza")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
        <div className="mb-8 text-right text-sm tracking-wide">{fecha}</div>

        <div className="space-y-4 text-justify leading-relaxed">
          <p>
            VISTO la Ordenanza Nº 004/2011 del Consejo Superior de la Universidad Nacional de Catamarca, por la que se aprueba el Diseño Curricular de la Carrera de Grado &quot;INGENIERÍA INFORMÁTICA&quot; que se dicta en la Facultad de Tecnología y Ciencias Aplicadas, y
          </p>
          <p className="font-semibold">CONSIDERANDO</p>
          <p>
            Que la carrera Ingeniería en Informática se encuentra comprendida en el Artículo 43 de la Ley de Educación Superior (LES), lo cual requiere el cumplimiento de los Estándares Nacionales y la alineación con los estándares regionales ARCUSUR (Dimensión 2: Proyecto Académico),
          </p>
          <p>
            Que el Ministerio de Educación de la Nación mediante Resolución Nº 1254/2018 define las actividades profesionales reservadas exclusivamente al título y por RM Nº 1557/2021 y sus modificatorias, plantea cambios principalmente en la organización y carga horaria de los contenidos curriculares básicos,
          </p>
          <p>
            Que, por lo expuesto anteriormente, se ha realizado el análisis del Plan de Estudio vigente, a los fines de dar cumplimiento a los nuevos contenidos curriculares básicos, la carga horaria mínima y la intensidad de la formación práctica, manteniendo la identidad de la carrera,
          </p>
          <p>
            Que, como resultado del trabajo de análisis realizado, el Departamento de Informática de la Facultad de Tecnología y Ciencias Aplicadas, ha realizado una propuesta de adecuación curricular, de acuerdo a la normativa mencionada,
          </p>
          <p>
            Que la &quot;Comisión de Asuntos Académicos y Docentes&quot; y la &quot;Comisión de Reglamentaciones&quot; han tomado la intervención que les compete produciendo dictamen favorable.
          </p>
          <p>Por ello y en uso de las atribuciones conferidas por el Estatuto Universitario vigente</p>
        </div>

        <div className="mt-8 text-center">
          <div className="font-semibold">EL CONSEJO DIRECTIVO DE LA FACULTAD DE TECNOLOGÍA Y CIENCIAS APLICADAS</div>
          <div className="text-sm">(En Sesión Extraordinaria del –/11/25)</div>
          <div className="mt-2 font-semibold">ORDENA</div>
        </div>

        <div className="mt-6 space-y-4 text-justify leading-relaxed">
          <p>
            ARTÍCULO 1º.- APROBAR las adecuaciones del Plan de estudio de la carrera de grado &quot;INGENIERÍA INFORMÁTICA&quot; con una duración de cinco (5) años, las que forman parte de la presente Ordenanza como ANEXO ÚNICO.
          </p>
          <p>
            ARTÍCULO 2º.- ESTABLECER que el diseño curricular aprobado, entrará en vigencia a partir del año académico 2026.
          </p>
          <p>
            ARTÍCULO 3º.- SOLICITAR al Consejo Superior de la Universidad Nacional de Catamarca la aprobación de la presente Ordenanza.
          </p>
          <p>
            ARTÍCULO 4º.- REGISTRAR. Comunicar a las áreas de competencia. Cumplido ARCHIVAR.
          </p>
          <p>ORDENANZA C.D. Nº XX/25-</p>
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <div className="text-center text-3xl font-semibold leading-tight">
          <div>Propuesta de Adecuación de Plan de estudio</div>
          <div>Ingeniería informática</div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold">Fundamentación de la propuesta</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Fundamentación de la propuesta")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            El presente Plan de Estudios de la carrera Ingeniería en Informática de la Universidad Nacional de Catamarca (UNCA) surge como resultado de un proceso de autoevaluación y revisión crítica del diseño curricular vigente (Plan 2011), llevado adelante por el Departamento de Informática, debido a que la disciplina Informática se caracteriza por una rápida evolución y una obsolescencia de los conocimientos adquiridos, lo que obliga a la Facultad a implementar acciones sistemáticas para asegurar la pertinencia y calidad de la formación profesional, con un compromiso prioritario con las necesidades de la región.
          </p>
          <p>
            Esta adecuación curricular es imperativa al enmarcarse en la obligación de las carreras comprendidas en el Artículo 43 de la Ley de Educación Superior (LES), lo cual requiere el cumplimiento de los Estándares Nacionales (RM N° 1557/2021 y sus modificatorias) y la alineación con los estándares regionales ARCUSUR (Dimensión 2: Proyecto Académico), en vistas a los procesos de acreditación. Específicamente, el diseño curricular debe contemplar las Actividades Profesionales Reservadas (AARR) para Sistemas de Información/Informática (RM N° 1254/2018), y debe garantizar una Carga Horaria Mínima de 3600 horas distribuida en los cuatro Bloques de Conocimiento (Ciencias Básicas, Tecnologías Básicas, Tecnologías Aplicadas, y Ciencias y Tecnologías Complementarias) para el desarrollo de las competencias mínimas indispensables para el correcto ejercicio de las AARR.
          </p>
          <p>
            La propuesta formativa adopta un modelo basado en el desarrollo de competencias, buscando un balance equilibrado entre conocimientos científicos, tecnológicos y de gestión, con formación humanística, y garantizando que el egresado posea una adecuada formación habilitándolo para ejercer, aprender, desarrollar y emprender nuevas tecnologías, con actitud ética, crítica y creativa para la identificación y resolución de problemas en forma sistémica, considerando aspectos políticos, económicos, sociales, ambientales y culturales desde una perspectiva global, tomando en cuenta las necesidades de la sociedad.
          </p>
          <p>
            En éste sentido, la propuesta responde también, a la necesidad de consolidar una mayor articulación académica entre las distintas carreras de Ingeniería que se dictan en la Facultad de Tecnología y Ciencias Aplicadas, promoviendo sinergias en asignaturas comunes del ciclo básico y estrategias de cooperación académica e interdisciplinaria en los ciclos superiores.
          </p>
          <p>
            Asimismo, se reconoce la importancia de atender a las demandas del entorno productivo, institucional y tecnológico de la región de Catamarca y del Noroeste Argentino. En este sentido, el nuevo plan busca formar profesionales capaces de dar respuesta a los desafíos actuales y futuros del sector público y privado, contribuyendo a la transformación digital, el desarrollo de capacidades tecnológicas locales, la innovación, la sostenibilidad y la soberanía tecnológica. Esta perspectiva regional fortalece la pertinencia social de la carrera y su compromiso con el desarrollo territorial.
          </p>
          <p>
            Este enfoque asegura que la intervención profesional del graduado no comprometa el interés público ni el desarrollo sostenible, satisfaciendo las necesidades del presente sin comprometer la capacidad de las futuras generaciones. Finalmente, el plan garantiza la Intensidad de la Formación Práctica (Anexo III de la RM N° 1557/2021), incluyendo la Práctica Profesional Supervisada (PPS) y el Proyecto Integrador/Final como espacios cruciales de aplicación de competencias, observando en la práctica las cuestiones relativas a la seguridad, el impacto social y la preservación del medio ambiente.
          </p>
        </div>
        <h2 className="mt-8 text-2xl font-semibold">Objetivos del Proyecto</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Objetivos del Proyecto")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            El Proyecto de Innovación Curricular surge de la necesidad de actualizar el diseño curricular vigente (Plan 2011), con el fin de alcanzar los siguientes objetivos clave:
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              Lograr el ajuste integral del Plan de Estudios a los estándares de acreditación nacionales (RM Nº 1557/2021 y sus modificatorias) y a los estándares regionales ARCUSUR, garantizando el cumplimiento de los Contenidos Curriculares Básicos, la Carga Horaria Mínima y los Criterios de Intensidad de la Formación Práctica.
            </li>
            <li>
              Actualizar el perfil y los contenidos para responder a la rápida evolución de la disciplina Informática (Industria del Software) y a las demandas del entorno productivo, institucional y tecnológico de la región, reforzando la pertinencia social y la capacidad de transformación digital.
            </li>
            <li>
              Asegurar que el currículo garantice la formación integral del graduado, balanceando conocimiento científico, técnico, tecnológico y de gestión, con adecuada formación humanística.
            </li>
          </ol>
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-2xl font-semibold">Identificación del Plan de estudio</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Identificación del Plan de estudio")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
        <h3 className="mt-8 text-xl font-semibold">1. Denominación: <span className="font-normal">INGENIERÍA EN INFORMÁTICA</span></h3>
        <h3 className="mt-8 text-xl font-semibold">2. Título que otorga: <span className="font-normal">INGENIERO/A EN INFORMÁTICA</span></h3>
        <h3 className="mt-8 text-xl font-semibold">3. Tipo de carrera: <span className="font-normal">Grado</span></h3>
        <h3 className="mt-8 text-xl font-semibold">4. Unidad Ejecutora: <span className="font-normal">Facultad de Tecnología y Ciencias Aplicadas de la Universidad Nacional de Catamarca</span></h3>
        <h3 className="mt-8 text-xl font-semibold">5. Modalidad de Dictado: <span className="font-normal">Presencial</span></h3>
        <h3 className="mt-8 text-xl font-semibold">6. Carácter: <span className="font-normal">Permanente</span></h3>
        <h3 className="mt-8 text-xl font-semibold">7. Duración del Plan de Estudio: <span className="font-normal">Cinco (5) años</span></h3>
        <h3 className="mt-8 text-xl font-semibold">8. Carga Horaria Total: <span className="font-normal">Tres mil novecientos setenta (3970) horas</span></h3>

        <h3 className="mt-8 text-xl font-semibold">9. Objetivos de la carrera</h3>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            La carrera busca formar un profesional con sólida formación científica, tecnológica y humanística, con una visión sistémica, estratégica e investigativa, capaz de:
          </p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Especificar, proyectar y desarrollar sistemas de información, sistemas de comunicación de datos y software, incluyendo aquellos cuya utilización pueda afectar la seguridad, salud, bienes o derechos.</li>
            <li>Gestionar, planificar, ejecutar y controlar proyectos de ingeniería, aplicando metodologías y tecnologías con enfoque de Industria del Software.</li>
            <li>Establecer métricas y normas de calidad de software, y dirigir lo referido a la seguridad informática.</li>
            <li>Liderar y desempeñarse de manera efectiva en equipos de trabajo multidisciplinarios, contribuir a la generación de desarrollos tecnológicos y/o innovaciones tecnológicas, y actuar con espíritu emprendedor.</li>
            <li>Actuar con actitud ética, crítica y creativa y con responsabilidad profesional y compromiso social, considerando el impacto político, económico, social y ambiental, demostrando capacidad de aprendizaje continuo y autónomo.</li>
          </ol>
        </div>

        <h3 className="mt-8 text-xl font-semibold">10. Perfil del egresado/egresada</h3>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            El/La Ingeniero/a en Informática egresado/a de la Universidad Nacional de Catamarca es un profesional con una sólida formación científica, técnica, profesional y de gestión. Está habilitado para concebir, diseñar, desarrollar y liderar soluciones tecnológicas integrales en contextos organizacionales complejos.
          </p>
          <p>
            Su perfil híbrido le permite articular conocimiento profundo en las áreas técnicas de la informática con una visión estratégica y de negocios sobre las organizaciones, basada en el conocimiento adquirido en los bloques curriculares.
          </p>
          <p>
            Este profesional posee una actitud ética, crítica y creativa para la identificación y resolución de problemas de forma sistémica y holística, considerando aspectos políticos, económicos, sociales, ambientales y culturales desde una perspectiva global, tomando en cuenta las necesidades de la sociedad y garantizando el desarrollo sostenible.
          </p>
          <p>
            El perfil del egresado/a se define explícitamente sobre la base del Proyecto Institucional y garantiza el desarrollo del conjunto de competencias genéricas y específicas exigidas por los estándares nacionales (Resolución Ministerial N.º 1557/2021 y modificatorias) y los estándares regionales ARCUSUR.
          </p>
          <p>El/La Ingeniero/a en Informática está capacitado/a para:</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Liderar la Transformación Digital: Asume roles de liderazgo y dirección en la concepción, diseño, desarrollo, implementación, operación y mantenimiento de sistemas de información, software y comunicaciones en diversos entornos.</li>
            <li>Emprender y gestionar: Genera soluciones tecnológicas innovadoras, dirige equipos multidisciplinarios de manera efectiva, y está preparado para crear y gestionar empresas de base tecnológica y en la innovación en el medio socio-productivo.</li>
            <li>Actuar con Responsabilidad Social: Posee un compromiso ético y responsabilidad social, considerando el impacto político, económico, social y ambiental de su actividad, garantizando que su intervención no comprometa el interés público ni el desarrollo sostenible.</li>
            <li>Demostrar capacidad de aprendizaje continuo y autónomo, adaptándose rápidamente a la evolución de las tecnologías.</li>
            <li>Ejercer las Actividades Profesionales Reservadas (AARR) al título conforme a la Resolución Ministerial N.º 1254/2018 — Anexo XXXII, incluyendo especificar, proyectar, desarrollar, dirigir, controlar, establecer métricas de calidad y certificar sistemas de información y software.</li>
          </ol>
        </div>

        <h3 className="mt-8 text-xl font-semibold">11. Alcance del Título: Ingeniero/a en Informática</h3>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            De acuerdo con lo establecido en el Artículo 43 de la Ley de Educación Superior, la Ingeniería en Informática es una carrera que implica Actividades Profesionales Reservadas (AARR). En consecuencia, el egresado de esta carrera tendrá competencia para desarrollar las siguientes actividades profesionales, en virtud de la formación adquirida en el presente plan de estudios:
          </p>
          <div className="mt-2 font-semibold">a) Actividades Profesionales Reservadas</div>
          <ol className="list-decimal space-y-2 pl-6">
            <li>Especificar, proyectar y desarrollar sistemas de información, sistemas de comunicación de datos y software cuya utilización pueda afectar la seguridad, salud, bienes o derechos.</li>
            <li>Proyectar y dirigir lo referido a seguridad informática.</li>
            <li>Establecer métricas y normas de calidad de software.</li>
            <li>Certificar el funcionamiento, condición de uso o estado de sistemas de información, sistemas de comunicación de datos y software, cuya utilización pueda afectar la seguridad, salud, bienes o derechos.</li>
            <li>Dirigir y controlar la implementación, operación y mantenimiento de sistemas de información, sistemas de comunicación de datos y software, cuya utilización pueda afectar la seguridad, salud, bienes o derechos.</li>
          </ol>
          <div className="mt-4 font-semibold">b) Alcances Profesionales Adicionales (no reservados - AL)</div>
          <ol className="list-decimal space-y-2 pl-6" start={6}>
            <li>Planificar, dirigir y gestionar la infraestructura tecnológica y de comunicaciones para la operación y soporte de sistemas de información.</li>
            <li>Auditar y evaluar sistemas informáticos, procesos de TI y estructuras de ciberseguridad, asegurando el cumplimiento de normas y estándares nacionales e internacionales.</li>
            <li>Formular, implementar y controlar planes de gestión de riesgos de tecnología de la información (TI) y planes de continuidad operativa.</li>
            <li>Diseñar, implementar y gestionar bases de datos complejas, incluyendo bases de datos distribuidas y tecnologías NoSQL, para la administración de grandes volúmenes de información (Big Data).</li>
            <li>Liderar y desempeñarse de manera efectiva en equipos de trabajo multidisciplinarios para el desarrollo de proyectos de ingeniería, utilizando metodologías ágiles.</li>
            <li>Especificar, proyectar, desarrollar e implementar modelos de simulación y sistemas con inteligencia artificial.</li>
            <li>Definir y evaluar asuntos de ingeniería legal, económica y financiera, incluyendo la formulación y evaluación de proyectos y planes de negocio, y el control del impacto ambiental en el contexto de las TIC.</li>
            <li>Evaluar el impacto ético, legal y social de las soluciones informáticas, y actuar con responsabilidad profesional y compromiso social, en coherencia con el desarrollo sostenible.</li>
          </ol>
        </div>

        <h3 className="mt-8 text-xl font-semibold">12. Requisitos de ingreso</h3>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            Para ingresar a la carrera, el/la aspirante deberá cumplir con alguna de las siguientes condiciones: a) Poseer título de nivel secundario completo, conforme a lo establecido por la Ley de Educación Superior N.º 24.521; b) Tener más de 25 años y no haber completado el nivel secundario, pero acreditar preparación y/o experiencia laboral acorde con la carrera, en el marco del artículo 7 de la Ley de Educación Superior N.º 24.521.
          </p>
          <p>
            Asimismo, los requisitos de ingreso están regulados institucionalmente por las siguientes normativas:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Ordenanza CD N.º 004/2005 y su modificatoria 002/2007, que establecen las condiciones generales de ingreso a las carreras de la Facultad de Tecnología y Ciencias Aplicadas.</li>
            <li>Ordenanza CD N.º 010/2024, que aprueba la implementación del Curso de Nivelación para el Ingreso a carreras de Ingeniería, Licenciaturas y Tecnicaturas.</li>
          </ul>
          <p>
            A su vez, el ingreso a la carrera contempla acciones de acompañamiento y tutoría a los estudiantes de primer año, orientadas a facilitar la inserción en la vida universitaria y el desarrollo de competencias fundamentales para la trayectoria académica. Estas actividades se articulan con las políticas institucionales de retención y mejora de la permanencia estudiantil, coordinadas por el equipo de tutorías de la Facultad.
          </p>
        </div>

        <h3 className="mt-8 text-xl font-semibold">13. Estructura del Plan de estudios</h3>
        <div className="mt-4 space-y-4 text-justify leading-relaxed">
          <p>
            La carrera de Ingeniería en Informática tiene una duración prevista de cinco (5) años, con una carga horaria total de 3970 horas reloj. El Plan de Estudios ha sido diseñado conforme a lo establecido en la Resolución N° 1557/2021 de la Secretaría de Educación y sus modificatorias, que fijan los contenidos curriculares básicos, los bloques de conocimiento, la intensidad de la formación práctica, y las actividades reservadas al título que deben ser cumplimentadas obligatoriamente por todas las carreras que aspiren al reconocimiento oficial y validez nacional del título.
          </p>
          <p>
            La propuesta académica se estructura en módulos y bloques formativos, organizados en asignaturas cuatrimestrales y anuales, con un sistema de correlatividades que promueve la adquisición gradual y progresiva de conocimientos y competencias. Esta estructura permite garantizar un trayecto formativo coherente, articulado y flexible, en consonancia con los estándares nacionales del CONFEDI y los criterios regionales del sistema ARCUSUR.
          </p>
          <p>
            La distribución horaria resultante expresa una orientación formativa que combina fundamentos sólidos en ciencias básicas y tecnologías esenciales, junto con un enfoque profesionalizante alineado con las necesidades de desempeño del Ingeniero en Informática en el contexto regional y nacional. El mayor peso relativo del bloque de Tecnologías Aplicadas, por encima del rango observado en planes tradicionales de ingeniería, responde a una construcción curricular deliberada que prioriza la formación práctica y la integración temprana de los estudiantes en proyectos reales mediante actividades de desarrollo de software, sistemas de comunicación de datos y diseño e implementación de soluciones TIC. Esta orientación es coherente con los Alcances Profesionales Adicionales y con los requerimientos de la industria del software, sector estratégico para la provincia y la región.
          </p>
          <p>
            El diseño curricular que se detalla en los ANEXOS I y II da cumplimiento a los requisitos de carga horaria, distribución por bloques de conocimiento, y contenido mínimo establecido por la normativa vigente. La intensidad de la formación práctica, desarrollada tanto en asignaturas específicas como de manera transversal, se encuentra detallada en el ANEXO III, en concordancia con lo estipulado en el ANEXO III de la Resolución N.º 1557/2021.
          </p>
          <p>
            Los contenidos mínimos de cada asignatura, tanto obligatoria como optativa, se presentan en el ANEXO IV – Programas Sintéticos. En el ANEXO V se incluye la oferta inicial de asignaturas optativas, enmarcadas en los bloques de Tecnologías Básicas y Tecnologías Aplicadas, las cuales podrán ser actualizadas según la evolución disciplinar y la disponibilidad académica.
          </p>
          <p>
            El ANEXO VI contempla el Régimen de Transición y Equivalencias, el cual resulta indispensable para la implementación del nuevo Plan de Estudios. Este régimen será de aplicación obligatoria para todos los estudiantes inscriptos bajo el Plan de Estudios anterior (Ordenanza CS N.º 004/2011) que, a la fecha de entrada en vigencia del nuevo plan, no hubieren completado la totalidad de los requisitos curriculares para la obtención del título.
          </p>
          <h4 className="mt-4 text-xl font-semibold italic">13.1 Trayectos formativos especiales</h4>
          <ul className="mt-2 space-y-3 pl-6">
            <li>
              <span className="font-semibold">PPS – Práctica Profesional Supervisada (200 h):</span> diseñada para que los estudiantes integren sus saberes en situaciones reales de ejercicio profesional, en articulación con el medio socio-productivo. Forma parte del bloque de Integración. (Reglamento de Práctica profesional supervisada Ord. CD FTyCA 002/2013)
            </li>
            <li>
              <span className="font-semibold">Trabajo Final de Ingeniería (200 h):</span> proyecto integrador individual o grupal que permite demostrar el dominio de competencias adquiridas, articulando conocimientos de diversas áreas. Se enmarca en el bloque de Integración. (Reglamento General de Trabajo Final, para las carreras de la Facultad de Tecnología y Ciencias Aplicadas Ord. CD FTyCA 008/2015)
            </li>
          </ul>
          <h4 className="mt-4 text-xl font-semibold italic">13.2 Materias Optativas</h4>
          <div className="mt-4 space-y-4 text-justify leading-relaxed">
            <p>
              El plan de estudios contempla la inclusión de tres (3) asignaturas optativas, cada una con una carga horaria de 60 horas reloj sincrónicas. Estas asignaturas se encuentran en el Bloque de Tecnologías Aplicadas (TA) del plan de estudios, y están previstas para asegurar una flexibilidad curricular, permitir la actualización frente a los rápidos avances tecnológicos de la disciplina y facilitar la adaptación a los intereses de formación especializada del estudiante.
            </p>
            <p>
              La oferta de asignaturas optativas será gestionada por el Departamento de Informática, que presentará propuestas de materias en cada cuatrimestre. Estas propuestas deberán ser elevadas al Consejo Directivo de la Facultad para su aprobación formal y posterior dictado en el cuatrimestre subsiguiente.
            </p>
            <p>
              Reconocimiento de Asignaturas Optativas Externas: El estudiante tiene la posibilidad de optar por cursar asignaturas optativas que se dicten en otra institución universitaria, ya sea Nacional o extranjera, y/o enmarcadas en convenios de movilidad académica, formación complementaria o doble titulación.
            </p>
            <p>
              Para el reconocimiento de una asignatura externa como válida, el alumno debe seguir el siguiente procedimiento:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>Solicitud y Documentación: El estudiante debe presentar una nota formal solicitando la autorización al Departamento de Informática.</li>
              <li>La solicitud debe estar acompañada de la documentación correspondiente, que describa explícitamente el programa de la asignatura, la carga horaria (debiendo ser no menor a 60 h), los objetivos de aprendizaje, los contenidos mínimos, conforme a la normativa (DNGU) y la modalidad de evaluación.</li>
              <li>El Departamento de Informática tiene la potestad de evaluar la solicitud. Dicha evaluación puede resultar en la autorización o el rechazo de la solicitud, basándose en observaciones fundadas.</li>
              <li>Aprobación Final: Una vez autorizada por el Departamento de Informática, la solicitud debe ser elevada al Consejo Directivo de la Facultad para su aprobación formal definitiva mediante el trámite de equivalencia.</li>
            </ol>
          </div>

          <h4 className="mt-4 text-xl font-semibold italic">13.3 Modalidad, régimen de cursado y normativa</h4>
          <div className="mt-4 space-y-4 text-justify leading-relaxed">
            <p>
              La carrera se dicta bajo modalidad presencial, con posibilidad de incorporar instancias complementarias de tipo híbrido, tales como clases espejo, seminarios virtuales o talleres sincrónicos, en el marco de propuestas pedagógicas específicas.
            </p>
            <p>
              Las correlatividades entre asignaturas están detalladas en el Anexo I y responden a una secuencia progresiva que garantiza la apropiación gradual de conocimientos y competencias.
            </p>
            <p>El régimen académico se rige por las siguientes normativas:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Ordenanza CS Nº 037/2004 – Reglamento General de Alumnos de la UNCA</li>
              <li>Reglamento General de Alumnos de la FTyCA – aprobado por Consejo Directivo</li>
            </ul>
            <p>
              Estas normas establecen los criterios institucionales para el cursado, evaluación, promoción y acreditación de las asignaturas del plan de estudios.
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-2xl font-semibold">Anexo I: Plan de Estudio</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo I: Plan de Estudio")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
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
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">Anexo II: Núcleos temáticos agrupados por Bloques de Conocimiento, sobre la base de lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo II: Núcleos temáticos agrupados por Bloques de Conocimiento, sobre la base de lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
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
              const rows = items.map((x) => {
                const descIds = descMap[x.id] || [];
                const descList = descIds
                  .map((id) => descNames[id])
                  .filter(Boolean)
                  .sort((a, b) => (a || "").localeCompare(b || "", "es", { sensitivity: "base" }));
                const ejeIds = ejeMap[x.id] || [];
                const ejeList = ejeIds
                  .map((id) => ejeNames[id])
                  .filter(Boolean)
                  .sort((a, b) => (a || "").localeCompare(b || "", "es", { sensitivity: "base" }));
                const hsSem = Number(x.horas_semanales_sincronicas || 0) || 0;
                const factor = factorForRegimen(x.regimen);
                const calcTot = hsSem && factor ? hsSem * factor : 0;
                const hsTot = Number(x.horas_totales_sincronicas || calcTot || 0) || 0;
                const hsMin = null;
                return { nombre: x.nombre, descriptores: descList, ejes: ejeList, hsMin, hsTot };
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
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "30%" }} />
                        <col style={{ width: "5%" }} />
                        <col style={{ width: "5%" }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="border border-zinc-300 px-2 py-1 text-center">Bloque de Conocimiento</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Asignatura</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Descriptores</th>
                          <th className="border border-zinc-300 px-2 py-1 text-center">Ejes transversales de formación</th>
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
                            <td className="border border-zinc-300 px-2 py-1 text-left">{r.nombre}</td>
                            <td className="border border-zinc-300 px-2 py-1 align-top text-left">
                              {r.descriptores.length ? (
                                <ul className="list-disc pl-6">
                                  {r.descriptores.map((d, i) => (
                                    <li key={`desc-${bid}-${idx}-${i}`}>{d}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td className="border border-zinc-300 px-2 py-1 align-top text-left">
                              {r.ejes.length ? (
                                <ul className="list-disc pl-6">
                                  {r.ejes.map((d, i) => (
                                    <li key={`eje-${bid}-${idx}-${i}`}>{d}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.hsMin)}</td>
                            <td className="border border-zinc-300 px-2 py-1 text-center">{fmt(r.hsTot)}</td>
                          </tr>
                        ))}
                        <tr className="bg-zinc-50 font-medium">
                          <td className="border border-zinc-300 px-2 py-1" colSpan={3}>TOTAL DE {nombreBloque?.toUpperCase?.() || ""}</td>
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
            const rowsSorted = [...summaryRows].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
            const colors = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6"];  
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
                      {rowsSorted.map((r) => (
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
                <div className="mt-8 flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Distribución de Hs. Ofrecidas por Bloque</div>
                    <canvas
                      style={{ width: 320, height: 320 }}
                      ref={(el) => {
                        if (!el) return;
                        const ctx = el.getContext("2d");
                        if (!ctx) return;
                        const dpr = typeof window !== "undefined" && typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1;
                        const size = 320;
                        el.width = size * dpr;
                        el.height = size * dpr;
                        ctx.scale(dpr, dpr);
                        const cx = size / 2;
                        const cy = size / 2;
                        const radius = size / 2 - 12;
                        let start = 0;
                        for (let i = 0; i < rowsSorted.length; i++) {
                          const r = rowsSorted[i];
                          const val = Number(r.offered || 0) || 0;
                          const frac = totalOfferedAll ? val / totalOfferedAll : 0;
                          const end = start + frac * Math.PI * 2;
                          ctx.beginPath();
                          ctx.moveTo(cx, cy);
                          ctx.arc(cx, cy, radius, start, end);
                          ctx.closePath();
                          ctx.fillStyle = colors[i % colors.length];
                          ctx.fill();
                          start = end;
                        }
                        ctx.beginPath();
                        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                        ctx.strokeStyle = "#e5e7eb";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                      }}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {rowsSorted.map((r, i) => {
                        const pct = totalOfferedAll ? Math.round((Number(r.offered || 0) || 0) * 100 / totalOfferedAll) : 0;
                        return (
                          <div key={`legend-${r.bid}`} className="flex items-center gap-2">
                            <span style={{ backgroundColor: colors[i % colors.length] }} className="inline-block h-2.5 w-2.5 rounded"></span>
                            <span>{r.nombre} — {fmt(r.offered)} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">Anexo III: Criterios de intensidad de la Formación Práctica según lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo III: Criterios de intensidad de la Formación Práctica según lo establecido en la Resol-2025-982-APN-SE#MCH de la Secretaría de Educación")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
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
                          <td className="border border-zinc-300 px-2 py-1" colSpan={2}>TOTAL DE {nombreBloque?.toUpperCase?.() || ""}</td>
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
                        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }))
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
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">Anexo IV: Programas Sintéticos</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo IV: Programas Sintéticos")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
        <div className="mt-4 space-y-8">
          {(() => {
            const fmt = (v: number | string | null | undefined) => {
              const n = Number(v ?? 0);
              if (!n) return "-";
              return Number.isInteger(n) ? String(n) : n.toFixed(2);
            };
            const factorForRegimen = (r?: string | null) => {
              const rx = (r || "").toLowerCase();
              if (rx.includes("anual")) return 30;
              if (rx.includes("cuatr")) return 15;
              return 0;
            };
            const coefForBloque = (bid?: number | null) => {
              if (!bid) return 0;
              const name = bloqueNames[bid] || "";
              if (name === "Ciencias Básicas de la Ingeniería") return 1.25;
              if (name === "Tecnologías Básicas") return 1.5;
              if (name === "Tecnologías Aplicadas") return 2.0;
              if (name === "Ciencias y Tecnologías Complementarias") return 1.0;
              return 0;
            };
            const aCodes: Record<number, string> = {};
            for (const a of asignaturas) aCodes[a.id] = (a.codigo || "").trim();
            const aNames: Record<number, string> = {};
            for (const a of asignaturas) aNames[a.id] = (a.nombre || "").trim();
            const toPairs = (ids: number[]) =>
              ids
                .map((id) => ({ code: (aCodes[id] || "").trim(), name: (aNames[id] || "").trim() }))
                .filter((p) => p.code || p.name)
                .sort((p, q) => (p.code || "").localeCompare(q.code || "", "es", { sensitivity: "base" }));
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
              const coefTI = Number(a.coeficiente_horas_trabajo_independiente || 0) || coefForBloque(bid || undefined);
              const hsTI = Number(a.horas_trabajo_independiente_totales || 0) || (hsTotSync && coefTI ? hsTotSync * coefTI : 0);
              const hsTrabTot = Number(a.horas_trabajo_totales || 0) || (hsTotSync + hsTI);
              const regsRegPairs = toPairs(regMap[a.id] || []);
              const regsAprPairs = toPairs(aprMap[a.id] || []);
              const aprParaPairs = toPairs(aprParaMap[a.id] || []);
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
                      <tr className="bg-zinc-100">
                        <td className="border border-zinc-300 px-2 py-1 align-top">Asignatura: <span className="font-semibold italic">{a.nombre}</span></td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Año: {a.anio || "-"}</td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Código: <span className="font-semibold">{a.codigo || "-"}</span></td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Régimen: {a.regimen || "-"}</td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad de Horas Semanales Sincrónicas: {fmt(hsSem)}</td>
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
                          Asignaturas correlativas para cursar:
                          <div className="mt-1">
                            <div>Correlativas regularizadas:</div>
                            {regsRegPairs.length ? (
                              <ul className="list-disc pl-6">
                                {regsRegPairs.map((p, i) => (
                                  <li key={`rr-${a.id}-${i}`}>{(p.code || "-") + (p.name ? ` - ${p.name}` : "")}</li>
                                ))}
                              </ul>
                            ) : (
                              <div className="pl-6">-</div>
                            )}
                            <div className="mt-2">Correlativas aprobadas:</div>
                            {regsAprPairs.length ? (
                              <ul className="list-disc pl-6">
                                {regsAprPairs.map((p, i) => (
                                  <li key={`ra-${a.id}-${i}`}>{(p.code || "-") + (p.name ? ` - ${p.name}` : "")}</li>
                                ))}
                              </ul>
                            ) : (
                              <div className="pl-6">-</div>
                            )}
                          </div>
                        </td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">
                          Asignaturas correlativas aprobadas para aprobar:
                          {aprParaPairs.length ? (
                            <ul className="mt-1 list-disc pl-6">
                              {aprParaPairs.map((p, i) => (
                                <li key={`ap-${a.id}-${i}`}>{(p.code || "-") + (p.name ? ` - ${p.name}` : "")}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-1 pl-6">-</div>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-300 px-2 py-1 align-top">
                          Descriptores de conocimiento:
                          <ul className="mt-1 list-disc pl-6">
                            {descArr.length ? descArr.map((d, i) => <li key={`desc-${a.id}-${i}`}>{d}</li>) : <li>-</li>}
                          </ul>
                        </td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">
                          Ejes transversales de formación:
                          <ul className="mt-1 list-disc pl-6">
                            {ejesArr.length ? ejesArr.map((d, i) => <li key={`eje-${a.id}-${i}`}>{d}</li>) : <li>-</li>}
                          </ul>
                        </td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">
                          Objetivos:
                          <ul className="mt-1 list-disc pl-6">
                            {objetivosArr.length ? objetivosArr.map((s, i) => <li key={`obj-${a.id}-${i}`}>{s}</li>) : <li>-</li>}
                          </ul>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Contenidos Mínimos: {a.contenidos_minimos || "-"}</td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Formación Práctica: {a.formacion_practica || "-"}</td>
                        <td className="border border-zinc-300 px-2 py-1 align-top">Cantidad de horas de formación práctica: {fmt(a.horas_formacion_practica)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            });
          })()}
        </div>
      </div>
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">Anexo V: Oferta de Asignaturas Optativas</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo V: Oferta de Asignaturas Optativas")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
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
                      <tr className="bg-zinc-100">
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
      </div>
      <div className="mx-auto mt-12 w-full max-w-6xl rounded-xl bg-white p-10 shadow">
        <h2 className="text-xl font-semibold">Anexo VI: Equivalencias entre Plan 2026 y Plan 2011</h2>
        <div className="mt-1"><a className="text-sm text-blue-700 hover:underline" href={`/sugerencias/documento?seccion=${encodeURIComponent("Anexo VI: Equivalencias entre Plan 2026 y Plan 2011")}`} target="_blank" rel="noopener noreferrer">Sugerir cambios en esta sección</a></div>
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
                  const pairs = eqIds.map((pid) => ({ num: (plan2011Numero[pid] || "").trim(), nom: (plan2011Nombre[pid] || "").trim() })).filter((p) => p.num || p.nom);
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
      </div>
    </div>
  );
}
