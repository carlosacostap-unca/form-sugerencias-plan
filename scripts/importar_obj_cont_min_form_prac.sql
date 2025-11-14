BEGIN;

-- Cálculo Numérico
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender métodos numéricos para la resolución de problemas matemáticos y de ingeniería.
Desarrollar criterios para analizar errores y estabilidad de los métodos numéricos.
Implementar algoritmos numéricos usando herramientas computacionales.
Aplicar los métodos apropiados según el tipo de problema a resolver.
$$,
  contenidos_minimos = $$
Errores de aproximación y propagación del error. Raíces de ecuaciones no lineales. Sistemas de ecuaciones lineales.
Interpolación y aproximación de funciones. Derivación e integración numérica. Métodos numéricos para ecuaciones diferenciales
ordinarias. Introducción a métodos numéricos para ecuaciones en derivadas parciales. Uso de software científico para cálculo numérico.
$$,
  formacion_practica = $$
Implementación de algoritmos numéricos clásicos (Newton-Raphson, bisección, Jacobi, Gauss-Seidel, Runge-Kutta, etc.) en un lenguaje
de programación o software matemático. Comparación de precisión y eficiencia entre distintos métodos. Resolución de problemas reales
provenientes de la ingeniería mediante simulaciones numéricas.
$$
WHERE nombre = 'Cálculo Numérico';

-- Física II
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los principios del electromagnetismo y de la óptica clásica.
Desarrollar habilidades para modelar y analizar fenómenos electromagnéticos.
Aplicar leyes de Maxwell y conceptos de ondas electromagnéticas a problemas de ingeniería.
Introducir fenómenos ópticos relevantes para la tecnología.
$$,
  contenidos_minimos = $$
Carga eléctrica. Campo eléctrico. Ley de Gauss. Potencial eléctrico. Capacitancia.
Corriente eléctrica. Ley de Ohm. Circuitos de corriente continua. Campo magnético. Ley de Ampère. Ley de Faraday.
Inducción electromagnética. Oscilaciones electromagnéticas. Ondas electromagnéticas.
Óptica geométrica: reflexión, refracción, instrumentos ópticos básicos. Óptica física: interferencia y difracción.
$$,
  formacion_practica = $$
Medición de magnitudes eléctricas con instrumental de laboratorio. Análisis experimental de circuitos en corriente continua
y alterna. Experiencias de óptica geométrica y física usando láseres, lentes y rejillas de difracción. Uso de simuladores para
circuitos y campos electromagnéticos.
$$
WHERE nombre = 'Física II';

-- Ingeniería y Sociedad
UPDATE public.asignaturas
SET
  objetivos = $$
Reflexionar sobre el rol social del ingeniero en contexto local, nacional e internacional.
Reconocer las implicancias éticas, ambientales y culturales de los proyectos de ingeniería.
Analizar el impacto de la tecnología en la organización del trabajo y en la vida cotidiana.
Fomentar una actitud responsable y comprometida con el desarrollo sostenible.
$$,
  contenidos_minimos = $$
Historia de la ingeniería y desarrollo tecnológico. Sociedad de la información y del conocimiento.
Responsabilidad social del ingeniero. Ética profesional y códigos deontológicos. Impacto ambiental de la tecnología.
Relación entre ciencia, tecnología y sociedad. Políticas científicas y tecnológicas. Desarrollo sostenible.
Problemáticas sociales vinculadas a la tecnología (brecha digital, automatización, empleo, privacidad).
$$,
  formacion_practica = $$
Análisis de casos de estudio sobre proyectos de ingeniería y sus consecuencias sociales y ambientales.
Elaboración de ensayos críticos y debates guiados sobre temas de ética profesional y tecnología.
Diseño preliminar de propuestas de mejora tecnológica con enfoque socialmente responsable.
$$
WHERE nombre = 'Ingeniería y Sociedad';

-- Organización y Arquitectura de Computadoras
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender la estructura interna de una computadora y la interacción entre sus componentes.
Distinguir entre organización y arquitectura de computadoras.
Analizar el impacto de las decisiones de diseño de hardware en el rendimiento del software.
Introducir conceptos de paralelismo y arquitecturas modernas.
$$,
  contenidos_minimos = $$
Modelo de computadora de Von Neumann. Representación de datos en la computadora.
Aritmética de computadora. Unidad central de procesamiento: conjunto de instrucciones, modos de direccionamiento.
Jerarquía de memoria: registros, caché, memoria principal, memoria secundaria.
Sistemas de entrada/salida. Buses. Interrupciones.
Arquitecturas RISC y CISC. Paralelismo a nivel de instrucción. Multiprocesadores y multinúcleo. Introducción a GPUs.
$$,
  formacion_practica = $$
