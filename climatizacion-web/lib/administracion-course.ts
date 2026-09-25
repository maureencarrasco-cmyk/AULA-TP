export const ERP_BASE = "/erp_bazar_inteligente/";

export type AdminFase =
  | "contextualizacion"
  | "estacion_ae"
  | "situacion_integradora"
  | "evaluacion_final"
  | "retroalimentacion";

export type AdminQuiz = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export type AdminStation = {
  id: string;
  fase: AdminFase;
  titulo: string;
  hint: string;
  minutes: number;
  body: string[];
  bullets?: string[];
  erp?: {
    vista: string;
    mission: string;
    checklist: string[];
  };
  quiz?: AdminQuiz[];
};

export type AdminModule = {
  numero: number;
  slug: string;
  title: string;
  oa: string;
  blurb: string;
  hoursAnnual: string;
  hours3d: string;
  hoursLabel: string;
  erpVista: string;
  erpLabel: string;
  stations: AdminStation[];
};

export function erpUrl(vista: string) {
  const params = new URLSearchParams({ aula: "1", vista });
  return `${ERP_BASE}?${params.toString()}`;
}

const FASE_HINT: Record<AdminFase, string> = {
  contextualizacion: "Comprender la situación",
  estacion_ae: "Analiza, comprende y aplica",
  situacion_integradora: "Práctica en el ERP",
  evaluacion_final: "Demuestra lo aprendido",
  retroalimentacion: "Reflexiona y mejora",
};

