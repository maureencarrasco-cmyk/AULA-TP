/**
 * Desafíos cortos de Práctica Libre (formativo, sin nota).
 * Un set por módulo; fases: explorar / desafiar / investigar / transferir.
 */

export type PlFaseId = "explorar" | "desafiar" | "investigar" | "transferir";

export type PlDesafioOpcion = {
  id: string;
  label: string;
  correcta: boolean;
};

export type PlDesafio = {
  faseId: PlFaseId;
  titulo: string;
  prompt: string;
  /** Mini-check 2–3 opciones; si omitido, solo botón “completar desafío”. */
  opciones?: PlDesafioOpcion[];
};

const GENERIC: PlDesafio[] = [
  {
    faseId: "explorar",
    titulo: "Explorar el escenario",
    prompt: "Identifica un riesgo visible antes de intervenir el equipo.",
    opciones: [
      { id: "a", label: "Observar EPP, zona y señales antes de tocar", correcta: true },
      { id: "b", label: "Abrir el circuito de inmediato para «ver qué pasa»", correcta: false },
    ],
  },
  {
    faseId: "desafiar",
    titulo: "Desafío técnico",
    prompt: "Elige la acción más segura y trazable al procedimiento.",
    opciones: [
      { id: "a", label: "Seguir checklist / manual y registrar", correcta: true },
      { id: "b", label: "Improvisar sin registro «para ganar tiempo»", correcta: false },
      { id: "c", label: "Omitir mediciones si «se ve bien»", correcta: false },
    ],
  },
  {
    faseId: "investigar",
    titulo: "Investigar evidencia",
    prompt: "¿Qué evidencia mínima te permite justificar una decisión?",
    opciones: [
      { id: "a", label: "Medición o inspección contrastada con especificación", correcta: true },
      { id: "b", label: "Solo intuición sin instrumento ni manual", correcta: false },
    ],
  },
  {
    faseId: "transferir",
    titulo: "Transferir a otro contexto",
    prompt: "Completa el desafío aplicando el mismo criterio de seguridad en otro equipo o sitio.",
  },
];

/** Prompts HVAC por módulo (sobrescriben prompt/título del genérico). */
const BY_MODULO: Record<number, Partial<Record<PlFaseId, { titulo?: string; prompt: string; opciones?: PlDesafioOpcion[] }>>> = {
  1: {
    explorar: { prompt: "En un plano de redes, ¿qué revisas primero antes de marcar interferencias?" },
    desafiar: {
      prompt: "Hay una leyenda incompleta en el plano. ¿Qué haces?",
      opciones: [
        { id: "a", label: "Cruzar con especificaciones y marcar lo dudoso", correcta: true },
        { id: "b", label: "Asumir diámetros «estándar» sin evidencia", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué contraste usas para validar una simbología dudosa?" },
    transferir: { prompt: "Transfiere el criterio de lectura de planos a otra tipología de red (frío vs. AC)." },
  },
  2: {
    explorar: { prompt: "Antes de medir, ¿qué verificas en el instrumento?" },
    desafiar: {
      prompt: "La lectura está fuera de rango de fábrica. ¿Qué priorizas?",
      opciones: [
        { id: "a", label: "Repetir con técnica correcta y contrastar manual", correcta: true },
        { id: "b", label: "Forzar setpoint sin registrar", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué evidencia deja trazada una medición conforme?" },
    transferir: { prompt: "Aplica el mismo protocolo de medición a otro parámetro (P/T)." },
  },
  3: {
    explorar: { prompt: "En una unión de tubería, ¿qué riesgo buscas primero?" },
    desafiar: {
      prompt: "Secuencia segura de armado de red: ¿qué no puede faltar?",
      opciones: [
        { id: "a", label: "Limpieza, unión correcta y prueba de hermeticidad", correcta: true },
        { id: "b", label: "Soldar «a ojo» sin soportes ni prueba", correcta: false },
      ],
    },
    investigar: { prompt: "¿Cómo demuestras hermeticidad sin inventar valores?" },
    transferir: { prompt: "Transfiere la secuencia segura a otro tramo o material." },
  },
  4: {
    explorar: { prompt: "Al montar un componente, ¿qué contrastas con el manual?" },
    desafiar: {
      prompt: "Hay dificultad de acceso al equipo. ¿Qué es correcto?",
      opciones: [
        { id: "a", label: "Planificar montaje según manual y EPP", correcta: true },
        { id: "b", label: "Forzar el equipo omitiendo anclajes", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué verificación post-montaje dejas registrada?" },
    transferir: { prompt: "Aplica el criterio de montaje a otro equipo del sistema." },
  },
  5: {
    explorar: { prompt: "Antes de cargar fluido, ¿qué preparas en el área (EPP/ambiente)?" },
    desafiar: {
      prompt: "Durante la carga de refrigerante, ¿qué está prohibido?",
      opciones: [
        { id: "a", label: "Venteo a la atmósfera «para purgar»", correcta: true },
        { id: "b", label: "Vacío / hermeticidad previa según procedimiento", correcta: false },
        { id: "c", label: "Monitoreo de presión/temperatura", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué registro mínimo deja una carga conforme a NCh3241?" },
    transferir: { prompt: "Transfiere el checklist de carga a otra sala fría del local." },
  },
  6: {
    explorar: { prompt: "En inspección visual de condensadora, ¿qué anomalía registras sin diagnosticar causa raíz?" },
    desafiar: {
      prompt: "Vibración en basamento. ¿Qué hipótesis es más prudente primero?",
      opciones: [
        { id: "a", label: "Revisar fijación/anclaje antes de culpar al compresor", correcta: true },
        { id: "b", label: "Pedir compresor nuevo sin medir ni inspeccionar", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué contraste (manual/instrumento) respalda tu hipótesis?" },
    transferir: { prompt: "Clasifica la falla: ¿obra o taller? Justifica con evidencia." },
  },
  7: {
    explorar: { prompt: "Antes del checklist preventivo en cámara, ¿qué seguridad verificas?" },
    desafiar: {
      prompt: "Mantención preventiva: ¿qué paso no puedes saltar?",
      opciones: [
        { id: "a", label: "EPP / autorización e ingreso seguro", correcta: true },
        { id: "b", label: "Abrir tablero sin LOTO «solo un momento»", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué dejas en bitácora/OT tras el preventivo?" },
    transferir: { prompt: "Aplica el mismo checklist a otra cámara del plan anual." },
  },
  8: {
    explorar: { prompt: "Antes de recuperar R-410A, ¿qué preparación NCh3241 priorizas?" },
    desafiar: {
      prompt: "Al recuperar refrigerante, ¿qué es correcto?",
      opciones: [
        { id: "a", label: "Equipo de recuperación + cilindro aprobado y etiquetado", correcta: true },
        { id: "b", label: "Liberar a la atmósfera si «queda poco»", correcta: false },
      ],
    },
    investigar: { prompt: "¿Qué evidencia de custodia/etiquetado dejas del cilindro?" },
    transferir: { prompt: "Transfiere el protocolo de recuperación a otro equipo del mall." },
  },
};

export function getPracticaLibreDesafios(moduloNumero: number): PlDesafio[] {
  const overrides = BY_MODULO[moduloNumero] ?? {};
  return GENERIC.map((g) => {
    const o = overrides[g.faseId];
    if (!o) return { ...g, opciones: g.opciones?.map((x) => ({ ...x })) };
    return {
      ...g,
      titulo: o.titulo ?? g.titulo,
      prompt: o.prompt,
      opciones: (o.opciones ?? g.opciones)?.map((x) => ({ ...x })),
    };
  });
}