Uso de simuladores de arquitectura para analizar el comportamiento de programas. Experimentos de rendimiento variando
configuraciones de caché y memoria. Análisis de trazas de ejecución y conteo de instrucciones. Elaboración de informes
comparando distintas arquitecturas y su impacto en aplicaciones reales.
$$
WHERE nombre = 'Organización y Arquitectura de Computadoras';

-- Probabilidad y Estadística
UPDATE public.asignaturas
SET
  objetivos = $$
Introducir los conceptos fundamentales de probabilidad y estadística.
Desarrollar habilidades para modelar incertidumbre en problemas de ingeniería.
Aplicar técnicas estadísticas para el análisis y la interpretación de datos.
Proporcionar herramientas básicas para estudios experimentales y toma de decisiones.
$$,
  contenidos_minimos = $$
Conceptos de población y muestra. Tipos de variables. Descripción de datos: tablas, gráficos, medidas de posición y dispersión.
Probabilidad clásica, frecuentista y axiomática. Eventos y operaciones con eventos. Variables aleatorias discretas y continuas.
Distribuciones de probabilidad (binomial, Poisson, normal, etc.). Distribuciones muestrales. Estimación puntual e intervalos de confianza.
Contraste de hipótesis. Correlación y regresión lineal simple. Introducción al diseño de experimentos.
$$,
  formacion_practica = $$
Uso de planillas de cálculo o software estadístico para describir y analizar datos.
Resolución de problemas de probabilidad aplicada a contextos de ingeniería.
Aplicación de pruebas de hipótesis y construcción de intervalos de confianza en casos reales.
Análisis de datos de pequeños experimentos o relevamientos.
$$
WHERE nombre = 'Probabilidad y Estadística';

-- Bases de Datos
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los fundamentos teóricos y prácticos de los sistemas de bases de datos.
Dominar el modelo relacional y el lenguaje SQL.
Diseñar esquemas de bases de datos consistentes y normalizados.
Introducir modelos y tecnologías de bases de datos no relacionales.
$$,
  contenidos_minimos = $$
Conceptos de dato, información y base de datos. Modelos de datos. Modelo relacional: relaciones, claves, restricciones de integridad.
Álgebra relacional. Lenguaje SQL: definición, manipulación y control de datos (DDL, DML, DCL).
Diseño de bases de datos: modelo entidad–relación, normalización, dependencias funcionales.
Transacciones, concurrencia y recuperación. Introducción a bases de datos distribuidas y NoSQL.
$$,
  formacion_practica = $$
Modelado entidad–relación de casos de estudio. Creación de esquemas relacionales en un SGBD.
Escritura de consultas SQL simples y complejas (joins, subconsultas, agregaciones).
Implementación de vistas, índices y restricciones. Desarrollo de una pequeña base de datos para una aplicación real.
$$
WHERE nombre = 'Bases de Datos';

-- Ingeniería de Software II
UPDATE public.asignaturas
SET
  objetivos = $$
Profundizar en el diseño y construcción de sistemas de software de mediana y gran escala.
Aplicar patrones de diseño y principios de arquitectura de software.
Integrar prácticas de aseguramiento de la calidad en el proceso de desarrollo.
Introducir herramientas y prácticas de integración y despliegue continuo.
$$,
  contenidos_minimos = $$
Diseño detallado de software. Principios SOLID. Patrones de diseño de software (creacionales, estructurales, de comportamiento).
Introducción a arquitectura de software en capas y orientada a servicios. Refactorización.
Pruebas de software: pruebas unitarias, de integración y de sistema. Integración continua, control de versiones y gestión de configuración.
Documentación técnica y de usuario. Gestión de defectos y métricas básicas de calidad.
$$,
  formacion_practica = $$
Desarrollo iterativo de un proyecto de software aplicando patrones de diseño.
Escritura de pruebas unitarias y de integración con frameworks específicos.
Uso de sistemas de control de versiones y pipelines de integración continua.
Aplicación de técnicas de refactorización sobre código existente.
$$
WHERE nombre = 'Ingeniería de Software II';

-- Diseño Web
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los fundamentos del desarrollo de interfaces web modernas.
Dominar HTML, CSS y conceptos básicos de accesibilidad y usabilidad.
Introducir buenas prácticas de diseño responsive y mobile-first.
Preparar al estudiante para interactuar con tecnologías de desarrollo front end más avanzadas.
$$,
  contenidos_minimos = $$