function st(
  id: string,
  fase: AdminFase,
  titulo: string,
  minutes: number,
  body: string[],
  extra: Partial<AdminStation> = {},
): AdminStation {
  return { id, fase, titulo, hint: FASE_HINT[fase], minutes, body, ...extra };
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    numero: 1,
    slug: "m1-contable",
    title: "Utilización de información contable",
    oa: "OA 1",
    blurb: "Lee ventas, IVA, margen e inventario valorizado del bazar para evaluar la marcha del negocio.",
    hoursAnnual: "152 h",
    hours3d: "46 h",
    hoursLabel: "152 h · 46 h 3D",
    erpVista: "accounting",
    erpLabel: "Contabilidad",
    stations: [
      st("m1-ctx", "contextualizacion", "El bazar necesita números claros", 15, [
        "Trabajas en Bazar Aula TP, un almacén de barrio que ya vende, compra y registra caja en el ERP Bazar Inteligente.",
        "La jefatura te pide un panorama de la marcha del negocio: ingresos, IVA y valor del inventario, sin inventar planillas sueltas.",
        "En Administración TP, la información contable se lee en el sistema que usa la empresa. Aquí ese sistema es el ERP.",
      ]),
      st(
        "m1-ae",
        "estacion_ae",
        "Qué debes saber leer",
        25,
        [
          "OA 1: leer y utilizar información contable básica de la empresa, alineada a la legislación tributaria vigente.",
        ],
        {
          bullets: [
            "Diferenciar venta bruta, neto e IVA.",
            "Relacionar inventario valorizado a costo con la caja del día.",
            "Usar un informe del ERP en lugar de copiar datos a mano.",
          ],
        },
      ),
      st(
        "m1-erp",
        "situacion_integradora",
        "Misión ERP · Informe de marcha",
        40,
        [
          "Entra al módulo Contabilidad del ERP. Recorre los indicadores del bazar y anota tres cifras que explicarías a tu jefatura.",
        ],
        {
          erp: {
            vista: "accounting",
            mission: "Abrir Contabilidad y leer el tablero del bazar.",
            checklist: [
              "Localiza ventas, IVA y margen o inventario valorizado.",
              "Anota una cifra de ingreso y una de stock.",
              "Explica en una frase qué le dirías a la jefatura.",
            ],
          },
        },
      ),
      st(
        "m1-eval",
        "evaluacion_final",
        "Comprueba la lectura contable",
        15,
        ["Responde con criterio de informe a jefatura, no de memoria suelta."],
        {
          quiz: [
            {
              q: "Si el ERP muestra venta con IVA incluido, el IVA no es utilidad del bazar. ¿Qué debes reportar aparte?",
              options: [
                "Solo el total cobrado en caja",
                "El impuesto recargado, separado del neto",
                "Únicamente el número de boletas",
              ],
              answer: 1,
              why: "La marcha del negocio exige separar neto e IVA para no confundir impuesto con ganancia.",
            },
            {
              q: "¿Para qué sirve ver el inventario valorizado a costo en Contabilidad?",
              options: [
                "Para saber cuánto capital hay inmovilizado en mercadería",
                "Para cambiar el precio de venta al azar",
                "Para cerrar la caja sin arqueo",
              ],
              answer: 0,
              why: "El stock valorizado es información contable de activo: mercadería que aún no se vende.",
            },
          ],
        },
      ),
      st("m1-cierre", "retroalimentacion", "Cierre del módulo", 10, [
        "La evidencia de este módulo no es una planilla paralela: es saber leer el ERP y comunicar la marcha del bazar.",
        "Siguiente paso: gestión comercial y tributaria, donde esas cifras se originan en compras y ventas reales.",
      ]),
    ],
  },
  {
    numero: 2,
    slug: "m2-comercial",
    title: "Gestión comercial y tributaria",
    oa: "OA 1",
    blurb: "Registra compras, proveedores y ventas con respaldo, y observa el efecto en IVA y documentos.",
    hoursAnnual: "190 h",
    hours3d: "57 h",
    hoursLabel: "190 h · 57 h 3D",
    erpVista: "suppliers",
    erpLabel: "Proveedores",
    stations: [
      st("m2-ctx", "contextualizacion", "El ciclo compra–venta del bazar", 15, [
        "Un bazar no solo vende: compra a proveedores, recibe mercadería y debe dejar rastro tributario de cada operación.",
        "Hoy el dueño te pide ordenar la agenda de proveedores y entender cómo una compra alimenta el inventario y el IVA.",
      ]),
      st(
        "m2-ae",
        "estacion_ae",
        "Documentos y obligaciones",
        25,
        ["Las transacciones comerciales se respaldan. En el ERP, proveedores y compras son el archivo vivo del ciclo."],
        {
          bullets: [
            "Identificar proveedor, documento y mercadería recibida.",
            "Relacionar compra con stock y con el IVA crédito.",
            "No vender lo que no está ingresado al sistema.",
          ],
        },
      ),
      st(
        "m2-erp",
        "situacion_integradora",
        "Misión ERP · Proveedores y compras",
        45,
        ["Abre Proveedores, revisa la agenda y sigue una compra o documento pendiente. Luego mira Vender para ver el otro lado del ciclo."],
        {
          erp: {
            vista: "suppliers",
            mission: "Ordenar el ciclo comercial del bazar en Proveedores.",
            checklist: [
              "Revisa al menos un proveedor y su estado.",
              "Identifica una compra o documento pendiente.",
              "Explica cómo esa compra debería aparecer después en inventario.",
            ],
          },
        },
      ),
      st(
        "m2-eval",
        "evaluacion_final",
        "Comprueba el ciclo comercial",
        15,
        ["Elige la práctica que deja rastro tributario correcto."],
        {
          quiz: [
            {
              q: "Una caja de arroz llega al bazar. ¿Cuál es el orden correcto en el ERP?",
              options: [
                "Vender primero y anotar el proveedor después",
                "Registrar proveedor/compra e ingresar stock, luego vender",
                "Solo cambiar el precio en la góndola",
              ],
              answer: 1,
              why: "Sin ingreso de compra el inventario y el IVA crédito quedan incompletos.",
            },
            {
              q: "¿Qué queda mal si vendes con IVA y nunca registras compras?",
              options: [
                "Nada: la caja cuadra igual",
                "El crédito fiscal y el costo de la mercadería no coinciden con la realidad",
                "Solo el nombre del producto",
              ],
              answer: 1,
              why: "La gestión tributaria necesita ambos lados del ciclo: débito por ventas y crédito por compras.",
            },
          ],
        },
      ),
      st("m2-cierre", "retroalimentacion", "Cierre del módulo", 10, [
        "El ERP guarda el ciclo comercial. Tu rol es no saltarte el respaldo.",
        "Siguiente: proceso administrativo, para programar y hacer seguimiento de estas tareas.",
      ]),
    ],
  },
  {
    numero: 3,
    slug: "m3-proceso",
    title: "Proceso administrativo",
    oa: "OA 2, OA 3",
    blurb: "Programa el turno del bazar, hace seguimiento con evidencias del ERP y reporta avances a jefatura.",
    hoursAnnual: "190 h",
    hours3d: "57 h",
    hoursLabel: "190 h · 57 h 3D",
    erpVista: "statistics",
    erpLabel: "Estadísticas",
    stations: [
      st("m3-ctx", "contextualizacion", "Hay que planificar el turno", 15, [
        "La jefatura define un objetivo de la semana: reducir quiebres de stock y reportar ventas por categoría.",
        "OA 2 y OA 3 piden programa de actividades, seguimiento con evidencias y reporte. El ERP entrega esas evidencias.",
      ]),
      st(
        "m3-ae",
        "estacion_ae",
        "Planificar, seguir y reportar",
        25,
        ["Un programa operativo no es una lista mental: tiene tareas, responsables, plazos y cómo se va a verificar."],
        {
          bullets: [
            "Redactar 3 tareas del turno (abrir caja, reponer, reportar).",
            "Elegir un indicador del ERP como evidencia.",
            "Preparar un reporte corto a jefatura.",
          ],
        },
      ),
      st(
        "m3-erp",
        "situacion_integradora",
        "Misión ERP · Tablero de seguimiento",
        40,
        ["Usa Estadísticas (y si hace falta Inicio) para armar evidencias del programa de la semana."],
        {
          erp: {
            vista: "statistics",
            mission: "Sacar evidencias del tablero para un reporte de avance.",
            checklist: [
              "Identifica un gráfico o ranking de productos/categorías.",
              "Relaciónalo con una tarea de tu programa (venta o reposición).",
              "Escribe dos líneas de reporte: avance y pendiente.",
            ],
          },
        },
      ),
      st(
        "m3-eval",
        "evaluacion_final",
        "Comprueba el proceso",
        15,
        ["Piensa como quien reporta a jefatura."],
        {
          quiz: [
            {
              q: "¿Cuál es una evidencia válida de seguimiento en este curso?",
              options: [
                "Un recorte de pantalla o cifra del ERP con fecha",
                "Decir “creo que se vendió bien”",
                "Borrar el historial para partir de cero",
              ],
              answer: 0,
              why: "OA 3 pide evidencias. El ERP fecha y cuantifica; la percepción no basta.",
            },
            {
              q: "Un programa operativo debe incluir…",
              options: [
                "Solo el logo del bazar",
                "Tareas, plazos, recursos y cómo se verificará el avance",
                "Únicamente el precio de oferta del día",
              ],
              answer: 1,
              why: "OA 2 pide programar actividades con recursos, tiempo y proyección de resultados.",
            },
          ],
        },
      ),
      st("m3-cierre", "retroalimentacion", "Cierre del módulo", 10, [
        "Ya tienes el hábito: plan → evidencia en ERP → reporte.",
        "Siguiente: atención de clientes, el momento en que el plan se encuentra con el público.",
      ]),
    ],
  },
  {
    numero: 4,
    slug: "m4-clientes",
    title: "Atención de clientes",
    oa: "OA 4",
    blurb: "Atiende al público del bazar con comunicación clara y registra la venta en el punto de venta del ERP.",
    hoursAnnual: "152 h",
    hours3d: "46 h",
    hoursLabel: "152 h · 46 h 3D",
    erpVista: "sales",
    erpLabel: "Vender",
    stations: [
      st("m4-ctx", "contextualizacion", "Llega un cliente al mesón", 15, [
        "Doña Marta pregunta por arroz, si hay oferta y si puede pagar de inmediato. Tú estás en el mesón con el ERP abierto en Vender.",
        "OA 4: atender clientes internos y externos con comunicación oral/escrita y el medio que corresponda. Aquí el medio operativo es el POS.",
      ]),
      st(
        "m4-ae",
        "estacion_ae",
        "Atender y registrar",
        20,
        ["Una buena atención no termina en la sonrisa: termina cuando la venta queda registrada y el cliente entiende el total."],
        {
          bullets: [
            "Saludar, escuchar el pedido y confirmar productos.",
            "Cargar el carro en el ERP y decir el total con IVA.",
            "No discutir el precio “de memoria” si el sistema ya lo tiene.",
          ],
        },
      ),
      st(
        "m4-erp",
        "situacion_integradora",
        "Misión ERP · Venta en el mesón",
        40,
        ["Abre Vender y simula la atención a Doña Marta: busca productos, arma el carro y deja la venta lista."],
        {
          erp: {
            vista: "sales",
            mission: "Registrar una venta de mostrador con total claro para la clienta.",
            checklist: [
              "Busca al menos dos productos en el carro.",
              "Verifica que el total se vea antes de cobrar.",
              "Describe cómo explicarías el total (con IVA) a la clienta.",
            ],
          },
        },
      ),
      st(
        "m4-eval",
        "evaluacion_final",
        "Comprueba la atención",
        15,
        ["Elige la conducta profesional en el mesón."],
        {
          quiz: [
            {
              q: "El cliente duda del precio. ¿Qué haces?",
              options: [
                "Inventas un descuento para no perder la venta",
                "Muestras el total del ERP y explicas que incluye IVA",
                "Cierras la pantalla para que no vea números",
              ],
              answer: 1,
              why: "La atención transparente usa la herramienta tecnológica y comunica el cobro.",
            },
            {
              q: "¿Por qué registrar la venta en el momento?",
              options: [
                "Para que caja, stock y contabilidad hablen el mismo idioma",
                "Solo para ocupar el computador",
                "No hace falta si cobraste en efectivo",
              ],
              answer: 0,
              why: "Sin registro, el resto del proceso administrativo queda ciego.",
            },
          ],
        },
      ),
      st("m4-cierre", "retroalimentacion", "Cierre del módulo", 10, [
        "Atender es comunicar y dejar rastro. El ERP es tu mostrador digital.",
        "Siguiente: organización de oficinas e inventario, para que ese mostrador tenga ficha y stock ordenados.",
      ]),
    ],
  },
  {
    numero: 5,
    slug: "m5-oficina",
    title: "Organización de oficinas",
    oa: "OA 5",
    blurb: "Ordena fichas de productos, lotes y vencimientos para recuperar información a tiempo.",
    hoursAnnual: "76 h",
    hours3d: "23 h",
    hoursLabel: "76 h · 23 h 3D",
    erpVista: "inventory",
    erpLabel: "Inventario",
    stations: [
      st("m5-ctx", "contextualizacion", "La oficina del bazar es el inventario", 12, [
        "OA 5 pide organizar el lugar de trabajo para disponer y recuperar información u objetos a tiempo.",
        "En un bazar digital, “el archivador” son las fichas de producto, los lotes y el semáforo de vencimientos.",
      ]),
      st(
        "m5-ae",
        "estacion_ae",
        "Ficha, lote y vencimiento",
        20,
        ["Si la ficha está incompleta, el mesón vende a ciegas y la bodega no sabe qué reponer."],
        {
          bullets: [
            "Nombre, código, precio y stock mínimo.",
            "Lotes con fecha para aplicar FEFO.",
            "Revisar productos por vencer antes de abrir al público.",
          ],
        },
      ),
      st(
        "m5-erp",
        "situacion_integradora",
        "Misión ERP · Archivo de mercadería",
        40,
        ["En Inventario revisa fichas y lotes. Luego entra a Productos por vencer si necesitas el semáforo FEFO."],
        {
          erp: {
            vista: "inventory",
            mission: "Dejar el archivo de productos recuperable y al día.",
            checklist: [
              "Abre una ficha y verifica código, precio y stock.",
              "Identifica si hay lotes o fechas de vencimiento.",
              "Decide un producto que convendría vender primero y por qué.",
            ],
          },
        },
      ),
      st(
        "m5-eval",
        "evaluacion_final",
        "Comprueba el orden",
        12,
        ["Organizar es poder encontrar."],
        {
          quiz: [
            {
              q: "FEFO significa vender primero lo que…",
              options: ["Tiene el precio más alto", "Vence antes", "Llegó último a la góndola"],
              answer: 1,
              why: "First Expired, First Out evita merma y usa la información de lotes.",
            },
            {
              q: "Una ficha sin código de barras o código interno…",
              options: [
                "Dificulta buscar y vender en el mesón",
                "Mejora la atención",
                "No tiene efecto en el ERP",
              ],
              answer: 0,
              why: "Sin identificador, la información no se recupera a tiempo (OA 5).",
            },
          ],
        },
      ),
      st("m5-cierre", "retroalimentacion", "Cierre del módulo", 8, [
        "Dejaste el “archivo” del bazar en el ERP: fichas y vencimientos.",
        "Cierre de 3°: aplicaciones informáticas, usando el ERP como herramienta completa de gestión.",
      ]),
    ],
  },
  {
    numero: 6,
    slug: "m6-aplicaciones",
    title: "Aplicaciones informáticas para la gestión",
    oa: "OA 6",
    blurb: "Opera el ERP Bazar Inteligente como herramienta diaria: inicio, caja, ventas, stock y reportes.",
    hoursAnnual: "76 h",
    hours3d: "23 h",
    hoursLabel: "76 h · 23 h 3D",
    erpVista: "dashboard",
    erpLabel: "Inicio",
    stations: [
      st("m6-ctx", "contextualizacion", "El ERP es el puesto de trabajo", 12, [
        "OA 6: utilizar equipos y herramientas tecnológicas de la gestión administrativa, con uso eficiente de recursos.",
        "En Aula TP esa herramienta es el ERP Bazar Inteligente: un solo sistema para el turno completo.",
      ]),
      st(
        "m6-ae",
        "estacion_ae",
        "Mapa de la herramienta",
        20,
        ["Antes de “hacer clic por hacer”, recorre el mapa del sistema y elige la pantalla correcta para cada tarea."],
        {
          bullets: [
            "Inicio: panorama del negocio.",
            "Vender y Caja: frente al cliente y arqueo.",
            "Inventario y Proveedores: bodega y compras.",
            "Contabilidad y Estadísticas: reporte a jefatura.",
          ],
        },
      ),
      st(
        "m6-erp",
        "situacion_integradora",
        "Misión ERP · Turno completo",
        50,
        [
          "Simula un turno: mira Inicio, abre o revisa Caja, atiende una venta, controla un producto y cierra con un dato de Contabilidad o Estadísticas.",
        ],
        {
          erp: {
            vista: "dashboard",
            mission: "Recorrer el ERP como herramienta de un turno real.",
            checklist: [
              "Parte en Inicio y ubica el menú de módulos.",
              "Entra a Caja del día y describe abrir o cerrar caja.",
              "Completa una acción en Vender o Inventario.",
              "Cierra el turno con una cifra de Contabilidad o Estadísticas.",
            ],
          },
        },
      ),
      st(
        "m6-eval",
        "evaluacion_final",
        "Comprueba el uso de la herramienta",
        12,
        ["Elige el módulo correcto."],
        {
          quiz: [
            {
              q: "Te piden el arqueo del turno. ¿Dónde vas?",
              options: ["Productos por vencer", "Caja del día", "Auditoría SaaS"],
              answer: 1,
              why: "Caja del día concentra apertura, movimientos y cierre.",
            },
            {
              q: "Usar el ERP con eficiencia significa…",
              options: [
                "Duplicar la misma venta en un cuaderno y en el sistema",
                "Registrar una sola vez y reutilizar la información en todo el giro",
                "Apagar el computador para atender más rápido",
              ],
              answer: 1,
              why: "OA 6 apunta a un uso eficiente de la herramienta: un dato, varios procesos.",
            },
          ],
        },
      ),
      st("m6-cierre", "retroalimentacion", "Cierre de la ruta 3°", 10, [
        "Completaste el plan común de Administración con un bazar realista: el ERP es tu taller.",
        "Puedes repetir misiones en Práctica ERP libre o revisar módulos anteriores.",
      ]),
    ],
  },
];

