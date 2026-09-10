/** Portadas de curso con el modelo de /curso/climatizacion, contextualizadas por especialidad. */

import { COURSE_CATALOG_HREF } from "@/lib/course-portal";

export type HubModule = {
  numero: number;
  title: string;
  blurb: string;
  oa: string;
  hoursLabel: string;
  hoursAnnual: string;
  hours3d: string;
  href: string;
  available: boolean;
};

export type HubRouteGroup = {
  title: string;
  nums: number[];
};

export type CourseHubConfig = {
  slug: string;
  title: string;
  sector: string;
  level: string;
  description: string;
  live: boolean;
  lms?: "climatizacion";
  heroImage: string;
  collage: [string, string, string];
  startCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  spotlight?: {
    title: string;
    body: string;
    image: string;
    href: string;
    cta: string;
    badge: string;
  };
  modules: HubModule[];
  groups: HubRouteGroup[];
  oa: { codigo: string; descripcion: string }[];
  footerNote: string;
  stats: {
    modules: number;
    hoursAnnual: string;
    hours3d: string;
    status: "En curso" | "Disponible" | "Próximamente";
  };
};

const SECTOR_IMG: Record<string, string> = {
  Administración: "/images/especialidades/sector-administracion.png",
  Alimentación: "/images/especialidades/sector-alimentacion.png",
  Agropecuario: "/images/especialidades/sector-agropecuario.png",
  Confección: "/images/especialidades/sector-confeccion.png",
  Construcción: "/images/especialidades/sector-construccion.png",
  Electricidad: "/images/especialidades/sector-electricidad.png",
  Gráfico: "/images/especialidades/sector-grafico.png",
  "Hotelería y Turismo": "/images/especialidades/sector-hoteleria.png",
  Maderero: "/images/especialidades/sector-maderero.png",
  Marítimo: "/images/especialidades/sector-maritimo.png",
  Metalmecánica: "/images/especialidades/sector-metalmecanica.png",
  Minero: "/images/especialidades/sector-minero.png",
  "Química e Industria": "/images/especialidades/sector-quimica.png",
  "Salud y Educación": "/images/especialidades/sector-salud.png",
  "Tecnología y Comunicaciones": "/images/especialidades/sector-tecnologia.png",
};

function sectorArt(sector: string): string {
  return SECTOR_IMG[sector] || "/images/hero.png";
}

function coming(
  slug: string,
  title: string,
  sector: string,
  level: string,
  description: string,
  moduleSpecs: Array<[string, string, string]>,
  oa: Array<[string, string]>,
): CourseHubConfig {
  const art = sectorArt(sector);
  const hoursAnnualEach = 190;
  const hours3dEach = 52;
  const modules: HubModule[] = moduleSpecs.map(([modTitle, blurb, oaCode], i) => ({
    numero: i + 1,
    title: modTitle,
    blurb,
    oa: oaCode,
    hoursAnnual: `${hoursAnnualEach} h`,
    hours3d: `${hours3dEach} h`,
    hoursLabel: `${hoursAnnualEach} h · ${hours3dEach} h 3D`,
    href: `/curso/${slug}`,
    available: false,
  }));
  const mid = Math.ceil(modules.length / 2);
  return {
    slug,
    title,
    sector,
    level,
    description,
    live: false,
    heroImage: art,
    collage: [art, "/images/hero.png", "/images/brand/aula-tp-chile-logo.jpg"],
    startCta: { label: "Ver ruta de módulos", href: `#ruta` },
    secondaryCta: { label: "Volver al catálogo", href: COURSE_CATALOG_HREF },
    modules,
    groups:
      modules.length > 4
        ? [
            { title: `3° medio · M1–M${mid}`, nums: modules.slice(0, mid).map((m) => m.numero) },
            { title: `4° medio · M${mid + 1}–M${modules.length}`, nums: modules.slice(mid).map((m) => m.numero) },
          ]
        : [{ title: `Ruta de la especialidad · M1–M${modules.length}`, nums: modules.map((m) => m.numero) }],
    oa: oa.map(([codigo, descripcion]) => ({ codigo, descripcion })),
    footerNote: "Modelo Aula TP (ruta obligatoria + Práctica Libre) · programa MINEDUC en preparación",
    stats: {
      modules: modules.length,
      hoursAnnual: `${hoursAnnualEach * modules.length} h`,
      hours3d: `${hours3dEach * modules.length} h`,
      status: "Próximamente",
    },
  };
}

const CLIM_LMS = "/curso/climatizacion";