Estructura básica de un documento HTML. Etiquetas semánticas. Enlaces, listas, tablas, formularios.
Hojas de estilo en cascada (CSS): selectores, modelo de caja, posicionamiento, tipografías, colores.
Diseño responsive: media queries, rejillas fluidas, layouts flexibles. Introducción a frameworks CSS.
Conceptos básicos de accesibilidad web. Buenas prácticas de diseño visual y experiencia de usuario.
Optimización básica de sitios web (peso, imágenes, estructura).
$$,
  formacion_practica = $$
Maquetado de sitios web estáticos para distintos dispositivos. Desarrollo de páginas con formularios y componentes comunes de UI.
Uso de técnicas de diseño responsive para adaptar interfaces a mobile y desktop.
Revisión de accesibilidad básica de los sitios desarrollados.
$$
WHERE nombre = 'Diseño Web';

-- Sistemas Operativos
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender la función y estructura de los sistemas operativos.
Analizar mecanismos de gestión de procesos, memoria y archivos.
Introducir conceptos de concurrencia, sincronización y comunicación entre procesos.
Relacionar el diseño del sistema operativo con el rendimiento y la seguridad del sistema.
$$,
  contenidos_minimos = $$
Evolución y funciones de los sistemas operativos. Arquitectura general.
Procesos e hilos. Planificación de CPU. Concurrencia y problemas de sincronización.
Mecanismos de sincronización: semáforos, monitores, secciones críticas.
Gestión de memoria: particiones, paginación, segmentación, memoria virtual.
Sistemas de archivos. Entrada/salida y drivers. Conceptos básicos de seguridad en el sistema operativo.
$$,
  formacion_practica = $$
Uso de herramientas de monitoreo de procesos y recursos del sistema operativo.
Programación de ejercicios de concurrencia y sincronización.
Experimentos de gestión de memoria y rendimiento con distintos parámetros de configuración.
Exploración de comandos y scripts para administración básica del sistema.
$$
WHERE nombre = 'Sistemas Operativos';

-- Teoría de la Información y la Comunicación
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los fundamentos matemáticos de la teoría de la información.
Analizar la transmisión, codificación y compresión de información en sistemas digitales.
Introducir conceptos básicos de teoría de la comunicación.
Relacionar la teoría de la información con la seguridad y confiabilidad de los datos.
$$,
  contenidos_minimos = $$
Concepto de información. Medida de la información. Entropía.
Teorema de la codificación de fuente. Codificación sin pérdidas y con pérdidas.
Canales de comunicación y capacidad de canal. Ruido e interferencias.
Códigos detectores y correctores de errores. Introducción a la compresión de datos.
Relación con criptografía y seguridad de la información.
$$,
  formacion_practica = $$
Cálculo de entropía y cantidad de información en distintas fuentes.
Diseño y análisis de códigos sencillos detectores y correctores de errores.
Experimentos simples de codificación y decodificación de mensajes con ruido simulado.
Análisis de esquemas de compresión y su efecto sobre la calidad y el tamaño de los datos.
$$
WHERE nombre = 'Teoría de la Información y la Comunicación';

-- Autómatas y Gramáticas
UPDATE public.asignaturas
SET
  objetivos = $$
Introducir los fundamentos de la teoría de lenguajes formales y autómatas.
Comprender la jerarquía de Chomsky y la relación entre gramáticas y autómatas.
Aplicar autómatas y expresiones regulares al diseño de analizadores léxicos.
Sentar bases teóricas para el estudio de compiladores.
$$,
  contenidos_minimos = $$
Lenguajes formales. Gramáticas y su clasificación. Jerarquía de Chomsky.
Autómatas finitos deterministas y no deterministas. Expresiones regulares.
Equivalencia entre autómatas finitos y expresiones regulares.
Autómatas con pila y gramáticas libres de contexto. Introducción a máquinas de Turing.
Aplicaciones en análisis léxico y sintáctico de lenguajes de programación.
$$,
  formacion_practica = $$
Construcción de autómatas finitos para reconocer lenguajes sencillos.
Transformación entre expresiones regulares y autómatas.
Diseño de pequeñas gramáticas libres de contexto para fragmentos de lenguajes de programación.
Uso de herramientas de generación de analizadores léxicos/sintácticos básicos.
$$
WHERE nombre = 'Autómatas y Gramáticas';

-- Desarrollo Back End
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los conceptos fundamentales del desarrollo del lado del servidor.
Diseñar y construir APIs para aplicaciones web y móviles.
Aplicar buenas prácticas de arquitectura, seguridad y manejo de datos.
Introducir herramientas de pruebas y despliegue de aplicaciones back end.
$$,
  contenidos_minimos = $$