export const ADMIN_OA = [
  {
    codigo: "OA 1",
    descripcion:
      "Leer y utilizar información contable básica acerca de la marcha de la empresa, de acuerdo a las normas internacionales de contabilidad y a la legislación tributaria vigente.",
  },
  {
    codigo: "OA 2",
    descripcion:
      "Elaborar un programa de actividades operativas de un departamento o área de una empresa, según orientaciones de jefatura y el plan estratégico de gestión.",
  },
  {
    codigo: "OA 3",
    descripcion:
      "Hacer seguimiento y elaborar informes del desarrollo de un programa operativo, sobre la base de evidencias y técnicas apropiadas.",
  },
  {
    codigo: "OA 4",
    descripcion:
      "Atender a clientes internos y externos de la empresa, de acuerdo a sus necesidades, con comunicación oral y escrita presencial o a distancia.",
  },
  {
    codigo: "OA 5",
    descripcion:
      "Organizar y ordenar el lugar de trabajo para disponer y recuperar información u objetos de manera oportuna.",
  },
  {
    codigo: "OA 6",
    descripcion:
      "Utilizar los equipos y herramientas tecnológicas de la gestión administrativa, con uso eficiente de energía, materiales e insumos.",
  },
];

export function getAdminModule(slug: string) {
  return ADMIN_MODULES.find((m) => m.slug === slug);
}

export function adminModuleHref(slug: string) {
  return `/curso/administracion/${slug}`;
}