export const COURSE_HUBS: CourseHubConfig[] = [
  {
    slug: "climatizacion",
    title: "Refrigeración y Climatización",
    sector: "Construcción",
    level: "3° y 4° medio",
    description:
      "Curso completo M1–M8 · 3° y 4° medio · ruta obligatoria + Práctica Libre. Entra por el módulo que te corresponde y avanza con estaciones AE.",
    live: true,
    lms: "climatizacion",
    heroImage: "/images/climatizacion/climatizacion-hero-v2.png",
    collage: [
      "/images/climatizacion/m1-planos-contexto.png",
      "/images/climatizacion/m6-inspeccion-demo.gif",
      "/images/climatizacion/m4-montaje-equipos.png",
    ],
    startCta: { label: "Empezar por Módulo 1", href: `${CLIM_LMS}/m1-planos?vista=mapa` },
    secondaryCta: { label: "Ver 4° medio (M5)", href: `${CLIM_LMS}/m5-puesta-en-marcha?vista=mapa` },
    spotlight: {
      title: "Diagnóstico con inspección 3D",
      body: "Explora la condensadora en 3D, recorre hotspots de inspección visual y conecta hallazgos con los CE del programa. Ideal para 4° medio.",
      image: "/images/climatizacion/m6-inspeccion-demo.gif",
      href: `${CLIM_LMS}/m6-diagnostico?estacion=inspeccion-visual`,
      cta: "Abrir inspección visual",
      badge: "Spotlight · M6",
    },
    modules: [
      { numero: 1, title: "Lectura de planos", blurb: "Simbología e interpretación de planos en proyecto real.", oa: "OA 1, OA 2", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: `${CLIM_LMS}/m1-planos?vista=mapa&reanudar=1`, available: true },
      { numero: 2, title: "Instrumentos de medición", blurb: "Selección y uso de instrumentos en contexto frigorífico.", oa: "OA 3", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: `${CLIM_LMS}/m2-medicion?vista=mapa&reanudar=1`, available: true },
      { numero: 3, title: "Montaje de redes", blurb: "Uniones, hermeticidad y secuencia segura de montaje.", oa: "OA 4", hoursAnnual: "228 h", hours3d: "68.4 h", hoursLabel: "228 h · 68.4 h 3D", href: `${CLIM_LMS}/m3-redes?vista=mapa&reanudar=1`, available: true },
      { numero: 4, title: "Montaje de equipos", blurb: "Instalación post-montaje y decisión con manual técnico.", oa: "OA 5", hoursAnnual: "228 h", hours3d: "68.4 h", hoursLabel: "228 h · 68.4 h 3D", href: `${CLIM_LMS}/m4-equipos?vista=mapa&reanudar=1`, available: true },
      { numero: 5, title: "Puesta en marcha", blurb: "Protocolo de carga, EPP y lecturas de presión.", oa: "OA 6", hoursAnnual: "228 h", hours3d: "68.4 h", hoursLabel: "228 h · 68.4 h 3D", href: `${CLIM_LMS}/m5-puesta-en-marcha?vista=mapa&reanudar=1`, available: true },
      { numero: 6, title: "Diagnóstico", blurb: "Inspección visual/3D, CE del programa y evaluación 2 h.", oa: "OA 7", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: `${CLIM_LMS}/m6-diagnostico?vista=mapa&reanudar=1`, available: true },
      { numero: 7, title: "Mantención", blurb: "Preventivo y correctivo acotado con orden de trabajo.", oa: "OA 8", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: `${CLIM_LMS}/m7-mantencion?vista=mapa&reanudar=1`, available: true },
      { numero: 8, title: "Reciclaje y almacenamiento", blurb: "Recuperar y almacenar refrigerantes según NCh3241.", oa: "OA 9", hoursAnnual: "152 h", hours3d: "45.6 h", hoursLabel: "152 h · 45.6 h 3D", href: `${CLIM_LMS}/m8-reciclaje?vista=mapa&reanudar=1`, available: true },
    ],
    groups: [
      { title: "3° medio · M1–M4", nums: [1, 2, 3, 4] },
      { title: "4° medio · M5–M8", nums: [5, 6, 7, 8] },
    ],
    oa: [
      { codigo: "OA 1", descripcion: "Leer y utilizar planos de redes de cañería y ductos, simbología y especificaciones técnicas de proyectos de refrigeración y climatización." },
      { codigo: "OA 2", descripcion: "Cubicar elementos y materiales para proyectos de refrigeración, climatización, calefacción y ventilación." },
      { codigo: "OA 3", descripcion: "Realizar mediciones y controles de verificación de magnitudes del proyecto, con normas de seguridad y medio ambiente." },
      { codigo: "OA 4", descripcion: "Armar, instalar y aislar redes de ductos y cañerías con uniones que aseguren hermeticidad según NCh3241." },
      { codigo: "OA 5", descripcion: "Instalar equipos y componentes de refrigeración, calefacción, climatización y ventilación según proyecto y fabricante." },
      { codigo: "OA 6", descripcion: "Cargar fluidos y poner en marcha sistemas considerando presiones de fabricante y refrigerantes de menor impacto." },
      { codigo: "OA 7", descripcion: "Inspeccionar y diagnosticar fallas respecto de las especificaciones técnicas del fabricante." },
      { codigo: "OA 8", descripcion: "Realizar mantenimiento preventivo y correctivo según parámetros de los manuales." },
      { codigo: "OA 9", descripcion: "Recuperar, reciclar y almacenar refrigerantes con herramientas y EPP adecuados." },
    ],
    footerNote: "Prompt Maestro 30 % · ruta obligatoria + Práctica Libre",
    stats: { modules: 8, hoursAnnual: "1672 h", hours3d: "479 h", status: "En curso" },
  },
  {
    slug: "enfermeria",
    title: "Atención de Enfermería",
    sector: "Salud y Educación",
    level: "3° medio",
    description:
      "Ruta clínica M1–M5 · cuidados básicos, parámetros, promoción, bioseguridad y registro. Misma lógica de climatización: ruta obligatoria, estaciones AE y Práctica Libre.",
    live: true,
    heroImage: "/images/especialidades/sector-salud.png",
    collage: [
      "/images/portal-docente/cursos/enfermeria.png",
      "/images/especialidades/sector-salud.png",
      "/images/hero.png",
    ],
    startCta: { label: "Empezar por Módulo 1", href: "/portal/simuladores/atencion_enfermeria/" },
    secondaryCta: { label: "Abrir LMS de Enfermería", href: "/portal/simuladores/atencion_enfermeria/" },
    spotlight: {
      title: "Simulación clínica con caso guiado",
      body: "Integra observación, procedimiento seguro y registro en un caso de atención. El Tutor Aula TP acompaña la ruta; la evaluación final se rinde sin Tutor.",
      image: "/images/portal-docente/cursos/enfermeria.png",
      href: "/portal/simuladores/atencion_enfermeria/",
      cta: "Entrar a la simulación clínica",
      badge: "Spotlight · caso clínico",
    },
    modules: [
      { numero: 1, title: "Cuidados básicos", blurb: "Higiene, confort y trato digno en el ciclo vital.", oa: "OA 1", hoursAnnual: "228 h", hours3d: "68 h", hoursLabel: "228 h · 68 h 3D", href: "/portal/simuladores/atencion_enfermeria/", available: true },
      { numero: 2, title: "Parámetros de salud", blurb: "Medir, registrar y comunicar signos vitales con protocolo.", oa: "OA 2", hoursAnnual: "152 h", hours3d: "46 h", hoursLabel: "152 h · 46 h 3D", href: "/portal/simuladores/atencion_enfermeria/", available: true },
      { numero: 3, title: "Promoción y prevención", blurb: "Factores protectores, educación y autocuidado comunitario.", oa: "OA 3", hoursAnnual: "190 h", hours3d: "48 h", hoursLabel: "190 h · 48 h 3D", href: "/portal/simuladores/atencion_enfermeria/", available: true },
      { numero: 4, title: "Bioseguridad", blurb: "Precauciones estándar, desinfección y residuos clínicos.", oa: "OA 4", hoursAnnual: "190 h", hours3d: "48 h", hoursLabel: "190 h · 48 h 3D", href: "/portal/simuladores/atencion_enfermeria/", available: true },
      { numero: 5, title: "Registro en salud", blurb: "Trazabilidad, confidencialidad y continuidad del cuidado.", oa: "OA 6", hoursAnnual: "76 h", hours3d: "15 h", hoursLabel: "76 h · 15 h 3D", href: "/portal/simuladores/atencion_enfermeria/", available: true },
    ],
    groups: [{ title: "3° medio · M1–M5", nums: [1, 2, 3, 4, 5] }],
    oa: [
      { codigo: "OA 1", descripcion: "Aplicar cuidados básicos según condición de salud, costumbres y etapa del ciclo vital, con privacidad y asepsia." },
      { codigo: "OA 2", descripcion: "Medir, registrar y comunicar parámetros básicos de salud con instrumentos y procedimientos establecidos." },
      { codigo: "OA 3", descripcion: "Participar en promoción de la salud y prevención, considerando el contexto individual, familiar y comunitario." },
      { codigo: "OA 4", descripcion: "Aplicar higiene, limpieza, desinfección y prevención de riesgos en el entorno de atención." },
      { codigo: "OA 6", descripcion: "Registrar información de salud con confidencialidad, trazabilidad y uso responsable de sistemas." },
    ],
    footerNote: "Modelo Aula TP · ruta clínica en LMS de Enfermería",
    stats: { modules: 5, hoursAnnual: "836 h", hours3d: "225 h", status: "En curso" },
  },
  {
    slug: "electricidad",
    title: "Electricidad 3° Medio",
    sector: "Electricidad",
    level: "3° medio",
    description:
      "Ruta técnica M1–M4 · motores y calefacción, instalaciones domiciliarias, proyectos y mantenimiento. Misma secuencia Aula TP: contexto, estaciones AE, integradora y evaluación 2 h.",
    live: true,
    heroImage: "/images/especialidades/sector-electricidad.png",
    collage: [
      "/images/portal-docente/cursos/electricidad.png",
      "/images/simulador-electricidad.png",
      "/images/especialidades/sector-electricidad.png",
    ],
    startCta: { label: "Empezar por Módulo 1", href: "/portal/simuladores/electricidad_3_medio/" },
    secondaryCta: { label: "Abrir LMS de Electricidad", href: "/portal/simuladores/electricidad_3_medio/" },
    spotlight: {
      title: "Tablero y puesta en marcha segura",
      body: "Trabaja planos, protecciones y RIS SEC antes de energizar. El módulo de mantenimiento cierra con diagnóstico, bloqueo y registro técnico.",
      image: "/images/simulador-electricidad.png",
      href: "/portal/simuladores/electricidad_3_medio/",
      cta: "Entrar al taller eléctrico",
      badge: "Spotlight · baja tensión",
    },
    modules: [
      { numero: 1, title: "Motores y calefacción", blurb: "Fuerza motriz y calefacción en baja tensión hasta 5 kW.", oa: "OA 4", hoursAnnual: "152 h", hours3d: "42 h", hoursLabel: "152 h · 42 h 3D", href: "/portal/simuladores/electricidad_3_medio/", available: true },
      { numero: 2, title: "Instalaciones domiciliarias", blurb: "Alumbrado, ductos, tablero y protecciones según plano.", oa: "OA 1, OA 3", hoursAnnual: "190 h", hours3d: "52 h", hoursLabel: "190 h · 52 h 3D", href: "/portal/simuladores/electricidad_3_medio/", available: true },
      { numero: 3, title: "Proyectos eléctricos", blurb: "CAD, simbología, memoria de cálculo y cubicación.", oa: "OA 1, OA 2, OA 5", hoursAnnual: "152 h", hours3d: "42 h", hoursLabel: "152 h · 42 h 3D", href: "/portal/simuladores/electricidad_3_medio/", available: true },
      { numero: 4, title: "Mantenimiento eléctrico", blurb: "Preventivo y correctivo con bloqueo, medición y entrega.", oa: "OA 6", hoursAnnual: "152 h", hours3d: "42 h", hoursLabel: "152 h · 42 h 3D", href: "/portal/simuladores/electricidad_3_medio/", available: true },
    ],
    groups: [{ title: "3° medio · M1–M4", nums: [1, 2, 3, 4] }],
    oa: [
      { codigo: "OA 1", descripcion: "Leer especificaciones, planos y proyectos para ejecutar instalaciones de alumbrado en baja tensión." },
      { codigo: "OA 2", descripcion: "Utilizar software CAD para dibujar circuitos y cubicar materiales de instalaciones de baja tensión." },
      { codigo: "OA 3", descripcion: "Ejecutar canalizaciones, cableado y tablero de instalaciones domiciliarias según normativa vigente." },
      { codigo: "OA 4", descripcion: "Instalar motores y equipos de calefacción en baja tensión hasta 5 kW, con verificación y registro." },
      { codigo: "OA 5", descripcion: "Elaborar proyectos eléctricos coherentes entre plano, memoria y presupuesto." },
      { codigo: "OA 6", descripcion: "Mantener y reemplazar componentes de sistemas monofásicos y trifásicos con procedimientos seguros." },
    ],
    footerNote: "Modelo Aula TP · ruta técnica en LMS de Electricidad",
    stats: { modules: 4, hoursAnnual: "646 h", hours3d: "178 h", status: "En curso" },
  },
  {
    slug: "administracion",
    title: "Administración de Empresas",
    sector: "Administración",
    level: "3° medio · plan común",
    description:
      "Plan 3° MINEDUC con el ERP Bazar Inteligente como taller: el estudiante gestiona un bazar de práctica (ventas, inventario, caja, proveedores y contabilidad) en cada módulo.",
    live: true,
    heroImage: "/images/especialidades/sector-administracion.png",
    collage: [
      "/images/especialidades/sector-administracion.png",
      "/images/brand/aula-tp-chile-logo.jpg",
      "/images/hero.png",
    ],
    startCta: { label: "Empezar por Módulo 1", href: "/curso/administracion/m1-contable" },
    secondaryCta: { label: "Abrir experiencia ERP", href: "/curso/administracion/erp" },
    spotlight: {
      title: "ERP Bazar Inteligente",
      body: "Taller digital del curso. Opera el mismo tipo de sistema que un bazar real: vender, stock y vencimientos, caja, proveedores y reportes contables.",
      image: "/images/especialidades/sector-administracion.png",
      href: "/curso/administracion/erp",
      cta: "Entrar al bazar de práctica",
      badge: "Experiencia ERP",
    },
    modules: [
      { numero: 1, title: "Utilización de información contable", blurb: "Lee ventas, IVA, margen e inventario valorizado del bazar.", oa: "OA 1", hoursAnnual: "152 h", hours3d: "46 h", hoursLabel: "152 h · 46 h 3D", href: "/curso/administracion/m1-contable", available: true },
      { numero: 2, title: "Gestión comercial y tributaria", blurb: "Registra proveedores, compras y el ciclo que alimenta el IVA.", oa: "OA 1", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: "/curso/administracion/m2-comercial", available: true },
      { numero: 3, title: "Proceso administrativo", blurb: "Programa el turno, sigue evidencias del ERP y reporta a jefatura.", oa: "OA 2, OA 3", hoursAnnual: "190 h", hours3d: "57 h", hoursLabel: "190 h · 57 h 3D", href: "/curso/administracion/m3-proceso", available: true },
      { numero: 4, title: "Atención de clientes", blurb: "Atiende el mesón y registra la venta en el punto de venta.", oa: "OA 4", hoursAnnual: "152 h", hours3d: "46 h", hoursLabel: "152 h · 46 h 3D", href: "/curso/administracion/m4-clientes", available: true },
      { numero: 5, title: "Organización de oficinas", blurb: "Ordena fichas, lotes y vencimientos para recuperar información a tiempo.", oa: "OA 5", hoursAnnual: "76 h", hours3d: "23 h", hoursLabel: "76 h · 23 h 3D", href: "/curso/administracion/m5-oficina", available: true },
      { numero: 6, title: "Aplicaciones informáticas para la gestión", blurb: "Opera el ERP completo como herramienta del turno.", oa: "OA 6", hoursAnnual: "76 h", hours3d: "23 h", hoursLabel: "76 h · 23 h 3D", href: "/curso/administracion/m6-aplicaciones", available: true },
    ],
    groups: [{ title: "3° medio · M1–M6 · plan común", nums: [1, 2, 3, 4, 5, 6] }],
    oa: [
      { codigo: "OA 1", descripcion: "Leer y utilizar información contable básica acerca de la marcha de la empresa, de acuerdo a las normas internacionales de contabilidad y a la legislación tributaria vigente." },
      { codigo: "OA 2", descripcion: "Elaborar un programa de actividades operativas de un departamento o área de una empresa, según orientaciones de jefatura y el plan estratégico de gestión." },
      { codigo: "OA 3", descripcion: "Hacer seguimiento y elaborar informes del desarrollo de un programa operativo, sobre la base de evidencias y técnicas apropiadas." },
      { codigo: "OA 4", descripcion: "Atender a clientes internos y externos de la empresa, de acuerdo a sus necesidades, con comunicación oral y escrita presencial o a distancia." },
      { codigo: "OA 5", descripcion: "Organizar y ordenar el lugar de trabajo para disponer y recuperar información u objetos de manera oportuna." },
      { codigo: "OA 6", descripcion: "Utilizar los equipos y herramientas tecnológicas de la gestión administrativa, con uso eficiente de energía, materiales e insumos." },
    ],
    footerNote: "Modelo Aula TP · Plan 3° MINEDUC · ERP Bazar Inteligente como taller de gestión",
    stats: { modules: 6, hoursAnnual: "836 h", hours3d: "252 h", status: "En curso" },
  },
  coming("contabilidad", "Contabilidad", "Administración", "3° y 4° medio", "Registra operaciones, controla documentos tributarios y apoya la información económica del establecimiento o empresa.", [
    ["Registro contable", "Clasifica comprobantes y asientos básicos.", "OA 1"],
    ["Documentos tributarios", "Revisa facturas, boletas y libros de apoyo.", "OA 2"],
    ["Control de tesorería", "Concilia ingresos, egresos y arqueos simples.", "OA 3"],
    ["Informes financieros", "Prepara reportes de apoyo a la toma de decisiones.", "OA 4"],
  ], [
    ["OA 1", "Registrar operaciones contables a partir de documentos de respaldo."],
    ["OA 2", "Controlar documentos tributarios y su consistencia."],
    ["OA 3", "Apoyar el control de caja y movimientos de tesorería."],
    ["OA 4", "Elaborar informes contables simples para la gestión."],
  ]),
  coming("gastronomia", "Gastronomía", "Alimentación", "3° y 4° medio", "Cocina, higiene de alimentos y servicio, con estaciones de mise en place, producción y servicio seguro.", [
    ["Higiene e inocuidad", "BPM, temperaturas y prevención de contaminación.", "OA 1"],
    ["Técnicas de cocina", "Mise en place, cortes y cocciones controladas.", "OA 2"],
    ["Producción de menú", "Planifica recetas, porciones y costos básicos.", "OA 3"],
    ["Servicio gastronómico", "Montaje, atención y calidad de servicio.", "OA 4"],
  ], [
    ["OA 1", "Aplicar normas de higiene e inocuidad en la manipulación de alimentos."],
    ["OA 2", "Ejecutar técnicas de preparación culinaria según receta y estándar."],
    ["OA 3", "Organizar la producción de un servicio o menú con control de insumos."],
    ["OA 4", "Atender el servicio gastronómico con calidad y presentación."],
  ]),
  coming("elaboracion-industrial-alimentos", "Elaboración Industrial de Alimentos", "Alimentación", "3° y 4° medio", "Líneas de proceso, inocuidad y control de calidad en planta de alimentos.", [
    ["Recepción de materia prima", "Inspecciona, registra y almacena según pauta.", "OA 1"],
    ["Operación de línea", "Sigue el flujograma y puntos de control.", "OA 2"],
    ["Control de calidad", "Toma muestras y registra no conformidades.", "OA 3"],
    ["Limpieza de planta", "Aplica POES y desinfección de equipos.", "OA 4"],
  ], [
    ["OA 1", "Recepcionar y almacenar materias primas con criterios de inocuidad."],
    ["OA 2", "Operar etapas de un proceso de elaboración según procedimiento."],
    ["OA 3", "Registrar controles de calidad y desviaciones del proceso."],
    ["OA 4", "Aplicar limpieza y sanitización de equipos y superficies."],
  ]),
  coming("agropecuaria", "Agropecuaria", "Agropecuario", "3° y 4° medio", "Producción vegetal y animal, recursos y prácticas sustentables en un predio formativo.", [
    ["Producción vegetal", "Prepara suelo, siembra y labores culturales.", "OA 1"],
    ["Producción animal", "Maneja alimentación, bienestar y registros.", "OA 2"],
    ["Recursos e insumos", "Dosifica agua, fertilizantes y EPP.", "OA 3"],
    ["Sustentabilidad predial", "Aplica prácticas de cuidado del recurso.", "OA 4"],
  ], [
    ["OA 1", "Ejecutar labores de producción vegetal según calendario y seguridad."],
    ["OA 2", "Aplicar manejo básico de especies animales con registro."],
    ["OA 3", "Utilizar insumos y recursos prediales de forma eficiente y segura."],
    ["OA 4", "Registrar evidencias de producción y prácticas sustentables."],
  ]),
  coming("vestuario-confeccion-textil", "Vestuario y Confección Textil", "Confección", "3° y 4° medio", "Patronaje, corte, costura y terminaciones con control de calidad de prenda.", [
    ["Interpretación de ficha", "Lee fichas técnicas y medidas.", "OA 1"],
    ["Corte y tendido", "Trazado, tendido y corte seguro.", "OA 2"],
    ["Ensamble de prenda", "Costuras, avíos y secuencia de montaje.", "OA 3"],
    ["Terminaciones y control", "Acabados, planchado y control de calidad.", "OA 4"],
  ], [
    ["OA 1", "Interpretar fichas técnicas y especificaciones de una prenda."],
    ["OA 2", "Ejecutar corte textil según trazo y desperdicio controlado."],
    ["OA 3", "Ensamblar prendas con máquinas y puntos de costura adecuados."],
    ["OA 4", "Aplicar terminaciones y control de calidad antes de la entrega."],
  ]),
  coming("construccion", "Construcción", "Construcción", "3° y 4° medio", "Obras, lectura de planos, seguridad en faena y ejecución de partidas constructivas.", [
    ["Lectura de planos", "Plantas, cortes y cubicación de partida.", "OA 1"],
    ["Seguridad en faena", "EPP, riesgos y señalización de obra.", "OA 2"],
    ["Ejecución de partidas", "Trazado, niveles y control de calidad.", "OA 3"],
    ["Registro de obra", "Libro de obra y evidencias de avance.", "OA 4"],
  ], [
    ["OA 1", "Leer planos y especificaciones de una partida de construcción."],
    ["OA 2", "Aplicar medidas de seguridad y prevención en faena."],
    ["OA 3", "Ejecutar partidas constructivas según procedimiento y tolerancia."],
    ["OA 4", "Registrar avances, materiales y no conformidades de obra."],
  ]),
  coming("instalaciones-sanitarias", "Instalaciones Sanitarias", "Construcción", "3° y 4° medio", "Agua potable y evacuación: planos, trazado, uniones y pruebas de hermeticidad.", [
    ["Planos sanitarios", "Simbología de agua y alcantarillado.", "OA 1"],
    ["Trazado y corte", "Trazado de redes y cubicación de tuberías.", "OA 2"],
    ["Uniones y pruebas", "Uniones, pendientes y prueba de hermeticidad.", "OA 3"],
    ["Puesta en servicio", "Limpieza, prueba y entrega de la red.", "OA 4"],
  ], [
    ["OA 1", "Interpretar planos de instalaciones de agua potable y evacuación."],
    ["OA 2", "Trazar y preparar redes sanitarias según proyecto."],
    ["OA 3", "Ejecutar uniones y pruebas de hermeticidad."],
    ["OA 4", "Entregar la instalación con registro de pruebas."],
  ]),
  coming("montaje-industrial", "Montaje Industrial", "Construcción", "3° y 4° medio", "Montaje de estructuras y equipos con planos, izaje, alineación y seguridad.", [
    ["Lectura de isométricos", "Planos de montaje y listas de materiales.", "OA 1"],
    ["Izaje y posicionamiento", "Eslingas, centros de gravedad y señales.", "OA 2"],
    ["Alineación y anclaje", "Niveles, pernos y tolerancias.", "OA 3"],
    ["Entrega de montaje", "Checklist, torque y registro.", "OA 4"],
  ], [
    ["OA 1", "Interpretar planos e isométricos de montaje industrial."],
    ["OA 2", "Aplicar procedimientos seguros de izaje y traslado."],
    ["OA 3", "Alinear, anclar y verificar tolerancias de equipos."],
    ["OA 4", "Documentar la entrega del montaje con evidencias."],
  ]),
  coming("electronica", "Electrónica", "Electricidad", "3° y 4° medio", "Circuitos, ensamble, medición y diagnóstico de fallas en sistemas electrónicos básicos.", [
    ["Circuitos y simbología", "Lee esquemas y lista de componentes.", "OA 1"],
    ["Ensamble y soldadura", "Montaje seguro de placas y cableado.", "OA 2"],
    ["Medición electrónica", "Usa instrumento y compara con especificación.", "OA 3"],
    ["Diagnóstico de fallas", "Localiza falla y propone reemplazo.", "OA 4"],
  ], [
    ["OA 1", "Interpretar esquemas y simbología de circuitos electrónicos."],
    ["OA 2", "Ensamblar circuitos con técnicas de soldadura y orden."],
    ["OA 3", "Medir magnitudes eléctricas y compararlas con valores esperados."],
    ["OA 4", "Diagnosticar fallas básicas y registrar el procedimiento."],
  ]),
  coming("dibujo-tecnico", "Dibujo Técnico", "Gráfico", "3° y 4° medio", "Representación gráfica, normas de acotado y comunicación visual de proyectos.", [
    ["Normas y vistas", "Vistas, cortes y convenciones.", "OA 1"],
    ["Acotado y escalas", "Acota con criterio de fabricación.", "OA 2"],
    ["CAD 2D", "Dibuja planos verificables en software.", "OA 3"],
    ["Lámina de proyecto", "Presenta un plano listo para taller.", "OA 4"],
  ], [
    ["OA 1", "Aplicar normas de representación en dibujo técnico."],
    ["OA 2", "Acotar y escalar planos para fabricación o montaje."],
    ["OA 3", "Elaborar planos en CAD con capas y simbología."],
    ["OA 4", "Presentar documentación gráfica coherente con el proyecto."],
  ]),
  coming("grafica", "Gráfica", "Gráfico", "3° y 4° medio", "Diseño y producción impresa/digital: originales, preprensa y control de color.", [
    ["Original digital", "Prepara archivos y resolución.", "OA 1"],
    ["Preprensa", "Imposición, sangrado y pruebas.", "OA 2"],
    ["Producción impresa", "Sigue flujo de impresión y control.", "OA 3"],
    ["Acabados", "Corte, plegado y control de calidad visual.", "OA 4"],
  ], [
    ["OA 1", "Preparar originales digitales según especificación de salida."],
    ["OA 2", "Aplicar criterios de preprensa y pruebas de color."],
    ["OA 3", "Apoyar la producción impresa o digital con control de proceso."],
    ["OA 4", "Verificar acabados y calidad del producto gráfico."],
  ]),
  coming("servicios-hoteleria", "Servicios de Hotelería", "Hotelería y Turismo", "3° y 4° medio", "Recepción, pisos y calidad de servicio en un hotel formativo.", [
    ["Recepción y reserva", "Check-in, ficha y comunicación al huésped.", "OA 1"],
    ["Pisos y habitación", "Estándar de limpieza y amenities.", "OA 2"],
    ["Servicio al huésped", "Requerimientos, quejas y seguimiento.", "OA 3"],
    ["Calidad hotelera", "Indicadores simples y evidencia de servicio.", "OA 4"],
  ], [
    ["OA 1", "Atender reservas y recepción con registro correcto."],
    ["OA 2", "Ejecutar procedimientos de pisos y habitación según estándar."],
    ["OA 3", "Resolver requerimientos del huésped con cortesía y registro."],
    ["OA 4", "Registrar evidencias de calidad de servicio."],
  ]),
  coming("servicios-turismo", "Servicios de Turismo", "Hotelería y Turismo", "3° y 4° medio", "Atención al visitante, diseño de experiencia e información territorial.", [
    ["Información turística", "Orienta con datos verificables del destino.", "OA 1"],
    ["Diseño de experiencia", "Arma un itinerario breve y seguro.", "OA 2"],
    ["Atención de visitantes", "Comunica, registra y da seguimiento.", "OA 3"],
    ["Evaluación del servicio", "Recoge satisfacción y mejoras.", "OA 4"],
  ], [
    ["OA 1", "Entregar información turística clara y actualizada."],
    ["OA 2", "Diseñar una experiencia o itinerario breve y seguro."],
    ["OA 3", "Atender visitantes con registro y protocolo."],
    ["OA 4", "Evaluar el servicio y proponer mejoras concretas."],
  ]),
  coming("forestal", "Forestal", "Maderero", "3° y 4° medio", "Silvicultura, operaciones de cosecha y seguridad en el recurso bosque.", [
    ["Reconocimiento del rodal", "Identifica especies y estado del bosque.", "OA 1"],
    ["Labores silvícolas", "Plantación, poda y protección.", "OA 2"],
    ["Operación segura", "EPP, señales y riesgos de faena.", "OA 3"],
    ["Registro predial", "Bitácora de labores y volumen.", "OA 4"],
  ], [
    ["OA 1", "Reconocer especies, estado del rodal y condiciones de trabajo."],
    ["OA 2", "Ejecutar labores silvícolas según pauta técnica."],
    ["OA 3", "Aplicar seguridad en faena forestal."],
    ["OA 4", "Registrar labores, insumos y evidencias de la jornada."],
  ]),
  coming("muebles-terminaciones-madera", "Muebles y Terminaciones en Madera", "Maderero", "3° y 4° medio", "Trazado, maquinado, ensamble y acabado de un mueble o terminación.", [
    ["Lectura de plano de mueble", "Medidas, uniones y lista de corte.", "OA 1"],
    ["Maquinado seguro", "Máquinas, EPP y secuencia de corte.", "OA 2"],
    ["Ensamble", "Encolado, prensas y escuadría.", "OA 3"],
    ["Acabado", "Lija, barniz y control de calidad.", "OA 4"],
  ], [
    ["OA 1", "Interpretar planos y listas de corte de un mueble."],
    ["OA 2", "Operar máquinas de madera con seguridad."],
    ["OA 3", "Ensamblar piezas según unión y escuadría."],
    ["OA 4", "Aplicar terminaciones y controlar la calidad de la pieza."],
  ]),
  coming("construcciones-metalicas", "Construcciones Metálicas", "Metalmecánica", "3° y 4° medio", "Trazado, corte, soldadura y montaje de estructuras metálicas.", [
    ["Planos de estructura", "Simbología, cortes y listas.", "OA 1"],
    ["Corte y preparación", "Corte, biselado y limpieza.", "OA 2"],
    ["Soldadura", "Proceso, EPP y control visual del cordón.", "OA 3"],
    ["Montaje y entrega", "Aplome, pernos y registro.", "OA 4"],
  ], [
    ["OA 1", "Leer planos de estructuras metálicas y listas de materiales."],
    ["OA 2", "Preparar piezas metálicas para unión."],
    ["OA 3", "Ejecutar uniones soldadas con criterio de seguridad y calidad visual."],
    ["OA 4", "Montar y entregar un conjunto con evidencias de control."],
  ]),
  coming("mecanica-industrial", "Mecánica Industrial", "Metalmecánica", "3° y 4° medio", "Mantenimiento de maquinaria: diagnóstico, ajuste y lubricación segura.", [
    ["Lectura de manuales", "Partes, tolerancias y lubricación.", "OA 1"],
    ["Diagnóstico mecánico", "Síntomas, ruidos y mediciones.", "OA 2"],
    ["Intervención", "Ajuste, reemplazo y bloqueo de energías.", "OA 3"],
    ["Puesta en marcha", "Prueba funcional y registro.", "OA 4"],
  ], [
    ["OA 1", "Interpretar manuales y planos de conjuntos mecánicos."],
    ["OA 2", "Diagnosticar fallas mecánicas con evidencia observable."],
    ["OA 3", "Intervenir con bloqueo, herramientas y recambio seguro."],
    ["OA 4", "Verificar funcionamiento y registrar la mantención."],
  ]),
  coming("mecanica-automotriz", "Mecánica Automotriz", "Metalmecánica", "3° y 4° medio", "Diagnóstico y mantención de sistemas del vehículo con pauta y seguridad.", [
    ["Sistemas del vehículo", "Identifica conjuntos y síntomas.", "OA 1"],
    ["Diagnóstico", "Usa pauta, instrumentos y códigos.", "OA 2"],
    ["Mantención", "Servicio preventivo y recambio.", "OA 3"],
    ["Entrega del vehículo", "Prueba, limpieza y registro al cliente.", "OA 4"],
  ], [
    ["OA 1", "Reconocer sistemas del vehículo y su función."],
    ["OA 2", "Diagnosticar fallas con pauta e instrumentos."],
    ["OA 3", "Ejecutar mantención preventiva o correctiva segura."],
    ["OA 4", "Entregar el vehículo con registro de la intervención."],
  ]),
  coming("mecanica-mantenimiento-aeronaves", "Mecánica de Mantenimiento de Aeronaves", "Metalmecánica", "3° y 4° medio", "Inspección, fichas técnicas y cultura de seguridad aeronáutica.", [
    ["Documentación aeronáutica", "Fichas, órdenes y trazabilidad.", "OA 1"],
    ["Inspección visual", "Hallazgos, límites y reporte.", "OA 2"],
    ["Procedimiento de taller", "Herramientas, torque y FOD.", "OA 3"],
    ["Registro de liberación", "Evidencia antes de cerrar la orden.", "OA 4"],
  ], [
    ["OA 1", "Usar documentación técnica aeronáutica con trazabilidad."],
    ["OA 2", "Inspeccionar según pauta y reportar hallazgos."],
    ["OA 3", "Aplicar procedimientos de taller con control de herramientas."],
    ["OA 4", "Registrar la liberación del trabajo con evidencias."],
  ]),
  coming("asistencia-geologia", "Asistencia en Geología", "Minero", "3° y 4° medio", "Muestreo, registro de terreno y apoyo a campañas geológicas.", [
    ["Terreno y seguridad", "EPP, riesgos y desplazamiento.", "OA 1"],
    ["Muestreo", "Toma, etiquetado y cadena de custodia.", "OA 2"],
    ["Registro geológico", "Fichas, fotos y coordenadas.", "OA 3"],
    ["Laboratorio básico", "Preparación de muestras y reporte.", "OA 4"],
  ], [
    ["OA 1", "Trabajar en terreno con medidas de seguridad."],
    ["OA 2", "Tomar y etiquetar muestras con cadena de custodia."],
    ["OA 3", "Registrar observaciones geológicas de forma trazable."],
    ["OA 4", "Preparar reportes y muestras para análisis."],
  ]),
  coming("explotacion-minera", "Explotación Minera", "Minero", "3° y 4° medio", "Ciclo de mina, seguridad y operación de equipos en un escenario formativo.", [
    ["Ciclo de mina", "Perforación, carguío y transporte.", "OA 1"],
    ["Seguridad minera", "Riesgos críticos y bloqueo.", "OA 2"],
    ["Operación de equipo", "Chequeo preuso y secuencia.", "OA 3"],
    ["Registro de turno", "Producción, detenciones e incidentes.", "OA 4"],
  ], [
    ["OA 1", "Reconocer las etapas del ciclo de explotación."],
    ["OA 2", "Aplicar normas de seguridad minera en la tarea."],
    ["OA 3", "Ejecutar una operación simulada con chequeo preuso."],
    ["OA 4", "Registrar el turno con datos de producción y seguridad."],
  ]),
  coming("metalurgia-extractiva", "Metalurgia Extractiva", "Minero", "3° y 4° medio", "Chancado, molienda, flotación y control de proceso en planta piloto.", [
    ["Circuito de planta", "Flujograma y equipos principales.", "OA 1"],
    ["Operación de equipos", "Parámetros, EPP y bloqueos.", "OA 2"],
    ["Control de proceso", "Muestras, leyes y desviaciones.", "OA 3"],
    ["Seguridad e higiene", "Polvo, reactivos y emergencias.", "OA 4"],
  ], [
    ["OA 1", "Identificar equipos y flujo de un proceso extractivo."],
    ["OA 2", "Operar parámetros básicos con seguridad."],
    ["OA 3", "Registrar controles de proceso y desviaciones."],
    ["OA 4", "Aplicar medidas de higiene industrial en planta."],
  ]),
  coming("acuicultura", "Acuicultura", "Marítimo", "3° y 4° medio", "Cultivo, calidad de agua y bioseguridad en un centro formativo.", [
    ["Calidad de agua", "Parámetros, muestreo y registro.", "OA 1"],
    ["Manejo de cultivo", "Densidad, alimentación y mortalidad.", "OA 2"],
    ["Bioseguridad", "Barreras, desinfección y tránsito.", "OA 3"],
    ["Cosecha y registro", "Procedimiento y evidencias de lote.", "OA 4"],
  ], [
    ["OA 1", "Medir y registrar parámetros de calidad de agua."],
    ["OA 2", "Ejecutar labores de manejo de cultivo."],
    ["OA 3", "Aplicar bioseguridad en el centro."],
    ["OA 4", "Registrar cosecha y trazabilidad del lote."],
  ]),
  coming("operaciones-portuarias", "Operaciones Portuarias", "Marítimo", "3° y 4° medio", "Transferencia de carga, señalización y seguridad en recinto portuario.", [
    ["Flujo portuario", "Nave, muelle y patio.", "OA 1"],
    ["Señales y EPP", "Comunicación en faena y riesgos.", "OA 2"],
    ["Movimiento de carga", "Estiba, trincado y checklist.", "OA 3"],
    ["Registro de turno", "Novedades, daños e incidentes.", "OA 4"],
  ], [
    ["OA 1", "Reconocer el flujo de una operación portuaria."],
    ["OA 2", "Aplicar señales, EPP y comunicación en faena."],
    ["OA 3", "Apoyar el movimiento de carga con checklist."],
    ["OA 4", "Registrar el turno y novedades de la operación."],
  ]),
  coming("pesqueria", "Pesquería", "Marítimo", "3° y 4° medio", "Faena pesquera, conservación de la captura y seguridad a bordo.", [
    ["Arte de pesca", "Reconoce aparejos y su uso.", "OA 1"],
    ["Faena segura", "Cubierta, EPP y emergencias.", "OA 2"],
    ["Manejo de captura", "Clasifica, conserva y registra.", "OA 3"],
    ["Descarga", "Trazabilidad y entrega en puerto.", "OA 4"],
  ], [
    ["OA 1", "Identificar artes de pesca y su aplicación."],
    ["OA 2", "Trabajar en cubierta con medidas de seguridad."],
    ["OA 3", "Manejar la captura con higiene y conservación."],
    ["OA 4", "Registrar descarga y trazabilidad."],
  ]),
  coming("tripulacion-naves-mercantes", "Tripulación de Naves Mercantes y Especiales", "Marítimo", "3° y 4° medio", "Guardia, faenas de cubierta y procedimientos de emergencia a bordo.", [
    ["Guardia y órdenes", "Comunicación, bitácora y roles.", "OA 1"],
    ["Faena de cubierta", "Cabos, amarre y EPP.", "OA 2"],
    ["Emergencias", "Abandono, incendio y primeros auxilios.", "OA 3"],
    ["Registro de navegación", "Novedades de guardia.", "OA 4"],
  ], [
    ["OA 1", "Cumplir roles de guardia y comunicación a bordo."],
    ["OA 2", "Ejecutar faenas de cubierta con seguridad."],
    ["OA 3", "Aplicar procedimientos básicos de emergencia."],
    ["OA 4", "Registrar novedades de la guardia."],
  ]),
  coming("quimica-industrial", "Química Industrial", "Química e Industria", "3° y 4° medio", "Procesos, muestreo, control de calidad y seguridad de planta química.", [
    ["Flujograma de proceso", "Equipos, corrientes y riesgos.", "OA 1"],
    ["Muestreo y laboratorio", "Toma de muestra y análisis básico.", "OA 2"],
    ["Control de calidad", "Especificaciones y no conformidades.", "OA 3"],
    ["Seguridad de planta", "Hojas de seguridad, derrames y EPP.", "OA 4"],
  ], [
    ["OA 1", "Interpretar el flujograma de un proceso químico industrial."],
    ["OA 2", "Tomar muestras y realizar controles de laboratorio básicos."],
    ["OA 3", "Comparar resultados con especificaciones de calidad."],
    ["OA 4", "Aplicar seguridad química y manejo de emergencias simples."],
  ]),
  coming("atencion-parvulos", "Atención de Párvulos", "Salud y Educación", "3° y 4° medio", "Cuidado y educación inicial: bienestar, juego y registro en aula.", [
    ["Bienestar y cuidado", "Rutinas, higiene y trato respetuoso.", "OA 1"],
    ["Ambientes de aprendizaje", "Juego, materiales y seguridad.", "OA 2"],
    ["Comunicación con familias", "Registros y recados claros.", "OA 3"],
    ["Planificación de experiencia", "Propósito, evidencia y cierre.", "OA 4"],
  ], [
    ["OA 1", "Aplicar rutinas de cuidado y bienestar con respeto."],
    ["OA 2", "Organizar ambientes y experiencias de aprendizaje seguras."],
    ["OA 3", "Comunicar información relevante a familias y equipo."],
    ["OA 4", "Registrar evidencias de una experiencia educativa."],
  ]),
  coming("conectividad-redes", "Conectividad y Redes", "Tecnología y Comunicaciones", "3° y 4° medio", "Cableado, direccionamiento, verificación de enlace y documentación de red.", [
    ["Medios y conectores", "UTP, certificación visual y orden.", "OA 1"],
    ["Direccionamiento", "IP, máscara y prueba de enlace.", "OA 2"],
    ["Servicios de red", "DHCP, DNS y verificación básica.", "OA 3"],
    ["Documentación", "Plano lógico, etiquetado y bitácora.", "OA 4"],
  ], [
    ["OA 1", "Instalar y ordenar medios físicos de red."],
    ["OA 2", "Configurar direccionamiento básico y probar conectividad."],
    ["OA 3", "Verificar servicios esenciales de una LAN."],
    ["OA 4", "Documentar la red con etiquetas y evidencias."],
  ]),
  coming("programacion", "Programación", "Tecnología y Comunicaciones", "3° y 4° medio", "Lógica, desarrollo de un caso y pruebas: misma ruta de estaciones AE.", [
    ["Lógica y algoritmos", "Pseudocódigo y casos de prueba.", "OA 1"],
    ["Desarrollo de solución", "Implementa un caso acotado.", "OA 2"],
    ["Pruebas y depuración", "Reproduce el error y lo corrige.", "OA 3"],
    ["Entrega documentada", "README, evidencias y demo.", "OA 4"],
  ], [
    ["OA 1", "Diseñar un algoritmo para un problema acotado."],
    ["OA 2", "Implementar una solución funcional con criterio de calidad básica."],
    ["OA 3", "Probar, depurar y registrar correcciones."],
    ["OA 4", "Entregar el software con documentación mínima."],
  ]),
  coming("telecomunicaciones", "Telecomunicaciones", "Tecnología y Comunicaciones", "3° y 4° medio", "Enlaces, medición y puesta en servicio de un sistema de telecomunicaciones.", [
    ["Medios de transmisión", "Cobre, FO y radio en esquema simple.", "OA 1"],
    ["Instalación de enlace", "Conectores, orden y EPP.", "OA 2"],
    ["Medición", "Compara lecturas con especificación.", "OA 3"],
    ["Puesta en servicio", "Prueba de enlace y acta.", "OA 4"],
  ], [
    ["OA 1", "Reconocer medios y elementos de un enlace de telecomunicaciones."],
    ["OA 2", "Instalar un enlace simple según pauta."],
    ["OA 3", "Medir y comparar parámetros con la especificación."],
    ["OA 4", "Poner en servicio y registrar el acta del enlace."],
  ]),
];

const ALIASES: Record<string, string> = {
  "refrigeracion-climatizacion": "climatizacion",
  "electricidad-3m": "electricidad",
  "enfermeria-tens": "enfermeria",
};

export function resolveCourseSlug(slug: string): string {
  return ALIASES[slug] || slug;
}

export function getCourseHub(slug: string): CourseHubConfig | undefined {
  const resolved = resolveCourseSlug(slug);
  return COURSE_HUBS.find((hub) => hub.slug === resolved);
}

export function listCourseHubSlugs(): string[] {
  return [...COURSE_HUBS.map((hub) => hub.slug), ...Object.keys(ALIASES)];
}