Arquitectura cliente–servidor. Servidores web y frameworks back end.
Diseño de APIs REST. Rutas, controladores y middleware.
Conexión a bases de datos relacionales y/o NoSQL. ORM básicos.
Manejo de sesiones, autenticación y autorización. Gestión de errores y logging.
Buenas prácticas de seguridad básica en aplicaciones web (inyección, XSS, CSRF).
Introducción a pruebas de endpoints y despliegue en entornos de producción.
$$,
  formacion_practica = $$
Desarrollo de una API REST completa para un caso de estudio (CRUD, filtros, autenticación básica).
Integración con una base de datos real. Implementación de validaciones y manejo de errores.
Pruebas básicas de endpoints con herramientas tipo Postman o similares.
Preparación de la aplicación para su despliegue en un servidor.
$$
WHERE nombre = 'Desarrollo Back End';

-- Legislación
UPDATE public.asignaturas
SET
  objetivos = $$
Conocer el marco jurídico general aplicable a la actividad profesional del ingeniero en informática.
Identificar la normativa vinculada a contratos, propiedad intelectual y protección de datos.
Analizar responsabilidades legales y profesionales en proyectos tecnológicos.
Fomentar el ejercicio de la profesión dentro de la legalidad y la ética.
$$,
  contenidos_minimos = $$
Nociones básicas de derecho. Fuentes del derecho. Contratos civiles y comerciales.
Contratación de servicios informáticos. Responsabilidad civil y penal.
Propiedad intelectual y derechos de autor. Software libre y propietario.
Protección de datos personales y privacidad. Normativa sobre delitos informáticos.
Colegios y matriculación profesional (según corresponda). Aspectos legales de firma digital y documentos electrónicos.
$$,
  formacion_practica = $$
Análisis de contratos y cláusulas típicas en proyectos de software.
Discusión de fallos y casos jurisprudenciales vinculados a sistemas informáticos.
Redacción de acuerdos simples de confidencialidad, licenciamiento o prestación de servicios.
Evaluación legal básica de un caso de proyecto tecnológico.
$$
WHERE nombre = 'Legislación';

-- Modelos y Simulación
UPDATE public.asignaturas
SET
  objetivos = $$
Introducir técnicas de modelado de sistemas dinámicos y de eventos discretos.
Comprender el papel de la simulación en el análisis de sistemas complejos.
Formular modelos matemáticos o computacionales para problemas de ingeniería.
Analizar resultados de simulaciones para apoyar la toma de decisiones.
$$,
  contenidos_minimos = $$
Conceptos de modelo y simulación. Tipos de modelos: deterministas, estocásticos, continuos, discretos.
Etapas de un estudio de simulación. Modelos de colas, inventarios y redes de servicio.
Simulación de eventos discretos. Generación de números aleatorios.
Validación y verificación de modelos. Diseño de experimentos en simulación.
Análisis de resultados y presentación de conclusiones.
$$,
  formacion_practica = $$
Construcción de modelos sencillos de sistemas (colas, inventarios, procesos productivos).
Uso de herramientas o lenguajes de simulación para ejecutar experimentos.
Análisis estadístico de resultados de simulación y comparación de alternativas de diseño o gestión.
Elaboración de informes sobre casos de estudio simulados.
$$
WHERE nombre = 'Modelos y Simulación';

-- Redes de Computadoras
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los principios de funcionamiento de las redes de computadoras.
Conocer las capas y protocolos fundamentales de Internet.
Diseñar y analizar topologías de red pequeñas y medianas.
Introducir conceptos de configuración básica y seguridad en redes.
$$,
  contenidos_minimos = $$
Modelos de referencia OSI y TCP/IP. Medios físicos de transmisión.
Topologías de red. Dispositivos de red: repetidores, switches, routers.
Direcciones IP, máscaras, subredes. Protocolos de enrutamiento básicos.
Protocolos de transporte (TCP, UDP). Protocolos de aplicación (HTTP, DNS, etc.).
Conceptos básicos de redes inalámbricas. Introducción a QoS y seguridad en redes.
$$,
  formacion_practica = $$
Diseño de esquemas de direccionamiento y subredes.
Configuración básica de dispositivos de red en simuladores o equipos reales.
Pruebas de conectividad y diagnóstico de fallas simples.
Documentación de la red propuesta para un caso de estudio.
$$
WHERE nombre = 'Redes de Computadoras';

-- Ingeniería de Software III
UPDATE public.asignaturas
SET
  objetivos = $$
Integrar conocimientos de ingeniería de software en el desarrollo de sistemas complejos.
Aplicar enfoques avanzados de arquitectura y gestión de proyectos.
Incorporar prácticas de calidad, mantenimiento y evolución de software.
Trabajar colaborativamente en proyectos con múltiples actores y restricciones.
$$,
  contenidos_minimos = $$
Procesos de desarrollo avanzados (ágiles escalados, modelos híbridos).
Arquitecturas distribuidas, orientadas a servicios y microservicios.
Gestión de requisitos en proyectos grandes. Trazabilidad.
Mantenimiento, evolución y reingeniería de software. Gestión de la configuración y versiones.
Calidad de software en el ciclo de vida completo. Métricas y mejora de procesos.
Gestión de riesgos y de stakeholders en proyectos de software.
$$,
  formacion_practica = $$
Desarrollo de un proyecto de software de mayor envergadura en equipos.
Aplicación de técnicas de planificación, seguimiento y mejora continua.
Uso de herramientas de gestión de proyectos, repositorios de código y documentación colaborativa.
Presentación y defensa técnica del proyecto desarrollado.
$$
WHERE nombre = 'Ingeniería de Software III';

-- Desarrollo Front End
UPDATE public.asignaturas
SET
  objetivos = $$
Profundizar en el desarrollo de interfaces de usuario interactivas para la web.
Dominar un framework o biblioteca moderna de front end.
Aplicar buenas prácticas de componentes reutilizables, estado y enrutamiento.
Integrar el front end con APIs y servicios externos.
$$,
  contenidos_minimos = $$
Arquitectura de aplicaciones de una sola página (SPA).
Componentes, propiedades y estado en frameworks modernos de front end.
Manejo de eventos y ciclo de vida de componentes.
Consumo de APIs REST desde el front end. Manejo de errores y carga de datos.
Enrutamiento del lado del cliente. Gestión global de estado (según framework).
Buenas prácticas de organización de proyectos front end, testing básico y optimización.
$$,
  formacion_practica = $$
Desarrollo de una SPA completa conectada a una API real o simulada.
Diseño e implementación de componentes reutilizables.
Implementación de navegación, formularios y manejo de errores en la interfaz.
Pruebas básicas de componentes o vistas, y despliegue del front end.
$$
WHERE nombre = 'Desarrollo Front End';

-- Inteligencia Artificial
UPDATE public.asignaturas
SET
  objetivos = $$
Introducir los fundamentos de la inteligencia artificial clásica y moderna.
Conocer técnicas básicas de búsqueda, representación del conocimiento y aprendizaje automático.
Aplicar algoritmos de IA a problemas de ejemplo.
Reflexionar sobre implicancias éticas del uso de IA.
$$,
  contenidos_minimos = $$
Historia y conceptos básicos de IA. Problemas de búsqueda y espacios de estados.
Búsqueda ciega y heurística. Representación del conocimiento y razonamiento.
Introducción a lógica para IA. Introducción al aprendizaje automático: problemas supervisados y no supervisados.
Modelos simples de clasificación y regresión. Árboles de decisión, k-NN, clustering básico.
Aplicaciones típicas de IA en la industria. Consideraciones éticas y sociales.
$$,
  formacion_practica = $$
Implementación de algoritmos de búsqueda y soluciones a pequeños problemas de planificación.
Uso de librerías de aprendizaje automático para entrenar modelos simples con conjuntos de datos reales o sintéticos.
Evaluación de modelos y discusión de limitaciones. Mini-proyectos de aplicación de IA a un problema acotado.
$$
WHERE nombre = 'Inteligencia Artificial';

-- Seguridad Informática
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los conceptos fundamentales de la seguridad de la información.
Identificar amenazas, vulnerabilidades y riesgos en sistemas informáticos.
Conocer mecanismos de protección y controles de seguridad básicos.
Fomentar prácticas seguras en el desarrollo y operación de sistemas.
$$,
  contenidos_minimos = $$
Conceptos de confidencialidad, integridad y disponibilidad. Autenticación, autorización y auditoría.
Amenazas y vulnerabilidades comunes. Malware, phishing, ataques de red.
Criptografía básica: cifrado simétrico y asimétrico, hash, firma digital.
Seguridad en redes y sistemas operativos. Seguridad en aplicaciones web.
Políticas de seguridad, gestión de incidentes y continuidad del negocio.
$$,
  formacion_practica = $$
Análisis de vulnerabilidades simples en entornos controlados.
Aplicación de buenas prácticas de configuración segura en sistemas y aplicaciones.
Uso básico de herramientas de análisis de seguridad (escáneres, monitoreo de logs).
Elaboración de recomendaciones de seguridad para un caso de estudio.
$$
WHERE nombre = 'Seguridad Informática';

-- Arquitectura de Software
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender el rol de la arquitectura en el éxito de sistemas de software.
Conocer estilos y patrones arquitectónicos comunes.
Evaluar decisiones arquitectónicas considerando calidad, rendimiento y mantenibilidad.
Documentar y comunicar arquitecturas de software.
$$,
  contenidos_minimos = $$
Conceptos básicos de arquitectura de software. Estilos arquitectónicos (en capas, cliente-servidor, microservicios, event-driven, etc.).
Patrones arquitectónicos y de integración. Calidad arquitectónica: performance, escalabilidad, disponibilidad, mantenibilidad, seguridad.
Tácticas de arquitectura para distintos atributos de calidad.
Documentación arquitectónica (vistas, diagramas, decisiones de arquitectura).
Evaluación de arquitecturas y trade-offs entre alternativas.
$$,
  formacion_practica = $$
Elaboración de propuestas de arquitectura para sistemas de distinta escala.
Definición de vistas arquitectónicas y documentación asociada.
Análisis de casos reales de arquitectura (existente o propuesta) identificando fortalezas y debilidades.
Presentación y defensa de decisiones de diseño arquitectónico.
$$
WHERE nombre = 'Arquitectura de Software';

-- Auditoría Informática
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender el propósito y alcance de la auditoría de sistemas de información.
Conocer metodologías y normas básicas de auditoría informática.
Identificar controles y evidencias relevantes en sistemas y procesos.
Elaborar informes de auditoría claros y accionables.
$$,
  contenidos_minimos = $$
Conceptos de auditoría y control interno. Tipos de auditoría de sistemas.
Normas y marcos de referencia aplicables (por ejemplo, COBIT, ISO/IEC 27001 a nivel introductorio).
Planificación y ejecución de auditorías. Técnicas de relevamiento y evaluación de controles.
Auditoría de seguridad, de desarrollo de sistemas y de operación.
Hallazgos, recomendaciones y seguimiento. Ética del auditor.
$$,
  formacion_practica = $$
Simulación de una auditoría acotada de un proceso o sistema.
Relevamiento de controles existentes y análisis de brechas.
Redacción de un informe de auditoría con hallazgos y recomendaciones.
Exposición de resultados ante “clientes” o “directivos” simulados.
$$
WHERE nombre = 'Auditoría Informática';

-- Calidad de Software
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender los conceptos de calidad de software y su relación con el proceso de desarrollo.
Conocer normas, modelos y métricas de calidad.
Diseñar e implementar actividades de aseguramiento y control de calidad.
Fomentar la mejora continua en proyectos de software.
$$,
  contenidos_minimos = $$
Definiciones de calidad de software. Factores y atributos de calidad.
Modelos y normas de calidad (por ejemplo, ISO/IEC 25010, CMMI a nivel introductorio).
Aseguramiento de la calidad vs. control de calidad. Plan de calidad.
Técnicas de prueba y revisión de software. Métricas de producto y de proceso.
Gestión de la calidad en el ciclo de vida. Mejora continua y retroalimentación.
$$,
  formacion_practica = $$
Elaboración de un plan de calidad para un proyecto de software.
Definición e implementación de criterios de aceptación y casos de prueba.
Aplicación de revisiones de código y documentación.
Uso de herramientas de soporte a la calidad (análisis estático, cobertura de pruebas, etc.).
$$
WHERE nombre = 'Calidad de Software';

-- Práctica Profesional Supervisada
UPDATE public.asignaturas
SET
  objetivos = $$
Integrar conocimientos y habilidades adquiridas a lo largo de la carrera en un contexto real o simulado de trabajo.
Desarrollar competencias profesionales, de comunicación y trabajo en equipo.
Asumir responsabilidades y compromisos propios del ejercicio profesional.
Reflexionar críticamente sobre la práctica y el rol del ingeniero en informática.
$$,
  contenidos_minimos = $$
Desarrollo de actividades profesionales en organizaciones públicas, privadas o proyectos académicos equivalentes.
Aplicación de conocimientos técnicos, metodológicos y de gestión.
Comunicación con distintos actores (clientes, usuarios, equipos de trabajo).
Ética profesional y responsabilidad social en la práctica.
Elaboración de informes y presentaciones de resultados.
$$,
  formacion_practica = $$
Realización de una práctica supervisada con objetivos, tareas y entregables definidos.
Registro y seguimiento de actividades en bitácoras o reportes periódicos.
Presentación de un informe final integrador y defensa oral ante tribunal o comisión.
Autoevaluación y evaluación conjunta con el tutor o supervisor.
$$
WHERE nombre = 'Práctica Profesional Supervisada';

-- Organización Empresarial
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender el funcionamiento de las organizaciones y sus principales áreas.
Conocer conceptos básicos de administración, liderazgo y estructura organizacional.
Relacionar la gestión empresarial con proyectos y servicios de TI.
Desarrollar una visión sistémica del negocio y su entorno.
$$,
  contenidos_minimos = $$
Tipos de organizaciones. Estructura organizacional. Procesos y funciones básicas (producción, finanzas, marketing, RR.HH., etc.).
Planeamiento estratégico y operativo. Cultura organizacional y cambio.
Liderazgo y motivación. Toma de decisiones en la empresa.
Rol de las tecnologías de la información en las organizaciones.
Relación entre estrategia de negocio y estrategia de TI.
$$,
  formacion_practica = $$
Análisis de casos de empresas reales y su estructura organizativa.
Mapeo de procesos clave de negocio y su relación con sistemas de información.
Elaboración de diagnósticos simples sobre problemáticas organizacionales.
Presentación de propuestas de mejora apoyadas en TI.
$$
WHERE nombre = 'Organización Empresarial';

-- Sistemas de Información
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender el rol estratégico de los sistemas de información en las organizaciones.
Conocer tipos y componentes de sistemas de información.
Analizar la alineación entre sistemas de información y procesos de negocio.
Introducir criterios de evaluación y selección de soluciones informáticas.
$$,
  contenidos_minimos = $$
Conceptos básicos de sistemas de información. Tipos de sistemas (operacionales, gerenciales, estratégicos, etc.).
Ciclo de vida de los sistemas de información. Análisis y diseño desde la perspectiva organizacional.
Alineación entre TI y negocio. Gobierno de TI (nociones introductorias).
Evaluación de soluciones de software y paquetes. Tercerización y servicios en la nube.
Impacto de los sistemas de información en la organización y en la toma de decisiones.
$$,
  formacion_practica = $$
Relevamiento de necesidades de información en un área organizacional.
Análisis de sistemas de información existentes y sus fortalezas/debilidades.
Elaboración de propuestas de mejora, reemplazo o incorporación de nuevos sistemas.
Presentación de casos de evaluación y selección de soluciones.
$$
WHERE nombre = 'Sistemas de Información';

-- Economía y Finanzas
UPDATE public.asignaturas
SET
  objetivos = $$
Introducir conceptos básicos de economía y finanzas aplicados a proyectos de ingeniería.
Comprender el funcionamiento de los mercados y los principales indicadores económicos.
Aplicar herramientas financieras para evaluar inversiones y proyectos tecnológicos.
Apoyar la toma de decisiones económicas en contextos de TI.
$$,
  contenidos_minimos = $$
Conceptos de micro y macroeconomía básicos. Oferta y demanda. Mercado y precios.
Inflación, tipo de cambio, tasas de interés. Estados contables básicos.
Valor tiempo del dinero. Interés simple y compuesto.
Evaluación económica de proyectos: VAN, TIR, período de recuperación.
Análisis de alternativas de inversión en tecnología. Presupuestos y costos en proyectos de TI.
$$,
  formacion_practica = $$
Cálculo de indicadores financieros para casos de proyectos tecnológicos.
Elaboración de flujos de fondos y análisis de alternativas de inversión.
Uso de planillas de cálculo para evaluar escenarios económicos.
Discusión de casos reales de decisiones económicas vinculadas a TI.
$$
WHERE nombre = 'Economía y Finanzas';

-- Emprendedorismo Tecnológico
UPDATE public.asignaturas
SET
  objetivos = $$
Fomentar el espíritu emprendedor en el ámbito tecnológico.
Conocer el proceso de creación y validación de ideas de negocio basadas en tecnología.
Introducir herramientas de modelado de negocios y planes de empresa.
Analizar desafíos y oportunidades del ecosistema emprendedor.
$$,
  contenidos_minimos = $$
Conceptos de emprendimiento y tipos de emprendedores. Ideas de negocio y oportunidades de mercado.
Modelos de negocios (por ejemplo, lienzo Canvas). Propuesta de valor.
Validación de hipótesis con clientes. MVP y prototipos.
Aspectos básicos de marketing y ventas en emprendimientos tecnológicos.
Fuentes de financiamiento. Ecosistema emprendedor local y global.
$$,
  formacion_practica = $$
Formulación de una idea de emprendimiento tecnológico y desarrollo de su modelo de negocio.
Elaboración de un pitch básico para presentar la propuesta.
Realización de entrevistas o encuestas simples a potenciales usuarios o clientes.
Presentación y discusión grupal de los proyectos emprendedores.
$$
WHERE nombre = 'Emprendedorismo Tecnológico';

-- Gestión de Servicios TIC
UPDATE public.asignaturas
SET
  objetivos = $$
Comprender la naturaleza y ciclo de vida de los servicios de tecnologías de la información.
Conocer buenas prácticas y marcos de referencia para la gestión de servicios TIC.
Planificar y mejorar servicios alineados a las necesidades del negocio.
Introducir métricas y acuerdos de nivel de servicio (SLA).
$$,
  contenidos_minimos = $$
Concepto de servicio TIC. Portafolio y catálogo de servicios.
Procesos clave de provisión y soporte de servicios.
Introducción a marcos de referencia como ITIL u otros, a nivel conceptual.
Gestión de niveles de servicio. Gestión de incidentes, problemas y cambios.
Medición y mejora continua de servicios. Relación con usuarios y clientes internos.
$$,
  formacion_practica = $$
Identificación y descripción de servicios TIC en una organización.
Definición preliminar de acuerdos de nivel de servicio para un servicio elegido.
Análisis de flujos de gestión de incidentes o cambios.
Propuesta de mejoras en la gestión de un servicio TIC específico.
$$
WHERE nombre = 'Gestión de Servicios TIC';

-- Proyecto Integrador
UPDATE public.asignaturas
SET
  objetivos = $$
Integrar conocimientos técnicos, metodológicos y de gestión en el desarrollo de un proyecto completo.
Trabajar en equipo aplicando prácticas profesionales de ingeniería de software.
Desarrollar soluciones a problemas reales o realistas, con interacción con usuarios o “clientes”.
Documentar y presentar el proyecto con estándares profesionales.
$$,
  contenidos_minimos = $$
Formulación del problema y objetivos del proyecto. Relevamiento y especificación de requisitos.
Diseño de la solución (arquitectura, modelos de datos, interfaces, etc.).
Implementación e integración de componentes. Pruebas y validación.
Gestión del proyecto: planificación, seguimiento, riesgos, comunicación.
Documentación técnica y manuales de usuario. Presentación y defensa del proyecto.
$$,
  formacion_practica = $$
Desarrollo de un proyecto de software (u otro proyecto TIC) en equipo, a lo largo del cursado.
Aplicación de metodologías de desarrollo y herramientas colaborativas.
Entrega de hitos parciales y revisión iterativa con docentes/tutores.
Presentación final y defensa del proyecto ante tribunal o comisión.
$$
WHERE nombre = 'Proyecto Integrador';

-- Formulación de Propuesta de Proyecto Integrador
UPDATE public.asignaturas
SET
  objetivos = $$
Guiar al estudiante en la definición y formulación de la propuesta de su Proyecto Integrador.
Delimitar el problema, objetivos, alcance y resultados esperados.
Planificar recursos, cronograma y riesgos principales del proyecto.
Producir un documento de propuesta sólido y defendible.
$$,
  contenidos_minimos = $$
Identificación de problemas y oportunidades para el Proyecto Integrador.
Formulación de objetivos generales y específicos. Alcance y límites del proyecto.
Marco teórico y estado del arte (a nivel introductorio).
Planificación: actividades, recursos, tiempos, hitos.
Riesgos principales y estrategias de mitigación.
Estructura y redacción de la propuesta de proyecto.
$$,
  formacion_practica = $$
Elaboración progresiva de la propuesta de Proyecto Integrador propia de cada estudiante o equipo.
Revisión y corrección iterativa de los distintos apartados (problema, objetivos, planificación, etc.).
Presentación oral de la propuesta y recepción de retroalimentación.
Ajuste final de la propuesta para su aprobación.
$$
WHERE nombre = 'Formulación de Propuesta de Proyecto Integrador';

-- Formulación y Evaluación de Proyectos TIC
UPDATE public.asignaturas
SET
  objetivos = $$
Proporcionar herramientas para formular y evaluar proyectos de tecnologías de la información.
Analizar la viabilidad técnica, económica y organizacional de proyectos TIC.
Aplicar técnicas de evaluación económica y análisis de riesgos.
Preparar documentación de proyectos orientada a la toma de decisiones.
$$,
  contenidos_minimos = $$
Ciclo de vida de un proyecto TIC. Identificación de stakeholders y necesidades.
Formulación de proyectos: objetivos, alcance, entregables, recursos, cronograma.
Evaluación técnica, operativa, económica y financiera de proyectos.
Análisis de riesgos y escenarios. Indicadores de desempeño de proyectos.
Presentación y justificación de proyectos ante decisores.
Relación con portafolio de proyectos y estrategia de la organización.
$$,
  formacion_practica = $$
Formulación y evaluación de uno o más proyectos TIC de ejemplo o propuestos por los estudiantes.
Cálculo de indicadores económicos y análisis de escenarios.
Elaboración de un documento de proyecto con énfasis en su evaluación.
Presentación y defensa de los proyectos frente a un panel evaluador simulado.
$$
WHERE nombre = 'Formulación y Evaluación de Proyectos TIC';

COMMIT;
