const courseProfile = window.AulaTPCourseProfile || {};

function inferredCourseId() {
  if (courseProfile.id) return courseProfile.id;
  const path = window.location.pathname || '';
  if (path.includes('electricidad_3_medio')) return 'electricidad-3m';
  if (path.includes('atencion_enfermeria')) return 'enfermeria-tens';
  return '';
}

const currentCourseId = inferredCourseId();

const GENERIC_UI_LABELS = {
  tutorSafetyNote: 'Te orientaré con pistas y preguntas. No reemplazo a tu docente ni resuelve evaluaciones por ti.',
  contextCaseType: 'Caso técnico',
  practiceCaseType: 'Caso de refuerzo',
  practiceAnalyzePrefix: 'Analiza el caso de',
  finalCaseEntity: 'equipo',
  finalSimulationDefaultSmall: 'Meta final · simulación técnica',
  finalSimulationDefaultLead: 'Integra lo aprendido en un entorno técnico virtual: observa, selecciona, decide, ordena acciones y registra.',
  finalReadyDefault: 'Modelo 3D listo para explorar',
  finalModelCaptionDefault: 'Modelo 3D · exploración técnica',
  finalMonitorSmallDefault: 'Monitor de parámetros',
  finalMonitorTitleDefault: 'Parámetros simulados',
  finalStateFallback: 'Estado técnico',
  finalFooterDefault: '',
  finalTitleDefault: 'Simulación técnica final',
  finalRecordPlaceholder: '',
  contextFallbackDescription: 'En esta primera etapa se presentan los antecedentes, el contexto y el problema central que guiará el análisis del AE 1.',
  practiceIntro: 'Entrena con un caso, corrige tus decisiones y vuelve a intentarlo sin penalización.',
  decorativeSymbols: null,
  aeReflectionCheck: 'Revisé la retroalimentación y puedo explicar cómo aplicarla en una situación real.',
  integratorQuestionHint: 'Relaciona tu decisión con seguridad, evidencia y procedimiento.',
  evaluationQuestionHint: 'Relaciona el dato con seguridad, técnica y continuidad del trabajo.',
  tutorFallbackExample: 'Antes de elegir una alternativa, verifica qué acción protege primero la seguridad y qué información debes comunicar.',
  tutorFallbackQuestion: '¿Qué antecedente de la pantalla cambia más la decisión que debes tomar?',
};

const NURSING_UI_LABELS = {
  contextCaseType: 'Caso clínico',
  practiceCaseType: 'Paciente 2D · caso de refuerzo',
  finalCaseEntity: 'paciente',
  finalSimulationDefaultSmall: 'Meta final · simulación clínica',
  finalSimulationDefaultLead: 'Integra lo aprendido en un entorno clínico virtual: observa, selecciona insumos, decide, ordena acciones y registra.',
  finalReadyDefault: 'Paciente 3D listo para explorar',
  finalModelCaptionDefault: 'Paciente 3D · exploración clínica',
  finalMonitorSmallDefault: 'Monitor del paciente',
  finalMonitorTitleDefault: 'Signos vitales simulados',
  finalStateFallback: 'Estado clínico',
  finalTitleDefault: 'Simulación clínica final',
  contextFallbackDescription: 'En esta primera etapa se presentan los antecedentes, el contexto de atención y el problema central que guiará el análisis del AE 1.',
  practiceIntro: 'Entrena con un paciente, corrige tus decisiones y vuelve a intentarlo sin penalización.',
  aeReflectionCheck: 'Revisé la retroalimentación y puedo explicar cómo aplicarla en una situación de cuidado.',
  integratorQuestionHint: 'Relaciona tu decisión con seguridad, continuidad y respeto por la persona.',
  evaluationQuestionHint: 'Relaciona el dato con seguridad, técnica y continuidad del cuidado.',
  tutorFallbackExample: 'Antes de elegir una alternativa, verifica qué acción protege primero la seguridad de la persona y qué información debes comunicar.',
};

const courseUiLabels = {
  ...GENERIC_UI_LABELS,
  ...(currentCourseId === 'enfermeria-tens' ? NURSING_UI_LABELS : {}),
  ...(courseProfile.uiLabels || {})
};
const FALLBACK_NURSING_MODULES = [
  {
    number: '1', code: '01 · OA 1', short: 'Cuidados básicos', title: 'Aplicación de cuidados básicos',
    routeTitle: 'Aplicación de\ncuidados básicos', hours: '228 h', hours3d: '68 h 3D', icon: 'care', color: 'blue',
    description: 'Atiende necesidades básicas de personas en distintas etapas del ciclo vital aplicando principios técnicos, protocolos, trato digno y respeto por los derechos del paciente.',
    outcomes: ['Atención integral según condición de salud, costumbres y etapa del ciclo vital.', 'Higiene y confort con privacidad, pudor, asepsia y antisepsia.', 'Detección, comunicación y registro de alteraciones durante la atención.'],
    contentTitle: 'Fundamentos para una atención segura', content: 'Reconoce las necesidades de cuidado de las personas y aplica procedimientos básicos con una mirada respetuosa, segura y centrada en el paciente.',
    activities: [['01', 'Reconocer necesidades', 'Identifica condiciones y necesidades básicas en un caso de atención.'], ['02', 'Aplicar cuidados', 'Selecciona las acciones de higiene, confort y seguridad adecuadas.'], ['03', 'Registrar la atención', 'Comunica y registra observaciones relevantes del procedimiento.']]
  },
  {
    number: '2', code: '02 · OA 2', short: 'Parámetros de salud', title: 'Medición y control de parámetros básicos en salud',
    routeTitle: 'Medición y control\nde parámetros básicos\nen salud', hours: '152 h', hours3d: '46 h 3D', icon: 'vitals', color: 'teal',
    description: 'Mide, registra y comunica parámetros básicos de salud, utilizando instrumentos de manera segura y siguiendo procedimientos establecidos.',
    outcomes: ['Preparación segura de instrumentos y del espacio de atención.', 'Medición y registro de signos vitales según protocolo.', 'Comunicación oportuna de valores que requieren observación.'],
    contentTitle: 'Observar, medir y registrar con precisión', content: 'Practica la toma de parámetros básicos y aprende a interpretar los datos dentro de los rangos esperados para cada situación de cuidado.',
    activities: [['01', 'Prepara el procedimiento', 'Organiza los implementos y prepara el espacio de trabajo.'], ['02', 'Mide parámetros', 'Realiza la toma guiada de signos vitales básicos.'], ['03', 'Interpreta y comunica', 'Registra los resultados e identifica alertas.']]
  },
  {
    number: '3', code: '03 · OA 3', short: 'Promoción y prevención', title: 'Promoción de la salud y prevención de la enfermedad',
    routeTitle: 'Promoción de la salud\ny prevención de la\nenfermedad', hours: '190 h', hours3d: '48 h 3D', icon: 'community', color: 'sky',
    description: 'Participa en acciones de promoción de la salud y prevención de enfermedades, considerando características individuales, familiares y comunitarias.',
    outcomes: ['Reconocimiento de factores protectores y de riesgo para la salud.', 'Diseño de mensajes claros para educación y autocuidado.', 'Participación en acciones preventivas de acuerdo con el contexto.'],
    contentTitle: 'Cuidar antes de que aparezca la enfermedad', content: 'Explora acciones que favorecen el bienestar y aprende a comunicar recomendaciones de salud de forma clara, pertinente y cercana.',
    activities: [['01', 'Identifica factores', 'Reconoce elementos protectores y situaciones de riesgo.'], ['02', 'Diseña un mensaje', 'Crea una recomendación breve para un caso de prevención.'], ['03', 'Promueve el autocuidado', 'Propone una acción de cuidado para la comunidad.']]
  },
  {
    number: '4', code: '04 · OA 4', short: 'Bioseguridad', title: 'Higiene y bioseguridad del ambiente',
    routeTitle: 'Higiene y bioseguridad\ndel ambiente', hours: '190 h', hours3d: '48 h 3D', icon: 'shield', color: 'teal',
    description: 'Aplica medidas de higiene, limpieza, desinfección y prevención de riesgos para contribuir a un entorno de atención seguro.',
    outcomes: ['Aplicación de precauciones estándar y medidas de protección.', 'Reconocimiento de técnicas de higiene, limpieza y desinfección.', 'Manejo responsable de residuos y elementos de uso clínico.'],
    contentTitle: 'Un entorno limpio también cuida', content: 'Revisa las medidas que protegen a pacientes, equipos de salud y comunidad. Cada decisión de higiene y bioseguridad es parte de una atención de calidad.',
    activities: [['01', 'Evalúa el entorno', 'Identifica riesgos en un espacio de atención simulado.'], ['02', 'Selecciona protección', 'Escoge los elementos de protección adecuados.'], ['03', 'Aplica el protocolo', 'Ordena las acciones de higiene y desinfección.']]
  },
  {
    number: '5', code: '05 · OA 6', short: 'Registro en salud', title: 'Sistemas de registro e información en salud',
    routeTitle: 'Sistemas de registro\ne información\nen salud', hours: '76 h', hours3d: '15 h 3D', icon: 'record', color: 'navy',
    description: 'Registra información de salud de acuerdo con normas de confidencialidad, trazabilidad y uso responsable de los sistemas disponibles.',
    outcomes: ['Reconocimiento de datos relevantes para la continuidad de la atención.', 'Registro claro, oportuno y respetuoso de la confidencialidad.', 'Uso responsable de sistemas de información en salud.'],
    contentTitle: 'Información que da continuidad al cuidado', content: 'Comprende el valor de registrar con claridad y responsabilidad. La información de salud permite coordinar cuidados y proteger a cada persona atendida.',
    activities: [['01', 'Selecciona información', 'Distingue los datos relevantes de un registro clínico.'], ['02', 'Completa un registro', 'Organiza la información de manera clara y oportuna.'], ['03', 'Protege la información', 'Identifica acciones que resguardan la confidencialidad.']]
  }
];

const FALLBACK_ELECTRICITY_MODULES = [
  {
    number: '1', code: '01 · OA 4', short: 'Motores y calefacción', title: 'Instalación de motores eléctricos y equipos de calefacción',
    routeTitle: 'Instalación de motores\neléctricos y calefacción', hours: '152 h', hours3d: '42 h 3D', icon: 'motor', color: 'navy',
    description: 'Instala motores eléctricos y equipos de calefacción interpretando planos, controlando riesgos y verificando el montaje con evidencia técnica.',
    outcomes: ['Lectura de planos y características del motor o calefactor.', 'Montaje seguro con protecciones y conexiones según normativa.', 'Verificación de funcionamiento y registro de la instalación.'],
    contentTitle: 'Montar con evidencia y seguridad', content: 'Contrasta el plano con el tablero real, identifica riesgos eléctricos y justifica cada conexión antes de energizar.',
    activities: [['01', 'Leer el plano', 'Identifica circuitos, protecciones y puntos de conexión del caso.'], ['02', 'Montar con seguridad', 'Selecciona el procedimiento de instalación y las protecciones adecuadas.'], ['03', 'Verificar y registrar', 'Comprueba continuidad, protecciones y deja evidencia del montaje.']]
  },
  {
    number: '2', code: '02 · OA 1 · OA 3', short: 'Instalaciones domiciliarias', title: 'Instalaciones eléctricas domiciliarias',
    routeTitle: 'Instalaciones eléctricas\ndomiciliarias', hours: '190 h', hours3d: '52 h 3D', icon: 'home', color: 'blue',
    description: 'Ejecuta instalaciones domiciliarias interpretando proyectos, aplicando normativa y controlando riesgos en la faena.',
    outcomes: ['Interpretar canalizaciones, tableros y circuitos de una vivienda.', 'Seleccionar materiales y protecciones según el proyecto.', 'Verificar continuidad, aislación y seguridad antes de entregar.'],
    contentTitle: 'De plano a tablero en vivienda', content: 'Lee el proyecto, arma circuitos y comprueba que la instalación protege a las personas y a los equipos.',
    activities: [['01', 'Leer el proyecto', 'Reconoce circuitos, cargas y protecciones del domicilio.'], ['02', 'Armar el circuito', 'Define canalización, conductores y tablero según el plano.'], ['03', 'Verificar la entrega', 'Comprueba medidas de seguridad y deja registro de la faena.']]
  },
  {
    number: '3', code: '03 · OA 1 · OA 2 · OA 5', short: 'Proyectos eléctricos', title: 'Elaboración de proyectos eléctricos',
    routeTitle: 'Elaboración de\nproyectos eléctricos', hours: '152 h', hours3d: '42 h 3D', icon: 'plan', color: 'teal',
    description: 'Elabora y revisa proyectos eléctricos con simbología, cubicación y criterios de seguridad para una instalación real.',
    outcomes: ['Aplicar simbología y normativas en planos de proyecto.', 'Relacionar cargas, protecciones y materiales del listado.', 'Fundamentar decisiones de diseño con evidencia técnica.'],
    contentTitle: 'Proyectar con normativa', content: 'Pasa del requerimiento al plano: simbología, protecciones y cubicación sin inventar partidas.',
    activities: [['01', 'Leer simbología', 'Identifica símbolos y circuitos del proyecto.'], ['02', 'Dimensionar', 'Relaciona cargas, protecciones y materiales.'], ['03', 'Fundamentar', 'Justifica una decisión de diseño con plano y norma.']]
  },
  {
    number: '4', code: '04 · OA 6', short: 'Mantenimiento eléctrico', title: 'Mantenimiento de sistemas eléctricos',
    routeTitle: 'Mantenimiento de\nsistemas eléctricos', hours: '152 h', hours3d: '42 h 3D', icon: 'wrench', color: 'orange',
    description: 'Diagnostica y mantiene sistemas eléctricos con procedimientos seguros, mediciones y registro de fallas.',
    outcomes: ['Detectar fallas con evidencia de medición y observación.', 'Aplicar bloqueo, consignación y EPP antes de intervenir.', 'Registrar la mantención y las condiciones de entrega.'],
    contentTitle: 'Diagnosticar antes de intervenir', content: 'Mide, consigna y repara con evidencia. La seguridad de la persona y del sistema va primero.',
    activities: [['01', 'Diagnosticar', 'Interpreta síntomas y mediciones de una falla.'], ['02', 'Intervenir seguro', 'Aplica consignación y el procedimiento de mantención.'], ['03', 'Entregar registro', 'Documenta la falla, la acción y la verificación final.']]
  }
];

function fallbackModulesForCourse(courseId) {
  if (courseId === 'electricidad-3m') return FALLBACK_ELECTRICITY_MODULES;
  if (courseId === 'enfermeria-tens') return FALLBACK_NURSING_MODULES;
  return [];
}

const modules = courseProfile.modules || fallbackModulesForCourse(currentCourseId);

const internalStages = [
  { name: 'Contextualización', subtitle: 'Comprender la situación', icon: 'openbook', tone: 'navy' },
  { name: 'Aprendizaje esperado 1', subtitle: 'Analiza, comprende y aplica', icon: 'target', tone: 'teal' },
  { name: 'Aprendizaje esperado 2', subtitle: 'Analiza, comprende y aplica', icon: 'target', tone: 'blue' },
  { name: 'Aprendizaje esperado 3', subtitle: 'Analiza, comprende y aplica', icon: 'target', tone: 'purple' },
  { name: 'Situación integradora', subtitle: 'Resuelve en contexto', icon: 'puzzle', tone: 'orange' },
  { name: 'Evaluación final', subtitle: 'Demuestra lo aprendido', icon: 'evaluation', tone: 'green' },
  { name: 'Retroalimentación y cierre', subtitle: 'Reflexiona y avanza', icon: 'refresh', tone: 'blue' }
];

const STAGE_CONTEXT = 0;
const STAGE_INTEGRATOR = 4;
const STAGE_EVALUATION = 5;
const STAGE_FEEDBACK = 6;

const pedagogicalStages = [
  { name: 'Analizar', tone: 'navy', symbol: '⌕' },
  { name: 'Comprender', tone: 'red', symbol: '✧' },
  { name: 'Reconocer y relacionar', tone: 'purple', symbol: '↗' },
  { name: 'Aplicar procedimientos y tomar decisiones', tone: 'orange', symbol: '⚙' },
  { name: 'Verificar', tone: 'teal', symbol: '✓' },
  { name: 'Retroalimentar', tone: 'gold', symbol: '…' }
];

const aeStageDescriptions = [
  'Observa la situación profesional, identifica los antecedentes relevantes y reconoce qué información necesitas antes de actuar.',
  'Interpreta el contexto del caso y explica con tus palabras las necesidades, riesgos y condiciones que debes atender.',
  'Conecta los conceptos técnicos con los datos del caso para comprender cómo se relacionan entre sí.',
  'Selecciona procedimientos seguros, prioriza acciones y toma decisiones fundamentadas para responder al caso.',
  'Revisa los resultados, comprueba que la intervención fue segura e identifica los aspectos que debes corregir.',
  'Integra la retroalimentación, reconoce tus avances y registra aquello que necesitas reforzar antes de continuar.'
];

const aeStageIcons = ['analyze', 'understand', 'relate', 'apply', 'verify', 'feedback'];

const NURSING_AE_TITLES = {
  '1': ['Cuidados básicos', 'Higiene y confort', 'Observación y registro'],
  '2': ['Preparación de la medición', 'Control de parámetros', 'Interpretación y comunicación'],
  '3': ['Factores protectores y de riesgo', 'Promoción y autocuidado', 'Prevención de la enfermedad'],
  '4': ['Precauciones y protección', 'Higiene y desinfección', 'Manejo seguro del ambiente'],
  '5': ['Información clínica relevante', 'Registro y trazabilidad', 'Confidencialidad de la información']
};

const ELECTRICITY_AE_TITLES = {
  '1': ['Lectura de planos y motor', 'Montaje y protecciones', 'Verificación y registro'],
  '2': ['Proyecto domiciliario', 'Circuitos y tablero', 'Verificación de la instalación'],
  '3': ['Simbología y normativa', 'Cargas y protecciones', 'Cubicación y fundamento'],
  '4': ['Diagnóstico de fallas', 'Consignación e intervención', 'Registro de mantención']
};

const aeTitlesByModule = courseProfile.aeTitlesByModule || (
  currentCourseId === 'electricidad-3m' ? ELECTRICITY_AE_TITLES :
  currentCourseId === 'enfermeria-tens' ? NURSING_AE_TITLES : {}
);

const aeLearningContent = window.AulaTPAeContent || {};
const integratorContentByModule = window.AulaTPIntegratorContent || {};
const freePracticeContentByModule = window.AulaTPPracticeContent || {};
const integratorSteps = [
  { number: 1, title: '15 situaciones progresivas', description: 'Casos, datos, videos e imágenes', icon: '▥' },
  { number: 2, title: 'Palabras clave', description: 'Relaciona conceptos esenciales', icon: '⌕' },
  { number: 3, title: 'Gran Desafío', description: 'Explora, analiza y decide', icon: '◎' },
  { number: 4, title: 'Simulación 3D final', description: 'Situación Integradora', icon: '♛' }
];

const NURSING_COMPETENCIES = {
  '1': 'Atención integral, higiene y confort, observación clínica, comunicación y registro.',
  '2': 'Medición de signos vitales, uso seguro de instrumentos, interpretación y comunicación de resultados.',
  '3': 'Promoción del bienestar, prevención de riesgos, educación y comunicación para el autocuidado.',
  '4': 'Higiene clínica, control de riesgos, desinfección, protección personal y manejo de residuos.',
  '5': 'Registro clínico, confidencialidad, trazabilidad y uso responsable de sistemas de información.'
};

const ELECTRICITY_COMPETENCIES = {
  '1': 'Lectura de planos, montaje de motores y calefacción, protecciones y verificación segura.',
  '2': 'Instalación domiciliaria, canalizaciones, tableros, normativa y entrega verificada.',
  '3': 'Proyecto eléctrico, simbología, dimensionamiento, cubicación y fundamento normativo.',
  '4': 'Diagnóstico de fallas, consignación, mantención segura y registro de la intervención.'
};

const competencies = courseProfile.competencies || (
  currentCourseId === 'electricidad-3m' ? ELECTRICITY_COMPETENCIES :
  currentCourseId === 'enfermeria-tens' ? NURSING_COMPETENCIES : {}
);

const stageExplanations = courseProfile.stageExplanations || {
  1: 'El estudiante inicia el recorrido del AE 1 analizando la situación, comprendiendo el contexto y reconociendo relaciones clave antes de aplicar procedimientos y tomar decisiones.',
  2: 'El estudiante profundiza el AE 2 relacionando datos, procedimientos y criterios técnicos para verificar resultados con seguridad y precisión.',
  3: 'El estudiante integra el AE 3 en una situación aplicada, toma decisiones fundamentadas, verifica el proceso y utiliza la retroalimentación para mejorar.'
};

const contextualizationStepsBrief = [
  { number: 1, title: 'Comprendo la situación', time: 4, tone: 'navy', icon: 'document-search' },
  { number: 2, title: 'Relaciono conceptos', time: 5, tone: 'teal', icon: 'network' },
  { number: 3, title: 'Descubro conceptos clave', time: 4, tone: 'blue', icon: 'key' },
  { number: 4, title: 'Analizo afirmaciones', time: 5, tone: 'purple', icon: 'chat' },
  { number: 5, title: 'Tomo decisiones', time: 8, tone: 'orange', icon: 'scale' },
  { number: 6, title: 'Organizo una acción o procedimiento', time: 4, tone: 'green', icon: 'checklist' },
  { number: 7, title: 'Aplico lo aprendido', time: 6, tone: 'blue', icon: 'bulb' },
  { number: 8, title: 'Retroalimentación y cierre', time: 4, tone: 'teal', icon: 'refresh' }
];

const contextualizationStepsExtended = [
  { number: 1, title: 'Comprendo la situación', time: 10, tone: 'navy', icon: 'document-search' },
  { number: 2, title: 'Relaciono conceptos', time: 8, tone: 'teal', icon: 'network' },
  { number: 3, title: 'Descubro conceptos clave', time: 7, tone: 'blue', icon: 'key' },
  { number: 4, title: 'Analizo afirmaciones', time: 8, tone: 'purple', icon: 'chat' },
  { number: 5, title: 'Tomo decisiones', time: 15, tone: 'orange', icon: 'scale' },
  { number: 6, title: 'Organizo acciones o procedimientos', time: 8, tone: 'green', icon: 'checklist' },
  { number: 7, title: 'Cambio en la situación', time: 8, tone: 'blue', icon: 'refresh' },
  { number: 8, title: 'Aplico lo aprendido', time: 10, tone: 'navy', icon: 'bulb' },
  { number: 9, title: 'Desafío final del caso', time: 5, tone: 'pink', icon: 'trophy' },
  { number: 10, title: 'Retroalimentación y cierre', time: 3, tone: 'teal', icon: 'refresh' }
];

const module1Case = {
  patient: 'Elena Rojas, 78 años',
  setting: 'Unidad de Medicina de un hospital de mediana complejidad',
  centerSummary: 'Se recupera de una neumonía, presenta debilidad y necesita ayuda parcial para su higiene, confort y movilización.',
  summary: 'Elena se recupera de una neumonía. Está consciente y orientada, presenta debilidad, permanece gran parte del tiempo en cama y necesita ayuda parcial para su higiene y movilización. Refiere dolor leve al cambiar de posición, utiliza audífono y solicita que se resguarde su privacidad durante el aseo.',
  observations: [
    'Enrojecimiento leve y blanqueable en la zona sacra.',
    'Ropa de cama húmeda después de un episodio de incontinencia.',
    'Mesa de alimentación y timbre fuera de su alcance.',
    'La paciente puede colaborar si las indicaciones se entregan de frente y con claridad.'
  ],
  challenge: 'Brindar cuidados básicos seguros, dignos y centrados en la persona, previniendo riesgos y registrando los hallazgos relevantes.',
  heroImage: 'assets/elena-rojas-patient-natural-card-v2.webp',
  detailImage: 'assets/elena-rojas-patient-natural-card-v2.webp',
  imageAlt: 'Enfermera conversa con Elena y la ayuda a acomodarse de manera segura en su cama hospitalaria'
};

const module1Activities = [
  {
    number: 1, kind: 'quiz', quantity: '4 ejercicios', title: 'Comprendo la situación',
    lead: 'Identifica los antecedentes que deben considerarse antes de iniciar los cuidados.',
    questions: [
      { prompt: '¿Qué necesidad requiere atención inmediata antes de comenzar el aseo?', options: ['Asegurar privacidad, explicar el procedimiento y comprobar que Elena pueda participar', 'Cambiar la ropa de cama sin avisar', 'Solicitar que la familia realice todo el procedimiento'], answer: 0, feedback: 'La preparación protege la dignidad, favorece la colaboración y permite anticipar riesgos.' },
      { prompt: '¿Qué hallazgo aumenta el riesgo de lesión de la piel?', options: ['El uso de audífono', 'La humedad de la ropa de cama y el tiempo prolongado en cama', 'La presencia de la hija'], answer: 1, feedback: 'La humedad y la presión mantenida exigen higiene, secado cuidadoso y cambios de posición.' },
      { prompt: '¿Qué riesgo del entorno debe corregirse?', options: ['El timbre fuera de alcance', 'La luz natural de la habitación', 'La identificación de la paciente'], answer: 0, feedback: 'El timbre debe quedar al alcance para pedir ayuda y prevenir intentos inseguros de levantarse.' },
      { prompt: '¿Cómo facilitarías la comunicación con Elena?', options: ['Hablar desde la puerta y muy rápido', 'Dar todas las indicaciones a la hija', 'Ubicarse de frente, vocalizar con claridad y confirmar comprensión'], answer: 2, feedback: 'Una comunicación directa y clara respeta la autonomía de la paciente.' }
    ]
  },
  {
    number: 2, kind: 'matching', quantity: '1 actividad de 6 pares', title: 'Relaciono conceptos',
    lead: 'Relaciona cada concepto con su aplicación en el caso de Elena.',
    pairs: [
      ['Privacidad', 'Cubrir las zonas del cuerpo que no están siendo aseadas.'],
      ['Confort', 'Acomodar a Elena y dejar la cama limpia, seca y sin pliegues.'],
      ['Autonomía', 'Permitir que realice las acciones que puede ejecutar por sí misma.'],
      ['Prevención de caídas', 'Dejar cama baja, frenos activados y timbre al alcance.'],
      ['Integridad cutánea', 'Observar prominencias óseas y evitar humedad o presión prolongada.'],
      ['Registro', 'Documentar el cuidado realizado y los hallazgos observados.']
    ]
  },
  {
    number: 3, kind: 'quiz', quantity: '3 conceptos', title: 'Descubro conceptos claves',
    lead: 'Descubre el concepto representado por cada pista.',
    questions: [
      { prompt: 'Pista: capacidad de una persona para participar y decidir sobre sus propios cuidados.', options: ['Autonomía', 'Asepsia', 'Trazabilidad'], answer: 0, feedback: 'La autonomía se promueve informando, preguntando preferencias y facilitando la participación.' },
      { prompt: 'Pista: conjunto de acciones que disminuyen la presión mantenida sobre una zona del cuerpo.', options: ['Aislamiento', 'Cambio de posición', 'Registro diferido'], answer: 1, feedback: 'Los cambios de posición contribuyen a prevenir lesiones asociadas a presión.' },
      { prompt: 'Pista: comunicación escrita, objetiva y oportuna de cuidados y observaciones.', options: ['Entrega informal', 'Registro clínico', 'Opinión personal'], answer: 1, feedback: 'El registro clínico da continuidad y seguridad a la atención.' }
    ]
  },
  {
    number: 4, kind: 'truefalse', quantity: '4 ejercicios', title: 'Analizo afirmaciones',
    lead: 'Determina si cada afirmación es verdadera o falsa según el caso.',
    questions: [
      { prompt: 'Para ahorrar tiempo, el aseo puede iniciarse sin explicar el procedimiento si la paciente está orientada.', options: ['Verdadero', 'Falso'], answer: 1, feedback: 'Siempre se debe informar, solicitar colaboración y respetar la decisión de la persona.' },
      { prompt: 'El enrojecimiento sacro debe observarse, aliviar la presión y comunicarse según protocolo.', options: ['Verdadero', 'Falso'], answer: 0, feedback: 'Es un hallazgo relevante para prevenir deterioro de la piel.' },
      { prompt: 'Dejar la ropa de cama húmeda puede afectar el confort y la integridad cutánea.', options: ['Verdadero', 'Falso'], answer: 0, feedback: 'La humedad sostenida favorece irritación y daño de la piel.' },
      { prompt: 'La hija debe responder por Elena aunque ella esté consciente y orientada.', options: ['Verdadero', 'Falso'], answer: 1, feedback: 'La comunicación debe dirigirse primero a Elena, respetando su autonomía.' }
    ]
  },
  {
    number: 5, kind: 'quiz', quantity: '3 situaciones de decisión', title: 'Tomo decisiones',
    lead: 'Elige la acción más segura. Cada decisión incluye su consecuencia.',
    questions: [
      { prompt: 'Elena intenta levantarse sola para alcanzar el timbre. ¿Qué haces primero?', options: ['Le indicas que no se mueva y te retiras', 'Te acercas, aseguras su posición, acercas el timbre y explicas cómo pedir ayuda', 'Subes las barandas y omites conversar con ella'], answer: 1, feedback: 'Esta decisión controla el riesgo inmediato y entrega una alternativa segura.' },
      { prompt: 'Durante el aseo observas que el enrojecimiento sacro no desaparece al aliviar la presión. ¿Qué corresponde?', options: ['Masajear con fuerza la zona', 'Ignorarlo porque no hay herida', 'Suspender la fricción, aliviar presión, registrar y comunicar el hallazgo'], answer: 2, feedback: 'Un cambio persistente requiere protección de la zona y comunicación oportuna.' },
      { prompt: 'Elena dice sentir frío y cansancio a mitad del procedimiento. ¿Cómo continúas?', options: ['Mantienes el plan sin cambios', 'Pausas, cubres a la paciente, evalúas tolerancia y acuerdas cómo continuar', 'Pides a la hija que la convenza'], answer: 1, feedback: 'Adaptar el cuidado a la tolerancia preserva seguridad, confort y dignidad.' }
    ]
  },
  {
    number: 6, kind: 'sequence', quantity: '2 ejercicios', title: 'Organizo acciones o procedimientos',
    lead: 'Arrastra las acciones o utiliza las flechas para construir la secuencia correcta.',
    sequences: [
      { title: 'Preparación del cuidado', correct: ['Higienizar las manos y reunir materiales', 'Identificar a Elena y explicar el procedimiento', 'Resguardar la privacidad y preparar el entorno', 'Favorecer la participación de la paciente'], shuffled: [2, 0, 3, 1] },
      { title: 'Cierre del cuidado', correct: ['Secar cuidadosamente y observar la piel', 'Dejar a Elena cómoda y segura', 'Retirar materiales e higienizar las manos', 'Registrar el cuidado y comunicar hallazgos'], shuffled: [1, 3, 0, 2] }
    ]
  },
  {
    number: 7, kind: 'quiz', quantity: '1 situación nueva', title: 'Cambio en la situación',
    lead: 'Nuevo antecedente: al sentarse al borde de la cama, Elena refiere mareo y se observa inestable.',
    questions: [
      { prompt: '¿Cómo debes modificar el plan de cuidado?', options: ['Continuar la marcha rápidamente para que se acostumbre', 'Mantenerla sentada sin apoyo hasta que pase el mareo', 'Dar apoyo inmediato, evitar que se levante, dejarla segura y comunicar el cambio'], answer: 2, feedback: 'El nuevo antecedente obliga a detener la movilización y priorizar la prevención de una caída.' }
    ]
  },
  {
    number: 8, kind: 'quiz', quantity: '4 ejercicios', title: 'Aplico lo aprendido',
    lead: 'Resuelve las preguntas aplicando los cuidados revisados en el caso.',
    questions: [
      { prompt: '¿Qué acción combina autonomía y seguridad?', options: ['Realizar todo el aseo sin permitir participación', 'Entregar a Elena los elementos que puede usar y asistirla en lo que requiere apoyo', 'Pedirle que se levante sola'], answer: 1, feedback: 'La asistencia debe ajustarse a las capacidades actuales de la persona.' },
      { prompt: '¿Cuál es el mejor registro?', options: ['“Paciente complicada durante el aseo”', '“Se realizó todo sin novedades”', '“Aseo en cama con ayuda parcial; enrojecimiento sacro persistente, se alivió presión y se informó a profesional responsable”'], answer: 2, feedback: 'Un registro útil es objetivo, específico e incluye acciones y comunicaciones realizadas.' },
      { prompt: 'Antes de retirarte de la habitación debes comprobar que:', options: ['La cama esté alta para trabajar después', 'El timbre y objetos personales estén al alcance y Elena esté cómoda', 'La puerta quede abierta aunque la paciente pida privacidad'], answer: 1, feedback: 'El entorno final debe facilitar seguridad, confort y solicitud de ayuda.' },
      { prompt: '¿Qué hallazgo debe comunicarse con prioridad?', options: ['La preferencia por agua tibia', 'El audífono en la mesa', 'El mareo con inestabilidad al sentarse'], answer: 2, feedback: 'El mareo e inestabilidad implican riesgo inmediato de caída y requieren evaluación.' }
    ]
  },
  {
    number: 9, kind: 'challenge', quantity: '1 desafío integrador', title: 'Desafío final del caso',
    lead: 'Integra lo aprendido y selecciona el plan de cuidado más completo.',
    questions: [
      { prompt: '¿Qué plan responde mejor a la situación completa de Elena?', options: ['Explicar el cuidado, resguardar privacidad, promover participación, realizar higiene y secado cuidadosos, aliviar presión, prevenir caídas, dejar el timbre al alcance y registrar/comunicar hallazgos', 'Realizar el aseo rápidamente, dejarla descansando y registrar solo si aparece una herida', 'Delegar el cuidado en la familia y revisar a Elena al finalizar el turno'], answer: 0, feedback: 'El plan integra trato digno, cuidado de la piel, autonomía, seguridad y continuidad de la atención.' }
    ]
  },
  {
    number: 10, kind: 'closure', quantity: '1 cierre', title: 'Retroalimentación y cierre',
    lead: 'Revisa tus decisiones y registra una idea que quieras llevar a la práctica.'
  }
];

const module2Case = {
  patient: 'Rosa Contreras, 66 años',
  setting: 'Sala de atención ambulatoria',
  centerSummary: 'Consulta por cansancio, mareo al levantarse y escalofríos. Se deben medir y verificar sus parámetros básicos de salud.',
  summary: 'Rosa asiste a control acompañada por su hija. Refiere cansancio, sensación de mareo al levantarse y escalofríos desde la mañana. Está consciente, responde con claridad y permanece sentada mientras el equipo prepara la medición de sus parámetros básicos de salud.',
  observations: [
    'Llegó caminando y conversó durante los minutos previos al control.',
    'El manguito disponible inicialmente se observa pequeño para su brazo.',
    'La paciente mantiene una manga gruesa y acaba de beber una infusión caliente.',
    'Los resultados deben registrarse con unidad, hora, posición y observaciones relevantes.'
  ],
  challenge: 'Preparar, medir, verificar y registrar los parámetros básicos de Rosa con una técnica segura, comunicando oportunamente cualquier hallazgo que requiera evaluación.',
  heroImage: 'assets/rosa-context-v1.png',
  detailImage: 'assets/rosa-context-detail-v1.png',
  imageAlt: 'Rosa Contreras recibe atención ambulatoria mientras una profesional de enfermería prepara el control de sus parámetros básicos'
};

const module2Activities = [
  {
    number: 1, kind: 'quiz', quantity: '2 ejercicios', title: 'Comprendo la situación',
    lead: 'Identifica los antecedentes y condiciones que debes considerar antes de medir.',
    questions: [
      { prompt: '¿Qué acción debe realizarse antes de medir la presión arterial de Rosa?', options: ['Medir inmediatamente mientras conversa', 'Permitir un breve reposo, explicar el procedimiento y asegurar una posición adecuada', 'Pedirle que camine para comprobar el mareo'], answer: 1, feedback: 'Piensa en cómo el reposo, la postura y la comunicación ayudan a obtener un resultado más representativo.' },
      { prompt: '¿Qué elemento del caso puede alterar o dificultar una medición correcta?', options: ['Utilizar un manguito pequeño y medir sobre la manga gruesa', 'Registrar la hora del control', 'Explicar el procedimiento antes de comenzar'], answer: 0, feedback: 'Revisa el tamaño del manguito y la necesidad de colocarlo directamente sobre el brazo.' }
    ]
  },
  {
    number: 2, kind: 'matching', quantity: '1 actividad de 4 pares', title: 'Relaciono conceptos',
    lead: 'Relaciona cada parámetro con lo que permite observar.',
    pairs: [
      ['Temperatura', 'Expresa el equilibrio térmico del organismo y ayuda a reconocer cambios febriles.'],
      ['Pulso', 'Permite observar frecuencia, ritmo y características de los latidos percibidos.'],
      ['Frecuencia respiratoria', 'Corresponde al número y características de las respiraciones en un minuto.'],
      ['Presión arterial', 'Representa la fuerza ejercida por la sangre sobre las paredes arteriales.']
    ],
    hints: {
      'Temperatura': 'Busca el parámetro relacionado con calor corporal, escalofríos y posibles cambios febriles.',
      'Pulso': 'Piensa en el latido que puede palparse y cuya frecuencia y ritmo se observan.',
      'Frecuencia respiratoria': 'Relaciona la definición con inspiraciones y espiraciones contadas durante un minuto.',
      'Presión arterial': 'Identifica el parámetro que se obtiene con manguito y expresa dos valores.'
    }
  },
  {
    number: 3, kind: 'quiz', quantity: '2 conceptos', title: 'Descubro conceptos claves',
    lead: 'Utiliza las pistas para reconocer dos conceptos fundamentales de la medición.',
    questions: [
      { prompt: 'Pista: debe ajustarse al perímetro del brazo; si es demasiado pequeño puede distorsionar el resultado.', options: ['Manguito adecuado', 'Termómetro', 'Oxímetro'], answer: 0, feedback: 'El ancho y largo apropiados del manguito son parte de una técnica correcta de presión arterial.' },
      { prompt: 'Pista: consiste en repetir una medición inesperada después de revisar técnica, equipo y condición de la persona.', options: ['Estimación', 'Verificación', 'Diagnóstico'], answer: 1, feedback: 'Verificar permite confirmar el dato antes de registrarlo y comunicarlo según el protocolo.' }
    ]
  },
  {
    number: 4, kind: 'truefalse', quantity: '3 ejercicios', title: 'Analizo afirmaciones',
    lead: 'Determina si cada afirmación favorece una medición confiable.',
    questions: [
      { prompt: 'La presión arterial puede medirse sobre una manga gruesa si el manguito queda firme.', options: ['Verdadero', 'Falso'], answer: 1, feedback: 'La ropa gruesa puede interferir; el manguito debe colocarse sobre el brazo descubierto sin comprimirlo.' },
      { prompt: 'La frecuencia respiratoria se observa procurando que la persona respire con naturalidad.', options: ['Verdadero', 'Falso'], answer: 0, feedback: 'La observación discreta ayuda a evitar que la persona modifique voluntariamente su respiración.' },
      { prompt: 'Un resultado inesperado debe anotarse de inmediato sin revisar la técnica ni el equipo.', options: ['Verdadero', 'Falso'], answer: 1, feedback: 'Antes de concluir, revisa las condiciones, verifica el procedimiento y repite según protocolo.' }
    ]
  },
  {
    number: 5, kind: 'quiz', quantity: '2 situaciones de decisión', title: 'Tomo decisiones',
    lead: 'Selecciona la actuación más segura frente a cada momento del caso.',
    questions: [
      { prompt: 'La primera presión arterial obtenida es muy diferente del valor habitual informado por Rosa. ¿Qué haces?', options: ['La descartas y registras el valor habitual', 'Revisas postura, manguito y técnica; permites reposo, repites según protocolo y comunicas si persiste', 'Repites inmediatamente varias veces sin modificar nada'], answer: 1, feedback: 'Una diferencia importante exige comprobar las condiciones de medición y comunicar un resultado persistente.' },
      { prompt: 'Al palpar el pulso notas un ritmo irregular. ¿Cuál es la mejor decisión?', options: ['Contarlo durante menos tiempo para terminar rápido', 'Registrar solo la frecuencia estimada', 'Realizar el conteo completo según protocolo, observar características y comunicar el hallazgo'], answer: 2, feedback: 'Cuando el ritmo es irregular se necesita una observación completa y un registro claro del hallazgo.' }
    ]
  },
  {
    number: 6, kind: 'sequence', quantity: '1 ejercicio', title: 'Organizo una acción o procedimiento',
    lead: 'Ordena la secuencia para medir y registrar la presión arterial de forma segura.',
    sequences: [
      { title: 'Medición de presión arterial', correct: ['Preparar el equipo, identificar a Rosa y explicar el procedimiento', 'Favorecer reposo y ubicarla sentada con espalda, pies y brazo apoyados', 'Seleccionar el manguito adecuado y colocarlo sobre el brazo descubierto', 'Realizar la medición sin conversación ni movimiento', 'Leer, verificar y registrar el resultado con hora, posición y observaciones'], shuffled: [2, 0, 3, 1, 4], hint: 'Primero prepara y explica; después cuida la postura, selecciona el manguito, mide en reposo y registra al final.' }
    ]
  },
  {
    number: 7, kind: 'quiz', quantity: '2 ejercicios', title: 'Aplico lo aprendido',
    lead: 'Aplica la técnica y selecciona la mejor respuesta en cada situación.',
    questions: [
      { prompt: '¿Cuál de estos registros entrega información más completa?', options: ['“Presión baja”', '“PA 94/60 mmHg, 10:20 h, sentada y en reposo; medición verificada y hallazgo comunicado”', '“Signos vitales tomados”', '“Paciente se ve cansada”'], answer: 1, feedback: 'Busca un registro objetivo que incluya valor, unidad, hora, posición, verificación y comunicación.' },
      { prompt: 'Rosa acaba de beber una infusión caliente y se requiere medir temperatura oral. ¿Qué corresponde?', options: ['Medir inmediatamente y restar algunos grados', 'Cambiar el valor según la sensación de la paciente', 'Esperar el tiempo establecido por el protocolo o utilizar una vía alternativa indicada', 'Omitir la temperatura'], answer: 2, feedback: 'Las bebidas calientes pueden alterar temporalmente la medición oral; sigue el tiempo y vía definidos por el protocolo.' }
    ]
  },
  {
    number: 8, kind: 'closure', quantity: '1 cierre', title: 'Retroalimentación y cierre',
    lead: 'Revisa tus decisiones y formula una acción que mejore la calidad de tus mediciones.',
    closureBullets: [
      'Preparar a la persona, el entorno y el equipo antes de medir.',
      'Aplicar una técnica coherente con el parámetro y verificar resultados inesperados.',
      'Observar a la persona, no solo el número obtenido.',
      'Registrar valores, unidades, hora, posición y hallazgos relevantes.'
    ],
    reflectionPrompt: 'Escribe una acción concreta que aplicarías para obtener mediciones confiables.',
    reflectionPlaceholder: 'Por ejemplo: antes de medir la presión arterial comprobaré el tamaño del manguito y la posición de la persona...'
  }
];

const supplementalModuleContent = window.AulaTPCourseContent || {};

function isElectricityCourse() {
  return (window.AulaTPCourseProfile?.id || courseProfile.id) === 'electricidad-3m'
    || window.location.pathname.includes('electricidad_3_medio');
}

function moduleCaseFor(module) {
  const extra = supplementalModuleContent[module.number]?.case;
  if (extra) return extra;
  if (isElectricityCourse()) {
    return {
      patient: module.title,
      setting: module.short,
      centerSummary: module.description,
      summary: module.content || module.description,
      observations: module.outcomes || [],
      challenge: module.contentTitle || module.short,
      heroImage: defaultPracticeVisual(module),
      detailImage: defaultPracticeVisual(module),
      imageAlt: `Caso técnico del módulo ${module.number}: ${module.short}`
    };
  }
  if (module.number === '1') return module1Case;
  if (module.number === '2') return module2Case;
  return null;
}

function contextualizationPlanFor(module) {
  const caseData = moduleCaseFor(module);
  if (caseData) {
    document.querySelector('#situationPatientName').textContent = caseData.patient;
    document.querySelector('#situationPatientSetting').textContent = caseData.setting;
    document.querySelector('#situationPatientSummary').textContent = caseData.centerSummary;
  }
  const useExtended = !isElectricityCourse() && module.number === '1';
  const steps = useExtended ? contextualizationStepsExtended : contextualizationStepsBrief;
  const duration = steps.reduce((sum, step) => sum + step.time, 0);
  return {
    steps,
    duration,
    situationTime: useExtended ? 8 : 5,
    version: `Estación 1 de ${steps.length}`,
    hours: `${(duration / 45).toFixed(1)} horas pedagógicas aprox.`,
    sign: `Estación ${contextCurrentStep || 1}`
  };
}

const savedModule = Number.parseInt(localStorage.getItem('aulatp-current-module') || '1', 10);
let selected = modules.find((module) => Number(module.number) === savedModule) || modules[0];
let courseStarted = localStorage.getItem('aulatp-course-started') === 'true';
let activeInternalStage = 0;
let selectedOverviewIndex = 0;
let activeAe = 1;
let contextCurrentStep = 1;
let contextCompleted = new Set();
let contextActivityFeedback = null;
let sequenceOrders = {};
let lastSequenceMove = null;
let draggedSequenceItem = null;
let aeJourneyData = null;
let aeActiveSequence = 1;
let aeSelectedStageSequence = 1;
let contextAdvanceTimer = null;
let integratorState = null;
let integratorOpenResource = null;
let integratorVideoTimer = null;
let integratorVideoIndex = 0;
let practiceState = null;
let apiCourseState = null;
let serverModulesByNumber = new Map();
let reviewerMode = false;
let tutorHistoryLoaded = false;
let tutorSending = false;
const route = document.querySelector('#moduleRoute');
const tabs = document.querySelector('#moduleTabs');
const COURSE_ROUTE_PREFIXES = [
  courseProfile.basePath,
  '/portal/simuladores/atencion_enfermeria',
  '/portal/simuladores/electricidad_3_medio'
].filter(Boolean);
const COURSE_ROUTE_PREFIX = COURSE_ROUTE_PREFIXES.find((prefix) => window.location.pathname.startsWith(prefix)) || '';
const COURSE_BASE_PATH = (
  window.AULATP_COURSE_BASE_PATH ||
  COURSE_ROUTE_PREFIX
).replace(/\/$/, '');
const isLocalStaticPreview = ['127.0.0.1', 'localhost'].includes(window.location.hostname) && !COURSE_BASE_PATH;
const isGeneralCatalog = courseProfile.catalogMode === 'catalog' || COURSE_BASE_PATH === '/portal/cursos';

const LIVE_ROUTE_ACCESS = {
  'refrigeracion-climatizacion': {
    hubHref: '/curso/climatizacion',
    lmsHref: null,
    enterLabel: 'Abrir ruta'
  },
  'electricidad-3m': {
    hubHref: '/curso/electricidad',
    lmsHref: '/portal/simuladores/electricidad_3_medio/',
    enterLabel: 'Entrar al LMS'
  },
  'enfermeria-tens': {
    hubHref: '/curso/enfermeria',
    lmsHref: '/portal/simuladores/atencion_enfermeria/',
    enterLabel: 'Entrar al LMS'
  },
  administracion: {
    hubHref: '/curso/administracion',
    lmsHref: null,
    enterLabel: 'Abrir ruta'
  }
};

const fallbackCourseCatalog = [
  {
    id: 'refrigeracion-climatizacion',
    sort: 5,
    status: 'Disponible',
    sector: 'Construcción',
    specialty: 'Construcción',
    title: 'Refrigeración y Climatización',
    level: '3° y 4° Medio TP',
    semester: 'I Semestre',
    image: 'assets/tp-thumb-refrigeracion-climatizacion.png',
    imageAlt: 'Especialidad Refrigeración y Climatización',
    summary: 'Curso completo M1–M8 con ruta obligatoria, Práctica Libre y Tutor Aula TP.',
    href: '/curso/climatizacion',
    hubHref: '/curso/climatizacion',
    modules: ['Planos', 'Medición', 'Redes', 'Equipos', 'Puesta en marcha', 'Diagnóstico', 'Mantención', 'Reciclaje'],
    metrics: ['8 módulos', '1672 h anuales', '479 h 3D']
  },
  {
    id: 'enfermeria-tens',
    sort: 10,
    status: 'Disponible',
    sector: 'Salud y Educación',
    specialty: 'Salud y Educación',
    title: 'Atención de Enfermería',
    level: '3° Medio',
    semester: 'I Semestre',
    image: 'assets/elena-rojas-patient-natural-card-v2.webp',
    imageAlt: 'Caso clínico del curso Atención de Enfermería',
    summary: 'Ruta clínica para practicar cuidados básicos, parámetros de salud, promoción, bioseguridad y registro.',
    href: '/portal/simuladores/atencion_enfermeria/',
    hubHref: '/curso/enfermeria',
    lmsHref: '/portal/simuladores/atencion_enfermeria/',
    modules: ['Cuidados básicos', 'Parámetros de salud', 'Promoción y prevención', 'Bioseguridad', 'Registro en salud'],
    metrics: ['5 módulos', '836 h anuales', '225 h 3D']
  },
  {
    id: 'electricidad-3m',
    sort: 20,
    status: 'Disponible',
    sector: 'Electricidad',
    specialty: 'Electricidad',
    title: 'Electricidad 3° Medio',
    level: '3° Medio',
    semester: 'I Semestre',
    image: 'assets/electricity-simulation-context-v1.webp',
    imageAlt: 'Panel técnico del curso Electricidad 3° Medio',
    summary: 'Ruta técnica para motores, instalaciones domiciliarias, proyectos eléctricos y mantenimiento seguro.',
    href: '/portal/simuladores/electricidad_3_medio/',
    hubHref: '/curso/electricidad',
    lmsHref: '/portal/simuladores/electricidad_3_medio/',
    modules: ['Motores y calefacción', 'Instalaciones domiciliarias', 'Proyectos eléctricos', 'Mantenimiento eléctrico'],
    metrics: ['4 módulos', '646 h anuales', '178 h 3D']
  }
];

const courseCatalog = ((window.AulaTPSpecialtiesCatalog && window.AulaTPSpecialtiesCatalog.length)
  ? window.AulaTPSpecialtiesCatalog.map((course) => {
      const access = LIVE_ROUTE_ACCESS[course.id] || {};
      return {
        ...course,
        hubHref: access.hubHref || course.hubHref || (course.status === 'Disponible' ? course.href : null),
        lmsHref: access.lmsHref || course.lmsHref || null,
        enterLabel: access.enterLabel || null
      };
    })
  : fallbackCourseCatalog.slice()
).sort((a, b) => a.sort - b.sort);

const singleCourseCatalog = !isGeneralCatalog && (courseProfile.catalogMode === 'single' || currentCourseId === 'electricidad-3m');
let catalogSectorFilter = 'Todas';
let catalogSearchQuery = '';
try {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') || '').trim();
  const sector = (params.get('sector') || '').trim();
  if (q) catalogSearchQuery = q;
  if (sector) catalogSectorFilter = sector;
} catch (err) {}


function getCatalogSectors() {
  return [...new Set(courseCatalog.map((course) => course.sector || course.specialty).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

function sortCatalogCourses(courses) {
  return courses.slice().sort((a, b) => {
    const availA = a.status === 'Disponible' ? 0 : 1;
    const availB = b.status === 'Disponible' ? 0 : 1;
    if (availA !== availB) return availA - availB;
    const sectorA = a.sector || a.specialty || '';
    const sectorB = b.sector || b.specialty || '';
    const sectorCmp = sectorA.localeCompare(sectorB, 'es');
    if (sectorCmp) return sectorCmp;
    return String(a.title || '').localeCompare(String(b.title || ''), 'es');
  });
}

function filterCatalogCourses() {
  const query = catalogSearchQuery.trim().toLowerCase();
  return sortCatalogCourses(courseCatalog.filter((course) => {
    const sector = course.sector || course.specialty || '';
    if (catalogSectorFilter !== 'Todas' && sector !== catalogSectorFilter) return false;
    if (!query) return true;
    const haystack = [course.title, course.sector, course.specialty, course.summary].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  }));
}

function liveRoutes() {
  return sortCatalogCourses(courseCatalog.filter((course) => course.status === 'Disponible'));
}

function ensureCatalogToolbar(container) {
  let toolbar = container.previousElementSibling;
  if (toolbar && toolbar.classList.contains('catalog-toolbar')) return toolbar;
  toolbar = document.createElement('div');
  toolbar.className = 'catalog-toolbar';
  toolbar.setAttribute('data-catalog-toolbar', container.getAttribute('data-course-catalog') || 'main');
  const sectors = getCatalogSectors();
  const chips = ['Todas', ...sectors].map((sector) => (
    `<button type="button" class="catalog-sector-chip" data-sector-filter="${sector}">${sector}</button>`
  )).join('');
  toolbar.innerHTML = `
    <label class="catalog-search">
      <span class="visually-hidden">Buscar especialidad</span>
      <input type="search" data-catalog-search placeholder="Buscar especialidad o sector…" value="" />
    </label>
    <div class="catalog-sector-chips" role="group" aria-label="Filtrar por sector">${chips}</div>
  `;
  container.parentNode.insertBefore(toolbar, container);
  toolbar.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sector-filter]');
    if (!button) return;
    catalogSectorFilter = button.getAttribute('data-sector-filter') || 'Todas';
    renderCourseCatalogs();
  });
  toolbar.querySelector('[data-catalog-search]').addEventListener('input', (event) => {
    catalogSearchQuery = event.target.value || '';
    renderCourseCatalogs();
  });
  return toolbar;
}

function syncCatalogToolbar(container) {
  const toolbar = ensureCatalogToolbar(container);
  toolbar.querySelectorAll('[data-sector-filter]').forEach((button) => {
    button.classList.toggle('is-active', button.getAttribute('data-sector-filter') === catalogSectorFilter);
  });
  const search = toolbar.querySelector('[data-catalog-search]');
  if (search && document.activeElement !== search && search.value !== catalogSearchQuery) {
    search.value = catalogSearchQuery;
  }
}

function courseActionsMarkup(course, active) {
  const hub = course.hubHref || (course.status === 'Disponible' ? course.href : null);
  const lms = course.lmsHref || null;
  if (course.status !== 'Disponible' || !hub) {
    return `<div class="course-access-actions"><span class="course-select-link is-disabled" aria-disabled="true">Próximamente</span></div>`;
  }
  const primary = lms
    ? `<a href="${lms}" class="course-select-link ${active ? 'current' : ''}">${course.enterLabel || 'Entrar al LMS'}</a>`
    : `<a href="${hub}" class="course-select-link ${active ? 'current' : ''}">${course.enterLabel || 'Abrir ruta'}</a>`;
  const secondary = lms
    ? `<a href="${hub}" class="course-login-link">Ver ruta pedagógica</a>`
    : `<a href="#loginForm" class="course-login-link">Acceso institucional</a>`;
  return `<div class="course-access-actions">${primary}${secondary}</div>`;
}

function renderLiveRoutes() {
  const mount = document.querySelector('[data-live-routes]');
  if (!mount) return;
  if (!isGeneralCatalog) {
    mount.hidden = true;
    mount.innerHTML = '';
    return;
  }
  mount.hidden = false;
  const routes = liveRoutes();
  mount.innerHTML = `
    <div class="portal-live-kicker"><span>Abiertas ahora</span><strong>${routes.length} rutas pedagógicas</strong></div>
    <div class="portal-live-grid">
      ${routes.map((course, index) => {
        const hub = course.hubHref || course.href;
        const lms = course.lmsHref;
        return `
          <article class="portal-live-card tone-${index % 3}">
            <div class="portal-live-media"><img src="${course.image}" alt="${course.imageAlt || ''}" loading="lazy" decoding="async" /></div>
            <div class="portal-live-body">
              <small>${course.sector || course.specialty || ''} · ${course.level || ''}</small>
              <h3>${course.title}</h3>
              <p>${course.summary}</p>
              <ul>${(course.metrics || []).slice(0, 3).map((metric) => `<li>${metric}</li>`).join('')}</ul>
              <div class="portal-live-actions">
                <a class="portal-live-primary" href="${hub}">Ver ruta pedagógica</a>
                ${lms ? `<a class="portal-live-secondary" href="${lms}">Entrar al LMS</a>` : `<a class="portal-live-secondary" href="#loginForm">Acceso demo</a>`}
              </div>
            </div>
          </article>`;
      }).join('')}
    </div>`;
}

function renderCourseCatalogs() {
  renderLiveRoutes();
  const visibleCourses = singleCourseCatalog
    ? courseCatalog.filter((course) => course.id === currentCourseId)
    : isGeneralCatalog
      ? filterCatalogCourses()
      : courseCatalog.filter((course) => ['enfermeria-tens', 'electricidad-3m'].includes(course.id) || course.id === currentCourseId);
  const markup = visibleCourses.map((course) => {
    const active = course.id === currentCourseId;
    const available = course.status === 'Disponible' && (course.hubHref || course.href);
    const sectorLabel = course.sector || course.specialty || '';
    const statusClass = available ? 'is-available' : 'is-coming-soon';
    return `
      <details class="course-access-card ${active ? 'is-active' : ''} ${statusClass}" ${active && !isGeneralCatalog ? 'open' : ''}>
        <summary>
          <span class="course-access-media"><img src="${course.image}" alt="${course.imageAlt || ''}" loading="lazy" decoding="async" /></span>
          <span class="course-access-copy">
            <small>${sectorLabel} · ${course.level || ''}</small>
            <strong>${course.title}</strong>
            <em class="course-status-badge">${course.status}</em>
          </span>
          <b aria-hidden="true">⌄</b>
        </summary>
        <div class="course-access-detail">
          <p>${course.summary || ''}</p>
          <div class="course-access-metrics">${(course.metrics || []).map((metric) => `<span>${metric}</span>`).join('')}</div>
          <ol>${(course.modules || []).map((module, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span>${module}</li>`).join('')}</ol>
          ${courseActionsMarkup(course, active)}
        </div>
      </details>`;
  }).join('') || `<p class="catalog-empty">No hay especialidades que coincidan con el filtro.</p>`;
  document.querySelectorAll('[data-course-catalog]').forEach((container) => {
    container.classList.toggle('single-course', singleCourseCatalog);
    container.classList.toggle('course-catalog--grid', isGeneralCatalog);
    if (isGeneralCatalog && !singleCourseCatalog) syncCatalogToolbar(container);
    container.innerHTML = markup;
  });
  document.querySelectorAll('.portal-catalog-block').forEach((block) => {
    block.hidden = singleCourseCatalog;
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${COURSE_BASE_PATH}${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || 'No fue posible completar la operación.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

const defaultAccessibilityPreferences = {
  text_scale: 'normal',
  high_contrast: false,
  reduce_motion: false,
  simple_visual_mode: false,
  narration_enabled: false,
  sound_effects_enabled: true,
  ambient_sound: 'off',
  more_time: false,
  more_help: false,
  focus_highlight: false,
  spacious_layout: false,
  reading_guide: false,
  narration_speed: 'normal',
  audio_volume: 70,
  sound_confirmations: true
};
let accessibilityPreferences = {
  ...defaultAccessibilityPreferences,
  ...JSON.parse(localStorage.getItem('aulatp-accessibility-preferences') || '{}')
};
let accessibilitySaveTimer = null;
let ambientAudioContext = null;
let ambientAudioNodes = [];
let feedbackAudioContext = null;
let narrationStopRequested = false;

function accessibilityStatus(message) {
  const status = document.querySelector('#accessibilitySaveStatus');
  if (status) status.textContent = message;
}

function playInterfaceTone(tone = 'tap') {
  if (!accessibilityPreferences.sound_effects_enabled) return;
  if (!accessibilityPreferences.sound_confirmations && !['error', 'success'].includes(tone)) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  feedbackAudioContext ||= new AudioContextClass();
  const context = feedbackAudioContext;
  if (context.state === 'suspended') void context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const frequencies = {
    tap: [520, 700],
    success: [620, 840],
    error: [220, 180],
    switch: [430, 560],
  }[tone] || [520, 700];
  oscillator.type = tone === 'error' ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(frequencies[0], now);
  oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], now + 0.08);
  const volumeFactor = Math.max(0, Math.min(100, Number(accessibilityPreferences.audio_volume ?? 70))) / 100;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime((tone === 'error' ? 0.035 : 0.045) * volumeFactor, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.18);
}

function stopAmbientSound() {
  ambientAudioNodes.forEach((node) => {
    try { node.stop?.(); } catch (_) { /* already stopped */ }
    try { node.disconnect?.(); } catch (_) { /* already disconnected */ }
  });
  ambientAudioNodes = [];
  if (ambientAudioContext) void ambientAudioContext.close();
  ambientAudioContext = null;
}

function startAmbientSound(mode) {
  stopAmbientSound();
  if (mode === 'off') return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  ambientAudioContext = new AudioContextClass();
  const master = ambientAudioContext.createGain();
  const volumeFactor = Math.max(0, Math.min(100, Number(accessibilityPreferences.audio_volume ?? 70))) / 100;
  master.gain.value = 0.028 * volumeFactor;
  master.connect(ambientAudioContext.destination);
  const buffer = ambientAudioContext.createBuffer(1, ambientAudioContext.sampleRate * 4, ambientAudioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) channel[index] = (Math.random() * 2 - 1) * .35;
  const source = ambientAudioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ambientAudioContext.createBiquadFilter();
  filter.type = mode === 'water' ? 'bandpass' : 'lowpass';
  filter.frequency.value = mode === 'water' ? 900 : mode === 'nature' ? 520 : 240;
  filter.Q.value = mode === 'water' ? .7 : .25;
  source.connect(filter).connect(master);
  source.start();
  ambientAudioNodes = [source, filter, master];
}

function applyAccessibilityPreferences({ playAmbient = false } = {}) {
  const body = document.body;
  body.classList.toggle('a11y-text-large', accessibilityPreferences.text_scale === 'large');
  body.classList.toggle('a11y-text-extra-large', accessibilityPreferences.text_scale === 'extra_large');
  body.classList.toggle('a11y-high-contrast', accessibilityPreferences.high_contrast);
  body.classList.toggle('a11y-reduce-motion', accessibilityPreferences.reduce_motion);
  body.classList.toggle('a11y-simple-mode', accessibilityPreferences.simple_visual_mode);
  body.classList.toggle('a11y-more-time', accessibilityPreferences.more_time);
  body.classList.toggle('a11y-more-help', accessibilityPreferences.more_help);
  body.classList.toggle('a11y-focus-highlight', accessibilityPreferences.focus_highlight);
  body.classList.toggle('a11y-spacious-layout', accessibilityPreferences.spacious_layout);
  body.classList.toggle('a11y-reading-guide', accessibilityPreferences.reading_guide);
  document.querySelectorAll('[data-text-scale]').forEach((button) => button.classList.toggle('active', button.dataset.textScale === accessibilityPreferences.text_scale));
  document.querySelectorAll('[data-text-scale]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.textScale === accessibilityPreferences.text_scale)));
  document.querySelectorAll('[data-accessibility-key]').forEach((input) => {
    input.checked = Boolean(accessibilityPreferences[input.dataset.accessibilityKey]);
    input.closest('label')?.classList.toggle('enabled', input.checked);
  });
  document.querySelector('#ambientSound').value = accessibilityPreferences.ambient_sound;
  document.querySelector('#narrationSpeed').value = accessibilityPreferences.narration_speed;
  document.querySelector('#audioVolume').value = String(accessibilityPreferences.audio_volume);
  document.querySelector('#listenCurrentInstruction').classList.toggle('is-ready', accessibilityPreferences.narration_enabled);
  document.querySelector('#listenCurrentInstruction').setAttribute('aria-pressed', String(accessibilityPreferences.narration_enabled));
  document.querySelector('#stopNarration').disabled = !('speechSynthesis' in window);
  if (playAmbient) startAmbientSound(accessibilityPreferences.ambient_sound);
}

function queueAccessibilitySave(message = 'Guardando preferencias…') {
  localStorage.setItem('aulatp-accessibility-preferences', JSON.stringify(accessibilityPreferences));
  applyAccessibilityPreferences();
  accessibilityStatus(message);
  window.clearTimeout(accessibilitySaveTimer);
  accessibilitySaveTimer = window.setTimeout(async () => {
    try {
      await apiRequest('/api/preferences/accessibility', { method: 'PUT', body: JSON.stringify(accessibilityPreferences) });
      accessibilityStatus('Preferencias guardadas en tu cuenta.');
    } catch (error) {
      accessibilityStatus(error.status === 401 ? 'Preferencias guardadas en este dispositivo.' : 'Guardadas localmente; se sincronizarán al reconectar.');
    }
  }, 350);
}

function applyAccessibilityProfile(profile) {
  const profileSettings = {
    reading: {
      text_scale: 'large',
      focus_highlight: true,
      spacious_layout: true,
      reading_guide: true,
      more_help: true
    },
    calm: {
      reduce_motion: true,
      simple_visual_mode: true,
      ambient_sound: 'neutral',
      sound_effects_enabled: false,
      sound_confirmations: false
    },
    guided: {
      narration_enabled: true,
      more_time: true,
      more_help: true,
      focus_highlight: true,
      narration_speed: 'slow',
      audio_volume: 75
    }
  };
  if (!profileSettings[profile]) return;
  accessibilityPreferences = {
    ...accessibilityPreferences,
    ...profileSettings[profile]
  };
  startAmbientSound(accessibilityPreferences.ambient_sound);
  playInterfaceTone('success');
  const label = document.querySelector(`[data-accessibility-profile="${profile}"] strong`)?.textContent || 'Perfil rápido';
  queueAccessibilitySave(`${label} aplicado.`);
}

async function syncAccessibilityPreferences() {
  try {
    const response = await apiRequest('/api/preferences/accessibility');
    if (response.preferences && Object.keys(response.preferences).length) {
      accessibilityPreferences = { ...defaultAccessibilityPreferences, ...response.preferences };
      localStorage.setItem('aulatp-accessibility-preferences', JSON.stringify(accessibilityPreferences));
    } else {
      await apiRequest('/api/preferences/accessibility', { method: 'PUT', body: JSON.stringify(accessibilityPreferences) });
    }
  } catch (_) { /* local preferences remain available offline */ }
  applyAccessibilityPreferences();
}

function openAccessibilityPanel() {
  const panel = document.querySelector('#accessibilityPanel');
  closeTutorPanel({ restoreFocus: false });
  document.querySelector('#accessibilityBackdrop').hidden = false;
  panel.hidden = false;
  panel.scrollTop = 0;
  document.querySelector('#accessibilityButton').setAttribute('aria-expanded', 'true');
  document.querySelector('#closeAccessibility').focus();
}

function closeAccessibilityPanel() {
  document.querySelector('#accessibilityBackdrop').hidden = true;
  document.querySelector('#accessibilityPanel').hidden = true;
  document.querySelector('#accessibilityButton').setAttribute('aria-expanded', 'false');
  const focusTarget = !document.querySelector('#accessibilityButton')?.hidden
    ? document.querySelector('#accessibilityButton')
    : document.querySelector('#supportDockButton');
  focusTarget?.focus();
}

function currentInstructionText() {
  const scope = document.querySelector('.course-view.is-active') || document.querySelector('#authView:not([hidden])');
  if (!scope) return 'No hay una instrucción visible en este momento.';
  const candidates = [
    scope.querySelector('h1'),
    scope.querySelector('.activity-head p, .activity-lead, .ae-stage-detail-header p, .integrator-stage-panel p, .practice-question-body h2, .login-copy')
  ].filter(Boolean).map((element) => element.textContent.trim());
  return candidates.join('. ') || 'Revisa la información principal de esta pantalla y continúa cuando estés lista.';
}

function speakCurrentInstruction() {
  if (!accessibilityPreferences.narration_enabled) {
    accessibilityPreferences.narration_enabled = true;
    queueAccessibilitySave('Narración activada.');
  }
  if (!('speechSynthesis' in window)) {
    accessibilityStatus('La narración no está disponible en este navegador.');
    return;
  }
  narrationStopRequested = false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentInstructionText());
  utterance.lang = 'es-CL';
  const rates = { slow: 0.82, normal: 0.95, fast: 1.08 };
  utterance.rate = rates[accessibilityPreferences.narration_speed] || 0.95;
  utterance.volume = Math.max(0, Math.min(100, Number(accessibilityPreferences.audio_volume ?? 70))) / 100;
  utterance.onend = () => { if (!narrationStopRequested) accessibilityStatus('Narración finalizada.'); };
  utterance.onerror = () => { if (!narrationStopRequested) accessibilityStatus('No fue posible reproducir la narración.'); };
  window.speechSynthesis.speak(utterance);
  accessibilityStatus('Reproduciendo la instrucción visible.');
  playInterfaceTone('tap');
}

function showToast(message, tone = 'info') {
  let toast = document.querySelector('#appToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.className = `app-toast ${tone} visible`;
  toast.textContent = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

function serverModuleFor(module) {
  return serverModulesByNumber.get(Number(module.number));
}

function isModuleLocked(module) {
  if (reviewerMode) return false;
  const sequence = Number(module.number);
  const serverModule = serverModuleFor(module);
  if (serverModule?.locked) return true;
  if (!apiCourseState || sequence <= 1) return false;
  const previousModule = serverModulesByNumber.get(sequence - 1);
  return Boolean(previousModule && previousModule.progress_status !== 'completed');
}

function applyServerCourseState(state, hydrateProgress = true) {
  apiCourseState = state;
  reviewerMode = ['teacher', 'admin', 'superadmin'].includes(state.user.role) && sessionStorage.getItem('aulatp-reviewer-mode') === 'true';
  updateReviewerControls();
  serverModulesByNumber = new Map(state.modules.map((module) => [Number(module.sequence), module]));
  document.querySelector('#userFullName').textContent = state.user.full_name;
  document.querySelector('#userRole').textContent = state.user.role === 'student' ? 'Estudiante' : state.user.role;
  document.querySelector('#userInitials').textContent = state.user.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  document.querySelector('#serverProgress').textContent = `${Math.round(Number(state.enrollment.progress_percent))} %`;
  localStorage.setItem('aulatp-overall-progress', String(Math.round(Number(state.enrollment.progress_percent))));
  courseStarted = state.modules.some((module) => ['in_progress', 'completed'].includes(module.progress_status));
  localStorage.setItem('aulatp-course-started', String(courseStarted));

  if (hydrateProgress) {
    state.modules.forEach((moduleState) => {
      const completed = moduleState.activities.filter((activity) => activity.progress_status === 'completed').map((activity) => Number(activity.sequence));
      localStorage.setItem(`aulatp-context-${moduleState.sequence}-completed`, JSON.stringify(completed));
      if (completed.length) localStorage.setItem(`aulatp-context-${moduleState.sequence}-current`, String(Math.max(...completed)));
    });
    const inProgressModule = state.modules.find((module) => module.progress_status === 'in_progress');
    const currentSequence = Number(inProgressModule?.sequence || state.enrollment.current_module_sequence || 1);
    selected = modules.find((module) => Number(module.number) === currentSequence) || modules[0];
  }
}

async function loadServerCourseState(hydrateProgress = true) {
  const state = await apiRequest('/api/courses/current');
  applyServerCourseState(state, hydrateProgress);
  return state;
}

async function syncModuleStart(module) {
  const serverModule = serverModuleFor(module);
  if (!serverModule) return;
  try {
    await apiRequest(`/api/modules/${serverModule.id}/start`, { method: 'POST', body: '{}' });
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function syncActivityCompletion(module, activity) {
  const serverModule = serverModuleFor(module);
  const serverActivity = serverModule?.activities.find((item) => Number(item.sequence) === activity.number);
  if (!serverActivity) return;
  await apiRequest(`/api/activities/${serverActivity.id}/attempt`, {
    method: 'POST',
    body: JSON.stringify({
      response: { activity_type: activity.kind, validated_in_interface: true },
      score: 100,
      completed: true
    })
  });
  await loadServerCourseState(false);
}

function moduleIcon(module, extraClass = '') {
  return `<i class="module-icon icon-${module.icon} ${extraClass}" aria-hidden="true"></i>`;
}

function progressFor(module, started = courseStarted) {
  if (!started) return Math.max(0, (Number(module.number) - 1) * 20);
  return Number(module.number) * 20;
}

function updateCoursePanel(module, started = courseStarted, exactProgress) {
  const progress = currentCourseId === 'electricidad-3m' ? overallProgress(module) : (exactProgress ?? progressFor(module, started));
  if (currentCourseId === 'electricidad-3m') document.querySelector('#serverProgress').textContent = `${progress}% · curso`;
  document.querySelectorAll('[data-progress-number]').forEach((element) => { element.textContent = `${progress} %`; });
  document.querySelectorAll('[data-progress-fill]').forEach((element) => { element.style.width = `${progress}%`; });
  document.querySelectorAll('[data-progress-ring]').forEach((element) => { element.style.setProperty('--progress', `${progress * 3.6}deg`); });
  document.querySelectorAll('[data-current-module]').forEach((element) => { element.textContent = `${module.code} · ${module.short}`; });
  document.querySelectorAll('[data-course-status]').forEach((element) => { element.textContent = started ? 'En curso' : 'Disponible'; });
}

function buildRoute() {
  const activeNumber = Number(selected.number);
  route.innerHTML = modules.map((module, index) => {
    const moduleNumber = Number(module.number);
    const serverModule = serverModuleFor(module);
    const locked = isModuleLocked(module);
    const rawState = serverModule?.progress_status === 'completed' ? 'completed' : moduleNumber === activeNumber ? 'selected' : locked ? 'locked' : 'available';
    const state = rawState === 'selected' ? 'selected' : rawState === 'completed' ? 'completed' : '';
    const stateLabel = rawState === 'completed' ? 'Completado' : rawState === 'selected' ? 'En curso' : rawState === 'locked' ? 'Bloqueado' : 'Disponible';
    return `
      <article class="route-item ${module.color} ${state} ${locked ? 'locked' : ''}" data-route-state="${rawState}">
        <button class="route-select" type="button" data-module="${module.number}" aria-label="Seleccionar módulo ${module.number}: ${module.title}">
          <span class="step">${moduleNumber < activeNumber ? '✓' : module.number}</span>
          <span class="module-code">${module.code}</span><small>${module.short}</small>
          <span class="route-icon">${moduleIcon(module)}</span>
          <h3>${module.routeTitle.replace(/\n/g, '<br />')}</h3>
          <span class="route-state-badge">${stateLabel}</span>
          <span class="hours"><strong>${module.hours}</strong><i></i><strong>${module.hours3d}</strong></span>
        </button>
        <button class="route-enter" type="button" data-enter="${module.number}" ${locked ? 'disabled' : ''}>${locked ? 'Módulo bloqueado' : `Ingresar Módulo ${module.number}`}</button>
        ${index < modules.length - 1 ? '<span class="route-arrow" aria-hidden="true">›</span>' : ''}
      </article>`;
  }).join('') + `<div class="route-line" aria-hidden="true"><span style="width:${progressFor(selected, false)}%"></span></div>`;
}

function buildTabs() {
  tabs.innerHTML = modules.map((module) => `
    <button type="button" class="module-tab ${module.number === selected.number ? 'active' : ''}" data-module="${module.number}">
      <strong>${module.code}</strong><span>${module.short}</span>
    </button>
  `).join('');
}

function showSelected(module) {
  selected = module;
  localStorage.setItem('aulatp-current-module', module.number);
  buildRoute();
  buildTabs();
  document.querySelector('#detailEyebrow').textContent = `MÓDULO ${module.number.padStart(2, '0')} · ${module.code} · ${module.hours.toUpperCase()}`;
  document.querySelector('#detailTitle').textContent = module.title;
  document.querySelector('#detailDescription').textContent = module.description;
  document.querySelector('#detailOutcomes').innerHTML = module.outcomes.map((outcome) => `<li>${outcome}</li>`).join('');
  document.querySelector('#detailIcon').className = `module-icon icon-${module.icon}`;
  document.querySelector('#detailButtonNumber').textContent = module.number;
  document.querySelector('#enterDetail').disabled = isModuleLocked(module);
  const serverProgress = Number(apiCourseState?.enrollment?.progress_percent);
  const savedProgress = Number.isFinite(serverProgress) ? Math.round(serverProgress) : Number.parseInt(localStorage.getItem('aulatp-overall-progress') || '', 10);
  updateCoursePanel(module, courseStarted, Number.isFinite(savedProgress) ? savedProgress : undefined);
}

function internalProgress() {
  return moduleCompletionSummary(selected).percent;
}

function moduleCompletionSummary(module) {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const contextTotal = module.number === '1' ? contextualizationStepsExtended.length : contextualizationStepsBrief.length;
  const count = (values, max) => new Set((values || []).map(Number).filter((n) => n >= 1 && n <= max)).size;
  const context = count(read(`aulatp-context-${module.number}-completed`, []), contextTotal);
  const ae = aeSequenceList(module).reduce((sum, sequence) => sum + count(read(`aulatp-ae-${module.number}-${sequence}-completed`, []), 6), 0);
  const integrator = count(read(`aulatp-integrator-${module.number}`, {}).completedSteps, 4);
  const evaluation = loadEvaluationState(module).completed ? 1 : 0;
  const total = contextTotal + expectedAeCount(module) * 6 + 4 + 1;
  const done = context + ae + integrator + evaluation;
  return { done, total, percent: Math.round(done / total * 100) };
}

function overallProgress(module) {
  const summaries = modules.map(moduleCompletionSummary);
  return Math.round(summaries.reduce((sum, item) => sum + item.done, 0) / summaries.reduce((sum, item) => sum + item.total, 0) * 100);
}

function expectedAeCount(module = selected) {
  const titles = aeTitlesByModule?.[module?.number];
  return Array.isArray(titles) && titles.length ? Math.min(3, Math.max(1, titles.length)) : 3;
}

function aeSequenceList(module = selected) {
  return Array.from({ length: expectedAeCount(module) }, (_, index) => index + 1);
}

function normalizeInternalStage(stageIndex, module = selected) {
  const bounded = Math.max(0, Math.min(Number(stageIndex) || 0, internalStages.length - 1));
  if (bounded >= 1 && bounded <= 3 && bounded > expectedAeCount(module)) return 4;
  return bounded;
}

function nextInternalStage(stageIndex, module = selected) {
  const count = expectedAeCount(module);
  if (stageIndex === 0) return 1;
  if (stageIndex >= 1 && stageIndex < count) return stageIndex + 1;
  if (stageIndex >= 1 && stageIndex <= 3) return 4;
  return Math.min(stageIndex + 1, internalStages.length - 1);
}

function aeForStage(stageIndex) {
  if (stageIndex <= 1) return 1;
  if (stageIndex === 2) return 2;
  return Math.min(3, expectedAeCount(selected));
}

function overviewStations(module = selected) {
  return [
    { index: STAGE_CONTEXT, name: 'Contextualización', titleHtml: 'Contextualización', subtitle: 'Comprender la situación', icon: 'document', tone: 'green', activity: 'Introducción al caso', duration: '45 min', purpose: 'Comprendo la situación técnica o laboral', reflection: '¿Qué te llamó la atención de esta situación y qué sabes ya sobre ella?' },
    { index: 1, name: 'Aprendizajes Esperados', titleHtml: 'Aprendizajes<br>Esperados', subtitle: 'Analiza, comprende y aplica', icon: 'book', tone: 'blue', activity: 'Secuencia pedagógica', duration: '6 h', purpose: 'Analizo, comprendo y aplico los aprendizajes esperados', reflection: '¿Qué aprendizaje esperado te resulta más exigente y por qué?' },
    { index: STAGE_INTEGRATOR, name: 'Situación Integradora', titleHtml: 'Situación<br>Integradora', subtitle: 'Resuelve en contexto', icon: 'cube', tone: 'purple', activity: 'Caso aplicado', duration: '3 h', purpose: 'Resuelvo una situación integradora en contexto real', reflection: '¿Qué decisión técnica tomarías primero en esta situación integradora?' },
    { index: STAGE_EVALUATION, name: 'Evaluación Final', titleHtml: 'Evaluación Final', subtitle: 'Demuestra lo aprendido', icon: 'clipboard', tone: 'orange', activity: 'Evaluación', duration: '2 h', purpose: 'Demuestro lo aprendido en la evaluación final', reflection: '¿Con qué evidencia demostrarías que lograste este módulo?' },
    { index: STAGE_FEEDBACK, name: 'Retroalimentación y Cierre', titleHtml: 'Retroalimentación<br>y Cierre', subtitle: 'Reflexiona y avanza', icon: 'flag', tone: 'pink', activity: 'Cierre', duration: '1 h', purpose: 'Reflexiono sobre mi avance y proyecto el módulo siguiente', reflection: '¿Qué harías distinto si repitieras este módulo?' }
  ];
}

/* —— Dirección propia para cada módulo y estación ——
   La ruta vive en la URL (?modulo=…&estacion=…) para poder compartir,
   marcar como favorita y volver con el botón atrás del navegador. */
function routeSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function moduleRouteSlug(module) {
  return module ? `${module.number}-${routeSlug(module.short || module.title)}` : '';
}

function stationRouteSlug(station) {
  return station ? routeSlug(station.name) : '';
}

function moduleFromRoute(value) {
  const slug = routeSlug(value);
  if (!slug) return null;
  const number = slug.split('-')[0];
  return modules.find((module) => moduleRouteSlug(module) === slug)
    || modules.find((module) => routeSlug(module.short || module.title) === slug)
    || modules.find((module) => String(module.number) === number)
    || null;
}

function stationIndexFromRoute(value, module = selected) {
  const slug = routeSlug(value);
  if (!slug) return -1;
  return overviewStations(module).findIndex((station) => stationRouteSlug(station) === slug);
}

function currentOverviewStation(module = selected) {
  const stations = overviewStations(module);
  return stations[Math.max(0, Math.min(selectedOverviewIndex, stations.length - 1))] || stations[0];
}

let restoringCourseRoute = false;

function courseDocumentTitle() {
  const courseTitle = courseProfile.title || 'Aula TP Chile';
  const insideModule = document.querySelector('#learningView')?.classList.contains('is-active');
  if (!insideModule || !selected) return `Aula TP Chile · ${courseTitle}`;
  const station = currentOverviewStation(selected);
  return `Módulo ${selected.number} · ${selected.short} — ${station ? station.name : ''} | ${courseTitle}`;
}

function syncCourseUrl({ replace = false } = {}) {
  if (restoringCourseRoute || typeof history.pushState !== 'function') return;
  const url = new URL(window.location.href);
  const insideModule = document.querySelector('#learningView')?.classList.contains('is-active');
  if (insideModule && selected) {
    url.searchParams.set('modulo', moduleRouteSlug(selected));
    url.searchParams.set('estacion', stationRouteSlug(currentOverviewStation(selected)));
  } else {
    url.searchParams.delete('modulo');
    url.searchParams.delete('estacion');
  }
  document.title = courseDocumentTitle();
  const next = `${url.pathname}${url.search}`;
  if (next === `${window.location.pathname}${window.location.search}`) return;
  history[replace ? 'replaceState' : 'pushState']({ aulatp: true }, '', next);
}

function applyCourseRoute() {
  const params = new URLSearchParams(window.location.search);
  const module = moduleFromRoute(params.get('modulo'));
  restoringCourseRoute = true;
  try {
    if (!module) {
      openAccessView();
      return;
    }
    if (isModuleLocked(module) && !reviewerMode) {
      openAccessView();
      showToast('Ese módulo todavía está bloqueado. Completa el anterior para abrirlo.', 'error');
      return;
    }
    enterModule(module);
    const stationIndex = stationIndexFromRoute(params.get('estacion'), module);
    if (stationIndex >= 0) {
      const station = overviewStations(module)[stationIndex];
      const state = station ? overviewStationState(station.index, module) : 'locked';
      if (reviewerMode || state !== 'locked') {
        selectedOverviewIndex = stationIndex;
        renderModuleScreen(module);
      }
    }
  } finally {
    restoringCourseRoute = false;
  }
  syncCourseUrl({ replace: true });
}

const overviewStationIcons = {
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7c-2.2-2-5.5-2.5-8-1v13c2.5-1 5.8-.6 8 1 2.2-1.6 5.5-2 8-1V6c-2.5-1-5.8-.6-8 1z"/><path d="M12 7v13"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 21 8v8l-9 5-9-5V8z"/><path d="M12 13V3M12 13l9-5M12 13 3 8"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4h6v1"/><path d="m9 13 2 2 4-4"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v18"/><path d="M6 5h10l-2 3 2 3H6"/></svg>'
};

function overviewVisualIndexForStage(stageIndex, module = selected) {
  if (stageIndex >= 1 && stageIndex <= expectedAeCount(module)) return 1;
  const idx = overviewStations(module).findIndex((station) => station.index === stageIndex);
  return idx < 0 ? 0 : idx;
}

function overviewStationState(index, module = selected) {
  const aeCount = expectedAeCount(module);
  if (index === 1) {
    if (activeInternalStage > aeCount) return 'completed';
    if (activeInternalStage >= 1 && activeInternalStage <= aeCount) return 'active';
    return 'locked';
  }
  if (index < activeInternalStage) return 'completed';
  if (index === activeInternalStage) return 'active';
  return 'locked';
}

function buildInternalRoute() {
  const stations = overviewStations(selected);
  document.querySelector('#internalRoute').innerHTML = stations.map((station, visualIndex) => {
    const state = overviewStationState(station.index);
    const locked = state === 'locked' && !reviewerMode;
    const status = state === 'completed' ? 'Completada' : state === 'active' ? 'En desarrollo' : locked ? 'Bloqueada' : 'Disponible';
    const selectedClass = visualIndex === selectedOverviewIndex ? ' is-selected' : '';
    const lastClass = visualIndex === stations.length - 1 ? ' is-last' : '';
    return `
    <button type="button" class="internal-step is-${state} ${state}${selectedClass}${lastClass}" data-internal-stage="${station.index}" aria-label="${station.name}${locked ? ', bloqueada' : ''}" ${locked ? 'disabled' : ''} ${state === 'active' ? 'aria-current="step"' : ''}>
      <span class="internal-number">${state === 'completed' ? '✓' : visualIndex + 1}</span>
      <strong>Estación ${visualIndex + 1}</strong>
      <em>${station.name}</em>
      <span class="internal-time">${station.duration || ''}</span>
      <small class="internal-status">${status}</small>
    </button>`;
  }).join('');
}

function buildAeTabs() {
  document.querySelector('#aeTabs').innerHTML = aeSequenceList(selected).map((ae) => `
    <button type="button" role="tab" aria-selected="${ae === activeAe}" class="ae-tab ${ae === activeAe ? 'active' : ''}" data-ae="${ae}">AE ${ae}</button>
  `).join('');
}

function buildPedagogicalStages() {
  const activePedagogicalStage = [0, 1, 2, 3, 3, 4, 5][activeInternalStage];
  document.querySelector('#pedagogicalStages').innerHTML = pedagogicalStages.map((stage, index) => {
    const state = index < activePedagogicalStage ? 'completed' : index === activePedagogicalStage ? 'active' : 'available';
    const lastClass = index === pedagogicalStages.length - 1 ? ' is-last' : '';
    return `
    <div class="pedagogical-stage is-${state} ${state}${lastClass}" ${state === 'active' ? 'aria-current="step"' : ''}>
      <span aria-hidden="true">${state === 'completed' ? '✓' : stage.symbol}</span><strong>${stage.name}</strong>
    </div>`;
  }).join('');
}

function updateAdvanceButton() {
  const button = document.querySelector('#advanceStage');
  const label = document.querySelector('#advanceStageLabel');
  const stations = overviewStations(selected);
  const station = stations[Math.max(0, Math.min(selectedOverviewIndex, stations.length - 1))];
  const state = overviewStationState(station.index);
  const locked = (state === 'locked' || state === 'available') && !reviewerMode;
  if (button) button.disabled = locked;
  if (label) label.textContent = locked ? 'Estación pendiente' : state === 'completed' ? 'Revisar estación' : 'Continuar';
  const previous = document.querySelector('#backToModuleFooter');
  if (previous) previous.setAttribute('aria-label', selectedOverviewIndex > 0 ? 'Ir a la estación anterior' : 'Volver a la portada del curso');
}

function setNodeText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function stationReflectionKey(module, station) {
  return `aulatp-station-note-${courseProfile.id || 'curso'}-${module.number}-${stationRouteSlug(station)}`;
}

function readStationReflection(module, station) {
  try {
    const stored = JSON.parse(localStorage.getItem(stationReflectionKey(module, station)) || 'null');
    return { text: stored?.text || '', checked: Boolean(stored?.checked) };
  } catch (_) {
    return { text: '', checked: false };
  }
}

function writeStationReflection() {
  const station = currentOverviewStation(selected);
  const templateVisible = !document.querySelector('#stationTemplateBody')?.hidden;
  const input = document.querySelector(templateVisible ? '#stationTemplateReflectInput' : '#stationReflectInput');
  const check = document.querySelector(templateVisible ? '#stationTemplateReflectCheck' : '#stationReflectCheck');
  if (!station || !input || !check) return;
  try {
    localStorage.setItem(stationReflectionKey(selected, station), JSON.stringify({ text: input.value, checked: check.checked }));
  } catch (_) { /* almacenamiento no disponible */ }
}

function stationTemplatePercent(module, kind) {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  if (kind === 'context') {
    const total = module.number === '1' ? contextualizationStepsExtended.length : contextualizationStepsBrief.length;
    return Math.round(new Set(read(`aulatp-context-${module.number}-completed`, []).map(Number)).size / total * 100);
  }
  if (kind === 'ae') {
    const total = expectedAeCount(module) * 6;
    const done = aeSequenceList(module).reduce((sum, sequence) => sum + new Set(read(`aulatp-ae-${module.number}-${sequence}-completed`, []).map(Number)).size, 0);
    return Math.round(done / total * 100);
  }
  if (kind === 'integrator') return Math.round(new Set(read(`aulatp-integrator-${module.number}`, {}).completedSteps || []).size / 4 * 100);
  if (kind === 'evaluation') {
    const state = loadEvaluationState(module);
    if (state.completed) return 100;
    const content = evaluationContent(module);
    return content?.questions?.length ? Math.round(Object.keys(state.answers || {}).length / content.questions.length * 100) : 0;
  }
  return moduleCompletionSummary(module).percent;
}

function stationTemplateReflection(module, station) {
  const reflection = readStationReflection(module, station);
  return `<section class="station-template-reflection" aria-labelledby="stationTemplateReflectTitle">
    <div><h3 id="stationTemplateReflectTitle"><span aria-hidden="true">✎</span> Tu reflexión en esta etapa</h3><p>${station.reflection}</p></div>
    <textarea id="stationTemplateReflectInput" rows="3" placeholder="Escribe aquí tu respuesta…" aria-label="Tu reflexión sobre esta estación">${escapePdfHtml(reflection.text)}</textarea>
    <label><input type="checkbox" id="stationTemplateReflectCheck" ${reflection.checked ? 'checked' : ''}/> He leído la información de esta estación y estoy listo/a para continuar.</label>
  </section>`;
}

function stationTemplateInfoCard(icon, title, body, tone = '') {
  return `<article class="station-template-info ${tone}"><span class="station-template-info__icon" aria-hidden="true">${icon}</span><div><h3>${title}</h3>${body}</div></article>`;
}

function stationTwoTemplate(module, station) {
  const titles = aeTitlesByModule[module.number] || module.outcomes || [];
  const active = Math.min(activeAe, titles.length || 1);
  const stageIndex = Math.max(0, Math.min(5, [0, 1, 2, 3, 3, 4, 5][activeInternalStage] || 0));
  return `<div class="station-template station-template--ae">
    <section class="station-template-ae-card">
      <div class="station-template-ae-tabs" role="tablist" aria-label="Aprendizajes esperados">${titles.map((_, index) => `<button type="button" data-template-ae="${index + 1}" class="${index + 1 === active ? 'is-active' : ''}" role="tab" aria-selected="${index + 1 === active}">AE ${index + 1}</button>`).join('')}</div>
      <div class="station-template-ae-copy"><small>APRENDIZAJE ESPERADO ${active} DE ${titles.length}</small><h3>${titles[active - 1] || module.outcomes?.[active - 1] || 'Aprendizaje esperado del módulo'}</h3><p>${module.outcomes?.[active - 1] || module.description}</p></div>
    </section>
    <section class="station-template-progression"><header><h3>La progresión de aprendizaje en esta estación</h3><p>Avanzarás siguiendo una ruta de 6 etapas.</p></header><div>${pedagogicalStages.map((stage, index) => `<article class="${index < stageIndex ? 'is-complete' : index === stageIndex ? 'is-active' : ''}"><span>${index < stageIndex ? '✓' : index + 1}</span><strong>${stage.name}</strong><small>${aeStageDescriptions[index]}</small></article>`).join('')}</div></section>
    ${stationTemplateReflection(module, station)}
  </div>`;
}

function stationThreeTemplate(module) {
  const content = integratorContent(module);
  const situations = (content?.progressiveSituations || []).slice(0, 5);
  const caseData = moduleCaseFor(module) || {};
  return `<div class="station-template station-template--integrator">
    <div class="station-template-summary-grid">
      ${stationTemplateInfoCard('◎', 'Propósito de esta estación', `<p>Moviliza los aprendizajes del módulo en escenarios que requieren análisis, aplicación y toma de decisiones.</p>`, 'is-purple')}
      ${stationTemplateInfoCard('▦', 'Esta estación contempla', `<p><strong>${content?.progressiveSituations?.length || 15} situaciones integradoras</strong> vinculadas con los aprendizajes esperados.</p><p><strong>1 situación final en 3D</strong> para integrar lo aprendido.</p>`, 'is-blue')}
    </div>
    <section class="station-template-cases"><header><div><h3>Situaciones integradoras (1 – ${content?.progressiveSituations?.length || 15})</h3><p>Selecciona una situación para comenzar y toma decisiones en contexto.</p></div></header><div class="station-template-case-grid">${situations.length ? situations.map((item, index) => `<article class="${index === 0 ? 'is-active' : ''}"><span>${index + 1}</span><img src="${item.image || defaultPracticeVisual(module)}" alt="${item.imageAlt || 'Situación técnica del módulo'}" loading="lazy"/><strong>${item.title || item.focus || `Situación ${index + 1}`}</strong><small>${item.subtitle || item.prompt || 'Análisis y toma de decisiones'}</small><em>${index === 0 ? 'Comenzar →' : 'Bloqueada'}</em></article>`).join('') : `<article class="is-active"><span>1</span><img src="${defaultPracticeVisual(module)}" alt="${caseData.imageAlt || 'Caso técnico'}"/><strong>${caseData.patient || module.short}</strong><small>Análisis y toma de decisiones</small><em>Comenzar →</em></article>`}</div></section>
  </div>`;
}

function stationFourTemplate(module) {
  const content = evaluationContent(module);
  const questionCount = content?.questions?.length || 25;
  return `<div class="station-template station-template--evaluation">
    <div class="station-template-summary-grid is-three">
      ${stationTemplateInfoCard('▤', '¿Qué incluye?', `<ul><li><strong>${questionCount} preguntas</strong> de selección múltiple.</li><li><strong>1 situación de desarrollo</strong>.</li></ul>`, 'is-gold')}
      ${stationTemplateInfoCard('◎', '¿Cuál es el propósito?', `<p>Evaluar tu nivel de logro aplicando y analizando los conocimientos en un escenario integrador.</p>`, 'is-blue')}
      ${stationTemplateInfoCard('★', 'Importante', `<ul><li>Dispones de reintentos para aprender de cada respuesta.</li><li>Las respuestas se registran automáticamente.</li><li>Lee cada pregunta con atención.</li></ul>`, 'is-warm')}
    </div>
    <section class="station-template-evaluation"><nav><strong>Preguntas (1 – ${questionCount})</strong><span>Situación de desarrollo</span></nav><h3>Resumen de la evaluación</h3><p>Completa las preguntas y luego desarrolla la situación final.</p><div><article><span>▤</span><strong>${questionCount} preguntas</strong><small>Selección múltiple · ${questionCount} puntos</small></article><article><span>✎</span><strong>1 situación de desarrollo</strong><small>Aplicación, análisis y justificación</small></article></div><p class="station-template-callout">La situación de desarrollo presenta un caso integrador donde deberás analizar información, tomar decisiones y justificar tu respuesta.</p></section>
  </div>`;
}

function stationFiveTemplate(module) {
  const scores = [
    ['Contextualización', stationTemplatePercent(module, 'context'), 'green'],
    ['Aprendizajes esperados', stationTemplatePercent(module, 'ae'), 'blue'],
    ['Situación Integradora', stationTemplatePercent(module, 'integrator'), 'purple'],
    ['Evaluación Final', stationTemplatePercent(module, 'evaluation'), 'orange']
  ];
  const average = Math.round(scores.reduce((sum, item) => sum + item[1], 0) / scores.length);
  return `<div class="station-template station-template--feedback">
    <div class="station-template-summary-grid is-three">
      ${stationTemplateInfoCard('▰', '¿Qué incluye?', `<ul><li>Revisión de tus resultados.</li><li>Retroalimentación personalizada.</li><li>Reflexión final y plan de mejora.</li></ul>`, 'is-pink')}
      ${stationTemplateInfoCard('◎', '¿Cuál es el propósito?', `<ul><li>Reconocer avances e identificar oportunidades de mejora.</li><li>Definir próximos pasos.</li></ul>`, 'is-blue')}
      ${stationTemplateInfoCard('▥', 'Importante', `<ul><li>Analiza tu desempeño en cada estación.</li><li>Identifica fortalezas y aspectos a mejorar.</li><li>Define acciones para seguir avanzando.</li></ul>`, 'is-warm')}
    </div>
    <section class="station-template-performance"><nav><strong>Tu desempeño en el módulo</strong><span>Retroalimentación</span><span>Reflexión y plan de mejora</span></nav><h3>Resumen de resultados</h3><p>Aquí puedes revisar tu desempeño general en las estaciones del módulo.</p><div class="station-template-score-grid">${scores.map(([label, score, tone], index) => `<article class="tone-${tone}"><span>${index + 1}</span><strong>${label}</strong><b>${score} %</b><i><u style="width:${score}%"></u></i></article>`).join('')}<article class="station-template-overall"><span>${average}%</span><div><strong>${average >= 80 ? '¡Buen trabajo!' : 'Sigue avanzando'}</strong><small>Tu progreso se actualiza con las actividades completadas.</small></div></article></div></section>
  </div>`;
}

function renderStationTemplate(module, station, ordinal) {
  const learning = document.querySelector('#learningView');
  const template = document.querySelector('#stationTemplateBody');
  const generic = document.querySelector('#stationGenericBody');
  const focus = document.querySelector('#moduleFocusRow');
  const useTemplate = ordinal >= 2;
  if (learning) learning.dataset.stationTemplate = useTemplate ? `station-${ordinal}` : '';
  if (template) template.hidden = !useTemplate;
  if (generic) generic.hidden = useTemplate;
  if (focus) focus.hidden = useTemplate;
  if (!useTemplate || !template) return;
  template.innerHTML = ordinal === 2 ? stationTwoTemplate(module, station)
    : ordinal === 3 ? stationThreeTemplate(module)
      : ordinal === 4 ? stationFourTemplate(module)
        : stationFiveTemplate(module);
}

function renderStationCard(module, station, ordinal) {
  const caseData = moduleCaseFor(module) || {};
  const icon = document.querySelector('#stationCardIcon');
  if (icon) icon.innerHTML = overviewStationIcons[station.icon] || '';
  setNodeText('#stationCardTitle', `Estación ${ordinal} · ${station.name}`);
  setNodeText('#stationCardPurpose', station.purpose || station.subtitle);
  setNodeText('#stationCardDuration', station.duration || module.hours3d);
  const image = document.querySelector('#stationCaseImage');
  if (image) {
    image.src = defaultPracticeVisual(module);
    image.alt = caseData.imageAlt || `Caso del módulo ${module.number}: ${module.short}`;
  }
  setNodeText('#stationCaseTitle', caseData.patient || module.short);
  setNodeText('#stationCaseText', caseData.centerSummary || module.description);
  const objectives = document.querySelector('#stationObjectives');
  if (objectives) objectives.innerHTML = (module.outcomes || []).map((outcome) => `<li>${outcome}</li>`).join('');
  setNodeText('#stationContentTitle', module.contentTitle || '');
  setNodeText('#stationContentText', module.content || '');
  setNodeText('#stationReflectPrompt', station.reflection || '¿Qué idea quieres recordar de esta estación?');
  const reflection = readStationReflection(module, station);
  const input = document.querySelector('#stationReflectInput');
  if (input) input.value = reflection.text;
  const check = document.querySelector('#stationReflectCheck');
  if (check) check.checked = reflection.checked;
  renderStationTemplate(module, station, ordinal);
}

function renderModuleScreen(module) {
  activeInternalStage = normalizeInternalStage(activeInternalStage, module);
  activeAe = Math.min(Math.max(1, activeAe), expectedAeCount(module));
  const stations = overviewStations(module);
  selectedOverviewIndex = Math.max(0, Math.min(selectedOverviewIndex, stations.length - 1));
  const moduleProgress = internalProgress();
  const generalProgress = overallProgress(module);
  localStorage.setItem('aulatp-overall-progress', String(generalProgress));

  document.querySelector('#moduleHero').className = `module-hero tone-${module.color}`;
  const heroTitleEl = document.querySelector('#moduleHeroTitle');
  if (heroTitleEl) heroTitleEl.textContent = courseProfile.title || module.short;
  const moduleLineEl = document.querySelector('#moduleScreenTitle');
  if (moduleLineEl) moduleLineEl.textContent = `Módulo ${module.number} · ${module.title}`;
  const currentOverview = stations[selectedOverviewIndex] || stations[0];
  const activeOverview = stations.find((item) => overviewStationState(item.index, module) === 'active') || stations[0];
  const stationOrdinal = selectedOverviewIndex + 1;
  const activeOrdinal = stations.findIndex((item) => item.index === activeOverview.index) + 1;
  const overviewPct = Math.round((Math.max(stationOrdinal, 1) / stations.length) * 100);
  const setText = (id, value) => { const el = document.querySelector(id); if (el) el.textContent = value; };
  if (stationOrdinal >= 2) {
    if (heroTitleEl) heroTitleEl.textContent = `Estación ${stationOrdinal}. ${currentOverview.name}`;
    if (moduleLineEl) moduleLineEl.textContent = `Módulo ${module.number} · ${module.title}`;
  }
  const oaLabel = module.code.split('·').pop().trim();
  setText('#moduleOaChip', oaLabel);
  setText('#moduleNumChip', `Módulo ${module.number}`);
  setText('#moduleStationChip', `Estación ${stationOrdinal}`);
  setText('#moduleStationChipName', currentOverview.name);
  setText('#moduleStationName', currentOverview.name);
  setText('#moduleStationMeta', `Estación ${stationOrdinal} de ${stations.length}`);
  const heroDescription = document.querySelector('#moduleHeroDescription');
  if (heroDescription) {
    const description = courseProfile.moduleHeroDescriptions?.[module.number] || module.description || '';
    heroDescription.textContent = description;
    heroDescription.hidden = !description;
  }
  const routeTitle = document.querySelector('#internalRouteTitle');
  if (routeTitle) routeTitle.innerHTML = `<span aria-hidden="true">▦</span> Ruta del módulo (${stations.length} estaciones)`;
  const heroFill = document.querySelector('#moduleHeroProgressFill');
  if (heroFill) heroFill.style.width = `${overviewPct}%`;
  setText('#moduleHeroProgressLabel', `${stationOrdinal} / ${stations.length} estaciones`);
  setText('#screenStationIndex', `${stationOrdinal} / ${stations.length}`);
  setText('#screenActivityType', currentOverview.activity || currentOverview.subtitle);
  setText('#screenModuleName', currentOverview.name);
  const overviewState = overviewStationState(currentOverview.index, module);
  const statusEl = document.querySelector('#screenStationStatus');
  if (statusEl) {
    statusEl.textContent = overviewState === 'completed' ? 'Completada' : overviewState === 'active' ? 'En desarrollo' : overviewState === 'locked' ? 'Bloqueada' : 'Pendiente';
    statusEl.classList.toggle('is-pending', overviewState === 'available' || overviewState === 'locked');
    statusEl.classList.toggle('is-completed', overviewState === 'completed');
  }
  document.querySelector('#screenCompetencies') && (document.querySelector('#screenCompetencies').textContent = competencies[module.number]);
  setText('#screenOA', oaLabel);
  setText('#screenDuration', currentOverview.duration || module.hours3d);
  setText('#screenAeList', aeSequenceList(module).map((ae) => `AE ${ae}`).join(', ').replace(/, AE ([^,]+)$/, ' y AE $1'));
  const completion = moduleCompletionSummary(selected);
  const progressEl = document.querySelector('#screenProgress');
  if (progressEl) progressEl.textContent = `${moduleProgress}% · ${completion.done} de ${completion.total} actividades`;
  const progressFill = document.querySelector('#screenProgressFill');
  if (progressFill) progressFill.style.width = `${moduleProgress}%`;
  setText('#currentModuleCount', `${module.number} de ${modules.length}`);
  setText('#currentStationCount', `${stationOrdinal} de ${stations.length}`);
  setText('#currentOaActive', oaLabel);
  renderStationCard(module, currentOverview, stationOrdinal);
  const moduleStatusEl = document.querySelector('[data-module-status]');
  if (moduleStatusEl) {
    const serverModule = serverModuleFor(module);
    moduleStatusEl.textContent = serverModule?.progress_status === 'completed' ? 'Completado' : courseStarted ? 'En curso' : 'Disponible';
  }
  document.querySelector('#currentStageName') && (document.querySelector('#currentStageName').textContent = internalStages[activeInternalStage].name);
  document.querySelector('#currentAeName') && (document.querySelector('#currentAeName').textContent = `AE ${activeAe}`);
  const selectedAeLabel = document.querySelector('#selectedAeLabel');
  if (selectedAeLabel) selectedAeLabel.textContent = `AE ${activeAe}`;
  const stageExplanation = document.querySelector('#stageExplanation');
  if (stageExplanation) stageExplanation.textContent = stageExplanations[activeAe];
  const moduleAeCenterImage = courseProfile.aeCenterImages?.[module.number];
  const aeCenterImage = document.querySelector('#aeCenterImage');
  if (moduleAeCenterImage && aeCenterImage) {
    aeCenterImage.src = moduleAeCenterImage.src;
    aeCenterImage.alt = moduleAeCenterImage.alt;
  }

  buildInternalRoute();
  buildAeTabs();
  buildPedagogicalStages();
  updateAdvanceButton();
  updateCoursePanel(module, true, generalProgress);
}

function showCourseView(viewId) {
  updateCoursePanel(selected);
  document.querySelectorAll('.course-view').forEach((view) => {
    const isActive = view.id === viewId;
    view.hidden = !isActive;
    view.classList.toggle('is-active', isActive);
    view.setAttribute('aria-hidden', String(!isActive));
  });
  syncPracticeFloatingButton(viewId);
  window.requestAnimationFrame(updateTutorContext);
}

function defaultPracticeVisual(module = selected) {
  const moduleImage = module?.image || courseProfile?.moduleImages?.[module?.number]?.src;
  if (moduleImage) return moduleImage;
  return currentCourseId === 'electricidad-3m'
    ? 'assets/electricity-module-graphic-v2.webp'
    : 'assets/elena-rojas-patient-natural-card-v2.webp';
}

function syncPracticeFloatingButton(viewId = document.querySelector('.course-view.is-active')?.id || '') {
  const button = document.querySelector('#practiceFloatingButton');
  if (button) button.hidden = true;
  const a11yButton = document.querySelector('#accessibilityButton');
  if (a11yButton) a11yButton.hidden = true;
  const tutorButton = document.querySelector('#tutorButton');
  if (tutorButton) tutorButton.hidden = true;
  syncSupportDock(viewId);
}

function syncSupportDock(viewId = document.querySelector('.course-view.is-active')?.id || '') {
  const button = document.querySelector('#supportDockButton');
  if (!button) return;
  const activeView = viewId || document.querySelector('.course-view.is-active')?.id || '';
  const appVisible = !document.querySelector('#appShell')?.hidden;
  button.hidden = !appVisible || activeView === 'accessView';
  const practiceCard = document.querySelector('[data-support-action="practice"]');
  const hasPractice = Boolean(selected && freePracticeContentByModule?.[selected.number]);
  if (practiceCard) {
    practiceCard.disabled = !hasPractice || activeView === 'practiceView';
    practiceCard.classList.toggle('is-disabled', !hasPractice || activeView === 'practiceView');
  }
  const progressEl = document.querySelector('[data-support-practice-progress]');
  if (progressEl) {
    const content = selected ? freePracticeContentByModule?.[selected.number] : null;
    const total = content?.questions?.length || 0;
    let done = 0;
    if (selected && total) {
      try {
        const stored = JSON.parse(localStorage.getItem(`aulatp-practice-${selected.number}`) || 'null');
        done = Array.isArray(stored?.completedQuestionIds) ? stored.completedQuestionIds.length : 0;
      } catch (_) {
        done = 0;
      }
    }
    progressEl.textContent = total ? `${done}/${total}` : 'sin lab';
  }
  const context = tutorContextSnapshot();
  const titleEl = document.querySelector('[data-support-context-title]');
  const promptEl = document.querySelector('[data-support-context-prompt]');
  if (titleEl) {
    titleEl.textContent = `M${context.module_number} · ${context.module_title} · ${context.screen_label}`;
  }
  if (promptEl) {
    promptEl.textContent = context.current_prompt || 'Abre una estación o etapa para contextualizar el agente y la práctica.';
  }
}

function openSupportDock() {
  if (!document.querySelector('#tutorPanel')?.hidden) closeTutorPanel({ restoreFocus: false });
  if (!document.querySelector('#accessibilityPanel')?.hidden) closeAccessibilityPanel();
  syncSupportDock();
  document.querySelector('#supportDockBackdrop').hidden = false;
  document.querySelector('#supportDockPanel').hidden = false;
  document.querySelector('#supportDockButton').setAttribute('aria-expanded', 'true');
}

function closeSupportDock({ restoreFocus = true } = {}) {
  document.querySelector('#supportDockBackdrop').hidden = true;
  document.querySelector('#supportDockPanel').hidden = true;
  document.querySelector('#supportDockButton').setAttribute('aria-expanded', 'false');
  if (restoreFocus) document.querySelector('#supportDockButton')?.focus();
}

function tutorContextSnapshot() {
  const activeView = document.querySelector('.course-view.is-active')?.id || 'accessView';
  const viewLabels = {
    accessView: 'Portada y ruta de módulos',
    learningView: 'Ruta interna del módulo',
    contextualizationView: 'Contextualización del caso',
    aeJourneyView: `AE ${aeActiveSequence} · etapa ${aeSelectedStageSequence}`,
    integratorView: `Situación Integradora · etapa ${integratorState?.activeStep || 1}`,
    practiceView: 'Práctica libre',
    evaluationView: 'Evaluación final y cierre',
  };
  const promptSelectors = {
    contextualizationView: '.activity-heading h2, .activity-head h2',
    aeJourneyView: '.ae-stage-detail-header h2, #aeStageActivity h3',
    integratorView: '#integratorStagePanel h2, #integratorStagePanel h3',
    practiceView: '.practice-question-body h2',
    evaluationView: '#evaluationQuestionPanel h2, .evaluation-card h2',
  };
  const promptElement = promptSelectors[activeView]
    ? [...document.querySelectorAll(promptSelectors[activeView])].find((element) => !element.closest('[hidden]'))
    : null;
  const stageName = internalStages[activeInternalStage]?.name || 'Inicio';
  const screenLabel = viewLabels[activeView] || stageName;
  return {
    view: activeView,
    screen_label: screenLabel,
    module_number: selected?.number || '1',
    module_title: selected?.title || 'Aplicación de cuidados básicos',
    ae: activeView === 'aeJourneyView' ? `AE ${aeActiveSequence}` : `AE ${activeAe}`,
    stage: stageName,
    current_prompt: (promptElement?.textContent || currentInstructionText()).trim().slice(0, 700),
    progress: document.querySelector('[data-progress-number]')?.textContent?.trim() || '0 %',
  };
}

function updateTutorContext() {
  const label = document.querySelector('#tutorContextLabel');
  if (!label) return;
  const context = tutorContextSnapshot();
  label.textContent = context.view === 'accessView'
    ? context.screen_label
    : `Módulo ${context.module_number} · ${context.screen_label}`;
}

function appendTutorMessage(role, content, { pending = false } = {}) {
  const container = document.querySelector('#tutorMessages');
  const article = document.createElement('article');
  article.className = `tutor-message ${role}${pending ? ' is-thinking' : ''}`;
  if (pending) article.dataset.tutorPending = 'true';
  const avatar = document.createElement('span');
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = role === 'assistant' ? 'TP' : 'Tú';
  const bubble = document.createElement('div');
  const title = document.createElement('strong');
  title.textContent = role === 'assistant' ? 'Tutor Aula TP' : 'Tú';
  bubble.append(title);
  String(content || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean).forEach((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    bubble.append(paragraph);
  });
  article.append(avatar, bubble);
  container.append(article);
  container.scrollTop = container.scrollHeight;
  return article;
}

function renderTutorQuickActions(actions = []) {
  const container = document.querySelector('#tutorQuickActions');
  const defaults = ['Explícame esta etapa', 'Dame una pista gradual', 'Ayúdame a ordenar mi decisión', '¿Qué evidencia debo revisar?'];
  const prompts = actions.length ? actions : defaults;
  container.replaceChildren(...prompts.slice(0, 4).map((prompt) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.tutorPrompt = prompt;
    button.textContent = prompt;
    return button;
  }));
}

function tutorWelcomeMessage() {
  if (currentCourseId === 'electricidad-3m') return 'Soy tu Tutor Aula TP de Electricidad. Te ayudaré a leer planos, contrastar cálculos, reconocer riesgos eléctricos y justificar decisiones técnicas. Revisemos la evidencia antes de elegir una respuesta.';
  return '¡Hola! Soy tu Tutor Aula TP. Puedo acompañarte en Electricidad, Enfermería u otra ruta TP.\n\nTe ayudaré a comprender conceptos, ordenar procedimientos, identificar riesgos y justificar decisiones con evidencia, sin resolver la actividad por ti.';
}

async function loadTutorHistory() {
  if (tutorHistoryLoaded) return;
  const container = document.querySelector('#tutorMessages');
  try {
    const response = await apiRequest('/api/tutor/history?limit=24');
    container.replaceChildren();
    if (!response.messages?.length) appendTutorMessage('assistant', tutorWelcomeMessage());
    else response.messages.forEach((message) => appendTutorMessage(message.role, message.content));
    tutorHistoryLoaded = true;
  } catch (_) {
    if (!container.children.length) appendTutorMessage('assistant', tutorWelcomeMessage());
  }
}

function openTutorPanel() {
  const panel = document.querySelector('#tutorPanel');
  if (!document.querySelector('#accessibilityPanel').hidden) closeAccessibilityPanel();
  document.querySelector('#tutorBackdrop').hidden = false;
  panel.hidden = false;
  document.querySelector('#tutorButton').setAttribute('aria-expanded', 'true');
  document.body.classList.add('tutor-open');
  updateTutorContext();
  void loadTutorHistory();
  window.setTimeout(() => document.querySelector('#tutorInput').focus(), 80);
}

function closeTutorPanel({ restoreFocus = true } = {}) {
  const panel = document.querySelector('#tutorPanel');
  if (!panel || panel.hidden) return;
  document.querySelector('#tutorBackdrop').hidden = true;
  panel.hidden = true;
  document.querySelector('#tutorButton').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('tutor-open');
  if (restoreFocus) {
    const focusTarget = !document.querySelector('#tutorButton')?.hidden
      ? document.querySelector('#tutorButton')
      : document.querySelector('#supportDockButton');
    focusTarget?.focus();
  }
}

function localTutorFallback() {
  const context = tutorContextSnapshot();
  return `Orientación\nEstoy contigo en ${context.screen_label}. Identifica primero el dato observable, el riesgo y la acción que corresponde a tu rol técnico.\n\nEjemplo aplicado\n${courseUiLabels.tutorFallbackExample}\n\nPregunta para continuar\n${courseUiLabels.tutorFallbackQuestion}`;
}

async function sendTutorMessage(message) {
  const cleanMessage = message.trim();
  if (!cleanMessage || tutorSending) return;
  tutorSending = true;
  const input = document.querySelector('#tutorInput');
  const sendButton = document.querySelector('#sendTutorMessage');
  appendTutorMessage('user', cleanMessage);
  input.value = '';
  input.disabled = true;
  sendButton.disabled = true;
  const pending = appendTutorMessage('assistant', 'Estoy revisando el contexto para orientarte…', { pending: true });
  try {
    const response = await apiRequest('/api/tutor/message', {
      method: 'POST',
      body: JSON.stringify({ message: cleanMessage, context: tutorContextSnapshot() }),
    });
    pending.remove();
    appendTutorMessage('assistant', response.reply);
    renderTutorQuickActions(response.quick_actions || []);
  } catch (_) {
    pending.remove();
    appendTutorMessage('assistant', localTutorFallback());
    renderTutorQuickActions(['Reintentar consulta', 'Dame una pista gradual', 'Ayúdame a ordenar mi decisión', 'Volver al contenido actual']);
  } finally {
    tutorSending = false;
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }
}

function fallbackAeJourney(module) {
  return {
    expected_learnings: aeSequenceList(module).map((sequence) => {
      const completed = new Set(JSON.parse(localStorage.getItem(`aulatp-ae-${module.number}-${sequence}-completed`) || '[]'));
      const previousComplete = sequence === 1 || JSON.parse(localStorage.getItem(`aulatp-ae-${module.number}-${sequence - 1}-completed`) || '[]').length === 6;
      const titles = aeTitlesByModule[module.number] || [`${module.short} · inicio`, `${module.short} · aplicación`, `${module.short} · integración`];
      return {
        id: null,
        sequence,
        code: `AE ${sequence}`,
        title: titles[sequence - 1],
        progress_status: completed.size === 6 ? 'completed' : previousComplete ? 'available' : 'locked',
        progress_percent: Math.round((completed.size / 6) * 100),
        stages: pedagogicalStages.map((stage, index) => ({
          id: null,
          sequence: index + 1,
          title: stage.name,
          tone: stage.tone,
          estimated_minutes: index === 3 ? 15 : index === 5 ? 5 : 10,
          progress_status: completed.has(index + 1) ? 'completed' : 'not_started'
        }))
      };
    })
  };
}

async function loadAeJourney(module) {
  const serverModule = serverModuleFor(module);
  if (!serverModule) {
    aeJourneyData = fallbackAeJourney(module);
    return;
  }
  try {
    aeJourneyData = await apiRequest(`/api/modules/${serverModule.id}/expected-learnings`);
  } catch (error) {
    aeJourneyData = fallbackAeJourney(module);
    showToast('El recorrido se abrió en modo local; el avance se sincronizará cuando la conexión esté disponible.', 'error');
  }
}

function activeExpectedLearning() {
  return aeJourneyData?.expected_learnings.find((learning) => Number(learning.sequence) === aeActiveSequence);
}

function activeAeContent(module) {
  return aeLearningContent[module.number]?.[aeActiveSequence] || null;
}

function selectedAeStageContent(module, stageSequence) {
  return activeAeContent(module)?.stages?.[Number(stageSequence) - 1] || null;
}

function aeQuizActivityMarkup(content) {
  return `<div class="ae-question-list">${content.questions.map((question, questionIndex) => `
    <fieldset class="ae-question-card" data-ae-question="${questionIndex}">
      <legend><span>${questionIndex + 1}</span>${question.prompt}</legend>
      <div class="ae-option-list">${question.options.map((option, optionIndex) => `
        <label><input type="radio" name="ae-${selected.number}-${aeActiveSequence}-${aeSelectedStageSequence}-${questionIndex}" value="${optionIndex}" /><span>${option}</span></label>`).join('')}
      </div>
      <p class="ae-question-hint" hidden><strong>Pista:</strong> ${question.hint}</p>
    </fieldset>`).join('')}</div>`;
}

function aeMatchingActivityMarkup(content) {
  return `<div class="ae-matching-list">${content.pairs.map((pair, pairIndex) => `
    <label class="ae-matching-row" data-ae-pair="${pairIndex}">
      <span><b>${pairIndex + 1}</b>${pair.action}</span>
      <select aria-label="Concepto relacionado con: ${pair.action}">
        <option value="">Selecciona un concepto</option>
        ${content.options.map((option) => `<option value="${option}">${option}</option>`).join('')}
      </select>
      <small hidden><strong>Pista:</strong> ${pair.hint}</small>
    </label>`).join('')}</div>`;
}

function aeChecklistActivityMarkup(content) {
  return `<div class="ae-checklist" role="group" aria-label="Lista de verificación">${content.items.map((item, index) => `
    <label><input type="checkbox" value="${index}" /><span><i aria-hidden="true">✓</i>${item}</span></label>`).join('')}</div>`;
}

function aeReflectionActivityMarkup(content) {
  return `<div class="ae-reflection">
    <div class="ae-reflection-summary"><h3>Lo esencial de este AE</h3><ul>${content.summary.map((item) => `<li>${item}</li>`).join('')}</ul></div>
    <label><strong>${content.prompt}</strong><textarea id="aeStageReflection" rows="4" minlength="30" placeholder="${content.placeholder}"></textarea></label>
    <label class="ae-reflection-check"><input id="aeStageReviewCheck" type="checkbox" /><span>${courseUiLabels.aeReflectionCheck}</span></label>
  </div>`;
}

function renderAeStageActivity(module, learning, stage, isCompleted) {
  const container = document.querySelector('#aeStageActivity');
  const feedback = document.querySelector('#aeStageFeedback');
  const learningContent = activeAeContent(module);
  const caseData = moduleCaseFor(module);
  const content = selectedAeStageContent(module, stage.sequence);
  feedback.hidden = true;
  feedback.className = 'ae-stage-feedback';
  feedback.textContent = '';

  if (!learningContent || !content) {
    container.innerHTML = `<div class="ae-content-preview"><strong>${learning.code} · ${learning.title}</strong><p>Revisa el propósito de la etapa y relaciónalo con una situación profesional propia del módulo.</p></div>`;
    return;
  }

  const activityMarkup = content.kind === 'quiz'
    ? aeQuizActivityMarkup(content)
    : content.kind === 'matching'
      ? aeMatchingActivityMarkup(content)
      : content.kind === 'checklist'
        ? aeChecklistActivityMarkup(content)
        : aeReflectionActivityMarkup(content);

  container.innerHTML = `
    <article class="ae-case-strip">
      <div><small>Caso aplicado</small><strong>${learningContent.person}</strong><span>${learningContent.setting}</span></div>
      <p>${learningContent.situation}</p>
      <p class="ae-case-objective"><b>Propósito del ${learning.code}:</b> ${learningContent.objective}</p>
      ${caseData?.risSec ? `<button class="ris-context-button" type="button" aria-label="Contextualizar situación RIS SEC"><span aria-hidden="true">⚡</span><strong>RIS SEC</strong><em>${caseData.risSec}</em></button>${freePracticeContent(selected) ? '<button class="ris-practice-action" type="button" data-open-practice-from-ris><span aria-hidden="true">✎</span> Ir a Práctica libre</button>' : ''}` : ''}
    </article>
    <section class="ae-learning-task ${isCompleted ? 'is-review' : ''}">
      <header><span>${content.label}</span><p>${content.intro}</p></header>
      ${activityMarkup}
    </section>
    ${isCompleted ? completedAeStageMessage(module, learning, stage) : ''}`;

}

function showAeStageFeedback(message, type = 'error') {
  const feedback = document.querySelector('#aeStageFeedback');
  feedback.hidden = false;
  feedback.className = `ae-stage-feedback ${type}`;
  feedback.innerHTML = message;
  feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validateAeStageActivity() {
  const content = selectedAeStageContent(selected, aeSelectedStageSequence);
  if (!content) return true;

  if (content.kind === 'quiz') {
    let answered = 0;
    let correct = 0;
    document.querySelectorAll('#aeStageActivity [data-ae-question]').forEach((card, index) => {
      const choice = card.querySelector('input:checked');
      const isCorrect = choice && Number(choice.value) === content.questions[index].answer;
      if (choice) answered += 1;
      if (isCorrect) correct += 1;
      card.classList.toggle('correct', Boolean(isCorrect));
      card.classList.toggle('wrong', Boolean(choice) && !isCorrect);
      card.querySelector('.ae-question-hint').hidden = Boolean(isCorrect);
    });
    if (answered < content.questions.length) {
      showAeStageFeedback(`<strong>Responde las ${content.questions.length} preguntas.</strong> Revisa los antecedentes del caso antes de continuar.`);
      return false;
    }
    if (correct < content.questions.length) {
      showAeStageFeedback(`<strong>Aún hay ${content.questions.length - correct} ${content.questions.length - correct === 1 ? 'respuesta por revisar' : 'respuestas por revisar'}.</strong> Las pistas muestran qué aspecto del caso debes volver a considerar.`);
      return false;
    }
  } else if (content.kind === 'matching') {
    let correct = 0;
    document.querySelectorAll('#aeStageActivity [data-ae-pair]').forEach((row, index) => {
      const isCorrect = row.querySelector('select').value === content.pairs[index].answer;
      if (isCorrect) correct += 1;
      row.classList.toggle('correct', isCorrect);
      row.classList.toggle('wrong', !isCorrect);
      row.querySelector('small').hidden = isCorrect;
    });
    if (correct < content.pairs.length) {
      showAeStageFeedback(`<strong>Relaciona correctamente los ${content.pairs.length} conceptos.</strong> Lee las pistas de las filas destacadas e inténtalo nuevamente.`);
      return false;
    }
  } else if (content.kind === 'checklist') {
    const checks = [...document.querySelectorAll('#aeStageActivity .ae-checklist input')];
    if (!checks.every((check) => check.checked)) {
      showAeStageFeedback('<strong>La verificación aún no está completa.</strong> Confirma cada condición de seguridad, calidad y continuidad antes de cerrar la etapa.');
      return false;
    }
  } else if (content.kind === 'reflection') {
    const reflection = document.querySelector('#aeStageReflection')?.value.trim() || '';
    const reviewed = document.querySelector('#aeStageReviewCheck')?.checked;
    if (reflection.length < 30 || !reviewed) {
      showAeStageFeedback('<strong>Completa tu reflexión.</strong> Escribe al menos 30 caracteres con una acción aplicable y confirma que revisaste la retroalimentación.');
      return false;
    }
  }

  showAeStageFeedback('<strong>¡Muy bien!</strong> La actividad está correcta y la etapa puede registrarse como completada.', 'success');
  return true;
}

function renderAeJourney(module) {
  aeJourneyData?.expected_learnings?.forEach((learning) => {
    localStorage.setItem(`aulatp-ae-${module.number}-${learning.sequence}-completed`, JSON.stringify(learning.stages.filter((stage) => stage.progress_status === 'completed').map((stage) => Number(stage.sequence))));
  });
  const learning = activeExpectedLearning();
  if (!learning) return;
  const stages = learning.stages;
  const completedCount = stages.filter((stage) => stage.progress_status === 'completed').length;
  const firstPendingIndex = stages.findIndex((stage) => stage.progress_status !== 'completed');
  const currentIndex = firstPendingIndex === -1 ? stages.length - 1 : firstPendingIndex;
  if (!stages.some((stage) => Number(stage.sequence) === aeSelectedStageSequence)) aeSelectedStageSequence = currentIndex + 1;
  const selectedStage = stages.find((stage) => Number(stage.sequence) === aeSelectedStageSequence) || stages[currentIndex];
  const selectedIndex = Number(selectedStage.sequence) - 1;
  const learningComplete = completedCount === stages.length;
  const progress = Math.round((completedCount / stages.length) * 100);
  const nextLearning = aeJourneyData.expected_learnings.find((item) => Number(item.sequence) === aeActiveSequence + 1);

  activeAe = aeActiveSequence;
  activeInternalStage = aeActiveSequence;
  localStorage.setItem(`aulatp-module-${module.number}-stage`, String(activeInternalStage));
  localStorage.setItem(`aulatp-module-${module.number}-ae`, String(activeAe));

  document.querySelector('#aeModuleEyebrow').textContent = `Módulo ${module.number} · ${learning.code}`;
  document.querySelector('#aeJourneyTitle').textContent = module.title;
  document.querySelector('#aeCenterCode').textContent = learning.code;
  document.querySelector('#aeCenterTitle').textContent = learning.title;
  const aeCenterImage = courseProfile.aeCenterImages?.[module.number] || (
    isElectricityCourse()
      ? { src: defaultPracticeVisual(module), alt: `Caso técnico del módulo ${module.number}` }
      : module.number === '2'
        ? { src: 'assets/rosa-context-v1.png', alt: 'Rosa Contreras recibe apoyo durante el control de sus parámetros básicos' }
        : { src: 'assets/elena-rojas-patient-natural-card-v2.webp', alt: 'Profesional de enfermería acompaña a una paciente durante sus cuidados básicos' }
  );
  document.querySelector('#aeCenterImage').src = aeCenterImage.src;
  document.querySelector('#aeCenterImage').alt = aeCenterImage.alt;

  document.querySelector('#aeRoute').innerHTML = stages.map((stage, index) => {
    const isCompleted = stage.progress_status === 'completed';
    const isCurrent = index === currentIndex && !learningComplete;
    const isLocked = !reviewerMode && index > currentIndex && !isCompleted;
    const status = isCompleted ? 'Completada' : isCurrent ? 'En progreso' : isLocked ? 'Bloqueada' : 'Disponible';
    return `<button type="button" class="ae-route-node tone-${stage.tone} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-ae-stage="${stage.sequence}" ${isLocked ? 'disabled' : ''} aria-label="${stage.title}: ${status}">
      <span class="ae-node-disc"><b class="ae-node-number">${stage.sequence}</b><i class="ae-node-icon icon-ae-${aeStageIcons[index]}" aria-hidden="true"></i></span>
      <strong>${stage.title}</strong><span class="ae-node-status">${status}</span>
    </button>`;
  }).join('');

  document.querySelector('#aeStageDetailNumber').textContent = selectedStage.sequence;
  document.querySelector('#aeStageDetailEyebrow').textContent = selectedStage.progress_status === 'completed' ? 'Etapa completada' : 'Etapa actual';
  document.querySelector('#aeStageDetailTitle').textContent = selectedStage.title;
  document.querySelector('#aeStageDetailDescription').textContent = aeStageDescriptions[selectedIndex];
  const completeButton = document.querySelector('#completeAeStage');
  const selectedCompleted = selectedStage.progress_status === 'completed';
  const selectedLocked = !reviewerMode && selectedIndex > currentIndex && !selectedCompleted;
  renderAeStageActivity(module, learning, selectedStage, selectedCompleted);
  completeButton.disabled = selectedCompleted || selectedLocked;
  completeButton.innerHTML = selectedCompleted ? 'Etapa completada <span aria-hidden="true">✓</span>' : selectedLocked ? 'Etapa bloqueada' : selectedAeStageContent(module, selectedStage.sequence) ? 'Comprobar y completar etapa <span aria-hidden="true">›</span>' : 'Completar etapa <span aria-hidden="true">›</span>';

  document.querySelector('#aeRouteProgress').textContent = `${completedCount} / ${stages.length}`;
  document.querySelector('#aeCurrentStage').textContent = learningComplete ? 'Recorrido completado' : stages[currentIndex].title;
  document.querySelector('#aeCurrentModule').textContent = `Módulo ${module.number}`;
  document.querySelector('#aeActiveCode').textContent = learning.code;
  document.querySelector('#aeStatusLabel').textContent = learningComplete ? 'Completado' : 'En progreso';
  document.querySelector('.ae-status').classList.toggle('completed', learningComplete);
  document.querySelector('#aeProgressLabel').textContent = `${progress} %`;
  document.querySelector('#aeProgressFill').style.width = `${progress}%`;
  document.querySelector('#aeCompletedCount').textContent = `${completedCount} de ${stages.length}`;
  document.querySelector('#aeAchievementLabel').textContent = `¡${learning.code} logrado!`;
  document.querySelector('#aeAchievement').classList.toggle('earned', learningComplete);

  const continueButton = document.querySelector('#continueNextAe');
  continueButton.hidden = !learningComplete;
  continueButton.innerHTML = nextLearning
    ? `Continuar al ${nextLearning.code} <span aria-hidden="true">›</span>`
    : 'Continuar recorrido del módulo <span aria-hidden="true">›</span>';
}

async function openAeJourney(module, aeSequence = 1) {
  if (contextAdvanceTimer) {
    window.clearTimeout(contextAdvanceTimer);
    contextAdvanceTimer = null;
  }
  selected = module;
  aeJourneyData = fallbackAeJourney(module);
  aeActiveSequence = Math.min(expectedAeCount(module), Math.max(1, Number(aeSequence) || 1));
  aeSelectedStageSequence = 1;
  showCourseView('aeJourneyView');
  renderAeJourney(module);
  await loadAeJourney(module);
  const requestedLearning = aeJourneyData.expected_learnings.find((learning) => Number(learning.sequence) === aeActiveSequence);
  if (!reviewerMode && requestedLearning?.progress_status === 'locked') {
    const available = [...aeJourneyData.expected_learnings].reverse().find((learning) => learning.progress_status !== 'locked');
    aeActiveSequence = Number(available?.sequence || 1);
    showToast(`Completa el AE ${aeActiveSequence} antes de continuar.`, 'error');
  }
  const learning = activeExpectedLearning();
  const firstPending = learning?.stages.find((stage) => stage.progress_status !== 'completed');
  aeSelectedStageSequence = Number(firstPending?.sequence || learning?.stages.at(-1)?.sequence || 1);
  renderAeJourney(module);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function completeSelectedAeStage() {
  const learning = activeExpectedLearning();
  const stage = learning?.stages.find((item) => Number(item.sequence) === aeSelectedStageSequence);
  if (!stage || stage.progress_status === 'completed') return;
  if (!validateAeStageActivity()) return;
  const button = document.querySelector('#completeAeStage');
  button.disabled = true;
  button.textContent = 'Guardando avance…';
  try {
    if (stage.id) {
      await apiRequest(`/api/ae-stages/${stage.id}/complete`, { method: 'POST', body: '{}' });
      await loadAeJourney(selected);
    } else {
      const key = `aulatp-ae-${selected.number}-${aeActiveSequence}-completed`;
      const completed = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      completed.add(Number(stage.sequence));
      localStorage.setItem(key, JSON.stringify([...completed].sort((a, b) => a - b)));
      aeJourneyData = fallbackAeJourney(selected);
    }
    aeSelectedStageSequence = Number(stage.sequence);
    renderAeJourney(selected);
    showToast(`Etapa ${stage.sequence} completada. Tu avance quedó guardado.`);
  } catch (error) {
    showToast(error.message, 'error');
    renderAeJourney(selected);
  }
}

async function continueAeJourney() {
  const nextLearning = aeJourneyData?.expected_learnings.find((learning) => Number(learning.sequence) === aeActiveSequence + 1);
  if (nextLearning) {
    await openAeJourney(selected, Number(nextLearning.sequence));
    return;
  }
  activeInternalStage = Math.min(STAGE_INTEGRATOR, internalStages.length - 1);
  activeAe = expectedAeCount(selected);
  localStorage.setItem(`aulatp-module-${selected.number}-stage`, String(activeInternalStage));
  openIntegrator(selected);
}

function defaultIntegratorState() {
  return {
    activeStep: 1,
    currentSituation: 1,
    completedSteps: [],
    progressiveAnswers: {},
    keywordAnswers: {},
    reviewedResources: [],
    challengeAnswers: {},
    finalAnswers: {},
    vitalState: 'alert',
    reflection: ''
  };
}

function loadIntegratorState(module) {
  try {
    const stored = JSON.parse(localStorage.getItem(`aulatp-integrator-${module.number}`) || 'null');
    integratorState = { ...defaultIntegratorState(), ...(stored || {}) };
  } catch (error) {
    integratorState = defaultIntegratorState();
  }
  integratorState.completedSteps = [...new Set(integratorState.completedSteps.map(Number))].filter((step) => step >= 1 && step <= 4);
  integratorState.reviewedResources = [...new Set(integratorState.reviewedResources)];
}

function saveIntegratorState() {
  try {
    localStorage.setItem(`aulatp-integrator-${selected.number}`, JSON.stringify(integratorState));
  } catch (error) {
    showToast('No se pudo guardar en este navegador. Conserva esta pantalla y vuelve a intentar.', 'error');
  }
  void syncIntegratorState();
}

async function syncIntegratorState() {
  const serverModule = serverModuleFor(selected);
  if (!serverModule || !integratorState) return;
  try {
    await apiRequest(`/api/modules/${serverModule.id}/integrator`, {
      method: 'PUT',
      body: JSON.stringify({
        current_step: integratorState.activeStep,
        completed_steps: integratorState.completedSteps,
        reviewed_resources: integratorState.reviewedResources,
        reflection: integratorState.reflection,
        state: {
          currentSituation: integratorState.currentSituation,
          progressiveAnswers: integratorState.progressiveAnswers,
          keywordAnswers: integratorState.keywordAnswers,
          challengeAnswers: integratorState.challengeAnswers,
          finalAnswers: integratorState.finalAnswers,
          vitalState: integratorState.vitalState
        }
      })
    });
  } catch (error) {
    showToast('Avance guardado en este navegador; falta sincronizar con el servidor. Se reintentará al continuar.', 'error');
  }
}

async function loadServerIntegratorState(module) {
  const serverModule = serverModuleFor(module);
  if (!serverModule) return;
  try {
    const progress = await apiRequest(`/api/modules/${serverModule.id}/integrator`);
    if (!progress.exists) return;
    integratorState = {
      ...defaultIntegratorState(),
      ...(progress.state || {}),
      activeStep: Number(progress.current_step || 1),
      completedSteps: (progress.completed_steps || []).map(Number),
      reviewedResources: progress.reviewed_resources || [],
      reflection: progress.reflection || ''
    };
    localStorage.setItem(`aulatp-integrator-${module.number}`, JSON.stringify(integratorState));
    if (!document.querySelector('#integratorView').hidden && selected.number === module.number) renderIntegrator();
  } catch (error) {
    showToast('El recorrido integrador continúa en modo local; el avance se sincronizará cuando sea posible.', 'error');
  }
}

function integratorContent(module = selected) {
  return integratorContentByModule[module.number] || null;
}

function integratorStepUnlocked(stepNumber) {
  if (reviewerMode) return true;
  return stepNumber === 1 || integratorState.completedSteps.includes(stepNumber - 1) || integratorState.completedSteps.includes(stepNumber);
}

function integratorStageProgress(content) {
  const step = integratorState.activeStep;
  if (integratorState.completedSteps.includes(step)) return 100;
  if (step === 1) return Math.round((Object.keys(integratorState.progressiveAnswers).length / content.progressiveSituations.length) * 100);
  if (step === 2) return 0;
  if (step === 3) {
    const resources = Object.keys(content.resources);
    return Math.round((integratorState.reviewedResources.filter((key) => resources.includes(key)).length / resources.length) * 60);
  }
  return integratorState.reflection.length >= 60 ? 35 : 0;
}

function integratorRouteMarkup() {
  return integratorSteps.map((step, index) => {
    const completed = integratorState.completedSteps.includes(step.number);
    const active = integratorState.activeStep === step.number;
    const locked = !integratorStepUnlocked(step.number);
    const stateLabel = completed ? 'Completado' : active ? 'Etapa actual' : locked ? 'Bloqueado' : 'Pendiente';
    return `<button type="button" class="integrator-route-step ${completed ? 'completed' : ''} ${active ? 'active' : ''} ${locked ? 'locked' : ''}" data-integrator-step="${step.number}" ${locked ? 'disabled' : ''} aria-label="${step.title}: ${stateLabel}">
      <span class="integrator-route-icon" aria-hidden="true">${step.icon}</span>
      <span><small>${step.number === 4 ? 'Situación Integradora' : `${step.number}.`}</small><strong>${step.title}</strong><em>${step.description}</em></span>
      ${completed ? '<i class="integrator-ticket" aria-label="Completado">✓</i>' : active ? '<i class="integrator-current">Etapa actual</i>' : ''}
    </button>${index < integratorSteps.length - 1 ? '<span class="integrator-route-arrow" aria-hidden="true">→</span>' : ''}`;
  }).join('');
}

function progressiveEvidenceMarkup(situation) {
  const image = situation.image ? `<figure class="progressive-photo"><img src="${situation.image}" alt="${situation.imageAlt || situation.title}"/><figcaption>${situation.imageAlt || situation.focus}</figcaption></figure>` : '';
  const chips = (situation.callouts || []).map((item) => `<span>${item}</span>`).join('');

  if (situation.format === 'photo') {
    return `<section class="progressive-media progressive-media-photo">${image}<div class="progressive-observation"><small>Observa antes de responder</small><strong>${situation.focus}</strong><div class="progressive-chips">${chips}</div></div></section>`;
  }
  if (situation.format === 'flow') {
    return `<section class="progressive-media progressive-flow" aria-label="Esquema de higiene de manos">${(situation.flowSteps || []).map((step, index) => `<div><b>${index + 1}</b><span>${step}</span></div>${index < situation.flowSteps.length - 1 ? '<i aria-hidden="true">→</i>' : ''}`).join('')}</section>`;
  }
  if (situation.format === 'dialogue') {
    return `<section class="progressive-media progressive-dialogue">${(situation.dialogue || []).map((line) => `<p class="${line.speaker === 'Elena' ? 'patient' : 'student'}"><strong>${line.speaker}</strong><span>${line.text}</span></p>`).join('')}</section>`;
  }
  if (situation.format === 'sequence') {
    return `<section class="progressive-media progressive-sequence"><header>Secuencia sugerida del aseo</header><div>${(situation.sequenceSteps || []).map((step, index) => `<span><b>${index + 1}</b>${step}</span>`).join('<i aria-hidden="true">›</i>')}</div><small>Avanza desde las zonas más limpias hacia las de mayor contaminación.</small></section>`;
  }
  if (situation.format === 'bodymap') {
    return `<section class="progressive-media progressive-bodymap"><div class="bodymap-figure" aria-hidden="true"><span class="head"></span><span class="torso"></span><span class="pelvis alert"></span><span class="legs"></span></div><div><small>Mapa de puntos de apoyo</small>${(situation.bodyZones || []).map((zone) => `<p class="${zone.state}"><i></i><span>${zone.label}</span><b>${zone.state === 'alert' ? 'Alerta' : zone.state === 'risk' ? 'Riesgo' : 'Observar'}</b></p>`).join('')}</div></section>`;
  }
  if (situation.format === 'vitals') {
    return `<section class="progressive-media progressive-vitals">${image}<div class="vital-monitor"><small>Control verificado</small><div>${(situation.vitals || []).map((vital) => `<p class="${vital.state || ''}"><span>${vital.label}</span><strong>${vital.value}</strong></p>`).join('')}</div><em>Relaciona los valores con lo que observas y con lo que Elena refiere.</em></div></section>`;
  }
  if (situation.format === 'bulletin') {
    return `<section class="progressive-media progressive-bulletin"><div class="bulletin-mark" aria-hidden="true">!</div><div><small>Boletín de seguridad clínica</small><h4>${situation.headline}</h4><p>${situation.evidence}</p><div class="progressive-chips">${(situation.tags || []).map((tag) => `<span>${tag}</span>`).join('')}</div></div></section>`;
  }
  if (situation.format === 'decision') {
    return `<section class="progressive-media progressive-decision">${(situation.decisionSteps || []).map((step, index) => `<div><span>${step.label}</span><strong>${step.value}</strong></div>${index < situation.decisionSteps.length - 1 ? '<i aria-hidden="true">↓</i>' : ''}`).join('')}</section>`;
  }
  if (situation.format === 'roommap') {
    return `<section class="progressive-media progressive-room"><div class="room-bed"><span>ELENA</span><b>Cama baja · frenos</b></div><div class="room-path">Trayecto despejado</div><div class="room-items">${(situation.roomItems || []).map((item) => `<span class="${item.state}"><b>${item.label}</b><small>${item.note}</small></span>`).join('')}</div></section>`;
  }
  if (situation.format === 'record') {
    return `<section class="progressive-media progressive-record"><header><span aria-hidden="true">▤</span><div><small>${situation.recordSmall || 'Ficha clínica resumida'}</small><strong>${situation.recordTitle || 'Revisión previa al cuidado'}</strong></div></header><div>${(situation.recordRows || []).map((row) => `<p class="${row.state || ''}"><span>${row.label}</span><b>${row.value}</b></p>`).join('')}</div></section>`;
  }
  if (situation.format === 'chart') {
    return `<section class="progressive-media progressive-chart"><header><small>Balance parcial · últimas 8 horas</small><strong>Compara los volúmenes registrados</strong></header>${(situation.chartBars || []).map((bar) => `<div><span>${bar.label}</span><i><b style="width:${Math.round((bar.value / bar.max) * 100)}%"></b></i><strong>${bar.display}</strong></div>`).join('')}</section>`;
  }
  if (situation.format === 'compare') {
    return `<section class="progressive-media progressive-compare">${(situation.compareCards || []).map((card) => `<article class="${card.state}"><small>${card.label}</small><p>${card.text}</p><span>${card.state === 'good' ? 'Dato observable y trazable' : 'Opinión imprecisa'}</span></article>`).join('')}</section>`;
  }
  if (situation.format === 'sbar') {
    return `<section class="progressive-media progressive-sbar">${(situation.sbar || []).map((item) => `<article><b>${item.key}</b><div><strong>${item.label}</strong><span>${item.value}</span></div></article>`).join('')}</section>`;
  }
  if (situation.format === 'case') {
    return `<section class="progressive-media progressive-case"><div class="case-avatar" aria-hidden="true">${situation.icon || 'i'}</div><div><small>Datos que debes considerar</small><p>${situation.evidence}</p><div class="progressive-chips">${chips}</div></div></section>`;
  }
  return '';
}

function progressiveStageMarkup(content) {
  const currentIndex = Math.max(0, Math.min(content.progressiveSituations.length - 1, integratorState.currentSituation - 1));
  const situation = content.progressiveSituations[currentIndex];
  const completedCount = Object.keys(integratorState.progressiveAnswers).length;
  const stageCompleted = integratorState.completedSteps.includes(1);
  return `<header class="integrator-stage-heading"><span>1</span><div><small>Preparación progresiva</small><h2>15 situaciones progresivas</h2><p>Trabaja distintos contextos, problemas, decisiones y procedimientos antes del caso integrador 3D.</p></div><b>${completedCount} / ${content.progressiveSituations.length}</b></header>
    <div class="progressive-navigator" aria-label="Situaciones disponibles">${content.progressiveSituations.map((item, index) => {
      const answered = Object.prototype.hasOwnProperty.call(integratorState.progressiveAnswers, index + 1);
      return `<button type="button" class="${answered ? 'answered' : ''} ${index === currentIndex ? 'active' : ''}" data-progressive-number="${index + 1}" aria-label="Situación ${index + 1}: ${item.title}">${answered ? '✓' : index + 1}</button>`;
    }).join('')}</div>
    <article class="progressive-card">
      <div class="progressive-card-title"><span>${currentIndex + 1}</span><div><small>Situación ${currentIndex + 1}</small><h3>${situation.title}</h3></div></div>
      <div class="progressive-context">
        <span>${situation.type || 'Caso aplicado'}</span>
        <strong>${situation.focus || 'Competencia laboral'}</strong>
        ${situation.evidence ? `<p>${situation.evidence}</p>` : ''}
      </div>
      ${progressiveEvidenceMarkup(situation)}
      <p class="progressive-question">${situation.prompt}</p>
      <div class="integrator-options">${situation.options.map((option, optionIndex) => `<label><input type="radio" name="progressive-answer" value="${optionIndex}" ${integratorState.progressiveAnswers[currentIndex + 1] === optionIndex ? 'checked' : ''} ${stageCompleted ? 'disabled' : ''}/><span>${option}</span></label>`).join('')}</div>
      <p id="integratorInlineHint" class="integrator-inline-hint" role="status" aria-live="polite" hidden></p>
      ${stageCompleted ? '<div class="integrator-complete-message">✓ Etapa completada. Puedes revisar cada situación.</div>' : '<button id="checkProgressive" class="integrator-action secondary" type="button">Comprobar situación</button>'}
    </article>
    ${stageCompleted ? '' : `<button id="completeIntegratorStep" class="integrator-action" type="button" ${completedCount < content.progressiveSituations.length ? 'disabled' : ''}>Completar las 15 situaciones <span aria-hidden="true">›</span></button>`}`;
}

function keywordsStageMarkup(content) {
  const completed = integratorState.completedSteps.includes(2);
  return `<header class="integrator-stage-heading"><span>2</span><div><small>Lenguaje profesional</small><h2>Palabras clave</h2><p>Relaciona los datos del caso con los conceptos que orientan una atención segura.</p></div><b>${content.keywords.pairs.length} conceptos</b></header>
    <div class="integrator-keywords">${content.keywords.pairs.map((pair, index) => `<label data-keyword-pair="${index}"><span><b>${index + 1}</b>${pair.clue}</span><select ${completed ? 'disabled' : ''}><option value="">Selecciona la palabra clave</option>${content.keywords.options.map((option) => `<option value="${option}" ${integratorState.keywordAnswers[index] === option ? 'selected' : ''}>${option}</option>`).join('')}</select><small hidden>Revisa qué principio describe exactamente la acción.</small></label>`).join('')}</div>
    <div id="integratorFeedback" class="integrator-feedback" hidden></div>
    ${completed ? '<div class="integrator-complete-message">✓ Palabras clave completadas.</div>' : '<button id="completeIntegratorStep" class="integrator-action" type="button">Comprobar palabras clave <span aria-hidden="true">›</span></button>'}`;
}

function integratorResourceMarkup(resource) {
  if (!resource) return '';
  const meta = resource.sourceName ? `<div class="integrator-resource-meta"><span>${resource.category || 'Fuente'}</span><strong>${resource.sourceName}</strong>${resource.type ? `<small>${resource.type}</small>` : ''}</div>` : '';
  const sourceAction = resource.url ? `<a class="integrator-resource-link" href="${resource.url}" target="_blank" rel="noopener noreferrer">Ver fuente oficial <span aria-hidden="true">↗</span></a>` : '';
  const sections = resource.sections ? `<div class="integrator-resource-sections">${resource.sections.map((section) => `<section><h4>${section.heading}</h4><ul>${section.items.map((item) => `<li>${item}</li>`).join('')}</ul></section>`).join('')}</div>` : '';
  const dialogue = resource.dialogue ? `<div class="integrator-dialogue">${resource.dialogue.map((line) => `<p class="${line.speaker === 'Elena' ? 'patient' : 'student'}"><strong>${line.speaker}</strong><span>${line.text}</span></p>`).join('')}</div>` : '';
  const images = resource.images ? `<div class="integrator-clinical-images">${resource.images.map((item) => `<figure><img src="${item.src}" alt="${item.title}"/><figcaption><strong>${item.title}</strong><span>${item.note}</span></figcaption></figure>`).join('')}</div>` : '';
  const video = resource.videoSteps ? `<div class="integrator-sim-video"><div class="integrator-video-scene" style="background-image:linear-gradient(90deg,rgba(2,37,103,.76),rgba(2,92,166,.2)),url('${integratorContent().image}')"><button id="playIntegratorVideo" type="button" aria-label="Reproducir recurso audiovisual">▶</button><div><small>Secuencia audiovisual · 4 momentos</small><strong id="integratorVideoCaption">Pulsa reproducir para observar el procedimiento.</strong></div></div><div class="integrator-video-progress"><span id="integratorVideoProgress"></span></div><p>El relato utiliza audio del navegador y texto en pantalla. Puedes pausarlo en cualquier momento.</p></div>` : '';
  return `<aside id="integratorResourcePanel" class="integrator-resource-panel" role="dialog" aria-modal="false" aria-labelledby="integratorResourceTitle"><header><span aria-hidden="true">${resource.icon}</span><h3 id="integratorResourceTitle">${resource.title}</h3><button type="button" data-close-integrator-resource aria-label="Cerrar recurso">×</button></header>${meta}${video}${dialogue}${images}${sections}${sourceAction}</aside>`;
}

function challengeStageMarkup(content) {
  const resourceEntries = Object.entries(content.resources);
  const reviewed = new Set(integratorState.reviewedResources);
  const allReviewed = resourceEntries.every(([key]) => reviewed.has(key));
  const completed = integratorState.completedSteps.includes(3);
  const leftResources = resourceEntries.slice(0, 2);
  const rightResources = resourceEntries.slice(2, 4);
  const extraResources = resourceEntries.slice(4);
  const resourceButton = ([key, resource]) => `<button type="button" class="challenge-resource ${reviewed.has(key) ? 'reviewed' : ''}" data-integrator-resource="${key}"><span aria-hidden="true">${resource.icon}</span><strong>${resource.title}</strong><small>${reviewed.has(key) ? '◉ Revisado' : '○ No revisado'}</small></button>`;
  const openResource = integratorOpenResource ? content.resources[integratorOpenResource] : null;
  return `<header class="integrator-stage-heading"><span>3</span><div><small>${content.challengeSmall || 'Exploración clínica'}</small><h2>Gran Desafío</h2><p>${content.challengeLead || 'Explora las fuentes disponibles, relaciona la información y luego responde las decisiones del caso.'}</p></div><b>${reviewed.size} / ${resourceEntries.length} recursos</b></header>
    <div class="grand-challenge-grid">
      <div class="challenge-resource-column">${leftResources.map(resourceButton).join('')}</div>
      <article class="challenge-patient">
        <img src="${content.image}" alt="${content.challengeImageAlt || `${content.patient} recibe atención de enfermería en su habitación`}"/>
        <div><small>${content.setting}</small><h3>${content.patient}</h3><p>${content.summary}</p></div>
      </article>
      <div class="challenge-resource-column">${rightResources.map(resourceButton).join('')}</div>
      ${extraResources.length ? `<div class="challenge-materials">${extraResources.map(resourceButton).join('')}</div>` : ''}
    </div>
    ${openResource ? integratorResourceMarkup(openResource) : `<p class="challenge-explore-prompt">${content.challengeEmptyPrompt || 'Selecciona un recurso para desplegar sus antecedentes sin abandonar la situación clínica.'}</p>`}
    <section class="challenge-questions ${allReviewed ? '' : 'locked'}">
      <header><h3>Decisiones del Gran Desafío</h3><span>${allReviewed ? 'Información disponible · responde las preguntas' : `Revisa los ${resourceEntries.length - reviewed.size} recursos pendientes para desbloquear`}</span></header>
      ${allReviewed ? `<div class="integrator-question-list">${content.challengeQuestions.map((question, index) => integratorQuestionMarkup(question, `challenge-${index}`, completed, integratorState.challengeAnswers[index])).join('')}</div>` : `<div class="challenge-locked-message"><span aria-hidden="true">🔒</span><p>${content.challengeLockedText || 'Primero explora la ficha, el recurso audiovisual, la entrevista, las imágenes, el registro, las alertas y los materiales.'}</p></div>`}
    </section>
    <div id="integratorFeedback" class="integrator-feedback" hidden></div>
    ${completed ? '<div class="integrator-complete-message">✓ Gran Desafío completado. La Meta final está disponible.</div>' : `<button id="completeIntegratorStep" class="integrator-action" type="button" ${allReviewed ? '' : 'disabled'}>Completar Gran Desafío <span aria-hidden="true">›</span></button>`}`;
}

function integratorQuestionMarkup(question, name, disabled = false, selectedValue = undefined) {
  return `<fieldset data-integrator-question><legend>${question.prompt}</legend>${question.options.map((option, index) => `<label><input type="radio" name="${name}" value="${index}" ${Number(selectedValue) === index ? 'checked' : ''} ${disabled ? 'disabled' : ''}/><span>${option}</span></label>`).join('')}<small hidden><strong>Pista:</strong> ${question.hint || courseUiLabels.integratorQuestionHint}</small></fieldset>`;
}

function finalStageMarkup(content) {
  const completed = integratorState.completedSteps.includes(4);
  const caseName = String(content.patient || 'Caso').split(',')[0];
  const simulation = content.finalSimulation || {};
  const vitalStates = simulation.vitalStates || {};
  const vitalStateKey = vitalStates[integratorState.vitalState]
    ? integratorState.vitalState
    : (simulation.defaultState || Object.keys(vitalStates)[0]);
  const vitalState = vitalStates[vitalStateKey] || {};
  const vitals = vitalState.vitals || {};
  const vitalLabels = simulation.vitalLabels || ['FC', 'FR', 'PA', 'TEMP', 'SpO₂'];
  const modelMarkup = simulation.modelSrc
    ? `<model-viewer id="integratorPatientModel" src="${simulation.modelSrc}" alt="${simulation.modelAlt || `Modelo 3D de ${caseName}`}" camera-controls interaction-prompt="none" camera-orbit="0deg 75deg 70%" camera-target="auto auto auto" min-camera-orbit="auto 55deg 52%" max-camera-orbit="auto 88deg 160%" field-of-view="24deg" exposure="1.05" shadow-intensity="0.35" shadow-softness="0.85" loading="eager" reveal="auto"></model-viewer>`
    : `<img src="${content.image}" alt="${simulation.caseImageAlt || `Imagen de ${caseName} durante la situación integradora`}"/>`;
  const stateButtons = Object.entries(vitalStates).map(([key, state]) => `<button type="button" class="patient-state-button ${key === vitalStateKey ? 'active' : ''}" data-vital-state="${key}" aria-pressed="${key === vitalStateKey}">${state.label}</button>`).join('');
  return `<header class="integrator-stage-heading"><span>4</span><div><small>${simulation.stageSmall || courseUiLabels.finalSimulationDefaultSmall}</small><h2>${simulation.stageTitle || 'Situación Integradora 3D'}</h2><p>${simulation.stageLead || courseUiLabels.finalSimulationDefaultLead}</p></div><b>${completed ? 'Lograda' : 'Desafío final'}</b></header>
    <article class="patient-simulator severity-${vitalStateKey}" data-patient-simulator data-severity="${vitalStateKey}">
      <header class="patient-simulator-toolbar">
        <div><span class="patient-ready-dot" aria-hidden="true"></span><strong>${simulation.readyLabel || courseUiLabels.finalReadyDefault}</strong><small>${content.patient} · ${content.setting}</small></div>
        <button id="resetPatientView" type="button">↻ Restablecer vista</button>
      </header>
      <div class="patient-simulator-stage">
        <div class="integrator-final-model">
          ${modelMarkup}
          <span>${simulation.modelCaption || courseUiLabels.finalModelCaptionDefault}</span>
        </div>
        <aside class="patient-monitor" aria-live="polite">
          <div class="patient-monitor-heading"><div><small>${simulation.monitorSmall || courseUiLabels.finalMonitorSmallDefault}</small><h3>${simulation.monitorTitle || courseUiLabels.finalMonitorTitleDefault}</h3></div><span class="patient-severity-badge">${vitalState.label || simulation.stateFallback || courseUiLabels.finalStateFallback}</span></div>
          <div class="patient-vitals-grid">
            <div><small>${vitalLabels[0]}</small><strong>${vitals.heartRate || '—'}</strong></div>
            <div><small>${vitalLabels[1]}</small><strong>${vitals.respiratoryRate || '—'}</strong></div>
            <div><small>${vitalLabels[2]}</small><strong>${vitals.bloodPressure || '—'}</strong></div>
            <div><small>${vitalLabels[3]}</small><strong>${vitals.temperature || '—'}</strong></div>
            <div class="wide"><small>${vitalLabels[4]}</small><strong>${vitals.oxygenSaturation || '—'}</strong></div>
          </div>
          <div class="patient-state-controls" aria-label="Simular gravedad del caso">${stateButtons}</div>
          <div class="patient-clinical-signals">
            <small>${simulation.signalsLabel || 'Señales simuladas'}</small>
            <strong>${vitalState.status || ''}</strong>
            <p>${vitalState.description || ''}</p>
            <div>${(vitalState.signals || []).map((signal) => `<span>${signal}</span>`).join('')}</div>
          </div>
        </aside>
      </div>
      <footer>${simulation.footerInstruction || courseUiLabels.finalFooterDefault || `Arrastra para orbitar · usa la rueda para acercar · compara los parámetros con los signos clínicos de ${caseName}`}</footer>
    </article>
    <article class="integrator-final-brief">
      <small>${content.setting}</small>
      <h3>${simulation.title || courseUiLabels.finalTitleDefault}</h3>
      <p>${simulation.summary || content.summary}</p>
      <ul>${(simulation.tasks || []).map((task) => `<li>${task}</li>`).join('')}</ul>
    </article>
    <article class="integrator-final-case"><div><small>${content.setting}</small><h3>${content.patient}</h3><p>${content.summary}</p></div><img src="${content.image}" alt="${simulation.caseImageAlt || `Imagen de ${caseName} durante la situación integradora`}"/></article>
    <div class="integrator-question-list">${content.finalQuestions.map((question, index) => integratorQuestionMarkup(question, `final-${index}`, completed, integratorState.finalAnswers[index])).join('')}</div>
    <label class="integrator-final-record"><strong>${simulation.recordTitle || 'Registro integrado del estudiante'}</strong><span>${simulation.recordInstruction || `Redacta una nota breve que incluya hallazgos prioritarios, acción realizada, comunicación y condición final de ${caseName}.`}</span><textarea id="integratorFinalReflection" rows="5" minlength="60" ${completed ? 'disabled' : ''} placeholder="${simulation.recordPlaceholder || courseUiLabels.finalRecordPlaceholder || `10:20 h: durante el control, ${caseName} refiere...`}">${integratorState.reflection || ''}</textarea></label>
    <label class="integrator-final-check"><input id="integratorFinalCheck" type="checkbox" ${completed ? 'checked disabled' : ''}/><span>Confirmo que revisé todas las fuentes y que mi decisión se basa en la información del caso.</span></label>
    <div id="integratorFeedback" class="integrator-feedback" hidden></div>
    ${completed ? '<div class="integrator-final-success"><span aria-hidden="true">★</span><div><small>Recorrido completado</small><strong>¡Situación Integradora lograda!</strong><p>Integraste información, priorizaste riesgos, actuaste con seguridad y registraste de forma objetiva.</p></div></div><button id="continueAfterIntegrator" class="integrator-action" type="button">Continuar a Evaluación final <span aria-hidden="true">›</span></button>' : '<button id="completeIntegratorStep" class="integrator-action" type="button">Resolver Meta final <span aria-hidden="true">›</span></button>'}`;
}

function renderIntegrator() {
  const content = integratorContent();
  if (!content || !integratorState) return;
  document.querySelector('#integratorTitle').textContent = content.title;
  document.querySelector('#integratorModuleTitle').textContent = `Módulo ${selected.number} · ${content.subtitle}`;
  document.querySelector('#integratorModuleLabel').textContent = `Módulo ${selected.number}`;
  document.querySelector('#integratorRoute').innerHTML = integratorRouteMarkup();
  const panel = document.querySelector('#integratorStagePanel');
  panel.innerHTML = integratorState.activeStep === 1
    ? progressiveStageMarkup(content)
    : integratorState.activeStep === 2
      ? keywordsStageMarkup(content)
      : integratorState.activeStep === 3
        ? challengeStageMarkup(content)
        : finalStageMarkup(content);
  const completedCount = integratorState.completedSteps.length;
  const current = integratorSteps[integratorState.activeStep - 1];
  const progress = integratorStageProgress(content);
  document.querySelector('#integratorRouteCount').textContent = `${completedCount} / 4`;
  document.querySelector('#integratorCurrentLabel').textContent = current.title;
  document.querySelector('#integratorCompletedCount').textContent = `${completedCount} de 4`;
  document.querySelector('#integratorProgressLabel').textContent = `${progress} %`;
  document.querySelector('#integratorProgressFill').style.width = `${progress}%`;
  document.querySelector('#integratorStatusLabel').textContent = completedCount === 4 ? 'Completado' : 'En progreso';
  document.querySelector('#integratorAchievement').classList.toggle('earned', completedCount === 4);
}

function openIntegrator(module) {
  const content = integratorContent(module);
  if (!content) {
    showToast('La Situación Integradora de este módulo está en preparación.', 'error');
    return;
  }
  selected = module;
  activeInternalStage = 4;
  activeAe = 3;
  localStorage.setItem(`aulatp-module-${module.number}-stage`, '4');
  localStorage.setItem(`aulatp-module-${module.number}-ae`, '3');
  loadIntegratorState(module);
  integratorOpenResource = null;
  showCourseView('integratorView');
  renderIntegrator();
  void loadServerIntegratorState(module);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showIntegratorFeedback(message, type = 'error') {
  const feedback = document.querySelector('#integratorFeedback');
  if (!feedback) return;
  feedback.hidden = false;
  feedback.className = `integrator-feedback ${type}`;
  feedback.innerHTML = message;
}

function markIntegratorStepComplete(step) {
  if (!integratorState.completedSteps.includes(step)) integratorState.completedSteps.push(step);
  integratorState.completedSteps.sort((a, b) => a - b);
  if (step < 4) integratorState.activeStep = step + 1;
  saveIntegratorState();
  renderIntegrator();
  showToast(step === 4 ? '¡Situación Integradora lograda!' : `Etapa ${step} completada. La siguiente etapa quedó disponible.`);
  document.querySelector('#integratorStagePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateIntegratorQuestions(questions) {
  const cards = [...document.querySelectorAll('#integratorStagePanel [data-integrator-question]')];
  let correct = 0;
  let answered = 0;
  const answers = {};
  cards.forEach((card, index) => {
    const choice = card.querySelector('input:checked');
    const isCorrect = choice && Number(choice.value) === questions[index].answer;
    if (choice) answered += 1;
    if (choice) answers[index] = Number(choice.value);
    if (isCorrect) correct += 1;
    card.classList.toggle('correct', Boolean(isCorrect));
    card.classList.toggle('wrong', Boolean(choice) && !isCorrect);
    card.querySelector('small').hidden = Boolean(isCorrect);
  });
  return { answered, correct, total: questions.length, answers };
}

function completeActiveIntegratorStep() {
  const content = integratorContent();
  const step = integratorState.activeStep;
  if (step === 1) {
    if (Object.keys(integratorState.progressiveAnswers).length === content.progressiveSituations.length) markIntegratorStepComplete(1);
    return;
  }
  if (step === 2) {
    let correct = 0;
    const answers = {};
    document.querySelectorAll('[data-keyword-pair]').forEach((row, index) => {
      const value = row.querySelector('select').value;
      answers[index] = value;
      const isCorrect = value === content.keywords.pairs[index].answer;
      if (isCorrect) correct += 1;
      row.classList.toggle('correct', isCorrect);
      row.classList.toggle('wrong', !isCorrect);
      row.querySelector('small').hidden = isCorrect;
    });
    if (correct === content.keywords.pairs.length) {
      integratorState.keywordAnswers = answers;
      markIntegratorStepComplete(2);
    }
    else showIntegratorFeedback(`<strong>Aún hay ${content.keywords.pairs.length - correct} relaciones por revisar.</strong> Observa las filas destacadas y vuelve a relacionar cada acción con su principio.`);
    return;
  }
  if (step === 3) {
    const required = Object.keys(content.resources);
    if (!required.every((key) => integratorState.reviewedResources.includes(key))) {
      showIntegratorFeedback('<strong>Faltan fuentes por explorar.</strong> Revisa todos los recursos antes de tomar una decisión.');
      return;
    }
    const result = validateIntegratorQuestions(content.challengeQuestions);
    if (result.correct === result.total) {
      integratorState.challengeAnswers = result.answers;
      markIntegratorStepComplete(3);
    }
    else showIntegratorFeedback(`<strong>Revisa ${result.total - result.correct} ${result.total - result.correct === 1 ? 'decisión' : 'decisiones'}.</strong> Las pistas indican qué información del caso debes volver a relacionar.`);
    return;
  }
  const result = validateIntegratorQuestions(content.finalQuestions);
  const reflection = document.querySelector('#integratorFinalReflection')?.value.trim() || '';
  const confirmed = document.querySelector('#integratorFinalCheck')?.checked;
  if (result.correct !== result.total || reflection.length < 60 || !confirmed) {
    integratorState.reflection = reflection;
    saveIntegratorState();
    showIntegratorFeedback(`<strong>La Meta final aún no está completa.</strong> Corrige las respuestas señaladas, redacta un registro de al menos 60 caracteres y confirma la revisión de las fuentes.`);
    return;
  }
  integratorState.reflection = reflection;
  integratorState.finalAnswers = result.answers;
  markIntegratorStepComplete(4);
}

function freePracticeContent(module = selected) {
  const content = freePracticeContentByModule[module.number] || null;
  if (!content) return null;
  const primaryImage = content.image || defaultPracticeVisual(module);
  const detailImage = content.detailImage || module?.image || primaryImage;
  const normalizedMedia = Array.isArray(content.lab?.media)
    ? content.lab.media.filter((item) => item?.src)
    : [];
  const fallbackMedia = [
    {
      kind: 'Escena',
      title: content.patient || module.title,
      caption: content.summary || module.description || 'Apoyo visual para interpretar el caso.',
      src: primaryImage,
      alt: content.imageAlt || `${content.patient || module.title} · apoyo visual`
    },
    {
      kind: 'Detalle técnico',
      title: module.title,
      caption: module.description || 'Referencia visual para conectar la evidencia con la decisión.',
      src: detailImage,
      alt: `${module.title} · detalle técnico`
    }
  ].filter((item, index, list) => item.src && list.findIndex((candidate) => candidate.src === item.src) === index);
  return {
    ...content,
    image: primaryImage,
    imageAlt: content.imageAlt || `${content.patient || module.title} · imagen de práctica libre`,
    detailImage,
    lab: content.lab ? {
      ...content.lab,
      media: normalizedMedia.length ? normalizedMedia : fallbackMedia
    } : content.lab
  };
}

function shuffledPracticeOrder(length) {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }
  return order;
}

function defaultPracticeState(content, round = 1) {
  return {
    order: shuffledPracticeOrder(content.questions.length),
    currentPosition: 0,
    completedQuestionIds: [],
    retries: 0,
    completed: false,
    round,
    mode: content.lab?.modes?.[0]?.id || 'refuerzo',
    variantIndex: 0,
    openedLinks: [],
    activeLinkId: '',
    evidenceType: 'FREE_PRACTICE_EVIDENCE',
    startedAt: new Date().toISOString(),
    completedAt: '',
    actions: [],
    sourcesConsulted: [],
    errors: [],
    corrections: [],
    hintsUsed: 0,
    outcome: 'en proceso',
    autonomyScore: null,
    transferIndicator: false
  };
}

function loadPracticeState(module) {
  const content = freePracticeContent(module);
  if (!content) {
    practiceState = null;
    return;
  }
  try {
    const stored = JSON.parse(localStorage.getItem(`aulatp-practice-${module.number}`) || 'null');
    practiceState = stored ? { ...defaultPracticeState(content), ...stored } : defaultPracticeState(content);
  } catch (error) {
    practiceState = defaultPracticeState(content);
  }
  const validIds = new Set(content.questions.map((_, index) => index));
  practiceState.order = Array.isArray(practiceState.order) ? practiceState.order.map(Number).filter((id) => validIds.has(id)) : [];
  validIds.forEach((id) => { if (!practiceState.order.includes(id)) practiceState.order.push(id); });
  practiceState.completedQuestionIds = [...new Set((practiceState.completedQuestionIds || []).map(Number))].filter((id) => validIds.has(id));
  practiceState.currentPosition = Math.max(0, Math.min(Number(practiceState.currentPosition) || 0, practiceState.order.length - 1));
  practiceState.retries = Math.max(0, Number(practiceState.retries) || 0);
  practiceState.completed = practiceState.completedQuestionIds.length === content.questions.length;
  const validModes = new Set((content.lab?.modes || []).map((mode) => mode.id));
  if (validModes.size && !validModes.has(practiceState.mode)) practiceState.mode = content.lab.modes[0].id;
  const variantCount = content.lab?.variants?.length || 1;
  practiceState.variantIndex = Math.max(0, Math.min(Number(practiceState.variantIndex) || 0, variantCount - 1));
  const validLinks = new Set((content.lab?.links || []).map((link) => link.id));
  practiceState.openedLinks = [...new Set((practiceState.openedLinks || []).filter((id) => validLinks.has(id)))];
  if (practiceState.activeLinkId && !validLinks.has(practiceState.activeLinkId)) practiceState.activeLinkId = '';
  practiceState.evidenceType = 'FREE_PRACTICE_EVIDENCE';
  practiceState.startedAt = practiceState.startedAt || new Date().toISOString();
  practiceState.completedAt = practiceState.completed ? (practiceState.completedAt || new Date().toISOString()) : '';
  practiceState.actions = Array.isArray(practiceState.actions) ? practiceState.actions.slice(-50) : [];
  practiceState.sourcesConsulted = Array.isArray(practiceState.sourcesConsulted) ? [...new Set(practiceState.sourcesConsulted.filter((id) => validLinks.has(id)))] : [];
  practiceState.errors = Array.isArray(practiceState.errors) ? practiceState.errors.slice(-25) : [];
  practiceState.corrections = Array.isArray(practiceState.corrections) ? practiceState.corrections.slice(-25) : [];
  practiceState.hintsUsed = Math.max(0, Number(practiceState.hintsUsed) || 0);
  practiceState.outcome = practiceState.completed ? 'ronda completada' : (practiceState.outcome || 'en proceso');
  practiceState.transferIndicator = Boolean(practiceState.transferIndicator || practiceState.mode === 'transferir');
}

function savePracticeState() {
  if (!practiceState) return;
  localStorage.setItem(`aulatp-practice-${selected.number}`, JSON.stringify(practiceState));
}

function recordPracticeEvidence(type, detail = {}) {
  if (!practiceState) return;
  practiceState.actions = Array.isArray(practiceState.actions) ? practiceState.actions : [];
  practiceState.actions.push({
    type,
    at: new Date().toISOString(),
    level: practiceState.mode,
    variantId: practiceState.variantIndex,
    ...detail
  });
  practiceState.actions = practiceState.actions.slice(-50);
}

function practiceLabMarkup(content) {
  const lab = content.lab;
  if (!lab) return '';
  const activeMode = lab.modes.find((mode) => mode.id === practiceState.mode) || lab.modes[0];
  const variant = lab.variants[practiceState.variantIndex] || lab.variants[0];
  const opened = new Set(practiceState.openedLinks || []);
  const activeLink = lab.links.find((link) => link.id === practiceState.activeLinkId);
  const mediaItems = Array.isArray(lab.media) ? lab.media : [];
  const activeLevelIndex = Math.max(0, lab.modes.findIndex((mode) => mode.id === activeMode.id));
  return `<section class="free-lab-panel" aria-label="Laboratorio de Práctica Libre">
    <header>
      <div><small>Laboratorio autónomo · Sin calificación</small><h3>${lab.title}</h3><p>${lab.intro}</p></div>
    </header>
    <div class="free-lab-evidence-note" role="note">
      <span>Evidencia de práctica libre · sin efecto en la nota</span>
      <p>La práctica libre entrena, explora y profundiza. No modifica nota ni ranking: conserva evidencia pedagógica separada para retroalimentación docente.</p>
    </div>
    ${lab.risContext ? `<button class="ris-context-button" type="button" aria-label="Contextualizar situación RIS SEC"><span aria-hidden="true">⚡</span><strong>RIS SEC</strong><em>${lab.risContext}</em></button>` : ''}
    ${mediaItems.length ? `<section class="free-lab-media" aria-label="Multimedia de práctica libre">
      ${mediaItems.map((item) => `<article class="free-lab-media-card">
        ${item.src ? `<img src="${item.src}" alt="${item.alt || item.title}" loading="lazy" />` : `<span aria-hidden="true">${item.icon || '▣'}</span>`}
        <div><small>${item.kind || 'Recurso'}</small><strong>${item.title}</strong><p>${item.caption}</p></div>
      </article>`).join('')}
    </section>` : ''}
    <div class="free-lab-modes" aria-label="Niveles de práctica libre sin calificación">
      ${lab.modes.map((mode, index) => `<button type="button" data-practice-mode="${mode.id}" class="${mode.id === activeMode.id ? 'active' : ''} ${index < activeLevelIndex ? 'completed' : ''}" aria-pressed="${mode.id === activeMode.id ? 'true' : 'false'}">
        <small>Nivel ${index + 1}</small><strong>${mode.title}</strong><span>${mode.question}</span><em>${mode.complexity} · Andamiaje ${mode.scaffolding}</em>
      </button>`).join('')}
    </div>
    <article class="free-lab-risk-card">
      <div><small>${activeMode.title} · ${variant.title}</small><h4>${lab.riskTitle}</h4><p>${variant.mission}</p></div>
      <ol>${lab.flow.map((step) => `<li>${step}</li>`).join('')}</ol>
      <p><strong>Restricción:</strong> ${variant.constraint}</p>
      <div>${variant.variables.map((variable) => `<span>${variable}</span>`).join('')}</div>
    </article>
    <section class="free-lab-links" aria-label="LINKS de investigación">
      <header><span aria-hidden="true">◈</span><div><small>Biblioteca contextual</small><h4>LINKS</h4><p>Consulta fuentes trazables sin abandonar la situación. No revelan la respuesta.</p></div></header>
      <div class="free-lab-link-grid">${lab.links.map((link) => `<button type="button" class="${opened.has(link.id) ? 'reviewed' : ''} ${link.id === practiceState.activeLinkId ? 'active' : ''}" data-practice-link="${link.id}">
        <strong>${link.title}</strong><small>${link.category}</small><span>${opened.has(link.id) ? 'Revisado' : 'Abrir recurso'}</span>
      </button>`).join('')}</div>
      ${activeLink ? `<article class="free-lab-link-detail">
        <small>${activeLink.type} · ${activeLink.sourceName}</small>
        <h5>${activeLink.title}</h5>
        <p><strong>Relación curricular:</strong> ${activeLink.relation}</p>
        <p><strong>Propósito didáctico:</strong> ${activeLink.purpose}</p>
        <p><strong>AE asociado:</strong> ${activeLink.aeReference}</p>
        ${activeLink.url ? `<a href="${activeLink.url}" target="_blank" rel="noopener noreferrer">Ver fuente oficial</a>` : '<span class="free-lab-source-note">Fuente a cargar por el establecimiento o fabricante antes de una demo normativa específica.</span>'}
      </article>` : '<p class="free-lab-empty">Abre un LINK cuando necesites contrastar evidencia técnica. El estado de la práctica se conserva.</p>'}
    </section>
    <footer><strong>Analítica registrada sin calificación:</strong>${lab.analytics.map((item) => `<span>${item}</span>`).join('')}</footer>
  </section>`;
}

function practiceQuestionMarkup(content) {
  const questionId = practiceState.order[practiceState.currentPosition];
  const question = content.questions[questionId];
  const answered = practiceState.completedQuestionIds.includes(questionId);
  const caseName = String(content.patient || 'caso').split(',')[0];
  const visual = evaluationQuestionVisual(content, selected, questionId, question.category || courseUiLabels.practiceCaseType);
  return `${practiceLabMarkup(content)}<header class="practice-question-header"><div><small>Situación activa · ${question.category}</small><strong>${courseUiLabels.practiceAnalyzePrefix} ${caseName}</strong></div><span>Ronda ${practiceState.round || 1}</span></header>
    <div class="practice-question-body">
      ${visual?.src ? `<figure class="practice-question-visual"><img src="${visual.src}" alt="${visual.alt || 'Apoyo visual de la práctica libre'}" loading="lazy" /><figcaption>${visual.caption || 'Observa la imagen para relacionar evidencia, riesgo y decisión.'}</figcaption></figure>` : ''}
      <h2>${question.prompt}</h2>
      <div class="practice-options">${question.options.map((option, index) => `<label class="${answered && index === question.answer ? 'correct' : ''}"><input type="radio" name="practice-answer" value="${index}" ${answered && index === question.answer ? 'checked' : ''} ${answered ? 'disabled' : ''}/><span>${option}</span></label>`).join('')}</div>
      <div id="practiceFeedback" class="practice-feedback success" ${answered ? '' : 'hidden'}><span aria-hidden="true">${answered ? '✓' : 'i'}</span><div><strong>${answered ? 'Respuesta correcta.' : ''}</strong> ${answered ? question.feedback : ''}</div></div>
      <div class="practice-actions">
        ${answered
          ? `<button id="nextPracticeQuestion" class="practice-primary-action" type="button">${practiceState.currentPosition === practiceState.order.length - 1 ? 'Ver resultado de la ronda' : 'Generar siguiente situación'} <span aria-hidden="true">›</span></button>`
          : '<button id="checkPracticeAnswer" class="practice-primary-action" type="button">Comprobar respuesta</button>'}
      </div>
    </div>`;
}

function renderPractice() {
  const content = freePracticeContent();
  if (!content || !practiceState) return;
  const completedCount = practiceState.completedQuestionIds.length;
  const total = content.questions.length;
  const progress = Math.round((completedCount / total) * 100);
  document.querySelector('#practiceModuleLabel').textContent = `Módulo ${selected.number} · Apoyo transversal`;
  document.querySelector('#practiceCaseTypeLabel').textContent = content.caseTypeLabel || courseUiLabels.practiceCaseType;
  document.querySelector('#practicePatientName').textContent = content.patient;
  document.querySelector('#practicePatientSetting').textContent = content.setting;
  document.querySelector('#practicePatientSummary').textContent = content.summary;
  const patientImage = document.querySelector('#practicePatientImage');
  patientImage.src = content.image;
  patientImage.alt = content.imageAlt;
  document.querySelector('#practiceFocusTags').innerHTML = content.focus.map((item) => `<span>${item}</span>`).join('');
  document.querySelector('#practiceCounter').textContent = practiceState.completed ? `${total} de ${total}` : '1 situación activa';
  document.querySelector('#practiceScore').textContent = `${completedCount} / ${total}`;
  document.querySelector('#practiceRetries').textContent = String(practiceState.retries);
  document.querySelector('#practiceProgressLabel').textContent = `${progress} %`;
  document.querySelector('#practiceProgressFill').style.width = `${progress}%`;
  const questionNav = document.querySelector('#practiceQuestionNav');
  questionNav.innerHTML = `<button id="newPracticeVariant" type="button" class="single-practice-button">Generar nueva situación de práctica <span aria-hidden="true">↻</span></button>`;
  const questionCard = document.querySelector('#practiceQuestionCard');
  const completion = document.querySelector('#practiceCompletion');
  questionCard.hidden = practiceState.completed;
  completion.hidden = !practiceState.completed;
  if (practiceState.completed) {
    document.querySelector('#practiceCompletionText').textContent = `Completaste una ronda de práctica visual con ${total} situaciones y ${practiceState.retries} ${practiceState.retries === 1 ? 'reintento' : 'reintentos'}. Puedes generar una nueva situación multimedia, consultar LINKS y seguir reforzando el módulo antes de avanzar a la evaluación final.`;
    const restartButton = document.querySelector('#restartPractice');
    if (restartButton) restartButton.textContent = content.lab ? 'Nueva situación' : 'Generar otra ronda';
  } else {
    questionCard.innerHTML = practiceQuestionMarkup(content);
  }
}

function openFreePractice(module = selected) {
  const content = freePracticeContent(module);
  if (!content) {
    showToast('La Práctica libre de este módulo está en preparación.', 'error');
    return;
  }
  selected = module;
  activeAe = Math.min(expectedAeCount(module), Math.max(1, activeAe));
  localStorage.setItem(`aulatp-module-${module.number}-ae`, String(activeAe));
  loadPracticeState(module);
  showCourseView('practiceView');
  renderPractice();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPracticeFeedback(message, type = 'error') {
  const feedback = document.querySelector('#practiceFeedback');
  if (!feedback) return;
  feedback.hidden = false;
  feedback.className = `practice-feedback ${type}`;
  feedback.innerHTML = `<span aria-hidden="true">${type === 'success' ? '✓' : 'i'}</span><div>${message}</div>`;
}

function checkPracticeAnswer() {
  const content = freePracticeContent();
  const questionId = practiceState?.order[practiceState.currentPosition];
  const question = content?.questions[questionId];
  if (!question) return;
  const selectedAnswer = document.querySelector('input[name="practice-answer"]:checked');
  if (!selectedAnswer) {
    showPracticeFeedback('<strong>Selecciona una alternativa.</strong> Luego podrás comprobar tu decisión.');
    return;
  }
  if (Number(selectedAnswer.value) !== question.answer) {
    practiceState.retries += 1;
    practiceState.hintsUsed += 1;
    practiceState.errors = Array.isArray(practiceState.errors) ? practiceState.errors : [];
    practiceState.errors.push({
      questionId,
      category: question.category || 'criterio profesional',
      selected: Number(selectedAnswer.value),
      at: new Date().toISOString()
    });
    practiceState.errors = practiceState.errors.slice(-25);
    recordPracticeEvidence('answer.reviewed', { questionId, category: question.category || '', selected: Number(selectedAnswer.value), result: 'requires_review' });
    savePracticeState();
    document.querySelector('#practiceRetries').textContent = String(practiceState.retries);
    showPracticeFeedback(`<strong>Decisión por revisar.</strong><p>Foco: ${question.category || 'criterio profesional'}.</p><ul><li><strong>Pista:</strong> ${question.hint || question.feedback || 'Vuelve al caso, revisa la evidencia disponible y compara la alternativa con el criterio técnico.'}</li><li><strong>Acción sugerida:</strong> observa la imagen, consulta los LINKS si corresponde y descarta la opción que no pueda verificarse con evidencia.</li></ul>`);
    playInterfaceTone('tap');
    return;
  }
  if (!practiceState.completedQuestionIds.includes(questionId)) practiceState.completedQuestionIds.push(questionId);
  practiceState.corrections = Array.isArray(practiceState.corrections) ? practiceState.corrections : [];
  practiceState.corrections.push({
    questionId,
    category: question.category || 'criterio profesional',
    at: new Date().toISOString()
  });
  practiceState.corrections = practiceState.corrections.slice(-25);
  practiceState.autonomyScore = Math.max(0, Math.min(100, 100 - (practiceState.retries * 7) - (practiceState.hintsUsed * 3)));
  practiceState.transferIndicator = Boolean(practiceState.transferIndicator || question.category === 'Transferir' || practiceState.mode === 'transferir');
  recordPracticeEvidence('answer.confirmed', { questionId, category: question.category || '', result: 'correct' });
  savePracticeState();
  renderPractice();
  playInterfaceTone('success');
}

function nextPracticeQuestion() {
  if (!practiceState) return;
  if (practiceState.currentPosition >= practiceState.order.length - 1) {
    practiceState.completed = true;
    practiceState.completedAt = new Date().toISOString();
    practiceState.outcome = 'ronda completada';
    recordPracticeEvidence('round.completed', { completedQuestions: practiceState.completedQuestionIds.length });
  } else {
    practiceState.currentPosition += 1;
    recordPracticeEvidence('question.advanced', { currentPosition: practiceState.currentPosition });
  }
  savePracticeState();
  renderPractice();
  document.querySelector('#practiceQuestionCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function restartFreePractice() {
  const content = freePracticeContent();
  const nextRound = (practiceState?.round || 1) + 1;
  practiceState = defaultPracticeState(content, nextRound);
  savePracticeState();
  renderPractice();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setPracticeMode(modeId) {
  const content = freePracticeContent();
  if (!content?.lab?.modes?.some((mode) => mode.id === modeId) || !practiceState) return;
  practiceState.mode = modeId;
  practiceState.transferIndicator = Boolean(practiceState.transferIndicator || modeId === 'transferir');
  recordPracticeEvidence('level.changed', { nextLevel: modeId });
  savePracticeState();
  renderPractice();
  playInterfaceTone('tap');
}

function openPracticeLink(linkId) {
  const content = freePracticeContent();
  if (!content?.lab?.links?.some((link) => link.id === linkId) || !practiceState) return;
  practiceState.activeLinkId = practiceState.activeLinkId === linkId ? '' : linkId;
  if (!practiceState.openedLinks.includes(linkId)) practiceState.openedLinks.push(linkId);
  practiceState.sourcesConsulted = Array.isArray(practiceState.sourcesConsulted) ? practiceState.sourcesConsulted : [];
  if (!practiceState.sourcesConsulted.includes(linkId)) practiceState.sourcesConsulted.push(linkId);
  recordPracticeEvidence('source.consulted', { linkId });
  savePracticeState();
  renderPractice();
  playInterfaceTone('tap');
}

function generateNewPracticeVariant() {
  const content = freePracticeContent();
  if (!content?.lab?.variants?.length || !practiceState) {
    restartFreePractice();
    return;
  }
  const nextRound = (practiceState.round || 1) + 1;
  const nextVariant = (Number(practiceState.variantIndex) + 1) % content.lab.variants.length;
  practiceState = {
    ...defaultPracticeState(content, nextRound),
    mode: practiceState.mode,
    variantIndex: nextVariant,
    transferIndicator: practiceState.transferIndicator || practiceState.mode === 'transferir'
  };
  recordPracticeEvidence('variant.generated', { nextVariant });
  savePracticeState();
  renderPractice();
  showToast('Nueva situación generada con condiciones diferentes.');
  playInterfaceTone('success');
}

function reviewerCompletePractice() {
  const content = freePracticeContent();
  if (!content || !practiceState) return;
  practiceState.completedQuestionIds = content.questions.map((_, index) => index);
  practiceState.currentPosition = content.questions.length - 1;
  practiceState.completed = true;
  practiceState.completedAt = new Date().toISOString();
  practiceState.outcome = 'ronda completada';
  recordPracticeEvidence('round.completed.by_reviewer', { completedQuestions: content.questions.length });
  savePracticeState();
  renderPractice();
  showToast('Admin: Práctica libre completada para revisión.');
}

function evaluationStorageKey(module = selected) {
  return `aulatp-evaluation-${module.number}`;
}

function rotateEvaluationOptions(options, answer, seed) {
  const normalized = options.map((option) => String(option));
  const shift = normalized.length ? seed % normalized.length : 0;
  const rotated = [...normalized.slice(shift), ...normalized.slice(0, shift)];
  return {
    options: rotated,
    answer: rotated.indexOf(normalized[answer])
  };
}

function normalizeEvaluationOptions(options = [], answer = 0, seed = 0) {
  const original = options.map((option) => String(option).trim()).filter(Boolean);
  const correct = original[answer] || original[0] || 'Aplicar el criterio técnico del caso y verificar con evidencia.';
  const distractorPool = [
    'Resolver por intuición y registrar solo el resultado final.',
    'Aplicar una pauta general sin contrastar los datos específicos del caso.',
    'Postergar la verificación y avanzar si la respuesta parece razonable.',
    'Priorizar rapidez por sobre seguridad, evidencia y registro.',
    'Elegir el recurso más conocido aunque no responda al problema planteado.',
    'Cerrar la actividad sin explicar el criterio utilizado.'
  ];
  const variedDistractors = [...distractorPool.slice(seed % distractorPool.length), ...distractorPool.slice(0, seed % distractorPool.length)];
  const ordered = [correct, ...original.filter((option) => option !== correct), ...variedDistractors]
    .filter((option, index, arr) => arr.indexOf(option) === index)
    .slice(0, 4);
  const rotated = rotateEvaluationOptions(ordered, 0, seed);
  return {
    options: rotated.options,
    answer: rotated.answer
  };
}

function evaluationQuestionVisual(practice, module, index, category = '', prompt = '') {
  const text = `${category} ${prompt}`.toLowerCase();
  const curatedVisuals = [];
  if (currentCourseId === 'electricidad-3m') {
    curatedVisuals.push(
      {
        test: /alcance|potencia|calefacci[oó]n|placa|protecci[oó]n|conductor|demanda|montaje|termostato|sobret|cambio de carga|entrega|integraci[oó]n/,
        src: 'assets/electricity-eval-panel-motor-heater-v1.png',
        alt: 'Tablero de baja tension con motor monofasico y calefactor en banco de entrenamiento',
        caption: 'Relaciona equipos, potencia instalada, protecciones y entrega segura.'
      },
      {
        test: /control de energ[ií]a|instrumento|ausencia de tensi[oó]n|protecci[oó]n|aislaci[oó]n|apriete|seguridad|riesgo|verificaci[oó]n/,
        src: 'assets/electricity-eval-safety-verification-v1.png',
        alt: 'Banco electrico con bloqueo, instrumentos de medicion y elementos de proteccion personal',
        caption: 'Usa la evidencia visual para justificar control de energia, medicion y seguridad.'
      },
      {
        test: /plano|cubicaci[oó]n|presupuesto|memoria|diagrama|canalizaci[oó]n|proyecto|material|conductor/,
        src: 'assets/electricity-eval-plans-cubicacion-v1.png',
        alt: 'Planos electricos, diagrama unilineal, materiales e instrumentos para cubicacion',
        caption: 'Contrasta plano, memoria de calculo, materiales y presupuesto.'
      },
      {
        test: /mantenimiento|motor|vibra|correctivo|preventivo|falla|componente|m[aá]quina/,
        src: 'assets/electricity-eval-maintenance-v1.png',
        alt: 'Motor electrico de entrenamiento con instrumentos y pauta de mantenimiento',
        caption: 'Observa componentes, mediciones y evidencias de mantenimiento.'
      }
    );
  } else if (String(module?.number) === '5' || /daniela|confidencialidad|trazabilidad|credencial|registro/.test(text)) {
    curatedVisuals.push(
      {
        test: /contrase[nñ]a|credencial|acceso|ses[ió]n|cuenta|autor[ií]a/,
        src: 'assets/nursing-eval-credentials-v1.png',
        alt: 'Profesionales de salud frente a pantalla de acceso protegido con credenciales personales',
        caption: 'Relaciona credenciales personales, autoria y trazabilidad del registro.'
      },
      {
        test: /corrige|correcci[oó]n|error|trazabilidad|fecha|motivo|autor|hora incorrecta|historial/,
        src: 'assets/nursing-eval-traceability-v1.png',
        alt: 'Tablet con registro clinico generico y correccion trazable sin datos personales visibles',
        caption: 'Analiza como corregir sin borrar evidencia, fecha, motivo ni responsable.'
      },
      {
        test: /confidencialidad|hija|mensajer[ií]a|canal|autoriz|identidad|ficha|informaci[oó]n|privacidad|registro/,
        src: 'assets/nursing-eval-confidentiality-v1.png',
        alt: 'Estacion de enfermeria con ficha clinica digital protegida y carpeta de privacidad',
        caption: 'Observa la relacion entre privacidad, canal autorizado y acceso minimo necesario.'
      }
    );
  }
  const selectedVisual = curatedVisuals.find((item) => item.test.test(text));
  if (selectedVisual) return selectedVisual;
  const media = Array.isArray(practice?.lab?.media) ? practice.lab.media : [];
  const visualPool = [
    practice?.image,
    ...media.map((item) => item.src).filter(Boolean),
    practice?.detailImage,
    module?.image
  ].filter(Boolean).filter((src, position, arr) => arr.indexOf(src) === position);
  const src = visualPool[index % Math.max(visualPool.length, 1)] || practice?.image || 'assets/electricity-module-graphic-v2.webp';
  const captions = [
    'Observa la escena y relaciona la decisión con evidencia verificable.',
    'Usa la imagen como apoyo para reconocer componentes, secuencia y criterio técnico.',
    'Contrasta la situación visual con la alternativa que mejor justifica el cierre.',
    'Identifica condiciones seguras, datos relevantes y registro esperado.'
  ];
  return {
    src,
    alt: `${category || 'Pregunta'} · apoyo visual de evaluación final`,
    caption: captions[index % captions.length]
  };
}

function makeEvaluationQuestion(category, prompt, correct, distractors, hint, seed) {
  const rotated = normalizeEvaluationOptions([correct, ...distractors], 0, seed);
  return {
    category,
    prompt,
    options: rotated.options,
    answer: rotated.answer,
    hint,
    feedback: hint
  };
}

function buildEvaluationQuestionBank(practice, module) {
  const curated = courseProfile.evaluationQuestionsByModule?.[module.number];
  if (curated?.length) return curated.map((question, index) => ({ ...question,
    ...rotateEvaluationOptions(question.options, question.answer, index % 3),
    visual: question.visual || evaluationQuestionVisual(practice, module, index, question.category, question.prompt)
  }));
  const focus = practice.focus?.length ? practice.focus : ['Seguridad', 'Procedimiento', 'Registro'];
  const caseName = practice.patient || 'caso profesional';
  const setting = practice.setting || 'entorno de práctica';
  const summary = practice.summary || 'situación profesional del módulo';
  const caseType = practice.caseTypeLabel || courseUiLabels.practiceCaseType;
  const isElectricity = currentCourseId === 'electricidad-3m';
  const domain = isElectricity ? 'técnica eléctrica' : 'técnica de atención';
  const riskControl = isElectricity ? 'control de energía, protección, medición y trazabilidad' : 'seguridad, técnica, comunicación y registro';
  const dataUnexpected = isElectricity ? 'dato eléctrico inesperado' : 'dato técnico o clínico inesperado';
  const professionalScope = isElectricity ? 'personas, equipos e instalación' : 'persona atendida, equipo e institución';
  const evidenceLabel = isElectricity ? 'medición, criterio técnico, decisión y condición de entrega' : 'dato observado, criterio técnico, decisión y continuidad del cuidado';
  const generated = [
    ['Interpretación del caso', `Antes de resolver ${caseName}, ¿qué lectura inicial permite decidir con mayor fundamento?`, 'Identificar propósito, restricciones, riesgos, datos del caso y evidencia requerida', ['Revisar solo el procedimiento general y ajustar durante la ejecución', 'Comenzar por la alternativa que parece más eficiente y corregir si aparece un problema'], 'Primero se comprende el caso; después se decide.'],
    ['Seguridad y control de riesgo', `En ${setting}, ¿qué criterio debe sostenerse durante toda la intervención?`, `Aplicar ${riskControl} antes, durante y después de actuar`, ['Aplicar seguridad al inicio y dejar la verificación para el cierre', 'Resolver primero la tarea principal y registrar los riesgos pendientes al final'], 'La seguridad no es una etapa aislada: acompaña todo el procedimiento.'],
    ['Aplicación técnica', `¿Qué demuestra aplicación real del módulo ${module.number}?`, 'Usar datos del caso para seleccionar una acción técnica justificada', ['Elegir un procedimiento correcto en general aunque no responda a los datos del caso', 'Describir el concepto principal sin vincularlo con una decisión observable'], 'Aplicar implica decidir con información contextual.'],
    ['Análisis', `El caso indica: "${summary}". ¿Qué análisis corresponde?`, 'Distinguir datos críticos, condiciones aceptables y posibles no conformidades', ['Identificar solo el dato más visible y continuar con el procedimiento estándar', 'Separar datos relevantes, pero omitir criterios de aceptación para ahorrar tiempo'], 'Analizar es separar datos, riesgos y criterios de aceptación.'],
    ['Procedimiento', `¿Qué secuencia general reduce errores en ${caseName}?`, 'Preparar, intervenir según procedimiento, verificar y registrar', ['Preparar e intervenir, dejando la verificación solo si aparece una falla', 'Intervenir, registrar intención de mejora y verificar en una sesión posterior'], 'La secuencia profesional reduce omisiones.'],
    ['Medición y verificación', `Si aparece un ${dataUnexpected}, ¿qué decisión es correcta?`, 'Revisar técnica/instrumento, repetir o contrastar y comunicar si persiste', ['Mantener el dato si coincide con una hipótesis previa', 'Repetir la acción principal sin revisar condiciones de medición'], 'Un dato inesperado se valida antes de concluir.'],
    ['Registro', '¿Qué registro entrega mayor trazabilidad?', `${evidenceLabel}, resultado y responsable`, ['Resultado final y observación breve sin explicar el criterio usado', 'Lista de tareas realizadas sin datos de verificación ni responsable'], 'La trazabilidad permite continuidad y revisión docente.'],
    ['Comunicación profesional', '¿Cómo se comunica una decisión del módulo?', 'Con lenguaje claro, objetivo y apoyado en evidencia del caso', ['Con lenguaje técnico amplio, aunque no se indiquen los datos que lo respaldan', 'Con una conclusión breve y dejando el detalle para consulta posterior'], 'La comunicación profesional explica el porqué.'],
    ['No conformidad', 'Si una condición no cumple el criterio esperado, ¿qué corresponde?', 'Mantener en revisión, corregir, volver a verificar y registrar', ['Dejar una observación pendiente y liberar si el funcionamiento general parece estable', 'Corregir parcialmente y registrar que requiere seguimiento posterior'], 'La no conformidad requiere acción correctiva verificable antes de cerrar.'],
    ['Autonomía de aprendizaje', '¿Qué conducta muestra aprendizaje autónomo?', 'Usar pistas, fuentes y retroalimentación para mejorar una decisión', ['Repetir el intento cambiando una alternativa sin explicar el motivo', 'Pedir confirmación externa antes de revisar la evidencia disponible'], 'La autonomía usa evidencia para ajustar el razonamiento.'],
    [
      'Criterio profesional',
      `En una ${caseType}, ¿qué criterio permite cerrar la actividad con responsabilidad?`,
      isElectricity ? 'Seguridad controlada, verificación técnica, documentación y entrega trazable' : 'Seguridad, técnica, comunicación, registro y continuidad del cuidado',
      isElectricity
        ? ['Una pauta visual que reemplaza la lectura técnica del caso', 'Un recurso opcional sin relación con protecciones, mediciones ni registro']
        : ['Una guía rápida que reemplaza el análisis cuando el caso es complejo', 'Un resumen visual del módulo sin relación directa con la toma de decisiones'],
      'La evaluación final mide aplicación y análisis; los marcos normativos se trabajan como contexto durante el recorrido previo.'
    ],
    ['LINKS', '¿Cuándo aporta más abrir LINKS?', 'Antes de decidir o al contrastar una hipótesis con fuentes confiables', ['Solo después de responder, para justificar la alternativa ya elegida', 'Cuando el estudiante necesita evitar revisar el caso completo'], 'LINKS orienta investigación; no funciona como solucionario.'],
    ['Criterio curricular', `¿Cómo se evidencia el aprendizaje esperado del módulo ${module.number}?`, `Resolviendo el caso con ${domain}, seguridad, verificación y registro`, ['Completando preguntas correctas sin explicar el criterio usado', 'Aplicando una pauta general aunque falte conexión con el aprendizaje esperado'], 'El AE se demuestra integrando acción y criterio.'],
    ['Priorización', `Si hay poco tiempo en ${caseName}, ¿qué no debe omitirse?`, 'La condición de seguridad, la verificación crítica y el registro mínimo', ['La revisión documental completa, aunque se postergue la verificación crítica', 'La comunicación de cierre, aunque todavía falte comprobar un criterio clave'], 'La presión de tiempo no elimina criterios esenciales.'],
    ['Evidencia', '¿Qué evidencia permite defender la respuesta ante un docente?', 'Datos del caso, criterio técnico, decisión tomada y resultado verificado', ['Una explicación correcta, pero sin resultado observable asociado', 'Una descripción del procedimiento sin indicar qué dato confirmó la decisión'], 'La evidencia conecta decisión y resultado.'],
    ['Instrumentos y recursos', `¿Cómo deben usarse los recursos disponibles en ${setting}?`, 'Según el propósito del procedimiento y el criterio de verificación', ['Según el orden en que aparecen en la pantalla de la actividad', 'Priorizando el recurso más conocido aunque no responda al problema'], 'Los recursos se seleccionan por función y seguridad.'],
    ['Retroalimentación', '¿Qué haces con una pista recibida durante la evaluación?', 'Revisar el concepto, corregir la decisión y explicar el cambio', ['Cambiar la respuesta y continuar sin revisar por qué estaba incompleta', 'Mantener la respuesta si parecía razonable y dejar la pista para el resumen'], 'La retroalimentación sirve para ajustar el razonamiento.'],
    ['Continuidad', '¿Qué permite continuar al siguiente módulo con base sólida?', 'Cerrar preguntas, checklist, situación de desarrollo y reflexión de mejora', ['Completar la mayoría de preguntas y dejar la situación de desarrollo para después', 'Revisar el resumen final sin volver sobre errores o criterios débiles'], 'El cierre asegura continuidad formativa.'],
    ['Foco del módulo', `¿Cómo se valida el foco "${focus[0]}" en esta evaluación?`, `Aplicando ${focus[0]} con seguridad, evidencia y registro`, ['Nombrándolo correctamente en la respuesta final', 'Usándolo como criterio secundario después de completar la acción principal'], 'El foco se valida cuando guía decisiones.'],
    ['Integración', `¿Qué integra mejor los aprendizajes esperados de ${module.title}?`, 'Analizar antecedentes, aplicar procedimiento, verificar resultado y justificar la entrega', ['Responder bien cada pregunta aunque la situación de desarrollo no conecte los aprendizajes', 'Completar el checklist y dejar la justificación solo en formato verbal'], 'La evaluación final debe integrar, no fragmentar.'],
    ['Responsabilidad profesional', `¿Qué decisión protege mejor a ${professionalScope}?`, 'Actuar dentro del rol, con criterio técnico y registro verificable', ['Actuar con buena intención aunque falte una verificación formal', 'Delegar el registro si otra persona observó parte del procedimiento'], 'La responsabilidad profesional delimita acción y evidencia.'],
    ['Calidad', '¿Qué diferencia una práctica aceptable de una demostración institucional sólida?', 'Coherencia entre caso, respuesta, evidencia, feedback y mejora', ['Buen desempeño en preguntas aunque falte análisis de cierre', 'Diseño visual claro aunque el registro no detalle la evidencia'], 'La calidad se ve en el flujo completo de aprendizaje.'],
    ['Transferencia', '¿Qué indica que puedes transferir lo aprendido a otro caso?', 'Resolver una variante justificando el criterio y no solo recordando la respuesta', ['Reconocer una situación parecida y aplicar el mismo orden sin comparar condiciones', 'Recordar la alternativa correcta de la actividad previa'], 'Transferir es aplicar criterio en condiciones nuevas.'],
    ['Análisis de consecuencias', 'Antes de cerrar, ¿qué consecuencia debe analizarse?', 'Qué ocurre si se omite la verificación o se registra evidencia incompleta', ['Qué parte del procedimiento tomó más tiempo que lo previsto', 'Qué opción parecía más directa al inicio del caso'], 'Analizar consecuencias previene errores críticos.'],
    ['Cierre reflexivo', '¿Qué reflexión tiene mayor valor formativo?', 'Una mejora concreta vinculada a una decisión, un riesgo y una evidencia del caso', ['Una conclusión positiva sobre el resultado general del módulo', 'Una descripción de lo realizado sin indicar cómo mejorará el siguiente intento'], 'La reflexión debe orientar una mejora observable.']
  ].map((item, index) => makeEvaluationQuestion(item[0], item[1], item[2], item[3], item[4], index + Number(module.number)));

  const practiceQuestions = (practice.questions || []).map((question, index) => {
    const rotated = normalizeEvaluationOptions(question.options || [], Number(question.answer || 0), index + 2);
    return {
      ...question,
      category: question.category || `Competencia ${index + 1}`,
      options: rotated.options,
      answer: rotated.answer,
      hint: question.hint || question.feedback || courseUiLabels.evaluationQuestionHint,
      feedback: question.feedback || question.hint || courseUiLabels.evaluationQuestionHint
    };
  });

  const combined = [...practiceQuestions, ...generated];
  return combined.slice(0, 25).map((question, index) => ({
    ...question,
    category: question.category || `Competencia ${index + 1}`,
    visual: question.visual || evaluationQuestionVisual(practice, module, index, question.category || `Competencia ${index + 1}`, question.prompt)
  }));
}

function evaluationContent(module = selected) {
  const practice = freePracticeContent(module);
  if (!practice) return null;
  const questions = buildEvaluationQuestionBank(practice, module);
  return {
    patient: practice.patient,
    setting: practice.setting,
    image: practice.image,
    imageAlt: practice.imageAlt,
    summary: practice.summary,
    focus: [...new Set([...(practice.focus || []), 'Cierre de módulo', 'Continuidad'])].slice(0, 6),
    questions,
    artifacts: currentCourseId === 'electricidad-3m' && String(module.number) === '1' ? [
      { key: 'diagram', title: 'Diagrama de los dos circuitos', instruction: 'Construye un esquema textual con flechas y ramificaciones: origen del circuito, protecciones, motor, calefactor, neutro y conductor de protección. Identifica cada circuito. Alcance: baja tensión, máximo 5 kW y sin alimentadores.' },
      { key: 'calculation', title: 'Memoria de cálculo y selección', instruction: 'Usa los datos del caso: 1,5 kW eléctricos del motor y 2 kW del calefactor a 220 V. Calcula potencia total y corriente del calefactor resistivo. Explica qué datos faltan para dimensionar conductor y protección del motor y calefactor; no inventes valores.' },
      { key: 'quantities', title: 'Cubicación y presupuesto', instruction: 'Construye una tabla textual: material | unidad | cantidad | precio unitario ficticio | subtotal. Circuito de calefacción: 12 m de recorrido, tres conductores individuales. Añade canalización, accesorios, reservas justificadas y mano de obra separada. Explicita supuestos y total.' }
    ] : [],
    developmentSituation: {
      title: `Situación de desarrollo · ${module.title}`,
      prompt: `Analiza el caso "${practice.patient}" e integra los aprendizajes esperados del módulo. Explica: 1) datos críticos, 2) riesgos o no conformidades, 3) acción profesional prioritaria, 4) verificación requerida y 5) evidencia que dejarías para continuar.`,
      placeholder: 'Ejemplo: identifico como datos críticos..., el principal riesgo es..., priorizo..., verifico mediante..., y registro como evidencia...',
      rubric: [
        'Analiza antecedentes relevantes del caso.',
        'Aplica aprendizajes esperados del módulo.',
        'Justifica una decisión profesional segura con verificación y evidencia.',
        'Define verificación y evidencia de cierre.'
      ]
    },
    checklist: [
      `Reconozco el propósito del módulo: ${module.title}.`,
      'Puedo justificar mis decisiones usando datos del caso.',
      'Identifico riesgos, límites del rol y acciones seguras.',
      'Registro o comunico hallazgos de manera objetiva.',
      'Sé qué aspecto debo reforzar antes de avanzar.'
    ]
  };
}

function loadEvaluationState(module = selected) {
  try {
    return { answers: {}, reflection: '', completed: false, reviewTopics: [], ...(JSON.parse(localStorage.getItem(evaluationStorageKey(module)) || '{}')) };
  } catch (error) {
    return { answers: {}, reflection: '', completed: false, reviewTopics: [] };
  }
}

function saveEvaluationState(state, module = selected) {
  localStorage.setItem(evaluationStorageKey(module), JSON.stringify(state));
}

function collectEvaluationArtifacts(state) {
  const artifacts = { ...(state.artifacts || {}) };
  document.querySelectorAll('[data-evaluation-artifact]').forEach((input) => {
    artifacts[input.dataset.evaluationArtifact] = input.value.trim();
  });
  return artifacts;
}

function evaluationArtifactsMarkup(content, state, printable = false) {
  if (!content.artifacts?.length) return '';
  return `<section class="evaluation-artifacts"><h3>Evidencias OA4 · AE1 y AE2</h3>
    <p>Rúbrica docente por evidencia: 0 = ausente; 1 = parcial o con errores; 2 = coherente, justificada y verificable. Total: 6 puntos de revisión, separado de las 25 preguntas. La extensión del texto no determina calidad.</p>
    ${content.artifacts.map((item) => `<label><strong>${item.title}</strong><span>${item.instruction}</span>${printable
      ? `<pre style="white-space:pre-wrap">${escapePdfHtml(state.artifacts?.[item.key] || 'Espacio para desarrollar la evidencia') }</pre>`
      : `<textarea data-evaluation-artifact="${item.key}" rows="5" ${state.completed ? 'disabled' : ''} aria-label="${item.title}">${escapePdfHtml(state.artifacts?.[item.key] || '')}</textarea>`}</label>`).join('')}
    <p>La entrega digital permite revisar tu razonamiento. La ejecución práctica requiere observación docente en el entorno formativo.</p></section>`;
}

function evaluationProgress(content, state) {
  const answered = Object.keys(state.answers || {}).length;
  const correct = content.questions.filter((question, index) => Number(state.answers?.[index]) === question.answer).length;
  const checks = [...document.querySelectorAll('#evaluationChecklist input:checked')].length;
  const reflection = (document.querySelector('#evaluationReflection')?.value.trim() || state.reflection || '').length >= 120 ? 1 : 0;
  const confirm = document.querySelector('#evaluationConfirm')?.checked || state.completed ? 1 : 0;
  const total = content.questions.length + content.checklist.length + 2;
  return Math.round(((correct + checks + reflection + confirm) / total) * 100);
}

function updateEvaluationProgress(content, state) {
  const progress = state.completed ? 100 : evaluationProgress(content, state);
  document.querySelector('#evaluationProgressLabel').textContent = `${progress} %`;
  document.querySelector('#evaluationProgressFill').style.width = `${progress}%`;
  document.querySelector('#evaluationStateLabel').textContent = state.completed ? 'Resumen listo' : 'En evaluación';
}

function evaluationResult(content, state) {
  const answers = state.answers || {};
  const questionTotal = content.questions.length;
  const correct = content.questions.filter((question, index) => Number(answers[index]) === question.answer).length;
  const checklistTotal = content.checklist.length;
  const checklistDone = state.completed ? checklistTotal : [...document.querySelectorAll('#evaluationChecklist input:checked')].length;
  const reflection = (state.reflection || document.querySelector('#evaluationReflection')?.value || '').trim();
  const reflectionDone = reflection.length >= 120 ? 1 : 0;
  const confirmed = state.completed || document.querySelector('#evaluationConfirm')?.checked ? 1 : 0;
  const total = questionTotal + checklistTotal + 2;
  // Checklist and text length describe submission, not demonstrated mastery.
  const score = questionTotal ? Math.round((correct / questionTotal) * 100) : 0;
  const grade = Math.max(1, Math.min(7, 1 + (score / 100) * 6));
  return {
    score,
    grade: grade.toFixed(1).replace('.', ','),
    correct,
    questionTotal,
    checklistDone,
    checklistTotal,
    reflectionLength: reflection.length
  };
}

function evaluationSummaryFeedback(result, module = selected) {
  if (result.score >= 90) {
    return `Integraste correctamente las decisiones centrales del módulo ${module.number}: interpretaste el caso, priorizaste datos relevantes, cerraste la revisión y dejaste evidencia para continuar.`;
  }
  if (result.score >= 75) {
    return `Tienes una base sólida en el módulo ${module.number}. Conviene reforzar las decisiones donde aparecieron pistas y revisar cómo comunicas la evidencia antes de avanzar.`;
  }
  return `Necesitas volver sobre las preguntas y el checklist del módulo ${module.number}. Revisa los datos del caso, corrige las decisiones y completa una reflexión más concreta antes de continuar.`;
}

function evaluationEncouragement(result, module = selected) {
  if (Number(module.number) < modules.length) {
    return `Ánimo, ya cerraste este tramo. Sigue con el siguiente módulo manteniendo el mismo foco: observar, decidir con evidencia y comunicar con claridad.`;
  }
  return 'Ánimo, completaste el cierre del recorrido. Conserva este resumen como guía para seguir practicando y fortalecer tu desempeño profesional.';
}

function evaluationStrengths(content, result) {
  const strengths = [];
  if (result.correct === result.questionTotal) strengths.push('Respondiste correctamente las decisiones técnicas centrales del caso.');
  if (result.checklistDone === result.checklistTotal) strengths.push('Confirmaste todos los criterios de cierre y seguridad antes de avanzar.');
  if (result.reflectionLength >= 120) strengths.push('Dejaste una reflexión extensa, útil para explicar tu razonamiento profesional.');
  if (!strengths.length) strengths.push('Completaste el cierre y tienes una base concreta para mejorar el siguiente intento.');
  return strengths.slice(0, 3);
}

function evaluationReviewTopics(content, state) {
  const stored = Array.isArray(state.reviewTopics) ? state.reviewTopics : [];
  const fromAttempts = stored
    .filter((topic) => topic && topic.category)
    .map((topic) => ({
      category: topic.category,
      prompt: topic.prompt,
      hint: topic.hint || courseUiLabels.evaluationQuestionHint
    }));
  if (fromAttempts.length) return fromAttempts.slice(0, 4);
  return content.questions.slice(0, 3).map((question) => ({
    category: question.category,
    prompt: question.prompt,
    hint: question.feedback || question.hint || courseUiLabels.evaluationQuestionHint
  }));
}

function evaluationMasteryMarkup(result) {
  const questionPct = result.questionTotal ? Math.round((result.correct / result.questionTotal) * 100) : 0;
  const checklistPct = result.checklistTotal ? Math.round((result.checklistDone / result.checklistTotal) * 100) : 0;
  const reflectionPct = Math.min(100, Math.round((result.reflectionLength / 120) * 100));
  const items = [
    ['Decisiones del caso', questionPct, `${result.correct} de ${result.questionTotal} respuestas correctas`],
    ['Criterios de cierre', checklistPct, `${result.checklistDone} de ${result.checklistTotal} verificaciones confirmadas`],
    ['Evidencia escrita', reflectionPct, `${result.reflectionLength} caracteres de reflexión técnica`]
  ];
  return items.map(([label, value, detail]) => `
    <article class="evaluation-mastery-item">
      <div><strong>${label}</strong><span>${detail}</span></div>
      <b>${value}%</b>
      <i aria-hidden="true"><em style="width:${value}%"></em></i>
    </article>`).join('');
}

function evaluationSummaryGraphsMarkup(result) {
  const questionPct = result.questionTotal ? Math.round((result.correct / result.questionTotal) * 100) : 0;
  const checklistPct = result.checklistTotal ? Math.round((result.checklistDone / result.checklistTotal) * 100) : 0;
  const reflectionPct = Math.min(100, Math.round((result.reflectionLength / 120) * 100));
  const bars = [
    ['Preguntas', questionPct, `${result.correct}/${result.questionTotal}`],
    ['Checklist', checklistPct, `${result.checklistDone}/${result.checklistTotal}`],
    ['Desarrollo', reflectionPct, `${result.reflectionLength} caracteres`],
    ['Logro total', result.score, `${result.score}%`]
  ];
  return `
    <div class="evaluation-visual-summary" aria-label="Gráficos del resumen de evaluación">
      <article class="evaluation-donut-card">
        <div class="evaluation-donut" style="--score:${result.score}"><span>${result.score}%</span></div>
        <div><small>Logro integrado</small><strong>Resultado general</strong><p>Combina preguntas, checklist y situación de desarrollo.</p></div>
      </article>
      <article class="evaluation-bars-card">
        <small>Desglose visual</small>
        <h3>Áreas del cierre</h3>
        <div>${bars.map(([label, value, detail]) => `<p><span>${label}</span><b>${detail}</b><i aria-hidden="true"><em style="width:${value}%"></em></i></p>`).join('')}</div>
      </article>
    </div>`;
}

function evaluationNextActions(module = selected) {
  return [
    `Repasa el caso del módulo ${module.number} y subraya qué dato justifica cada decisión.`,
    'Explica en voz alta el procedimiento como si lo presentaras a un docente o supervisor.',
    'Vuelve a la práctica libre y confirma que puedes repetir el criterio sin ayuda de pistas.'
  ];
}

function escapePdfHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function collectEvaluationExportState(content, state) {
  const answers = { ...(state.answers || {}) };
  document.querySelectorAll('[data-evaluation-question]').forEach((card, index) => {
    const choice = card.querySelector('input:checked');
    if (choice) answers[index] = Number(choice.value);
  });
  const checklist = [...document.querySelectorAll('#evaluationChecklist input')].map((input, index) => ({
    label: content.checklist[index],
    checked: state.completed || input.checked
  }));
  const reflection = (document.querySelector('#evaluationReflection')?.value || state.reflection || '').trim();
  return { ...state, answers, checklist, reflection, artifacts: collectEvaluationArtifacts(state) };
}

function evaluationPdfQuestionMarkup(content, exportState) {
  return content.questions.map((question, index) => {
    const selectedAnswer = Number(exportState.answers?.[index]);
    const hasAnswer = Number.isInteger(selectedAnswer) && selectedAnswer >= 0;
    const isCorrect = hasAnswer && selectedAnswer === question.answer;
    return `
      <article class="pdf-question ${isCorrect ? 'is-correct' : hasAnswer ? 'is-review' : 'is-pending'}">
        <header>
          <span>${String(index + 1).padStart(2, '0')}</span>
          <div><small>${escapePdfHtml(question.category || 'Competencia')}</small><h3>${escapePdfHtml(question.prompt)}</h3></div>
        </header>
        ${question.visual?.src ? `<figure class="pdf-question-visual"><img src="${escapePdfHtml(question.visual.src)}" alt="${escapePdfHtml(question.visual.alt || 'Apoyo visual de la pregunta')}" /><figcaption>${escapePdfHtml(question.visual.caption || 'Apoyo visual para analizar la situación.')}</figcaption></figure>` : ''}
        <ol>
          ${(question.options || []).map((option, optionIndex) => {
            const selected = hasAnswer && selectedAnswer === optionIndex;
            const correct = question.answer === optionIndex;
            return `<li class="${selected ? 'selected' : ''} ${correct ? 'correct' : ''}"><b>${String.fromCharCode(65 + optionIndex)}</b><span>${escapePdfHtml(option)}</span>${selected ? '<em>Marcada</em>' : ''}${correct ? '<strong>Correcta</strong>' : ''}</li>`;
          }).join('')}
        </ol>
        <p><strong>Pista / criterio:</strong> ${escapePdfHtml(question.hint || question.feedback || courseUiLabels.evaluationQuestionHint)}</p>
      </article>`;
  }).join('');
}

function evaluationPdfQuestionInstrumentMarkup(content) {
  return content.questions.map((question, index) => `
    <article class="pdf-question is-instrument">
      <header>
        <span>${String(index + 1).padStart(2, '0')}</span>
        <div><small>${escapePdfHtml(question.category || 'Competencia')}</small><h3>${escapePdfHtml(question.prompt)}</h3></div>
      </header>
      ${question.visual?.src ? `<figure class="pdf-question-visual"><img src="${escapePdfHtml(question.visual.src)}" alt="${escapePdfHtml(question.visual.alt || 'Apoyo visual de la pregunta')}" /><figcaption>${escapePdfHtml(question.visual.caption || 'Apoyo visual para analizar la situación.')}</figcaption></figure>` : ''}
      <ol>
        ${(question.options || []).map((option, optionIndex) => `<li class="${question.answer === optionIndex ? 'correct' : ''}"><b>${String.fromCharCode(65 + optionIndex)}</b><span>${escapePdfHtml(option)}</span>${question.answer === optionIndex ? '<strong>Clave</strong>' : ''}</li>`).join('')}
      </ol>
      <p><strong>Criterio de corrección:</strong> ${escapePdfHtml(question.hint || question.feedback || courseUiLabels.evaluationQuestionHint)}</p>
    </article>`).join('');
}

function exportEvaluationQuestionsPdf(module = selected) {
  const content = evaluationContent(module);
  if (!content) return;
  const development = content.developmentSituation || {};
  const generatedAt = new Date().toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
  const title = `Aula TP Chile · Instrumento docente · Módulo ${module.number}`;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showEvaluationFeedback('<strong>No se pudo abrir el PDF de preguntas.</strong> Permite ventanas emergentes para Aula TP Chile y vuelve a intentarlo.');
    return;
  }
  printWindow.document.write(`<!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapePdfHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #08224d; background: #f4f8fc; font-family: Arial, Helvetica, sans-serif; line-height: 1.45; }
        main { width: min(1080px, 100%); margin: 0 auto; padding: 28px; }
        .pdf-hero { padding: 28px; border-radius: 24px; color: #fff; background: linear-gradient(135deg, #061d4d, #075bd8 58%, #6d28d9); }
        .pdf-brand { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 24px; }
        .pdf-brand strong { font-size: 22px; }
        .pdf-brand span { display: block; color: #dbeafe; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        h1 { margin: 0 0 8px; font-size: 34px; line-height: 1.05; }
        h2 { margin: 28px 0 12px; color: #073f99; font-size: 22px; }
        h3 { margin: 0; color: #06377a; font-size: 15px; }
        p { margin: 0; }
        .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px; }
        .meta-grid article, .development, .pdf-question { padding: 16px; border: 1px solid #c7dced; border-radius: 16px; background: #fff; }
        .meta-grid small, .pdf-question small { display: block; color: #007f88; font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .meta-grid strong { display: block; margin-top: 4px; color: #073f99; font-size: 18px; }
        .questions { display: grid; gap: 14px; }
        .pdf-question { break-inside: avoid; }
        .pdf-question header { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: start; }
        .pdf-question header > span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; color: #fff; background: #075bd8; font-weight: 900; }
        .pdf-question-visual { display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: center; margin: 14px 0 6px; padding: 10px; border: 1px solid #d8e8f6; border-radius: 14px; background: #f4f9ff; }
        .pdf-question-visual img { width: 180px; height: 110px; object-fit: cover; border-radius: 12px; }
        .pdf-question-visual figcaption { color: #315f8d; font-size: 12px; line-height: 1.35; }
        .pdf-question ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0 10px; padding: 0; list-style: none; }
        .pdf-question li { display: grid; grid-template-columns: 28px 1fr auto; gap: 8px; align-items: center; padding: 9px 10px; border: 1px solid #e1ebf5; border-radius: 10px; background: #f8fbff; }
        .pdf-question li b { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: #06377a; background: #e6f0ff; }
        .pdf-question li.correct { border-color: #8bd5c7; background: #ecfff9; }
        .pdf-question li strong { color: #00785d; font-size: 11px; font-weight: 900; }
        .development p { color: #214f85; }
        .development ul { margin: 10px 0 0; padding-left: 20px; color: #214f85; }
        .screen-actions { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 10px; padding: 12px 0; background: #f4f8fccc; backdrop-filter: blur(8px); }
        .screen-actions button { border: 0; border-radius: 999px; padding: 11px 16px; color: #fff; background: #075bd8; font-weight: 900; cursor: pointer; }
        @media print {
          body { background: #fff; }
          main { max-width: none; padding: 0; }
          .screen-actions { display: none; }
        }
        @media (max-width: 760px) {
          main { padding: 14px; }
          .meta-grid, .pdf-question ol { grid-template-columns: 1fr; }
          .pdf-question-visual { grid-template-columns: 1fr; }
          .pdf-question-visual img { width: 100%; height: 150px; }
          h1 { font-size: 26px; }
        }
      </style>
    </head>
    <body>
      <main>
        <div class="screen-actions"><button type="button" onclick="window.print()">Guardar preguntas como PDF</button></div>
        <section class="pdf-hero">
          <div class="pdf-brand"><strong>Aula TP Chile</strong><span>${escapePdfHtml(courseProfile.title || 'Curso')}</span></div>
          <h1>Instrumento docente · Evaluación final</h1>
          <p>Módulo ${escapePdfHtml(module.number)} · ${escapePdfHtml(module.title)}</p>
          <div class="meta-grid">
            <article><small>Caso</small><strong>${escapePdfHtml(content.patient)}</strong></article>
            <article><small>Contexto</small><strong>${escapePdfHtml(content.setting)}</strong></article>
            <article><small>Preguntas</small><strong>${content.questions.length} alternativas</strong></article>
            <article><small>Generado</small><strong>${escapePdfHtml(generatedAt)}</strong></article>
          </div>
        </section>
        <section class="development">
          <h2>${escapePdfHtml(development.title || 'Situación de desarrollo')}</h2>
          <p>${escapePdfHtml(development.prompt || '')}</p>
          <ul>${(development.rubric || []).map((item) => `<li>${escapePdfHtml(item)}</li>`).join('')}</ul>
          ${evaluationArtifactsMarkup(content, {}, true)}
        </section>
        <section>
          <h2>25 preguntas con 4 alternativas</h2>
          <div class="questions">${evaluationPdfQuestionInstrumentMarkup(content)}</div>
        </section>
      </main>
      <script>
        window.addEventListener('load', () => setTimeout(() => window.print(), 350));
      </script>
    </body>
    </html>`);
  printWindow.document.close();
  showEvaluationFeedback('<strong>Instrumento exportado.</strong> Se abrió el PDF con las 25 preguntas, alternativas, imágenes y claves para el docente.', 'success');
}

function exportEvaluationPdf(module = selected) {
  const content = evaluationContent(module);
  if (!content) return;
  const state = collectEvaluationExportState(content, loadEvaluationState(module));
  const result = evaluationResult(content, state);
  const development = content.developmentSituation || {};
  const strengths = evaluationStrengths(content, result);
  const reviewTopics = evaluationReviewTopics(content, state);
  const generatedAt = new Date().toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
  const title = `Aula TP Chile · Evaluación final · Módulo ${module.number}`;
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showEvaluationFeedback('<strong>No se pudo abrir la ventana de PDF.</strong> Permite ventanas emergentes para Aula TP Chile y vuelve a intentarlo.');
    return;
  }
  printWindow.document.write(`<!doctype html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapePdfHtml(title)}</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #08224d; background: #f4f8fc; font-family: Arial, Helvetica, sans-serif; line-height: 1.45; }
        main { width: min(1080px, 100%); margin: 0 auto; padding: 28px; }
        .pdf-hero { padding: 28px; border-radius: 24px; color: #fff; background: linear-gradient(135deg, #062b62, #075bd8 58%, #00a88f); }
        .pdf-brand { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 24px; }
        .pdf-brand strong { font-size: 22px; }
        .pdf-brand span { display: block; color: #cde9ff; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        h1 { margin: 0 0 8px; font-size: 34px; line-height: 1.05; }
        h2 { margin: 28px 0 12px; color: #073f99; font-size: 22px; }
        h3 { margin: 0; color: #06377a; font-size: 15px; }
        p { margin: 0; }
        .meta-grid, .score-grid, .chart-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px; }
        .meta-grid article, .score-grid article, .chart-grid article, .development, .checklist, .feedback { padding: 16px; border: 1px solid #c7dced; border-radius: 16px; background: #fff; }
        .meta-grid small, .score-grid small, .chart-grid small, .pdf-question small { display: block; color: #007f88; font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .score-grid strong { display: block; margin-top: 4px; color: #073f99; font-size: 28px; }
        .bar { height: 10px; margin-top: 10px; overflow: hidden; border-radius: 999px; background: #dbe8f7; }
        .bar i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #075bd8, #00a88f, #f0c76b); }
        .questions { display: grid; gap: 14px; }
        .pdf-question { break-inside: avoid; padding: 16px; border: 1px solid #c7dced; border-radius: 16px; background: #fff; }
        .pdf-question header { display: grid; grid-template-columns: 42px 1fr; gap: 12px; align-items: start; }
        .pdf-question header > span { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; color: #fff; background: #075bd8; font-weight: 900; }
        .pdf-question-visual { display: grid; grid-template-columns: 180px 1fr; gap: 12px; align-items: center; margin: 14px 0 6px; padding: 10px; border: 1px solid #d8e8f6; border-radius: 14px; background: #f4f9ff; }
        .pdf-question-visual img { width: 180px; height: 110px; object-fit: cover; border-radius: 12px; }
        .pdf-question-visual figcaption { color: #315f8d; font-size: 12px; line-height: 1.35; }
        .pdf-question ol { display: grid; gap: 8px; margin: 14px 0 10px; padding: 0; list-style: none; }
        .pdf-question li { display: grid; grid-template-columns: 28px 1fr auto auto; gap: 8px; align-items: center; padding: 9px 10px; border: 1px solid #e1ebf5; border-radius: 10px; background: #f8fbff; }
        .pdf-question li b { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; color: #06377a; background: #e6f0ff; }
        .pdf-question li.correct { border-color: #8bd5c7; background: #ecfff9; }
        .pdf-question li.selected { box-shadow: inset 4px 0 0 #f0c76b; }
        .pdf-question li em, .pdf-question li strong { font-size: 11px; font-style: normal; font-weight: 900; }
        .pdf-question li em { color: #9d5d00; }
        .pdf-question li strong { color: #00785d; }
        .development p, .feedback li, .checklist li { color: #214f85; }
        .development blockquote { margin: 14px 0 0; padding: 14px; border-left: 5px solid #075bd8; border-radius: 10px; background: #eef6ff; color: #08224d; white-space: pre-wrap; }
        ul { margin: 10px 0 0; padding-left: 20px; }
        .screen-actions { position: sticky; top: 0; display: flex; justify-content: flex-end; gap: 10px; padding: 12px 0; background: #f4f8fccc; backdrop-filter: blur(8px); }
        .screen-actions button { border: 0; border-radius: 999px; padding: 11px 16px; color: #fff; background: #075bd8; font-weight: 900; cursor: pointer; }
        @media print {
          body { background: #fff; }
          main { max-width: none; padding: 0; }
          .screen-actions { display: none; }
          .pdf-hero, .meta-grid article, .score-grid article, .chart-grid article, .development, .checklist, .feedback, .pdf-question { box-shadow: none; }
        }
        @media (max-width: 760px) {
          main { padding: 14px; }
          .meta-grid, .score-grid, .chart-grid { grid-template-columns: 1fr; }
          .pdf-question-visual { grid-template-columns: 1fr; }
          .pdf-question-visual img { width: 100%; height: 150px; }
          h1 { font-size: 26px; }
        }
      </style>
    </head>
    <body>
      <main>
        <div class="screen-actions"><button type="button" onclick="window.print()">Guardar como PDF</button></div>
        <section class="pdf-hero">
          <div class="pdf-brand"><strong>Aula TP Chile</strong><span>${escapePdfHtml(courseProfile.title || 'Curso')}</span></div>
          <h1>Evaluación final · Módulo ${escapePdfHtml(module.number)}</h1>
          <p>${escapePdfHtml(module.title)}</p>
          <div class="meta-grid">
            <article><small>Caso</small><strong>${escapePdfHtml(content.patient)}</strong></article>
            <article><small>Contexto</small><strong>${escapePdfHtml(content.setting)}</strong></article>
            <article><small>Preguntas</small><strong>${content.questions.length}</strong></article>
            <article><small>Generado</small><strong>${escapePdfHtml(generatedAt)}</strong></article>
          </div>
        </section>

        <section>
          <h2>Resultado y gráficos</h2>
          <div class="score-grid">
            <article><small>Nota</small><strong>${escapePdfHtml(result.grade)}</strong><span>${result.score}% de logro</span></article>
            <article><small>Preguntas correctas</small><strong>${result.correct}/${result.questionTotal}</strong><span>Integración del módulo</span></article>
            <article><small>Checklist</small><strong>${result.checklistDone}/${result.checklistTotal}</strong><span>Criterios confirmados</span></article>
            <article><small>Desarrollo</small><strong>${result.reflectionLength}</strong><span>Caracteres escritos</span></article>
          </div>
          <div class="chart-grid">
            ${[
              ['Preguntas', result.questionTotal ? Math.round((result.correct / result.questionTotal) * 100) : 0],
              ['Checklist', result.checklistTotal ? Math.round((result.checklistDone / result.checklistTotal) * 100) : 0],
              ['Desarrollo', Math.min(100, Math.round((result.reflectionLength / 120) * 100))],
              ['Logro total', result.score]
            ].map(([label, value]) => `<article><small>${escapePdfHtml(label)}</small><strong>${value}%</strong><div class="bar"><i style="width:${value}%"></i></div></article>`).join('')}
          </div>
        </section>

        <section class="development">
          <h2>${escapePdfHtml(development.title || 'Situación de desarrollo')}</h2>
          <p>${escapePdfHtml(development.prompt || '')}</p>
          <ul>${(development.rubric || []).map((item) => `<li>${escapePdfHtml(item)}</li>`).join('')}</ul>
          <blockquote>${escapePdfHtml(state.reflection || 'Sin respuesta escrita al momento de exportar.')}</blockquote>
          ${evaluationArtifactsMarkup(content, state, true)}
        </section>

        <section class="checklist">
          <h2>Checklist de cierre</h2>
          <ul>${state.checklist.map((item) => `<li>${item.checked ? '✓' : '○'} ${escapePdfHtml(item.label)}</li>`).join('')}</ul>
        </section>

        <section>
          <h2>25 preguntas de evaluación</h2>
          <div class="questions">${evaluationPdfQuestionMarkup(content, state)}</div>
        </section>

        <section class="feedback">
          <h2>Feedback y refuerzo</h2>
          <p>${escapePdfHtml(evaluationSummaryFeedback(result, module))}</p>
          <h3>Fortalezas</h3>
          <ul>${strengths.map((item) => `<li>${escapePdfHtml(item)}</li>`).join('')}</ul>
          <h3>Refuerzo recomendado</h3>
          <ul>${reviewTopics.map((topic) => `<li><strong>${escapePdfHtml(topic.category)}:</strong> ${escapePdfHtml(topic.hint)}</li>`).join('')}</ul>
        </section>
      </main>
      <script>
        window.addEventListener('load', () => setTimeout(() => window.print(), 350));
      </script>
    </body>
    </html>`);
  printWindow.document.close();
}

function teacherEvaluationStorageKey() {
  return `aulatp-teacher-final-evaluations-${currentCourseId || 'curso'}`;
}

function saveFinalEvaluationForTeacher(module = selected) {
  const content = evaluationContent(module);
  if (!content) return;
  const state = collectEvaluationExportState(content, loadEvaluationState(module));
  const result = evaluationResult(content, state);
  const record = {
    id: `${currentCourseId || 'curso'}-module-${module.number}-${Date.now()}`,
    savedAt: new Date().toISOString(),
    courseId: currentCourseId || '',
    courseTitle: courseProfile.title || '',
    moduleNumber: module.number,
    moduleTitle: module.title,
    case: {
      title: content.patient,
      setting: content.setting,
      summary: content.summary,
      image: content.image
    },
    result: {
      score: result.score,
      grade: result.grade,
      correct: result.correct,
      questionTotal: result.questionTotal,
      checklistDone: result.checklistDone,
      checklistTotal: result.checklistTotal,
      reflectionLength: result.reflectionLength,
      completed: Boolean(state.completed)
    },
    developmentSituation: content.developmentSituation,
    artifacts: state.artifacts || {},
    artifactRubric: { pointsPerArtifact: 2, total: content.artifacts.length * 2, status: 'pending_teacher_review' },
    attempts: state.attempts || [],
    gradingPolicy: '25 preguntas, 1 punto por acierto; sin penalización. Dominio requerido: 25/25. Reintentos sin límite. Desarrollo y artefactos requieren revisión docente separada.',
    reflection: state.reflection || '',
    checklist: state.checklist || [],
    questions: content.questions.map((question, index) => ({
      number: index + 1,
      category: question.category,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      answerLetter: String.fromCharCode(65 + Number(question.answer || 0)),
      selected: Number.isInteger(Number(state.answers?.[index])) ? Number(state.answers[index]) : null,
      selectedLetter: Number.isInteger(Number(state.answers?.[index])) ? String.fromCharCode(65 + Number(state.answers[index])) : null,
      hint: question.hint || question.feedback || courseUiLabels.evaluationQuestionHint,
      visual: question.visual || null
    }))
  };
  const key = teacherEvaluationStorageKey();
  let records = [];
  try {
    records = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    records = [];
  }
  records = [record, ...records.filter((item) => !(item?.courseId === record.courseId && item?.moduleNumber === record.moduleNumber))].slice(0, 60);
  localStorage.setItem(key, JSON.stringify(records));
  localStorage.setItem('aulatp-teacher-final-evaluation-latest', JSON.stringify(record));
  showEvaluationFeedback(`<strong>Evaluación guardada para docente.</strong> Se conservó una copia estructurada del módulo ${module.number} con ${content.questions.length} preguntas y situación de desarrollo.`, 'success');
  showToast('Evaluación final guardada para el docente.');
}

function renderEvaluationSummary(content, state, module = selected) {
  const summary = document.querySelector('#evaluationSummary');
  if (!summary) return;
  if (!state.completed) {
    summary.hidden = true;
    summary.innerHTML = '';
    return;
  }
  const result = evaluationResult(content, state);
  const strengths = evaluationStrengths(content, result);
  const reviewTopics = evaluationReviewTopics(content, state);
  const nextActions = evaluationNextActions(module);
  summary.hidden = false;
  summary.innerHTML = `
    <div class="evaluation-summary-heading">
      <span aria-hidden="true">✓</span>
      <div>
        <small>Resumen posterior al cierre</small>
        <h2>Módulo ${module.number} completado</h2>
        <p>${evaluationSummaryFeedback(result, module)}</p>
      </div>
    </div>
    <div class="evaluation-summary-grid" aria-label="Resultado de la evaluación">
      <article>
        <small>Nota de preguntas · desarrollo pendiente de revisión docente</small>
        <strong>${result.grade}</strong>
        <span>${result.score} % de logro</span>
      </article>
      <article>
        <small>Preguntas correctas</small>
        <strong>${result.correct} / ${result.questionTotal}</strong>
        <span>Respuestas de integración</span>
      </article>
      <article>
        <small>Cierre realizado</small>
        <strong>${result.checklistDone} / ${result.checklistTotal}</strong>
        <span>Checklist confirmado</span>
      </article>
      <article>
        <small>Reflexión</small>
        <strong>${result.reflectionLength} caracteres</strong>
        <span>Evidencia escrita</span>
      </article>
    </div>
    ${evaluationSummaryGraphsMarkup(result)}
    <div class="evaluation-summary-insights">
      <article class="evaluation-insight-card is-strong">
        <small>Fortalezas demostradas</small>
        <h3>Lo que ya puedes defender</h3>
        <ul>${strengths.map((item) => `<li>${item}</li>`).join('')}</ul>
      </article>
      <article class="evaluation-insight-card is-review">
        <small>Refuerzo recomendado</small>
        <h3>Contenidos para consolidar</h3>
        <ul>${reviewTopics.map((topic) => `<li><strong>${topic.category}:</strong> ${topic.hint}</li>`).join('')}</ul>
      </article>
    </div>
    <div class="evaluation-feedback-panel">
      <div>
        <small>Pantalla de feedback</small>
        <h3>Plan breve antes de avanzar</h3>
        <p>Usa este cierre como pauta de conversación: evidencia, criterio técnico y mejora. Si alguna respuesta necesitó corrección, vuelve a ese contenido antes de entrar al siguiente módulo.</p>
      </div>
      <ol>${nextActions.map((item) => `<li>${item}</li>`).join('')}</ol>
    </div>
    <div class="evaluation-summary-message">
      <strong>Mensaje para continuar</strong>
      <p>${evaluationEncouragement(result, module)}</p>
      <button class="evaluation-summary-export" type="button" data-export-evaluation-pdf>Exportar resumen y evaluación en PDF</button>
    </div>`;
}

function renderEvaluation(module = selected) {
  const content = evaluationContent(module);
  if (!content) return;
  const state = loadEvaluationState(module);
  if (!state.startedAt) { state.startedAt = new Date().toISOString(); saveEvaluationState(state, module); }
  document.querySelector('#evaluationModuleLabel').textContent = `Módulo ${module.number} · Evaluación final`;
  document.querySelector('#evaluationCurrentModule').textContent = `${module.number} de ${modules.length}`;
  document.querySelector('#evaluationQuestionCount').textContent = `${content.questions.length}`;
  document.querySelector('#evaluationImage').src = isElectricityCourse() && /elena|rosa|nursing/i.test(content.image || '')
    ? defaultPracticeVisual(selected)
    : content.image;
  document.querySelector('#evaluationImage').alt = content.imageAlt || `Caso de evaluación del módulo ${selected.number}`;
  document.querySelector('#evaluationCaseTitle').textContent = content.patient;
  document.querySelector('#evaluationCaseSetting').textContent = content.setting;
  document.querySelector('#evaluationCaseSummary').textContent = content.summary;
  document.querySelector('#evaluationFocusTags').innerHTML = content.focus.map((item) => `<span>${item}</span>`).join('');
  const development = content.developmentSituation || {};
  const developmentPanel = document.querySelector('#evaluationDevelopmentSituation');
  if (developmentPanel) {
    developmentPanel.innerHTML = `
      <p>${development.prompt || 'Analiza el caso, aplica los aprendizajes esperados del módulo y justifica tu decisión profesional.'}</p>
      <ul>${(development.rubric || []).map((item) => `<li>${item}</li>`).join('')}</ul>${evaluationArtifactsMarkup(content, state)}`;
  }
  const developmentTitle = document.querySelector('#evaluationDevelopmentTitle');
  if (developmentTitle) developmentTitle.textContent = development.title || 'Situación de desarrollo';
  const reflectionPrompt = document.querySelector('#evaluationReflectionPrompt');
  if (reflectionPrompt) reflectionPrompt.textContent = 'Respuesta de aplicación y análisis';
  document.querySelector('#evaluationQuestionPanel').innerHTML = `
    <h2>Preguntas de integración del módulo</h2>
    <aside class="evaluation-policy" role="note"><strong>Cómo se evalúa</strong>
      <p>${content.questions.length} preguntas, 1 punto por acierto. Resultado al comprobar: correctas / ${content.questions.length}. Se conserva el criterio de dominio de la ruta: todas correctas para completar; reintentos ilimitados, sin descuento por error. Nota de preguntas = 1 + 6 × proporción de aciertos.</p>
      <p>Intentos completos registrados: ${(state.attempts || []).length}. Sin límite de tiempo ni envío automático. Los ajustes de accesibilidad y más tiempo también se aplican aquí.</p>
      <p>Checklist: autorreporte, no suma puntos. Desarrollo: revisión docente pendiente. El puntaje de preguntas no certifica por sí solo el aprendizaje práctico.</p>
      ${(state.attempts || []).length ? `<p>Primer intento: ${state.attempts[0].correct}/${content.questions.length}. Último: ${state.attempts.at(-1).correct}/${content.questions.length}.</p>` : ''}
    </aside>
    <p>Responde aplicando el caso, la imagen de apoyo y las competencias trabajadas durante el recorrido.</p>
    <div class="evaluation-question-list">
      ${content.questions.map((question, index) => `<fieldset data-evaluation-question="${index}">
        <legend><small>${question.category}</small>${question.prompt}</legend>
        <div class="evaluation-question-card-layout">
          ${question.visual?.src ? `<figure class="evaluation-question-visual"><img src="${question.visual.src}" alt="${question.visual.alt || 'Apoyo visual de la pregunta'}" loading="lazy" /><figcaption>${question.visual.caption || 'Apoyo visual para analizar la situación.'}</figcaption></figure>` : ''}
          <div>
            <div class="evaluation-option-grid">${question.options.map((option, optionIndex) => `<label><input type="radio" name="evaluation-${index}" value="${optionIndex}" ${Number(state.answers?.[index]) === optionIndex ? 'checked' : ''} ${state.completed ? 'disabled' : ''}/><span><b>${String.fromCharCode(65 + optionIndex)}</b>${option}</span></label>`).join('')}</div>
            <small hidden><strong>Pista:</strong> ${question.hint || courseUiLabels.evaluationQuestionHint}</small>
          </div>
        </div>
      </fieldset>`).join('')}
    </div>
    <footer class="evaluation-question-actions" aria-label="Acciones docentes de la evaluación">
      <div>
        <small>Instrumento docente</small>
        <strong>Exporta o guarda esta evaluación final</strong>
        <p>Incluye las 25 preguntas, alternativas A/B/C/D, imágenes de apoyo y situación de desarrollo del módulo.</p>
      </div>
      <button data-export-evaluation-questions-pdf type="button" class="practice-secondary-action evaluation-export-action">Exportar preguntas PDF</button>
      <button id="saveTeacherEvaluation" type="button" class="practice-secondary-action evaluation-save-action">Guardar para docente</button>
    </footer>`;
  document.querySelector('#evaluationChecklist').innerHTML = content.checklist.map((item, index) => `<label><input type="checkbox" value="${index}" ${state.completed ? 'checked disabled' : ''}/><span><i aria-hidden="true">✓</i>${item}</span></label>`).join('');
  const reflection = document.querySelector('#evaluationReflection');
  const confirm = document.querySelector('#evaluationConfirm');
  reflection.value = state.reflection || '';
  reflection.placeholder = development.placeholder || 'Integra datos críticos, riesgo, acción prioritaria, verificación y evidencia de cierre...';
  reflection.disabled = state.completed;
  confirm.checked = state.completed;
  confirm.disabled = state.completed;
  document.querySelector('#completeEvaluation').hidden = state.completed;
  document.querySelector('#continueAfterEvaluation').hidden = !state.completed;
  document.querySelector('#evaluationFeedback').hidden = true;
  updateEvaluationProgress(content, state);
  renderEvaluationSummary(content, state, module);
}

function openEvaluation(module = selected) {
  selected = module;
  activeInternalStage = STAGE_EVALUATION;
  localStorage.setItem(`aulatp-module-${module.number}-stage`, String(STAGE_EVALUATION));
  showCourseView('evaluationView');
  renderEvaluation(module);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showEvaluationFeedback(message, type = 'error') {
  const feedback = document.querySelector('#evaluationFeedback');
  feedback.hidden = false;
  feedback.className = `practice-feedback ${type}`;
  feedback.innerHTML = `<span aria-hidden="true">${type === 'success' ? '✓' : 'i'}</span><div>${message}</div>`;
}

function completeEvaluation() {
  const content = evaluationContent();
  if (!content) return;
  const state = loadEvaluationState();
  let answered = 0;
  let correct = 0;
  document.querySelectorAll('[data-evaluation-question]').forEach((card, index) => {
    const choice = card.querySelector('input:checked');
    const isCorrect = choice && Number(choice.value) === content.questions[index].answer;
    if (choice) {
      answered += 1;
      state.answers[index] = Number(choice.value);
    }
    if (isCorrect) correct += 1;
    card.classList.toggle('correct', Boolean(isCorrect));
    card.classList.toggle('wrong', Boolean(choice) && !isCorrect);
    card.querySelector('small:last-child').hidden = Boolean(isCorrect);
  });
  const checks = [...document.querySelectorAll('#evaluationChecklist input')];
  const allChecked = checks.every((check) => check.checked);
  const reflection = document.querySelector('#evaluationReflection')?.value.trim() || '';
  const confirmed = document.querySelector('#evaluationConfirm')?.checked;
  state.reflection = reflection;
  state.artifacts = collectEvaluationArtifacts(state);
  saveEvaluationState(state);
  updateEvaluationProgress(content, state);
  if (answered < content.questions.length) {
    showEvaluationFeedback(`<strong>Responde las ${content.questions.length} preguntas.</strong><p>La evaluación final necesita evidencia completa para cerrar el módulo: preguntas de cuatro alternativas, checklist y situación de desarrollo. Revisa las tarjetas sin respuesta; cada una incluye imagen y pista de criterio.</p>`);
    return;
  }
  state.attempts = [...(state.attempts || []), {
    submittedAt: new Date().toISOString(), correct, total: content.questions.length,
    answers: { ...state.answers }, elapsedSeconds: Math.max(0, Math.round((Date.now() - Date.parse(state.startedAt || new Date().toISOString())) / 1000))
  }];
  saveEvaluationState(state);
  if (correct < content.questions.length) {
    state.reviewTopics = content.questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => Number(state.answers?.[index]) !== question.answer)
      .map(({ question }) => ({
        category: question.category,
        prompt: question.prompt,
        hint: question.hint || question.feedback || courseUiLabels.evaluationQuestionHint
      }));
    saveEvaluationState(state);
    const reviewList = state.reviewTopics.slice(0, 4).map((item) => `<li><strong>${item.category}:</strong> ${item.hint}</li>`).join('');
    showEvaluationFeedback(`<strong>Hay ${content.questions.length - correct} respuesta(s) por revisar.</strong><p>Usa las pistas visibles bajo cada pregunta y prioriza estos focos:</p><ul>${reviewList}</ul><p>Corrige la alternativa solo cuando puedas justificarla con la imagen, el caso y el criterio trabajado.</p>`);
    return;
  }
  if (!allChecked || reflection.length < 120 || !confirmed) {
    showEvaluationFeedback('<strong>Falta completar el cierre.</strong><p>Marca el checklist, desarrolla la situación con al menos 120 caracteres e integra: condición inicial, riesgo o no conformidad, decisión tomada, verificación y evidencia registrada. Luego confirma la revisión.</p>');
    return;
  }
  const missingArtifacts = content.artifacts.filter((item) => (state.artifacts[item.key] || '').length < 40);
  if (missingArtifacts.length) {
    showEvaluationFeedback(`<strong>Completa las evidencias OA4.</strong><p>Falta desarrollar: ${missingArtifacts.map((item) => item.title).join(', ')}. Escribe al menos 40 caracteres por campo; esta comprobación verifica entrega, no calidad técnica.</p>`);
    return;
  }
  if (!Array.isArray(state.reviewTopics)) state.reviewTopics = [];
  state.completed = true;
  activeInternalStage = STAGE_FEEDBACK;
  localStorage.setItem(`aulatp-module-${selected.number}-stage`, String(STAGE_FEEDBACK));
  saveEvaluationState(state);
  saveFinalEvaluationForTeacher(selected);
  renderEvaluation(selected);
  showEvaluationFeedback(`<strong>Módulo ${selected.number} completado.</strong> Revisa tu resumen final, la nota y el feedback antes de continuar.`, 'success');
  document.querySelector('#evaluationSummary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast(`Módulo ${selected.number} completado. ¡Seguimos avanzando!`);
}

function continueAfterEvaluation() {
  const nextModule = modules[Number(selected.number)];
  if (nextModule) {
    activeInternalStage = 0;
    activeAe = 1;
    enterModule(nextModule);
    return;
  }
  showToast('¡Curso completo! Has terminado todos los módulos disponibles.');
  enterModule(selected);
}

function enterModule(module) {
  if (isModuleLocked(module)) {
    showToast('Completa el módulo anterior para desbloquear este contenido.', 'error');
    return;
  }
  selected = module;
  courseStarted = true;
  activeInternalStage = normalizeInternalStage(Number.parseInt(localStorage.getItem(`aulatp-module-${module.number}-stage`) || '0', 10), module);
  activeAe = Math.min(expectedAeCount(module), Math.max(1, Number.parseInt(localStorage.getItem(`aulatp-module-${module.number}-ae`) || String(aeForStage(activeInternalStage)), 10)));
  selectedOverviewIndex = overviewVisualIndexForStage(activeInternalStage, module);
  localStorage.setItem('aulatp-current-module', module.number);
  localStorage.setItem('aulatp-course-started', 'true');
  showCourseView('learningView');
  renderModuleScreen(module);
  syncCourseUrl();
  void syncModuleStart(module);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setInternalStage(stageIndex) {
  activeInternalStage = normalizeInternalStage(stageIndex, selected);
  activeAe = aeForStage(activeInternalStage);
  localStorage.setItem(`aulatp-module-${selected.number}-stage`, String(activeInternalStage));
  localStorage.setItem(`aulatp-module-${selected.number}-ae`, String(activeAe));
  renderModuleScreen(selected);
  syncCourseUrl({ replace: true });
}

function contextStepMarkup(step) {
  const complete = contextCompleted.has(step.number);
  const active = contextCurrentStep === step.number;
  const unlocked = reviewerMode || step.number === 1 || contextCompleted.has(step.number - 1) || complete;
  return `
    <button type="button" class="context-step ${step.tone} ${complete ? 'completed' : ''} ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-context-step="${step.number}" aria-label="${step.number}. ${step.title}, ${step.time} minutos${unlocked ? '' : ', bloqueada'}" ${unlocked ? '' : 'disabled'}>
      <span class="context-number">${step.number}</span>
      <i class="context-icon icon-${step.icon}" aria-hidden="true"></i>
      <strong>${step.number}. ${step.title}</strong>
      <small>${step.time} min</small>
      <span class="completion-ticket" aria-hidden="true">${complete ? '✓' : ''}</span>
    </button>`;
}

function activityFor(module, stepNumber) {
  const extra = supplementalModuleContent[module.number]?.activities;
  if (extra) return extra.find((activity) => activity.number === stepNumber) || null;
  if (isElectricityCourse()) return null;
  if (module.number === '1') return module1Activities.find((activity) => activity.number === stepNumber);
  if (module.number === '2') return module2Activities.find((activity) => activity.number === stepNumber);
  return null;
}

function quizMarkup(activity) {
  return activity.questions.map((question, questionIndex) => `
    <fieldset class="activity-question" data-question="${questionIndex}">
      <legend><span>${questionIndex + 1}</span>${question.prompt}</legend>
      <div class="answer-options">
        ${question.options.map((option, optionIndex) => `
          <label><input type="radio" name="activity-${activity.number}-question-${questionIndex}" value="${optionIndex}" /> <span>${option}</span></label>
        `).join('')}
      </div>
      <p class="answer-explanation" hidden></p>
    </fieldset>`).join('');
}

function matchingMarkup(activity) {
  const concepts = activity.pairs.map(([concept]) => concept);
  const optionOrder = [...concepts.slice(2), ...concepts.slice(0, 2)];
  const defaultHints = {
    'Privacidad': 'Piensa en el concepto que protege la intimidad y evita exponer innecesariamente el cuerpo.',
    'Confort': 'Relaciona esta acción con el bienestar físico, la comodidad y un entorno limpio.',
    'Autonomía': 'Busca el concepto que permite a Elena participar según sus capacidades y tomar decisiones sobre su cuidado.',
    'Prevención de caídas': 'Observa qué medidas del entorno disminuyen el riesgo de que la paciente se levante o se desplace de forma insegura.',
    'Integridad cutánea': 'Piensa en la protección de la piel frente a la humedad, la fricción y la presión prolongada.',
    'Registro': 'Identifica el concepto relacionado con dejar constancia escrita, objetiva y oportuna de lo realizado.'
  };
  const hints = { ...defaultHints, ...(activity.hints || {}) };
  return `<div class="matching-activity">
    ${activity.pairs.map(([, definition], index) => `
      <label class="matching-row" data-match="${index}">
        <span>${index + 1}</span><strong>${definition}</strong>
        <select aria-label="Concepto para: ${definition}">
          <option value="">Selecciona un concepto</option>
          ${optionOrder.map((concept) => `<option value="${concept}">${concept}</option>`).join('')}
        </select>
        <p class="inline-hint" role="status" hidden><b aria-hidden="true">💡</b><span><strong>Criterio:</strong> ${hints[activity.pairs[index][0]] || `${activity.pairs[index][0]}: ${definition}`}</span></p>
      </label>`).join('')}
  </div>`;
}

function ensureSequenceOrders(activity) {
  activity.sequences.forEach((sequence, sequenceIndex) => {
    const key = `${selected.number}-${activity.number}-${sequenceIndex}`;
    if (!sequenceOrders[key]) sequenceOrders[key] = sequence.shuffled.map((index) => sequence.correct[index]);
  });
}

function sequenceMarkup(activity) {
  ensureSequenceOrders(activity);
  return `<div class="sequence-guide"><span aria-hidden="true">↕</span><p><strong>Construye la secuencia</strong> Arrastra cada tarjeta a su posición o utiliza las flechas. Los cambios se animarán para que puedas seguir el orden.</p></div>
  <div class="sequence-activity">
    ${activity.sequences.map((sequence, sequenceIndex) => {
      const key = `${selected.number}-${activity.number}-${sequenceIndex}`;
      return `<section class="sequence-block" data-sequence="${sequenceIndex}">
        <h4><span>${sequenceIndex + 1}</span>${sequence.title}<small>${sequence.correct.length} pasos</small></h4>
        <ol>${sequenceOrders[key].map((item, itemIndex) => `
          <li class="sequence-item ${lastSequenceMove?.sequenceIndex === sequenceIndex && lastSequenceMove?.itemIndex === itemIndex ? `moving-${lastSequenceMove.direction}` : ''}" draggable="true" data-sequence-drag="${sequenceIndex}" data-item-index="${itemIndex}"><span>${itemIndex + 1}</span><i class="drag-handle" aria-hidden="true">⠿</i><strong>${item}</strong><span class="order-controls">
            <button type="button" data-sequence-move="up" data-sequence-index="${sequenceIndex}" data-item-index="${itemIndex}" aria-label="Subir ${item}">↑</button>
            <button type="button" data-sequence-move="down" data-sequence-index="${sequenceIndex}" data-item-index="${itemIndex}" aria-label="Bajar ${item}">↓</button>
          </span></li>`).join('')}</ol>
        <p class="inline-hint sequence-hint" hidden><b aria-hidden="true">💡</b><span><strong>Pista:</strong> ${sequence.hint || (sequenceIndex === 0 ? 'Comienza preparando tus manos y materiales; luego informa a Elena y organiza su entorno antes de pedirle que participe.' : 'Primero termina el cuidado directo de la piel; después deja a Elena segura, ordena los materiales y registra al final.')}</span></p>
      </section>`;
    }).join('')}
  </div>`;
}

function closureMarkup(activity) {
  const bullets = activity.closureBullets || [
    'Preparar el cuidado y comunicarse directamente con la persona.',
    'Resguardar privacidad, autonomía, confort e integridad de la piel.',
    'Adaptar las decisiones cuando cambia la condición de la paciente.',
    'Dejar un entorno seguro y registrar los hallazgos de forma objetiva.'
  ];
  return `
    <div class="closure-summary">
      <h4>Lo esencial de esta contextualización</h4>
      <ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
    </div>
    <label class="reflection-field"><strong>Mi compromiso para la práctica</strong><span>${activity.reflectionPrompt || 'Escribe una acción concreta que aplicarías al brindar cuidados básicos.'}</span><textarea id="contextReflection" rows="3" minlength="20" placeholder="${activity.reflectionPlaceholder || 'Por ejemplo: antes de iniciar, explicaré el procedimiento y preguntaré cómo prefiere participar...'}"></textarea></label>
    <label class="closure-check"><input id="contextReviewCheck" type="checkbox" /> <span>Revisé mis respuestas y comprendí la retroalimentación.</span></label>`;
}

function completedActivityMessage(module, activity) {
  const plan = contextualizationPlanFor(module);
  const isFinalActivity = activity.number >= plan.steps.length;
  const completedCount = Math.max(contextCompleted.size, activity.number);
  const progress = Math.round((completedCount / plan.steps.length) * 100);
  const nextStep = plan.steps[activity.number];
  const encouragement = isFinalActivity
    ? 'Excelente avance: ya estás listo para comenzar el Aprendizaje Esperado y aplicar lo trabajado en una ruta más profunda.'
    : `Vas muy bien. La siguiente estación es "${nextStep?.title || 'tu próxima actividad'}"; sigue paso a paso y conecta cada decisión con el caso.`;
  const progressCard = `<div class="activity-progress-card">
    <span class="activity-progress-badge" aria-hidden="true">${progress}%</span>
    <div>
      <small>Avance guardado</small>
      <strong>Estás en la estación ${activity.number} de ${plan.steps.length}: ${activity.title}</strong>
      <p>Completaste ${completedCount} de ${plan.steps.length} actividades de contextualización del Módulo ${module.number}. ${encouragement}</p>
      <div class="activity-progress-track" aria-label="Progreso de contextualización"><i style="width:${progress}%"></i></div>
    </div>
  </div>`;
  if (isFinalActivity) {
    return `${progressCard}<div class="module-unlocked">
      <span class="unlocked-number" aria-hidden="true">AE</span>
      <div><small>Nuevo recorrido disponible</small><strong>AE 1 desbloqueado</strong><p>${aeTitlesByModule[module.number]?.[0] || module.short} · 6 etapas pedagógicas</p></div>
      <span class="unlock-check" aria-hidden="true">✓</span>
    </div>`;
  }
  return progressCard;
}

function completedAeStageMessage(module, learning, stage) {
  const stages = learning?.stages || [];
  const completedCount = stages.filter((item) => item.progress_status === 'completed').length;
  const progress = stages.length ? Math.round((completedCount / stages.length) * 100) : 0;
  const nextStage = stages.find((item) => item.progress_status !== 'completed');
  const nextText = nextStage
    ? `Tu siguiente etapa es "${nextStage.title}". Continúa con calma: cada etapa refuerza una decisión profesional distinta.`
    : `Completaste ${learning.code}. Ahora puedes avanzar al siguiente AE o continuar el recorrido del módulo.`;
  return `<div class="activity-progress-card ae-progress-card">
    <span class="activity-progress-badge" aria-hidden="true">${progress}%</span>
    <div>
      <small>Etapa registrada</small>
      <strong>${learning.code} · etapa ${stage.sequence} de ${stages.length}: ${stage.title}</strong>
      <p>Llevas ${completedCount} de ${stages.length} etapas completadas en ${learning.title}. ${nextText}</p>
      <div class="activity-progress-track" aria-label="Progreso del aprendizaje esperado"><i style="width:${progress}%"></i></div>
    </div>
  </div>`;
}

function renderContextActivity(module) {
  const activity = activityFor(module, contextCurrentStep);
  const panel = document.querySelector('#contextActivityPanel');
  const content = document.querySelector('#contextActivityContent');
  const action = document.querySelector('#validateContextActivity');
  const result = document.querySelector('#contextActivityResult');
  const next = document.querySelector('#nextContextActivity');
  const isCompleted = contextCompleted.has(contextCurrentStep);

  if (!activity) {
    const step = contextualizationPlanFor(module).steps[contextCurrentStep - 1];
    panel.hidden = false;
    document.querySelector('#contextActivityNumber').textContent = `Estación ${contextCurrentStep}`;
    document.querySelector('#contextActivityTitle').textContent = step?.title || 'Contextualización';
    document.querySelector('#contextActivityMeta').textContent = step ? `${step.time} min` : '';
    document.querySelector('#contextActivityLead').textContent = step?.title || 'Comprendo la situación técnica o laboral';
    content.innerHTML = '<div class="activity-empty"><strong>Contenido en preparación</strong><p>Esta actividad se incorporará con los contenidos específicos del módulo.</p></div>';
    action.hidden = true;
    next.hidden = true;
    result.hidden = true;
    return;
  }

  document.querySelector('#contextActivityNumber').textContent = `Estación ${activity.number}`;
  document.querySelector('#contextActivityTitle').textContent = activity.title;
  document.querySelector('#contextActivityMeta').textContent = `${activity.quantity} · ${contextualizationPlanFor(module).steps[activity.number - 1].time} min`;
  document.querySelector('#contextActivityLead').textContent = activity.lead;
  panel.dataset.activityKind = activity.kind;
  content.innerHTML = activity.kind === 'matching'
    ? matchingMarkup(activity)
    : activity.kind === 'sequence'
      ? sequenceMarkup(activity)
      : activity.kind === 'closure'
        ? closureMarkup(activity)
        : quizMarkup(activity);
  action.hidden = isCompleted;
  action.textContent = activity.kind === 'closure' ? 'Finalizar contextualización' : 'Comprobar respuestas';
  next.hidden = !isCompleted;
  const plan = contextualizationPlanFor(module);
  const isFinalActivity = activity.number >= plan.steps.length;
  next.textContent = isFinalActivity ? 'Comenzar AE 1 · 6 etapas' : 'Continuar a la siguiente estación';
  next.classList.toggle('next-module-access', isFinalActivity);
  result.hidden = !contextActivityFeedback && !isCompleted;
  result.className = `activity-result ${contextActivityFeedback?.type || (isCompleted ? 'success' : '')}`;
  result.innerHTML = contextActivityFeedback?.message || (isCompleted ? completedActivityMessage(module, activity) : '');
}

async function completeContextActivity(activity) {
  try {
    const completedModule = selected;
    const isFinalActivity = activity.number >= contextualizationPlanFor(completedModule).steps.length;
    await syncActivityCompletion(selected, activity);
    contextCompleted.add(activity.number);
    localStorage.setItem(`aulatp-context-${selected.number}-current`, String(activity.number));
    localStorage.setItem(`aulatp-context-${selected.number}-completed`, JSON.stringify([...contextCompleted].sort((a, b) => a - b)));
    contextActivityFeedback = { type: 'success', message: completedActivityMessage(selected, activity) };
    renderContextualization(selected);
    if (isFinalActivity) {
      showToast('Contextualización completada. A continuación comienza el AE 1.');
      if (!accessibilityPreferences.more_time) {
        contextAdvanceTimer = window.setTimeout(() => {
          contextAdvanceTimer = null;
          void openAeJourney(completedModule, 1);
        }, 1200);
      }
    }
  } catch (error) {
    contextActivityFeedback = { type: 'error', message: `<strong>No pudimos guardar el avance.</strong> ${error.message}` };
    const result = document.querySelector('#contextActivityResult');
    result.hidden = false;
    result.className = 'activity-result error';
    result.innerHTML = contextActivityFeedback.message;
  }
}

async function validateContextActivity() {
  const activity = activityFor(selected, contextCurrentStep);
  if (!activity) return;

  if (activity.kind === 'matching') {
    const rows = [...document.querySelectorAll('#contextActivityContent [data-match]')];
    const complete = rows.every((row) => row.querySelector('select').value);
    const correct = complete && rows.every((row, index) => row.querySelector('select').value === activity.pairs[index][0]);
    rows.forEach((row, index) => {
      const select = row.querySelector('select');
      const isCorrect = select.value === activity.pairs[index][0];
      const isWrong = Boolean(select.value) && !isCorrect;
      row.classList.toggle('correct', isCorrect);
      row.classList.toggle('wrong', isWrong);
      row.querySelector('.inline-hint').hidden = false;
      row.querySelector('.inline-hint b').textContent = isCorrect ? '✓ Correcta' : 'Revisa';
    });
    if (correct) return completeContextActivity(activity);
    contextActivityFeedback = { type: 'error', message: complete ? '<strong>Aún hay relaciones por revisar.</strong> Observa la función que describe cada frase e inténtalo nuevamente.' : `<strong>Completa los ${activity.pairs.length} pares</strong> antes de comprobar la actividad.` };
  } else if (activity.kind === 'sequence') {
    ensureSequenceOrders(activity);
    const correct = activity.sequences.every((sequence, sequenceIndex) => sequence.correct.every((item, itemIndex) => sequenceOrders[`${selected.number}-${activity.number}-${sequenceIndex}`][itemIndex] === item));
    document.querySelectorAll('.sequence-block').forEach((block, index) => {
      const isCorrect = activity.sequences[index].correct.every((item, itemIndex) => sequenceOrders[`${selected.number}-${activity.number}-${index}`][itemIndex] === item);
      block.classList.toggle('correct', isCorrect);
      block.classList.toggle('wrong', !isCorrect);
      block.querySelector('.sequence-hint').hidden = isCorrect;
    });
    if (correct) return completeContextActivity(activity);
    contextActivityFeedback = { type: 'error', message: '<strong>El orden todavía puede mejorar.</strong> Revisa qué debe prepararse primero, cómo se ejecuta la acción con seguridad y qué corresponde verificar o registrar al final.' };
  } else if (activity.kind === 'closure') {
    const reflection = document.querySelector('#contextReflection').value.trim();
    const reviewed = document.querySelector('#contextReviewCheck').checked;
    if (reflection.length >= 20 && reviewed) return completeContextActivity(activity);
    contextActivityFeedback = { type: 'error', message: '<strong>Completa el cierre:</strong> escribe una acción concreta de al menos 20 caracteres y confirma que revisaste la retroalimentación.' };
  } else {
    const cards = [...document.querySelectorAll('#contextActivityContent [data-question]')];
    let answered = 0;
    let correctCount = 0;
    cards.forEach((card, index) => {
      const selectedOption = card.querySelector('input:checked');
      const explanation = card.querySelector('.answer-explanation');
      const isCorrect = Number(selectedOption?.value) === activity.questions[index].answer;
      if (selectedOption) answered += 1;
      if (isCorrect) correctCount += 1;
      card.classList.toggle('correct', isCorrect);
      card.classList.toggle('wrong', Boolean(selectedOption) && !isCorrect);
      explanation.hidden = !selectedOption;
      explanation.className = `answer-explanation ${isCorrect ? 'correct-note' : 'hint-note'}`;
      explanation.innerHTML = selectedOption ? (isCorrect ? `<strong>Correcto.</strong> ${activity.questions[index].feedback}` : `<strong>💡 Pista:</strong> ${activity.questions[index].feedback}`) : '';
    });
    if (answered === cards.length && correctCount === cards.length) return completeContextActivity(activity);
    contextActivityFeedback = { type: 'error', message: answered < cards.length ? `<strong>Faltan respuestas:</strong> completaste ${answered} de ${cards.length}.` : `<strong>Obtuviste ${correctCount} de ${cards.length} respuestas correctas.</strong> Lee la retroalimentación y vuelve a intentarlo.` };
  }

  const result = document.querySelector('#contextActivityResult');
  result.hidden = false;
  result.className = `activity-result ${contextActivityFeedback.type}`;
  result.innerHTML = contextActivityFeedback.message;
}

function buildContextConnectors(stepCount) {
  const leftRows = stepCount === 10
    ? [
        { y: 70, endX: 430, endY: 118 },
        { y: 165, endX: 402, endY: 185 },
        { y: 260, endX: 386 },
        { y: 355, endX: 402, endY: 335 },
        { y: 450, endX: 430, endY: 402 },
      ]
    : [
        { y: 92, endX: 430, endY: 132 },
        { y: 205, endX: 394, endY: 215 },
        { y: 318, endX: 394, endY: 305 },
        { y: 431, endX: 430, endY: 388 },
      ];
  const rightRows = stepCount === 10
    ? [
        { y: 70, startX: 570, startY: 118 },
        { y: 165, startX: 598, startY: 185 },
        { y: 260, startX: 614 },
        { y: 355, startX: 598, startY: 335 },
        { y: 450, startX: 570, startY: 402 },
      ]
    : [
        { y: 92, startX: 570, startY: 132 },
        { y: 205, startX: 606, startY: 215 },
        { y: 318, startX: 606, startY: 305 },
        { y: 431, startX: 570, startY: 388 },
      ];
  const left = leftRows.map((point) => `
    <path d="M 314 ${point.y} C 346 ${point.y}, ${point.endX - 24} ${point.endY ?? point.y}, ${point.endX} ${point.endY ?? point.y}" />
    <circle cx="${point.endX}" cy="${point.endY ?? point.y}" r="5" />
  `).join('');
  const right = rightRows.map((point) => `
    <path d="M ${point.startX} ${point.startY ?? point.y} C ${point.startX + 24} ${point.startY ?? point.y}, 654 ${point.y}, 686 ${point.y}" />
    <circle cx="${point.startX}" cy="${point.startY ?? point.y}" r="5" />
  `).join('');
  return `<svg class="context-connector-map" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true" focusable="false">${left}${right}</svg>`;
}

function renderContextStepsRail(steps) {
  const rail = document.querySelector('#contextStepsRail');
  if (!rail) return;
  rail.innerHTML = steps.map((step, index) => {
    const complete = contextCompleted.has(step.number);
    const active = contextCurrentStep === step.number;
    const unlocked = reviewerMode || step.number === 1 || contextCompleted.has(step.number - 1) || complete;
    const state = complete ? 'completed' : active ? 'active' : unlocked ? 'available' : 'locked';
    const status = state === 'completed' ? 'Completada' : state === 'active' ? 'En desarrollo' : 'Pendiente';
    const lastClass = index === steps.length - 1 ? ' is-last' : '';
    return `
      <button type="button" class="internal-step is-${state}${lastClass}" data-context-step="${step.number}" aria-label="${step.number}. ${step.title}" ${unlocked ? '' : 'disabled'} ${active ? 'aria-current="step"' : ''}>
        <span class="internal-number">${complete ? '✓' : step.number}</span>
        <strong>Estación ${step.number}</strong>
        <em>${step.title}</em>
        <span class="internal-time">${step.time} min</span>
        <small class="internal-status">${status}</small>
      </button>`;
  }).join('');
}

function renderContextualization(module) {
  const plan = contextualizationPlanFor(module);
  const steps = plan.steps;
  const completedCount = contextCompleted.size;
  const progress = Math.round((completedCount / steps.length) * 100);
  const setText = (id, value) => { const el = document.querySelector(id); if (el) el.textContent = value; };
  setText('#contextModuleTitle', `Módulo ${module.number} · ${module.title}`);
  setText('#contextStationTitle', 'Contextualización');
  setText('#contextNumChip', `Módulo ${module.number}`);
  setText('#contextModuleCount', `${module.number} de ${modules.length}`);
  renderContextStepsRail(steps);
  const left = document.querySelector('#contextStepsLeft');
  const right = document.querySelector('#contextStepsRight');
  if (left && right) {
    const splitIndex = Math.ceil(steps.length / 2);
    left.innerHTML = steps.slice(0, splitIndex).map(contextStepMarkup).join('');
    right.innerHTML = steps.slice(splitIndex).map(contextStepMarkup).join('');
  }
  document.querySelector('.context-route .context-connector-map')?.remove();
  setText('#contextRouteCount', `${contextCurrentStep} / ${steps.length}`);
  setText('#contextVersionLabel', `Estación ${contextCurrentStep} de ${steps.length}`);
  setText('#contextHoursLabel', plan.hours);
  setText('#contextDurationLabel', `${plan.duration} min`);
  setText('#contextSidebarDuration', `${plan.duration} min`);
  setText('#situationDuration', `${plan.situationTime} min`);
  setText('#contextRouteSign', `Estación ${contextCurrentStep}`);
  setText('#contextTipLastNumber', String(steps.length));
  setText('#contextInstruction', `Completa cada estación de la ruta hasta avanzar las ${steps.length} etapas.`);
  setText('#contextHeroProgressLabel', `${contextCurrentStep} / ${steps.length} estaciones`);
  setText('#contextProgressLabel', `${progress} %`);
  const heroFill = document.querySelector('#contextHeroProgressFill');
  if (heroFill) heroFill.style.width = `${Math.round((contextCurrentStep / steps.length) * 100)}%`;
  const fill = document.querySelector('#contextProgressFill');
  if (fill) fill.style.width = `${progress}%`;
  setText('#contextStatus', completedCount >= steps.length ? 'Completada' : completedCount ? 'En desarrollo' : 'Pendiente');
  const lead = document.querySelector('#contextHeroLead');
  if (lead) lead.textContent = courseProfile.moduleHeroDescriptions?.[module.number] || module.description || 'Conoce el contexto técnico o laboral de esta situación y activa tus conocimientos previos.';
  const caseData = moduleCaseFor(module);
  if (caseData) {
    document.querySelector('#situationPatientName').textContent = caseData.patient;
    document.querySelector('#situationPatientSetting').textContent = caseData.setting;
    document.querySelector('#situationPatientSummary').textContent = caseData.centerSummary;
    document.querySelector('#contextCaseHeroImage').src = caseData.detailImage || caseData.heroImage;
    document.querySelector('#contextCaseHeroImage').alt = caseData.imageAlt;
    document.querySelector('#contextCaseDetailImage').src = caseData.detailImage;
    document.querySelector('#contextCaseDetailImage').alt = caseData.imageAlt;
    document.querySelector('#contextCasePatient').textContent = caseData.patient;
    document.querySelector('#contextCaseSetting').textContent = caseData.setting;
    document.querySelector('#contextCaseDescription').textContent = caseData.summary;
    document.querySelector('#contextCaseObservations').innerHTML = caseData.observations.map((observation) => `<li>${observation}</li>`).join('');
    const norm = document.querySelector('#contextCaseNorm');
    if (norm) {
      if (caseData.risSec) {
        norm.hidden = false;
        norm.innerHTML = `<strong>RIS SEC</strong><p>${caseData.risSec}</p>${freePracticeContent(selected) ? '<button class="ris-practice-action" type="button" data-open-practice-from-ris>Ir a Práctica libre</button>' : ''}`;
      } else {
        norm.hidden = true;
        norm.innerHTML = '';
      }
    }
    document.querySelector('#contextCaseChallenge').innerHTML = `<strong>Desafío profesional:</strong> ${caseData.challenge}`;
  } else {
    document.querySelector('#situationPatientName').textContent = `Caso del Módulo ${module.number}`;
    document.querySelector('#situationPatientSetting').textContent = module.short;
    document.querySelector('#situationPatientSummary').textContent = 'Situación contextualizada para analizar antecedentes, reconocer el problema central y tomar decisiones.';
    document.querySelector('#contextCasePatient').textContent = `Caso del Módulo ${module.number}`;
    document.querySelector('#contextCaseSetting').textContent = module.short;
    document.querySelector('#contextCaseDescription').textContent = courseUiLabels.contextFallbackDescription;
    document.querySelector('#contextCaseObservations').innerHTML = '<li>Reconocer el contexto y sus actores.</li><li>Identificar el problema central.</li><li>Prepararse para analizar y tomar decisiones.</li>';
    const emptyNorm = document.querySelector('#contextCaseNorm');
    if (emptyNorm) {
      emptyNorm.hidden = true;
      emptyNorm.innerHTML = '';
    }
    document.querySelector('#contextCaseChallenge').innerHTML = '<strong>Desafío profesional:</strong> aplicar los aprendizajes del módulo en una situación contextualizada.';
  }
  renderContextActivity(module);

  if (completedCount >= steps.length) {
    localStorage.setItem(`aulatp-module-${module.number}-stage`, '1');
    const generalProgress = Math.round(((Number(module.number) - 1 + 1 / 8) / modules.length) * 100);
    localStorage.setItem('aulatp-overall-progress', String(generalProgress));
  }
}

function openContextualization(module) {
  selected = module;
  const plan = contextualizationPlanFor(module);
  const activityVersionKey = `aulatp-context-${module.number}-activity-version`;
  if (!apiCourseState && modules.some((item) => item.number === module.number) && localStorage.getItem(activityVersionKey) !== '1') {
    localStorage.removeItem(`aulatp-context-${module.number}-completed`);
    localStorage.removeItem(`aulatp-context-${module.number}-current`);
    localStorage.setItem(activityVersionKey, '1');
  }
  const savedCompleted = JSON.parse(localStorage.getItem(`aulatp-context-${module.number}-completed`) || '[]').filter((step) => step >= 1 && step <= plan.steps.length);
  contextCompleted = new Set(savedCompleted);
  contextCurrentStep = Math.min(plan.steps.length, Number.parseInt(localStorage.getItem(`aulatp-context-${module.number}-current`) || '1', 10));
  contextActivityFeedback = null;
  showCourseView('contextualizationView');
  renderContextualization(module);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openAccessView() {
  showCourseView('accessView');
  showSelected(selected);
  syncCourseUrl();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', (event) => {
  const enterButton = event.target.closest('[data-enter]');
  if (enterButton && !enterButton.disabled) {
    const module = modules.find((item) => item.number === enterButton.dataset.enter);
    if (module) enterModule(module);
    return;
  }
  const selectButton = event.target.closest('[data-module]');
  if (selectButton) {
    const module = modules.find((item) => item.number === selectButton.dataset.module);
    if (module) showSelected(module);
  }

  const stageButton = event.target.closest('[data-internal-stage]');
  if (stageButton) {
    if (stageButton.disabled) return;
    const stageIndex = Number(stageButton.dataset.internalStage);
    const state = overviewStationState(stageIndex, selected);
    if (!reviewerMode && state === 'locked') return;
    selectedOverviewIndex = overviewVisualIndexForStage(stageIndex, selected);
    renderModuleScreen(selected);
    syncCourseUrl();
  }

  const aeButton = event.target.closest('[data-ae]');
  if (aeButton) {
    activeAe = Number(aeButton.dataset.ae);
    activeInternalStage = activeAe;
    localStorage.setItem(`aulatp-module-${selected.number}-stage`, String(activeInternalStage));
    localStorage.setItem(`aulatp-module-${selected.number}-ae`, String(activeAe));
    renderModuleScreen(selected);
  }

  const templateAeButton = event.target.closest('[data-template-ae]');
  if (templateAeButton) {
    activeAe = Number(templateAeButton.dataset.templateAe);
    if (activeInternalStage >= 1 && activeInternalStage <= expectedAeCount(selected)) activeInternalStage = activeAe;
    localStorage.setItem(`aulatp-module-${selected.number}-ae`, String(activeAe));
    renderModuleScreen(selected);
  }

  const contextButton = event.target.closest('[data-context-step]');
  if (contextButton) {
    contextCurrentStep = Number(contextButton.dataset.contextStep);
    contextActivityFeedback = null;
    localStorage.setItem(`aulatp-context-${selected.number}-current`, String(contextCurrentStep));
    renderContextualization(selected);
    document.querySelector('#contextActivityPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const moveButton = event.target.closest('[data-sequence-move]');
  if (moveButton) {
    const activity = activityFor(selected, contextCurrentStep);
    if (!activity || activity.kind !== 'sequence') return;
    const sequenceIndex = Number(moveButton.dataset.sequenceIndex);
    const itemIndex = Number(moveButton.dataset.itemIndex);
    const direction = moveButton.dataset.sequenceMove === 'up' ? -1 : 1;
    const nextIndex = itemIndex + direction;
    const key = `${selected.number}-${activity.number}-${sequenceIndex}`;
    if (nextIndex < 0 || nextIndex >= sequenceOrders[key].length) return;
    [sequenceOrders[key][itemIndex], sequenceOrders[key][nextIndex]] = [sequenceOrders[key][nextIndex], sequenceOrders[key][itemIndex]];
    lastSequenceMove = { sequenceIndex, itemIndex: nextIndex, direction: direction < 0 ? 'up' : 'down' };
    contextActivityFeedback = null;
    renderContextActivity(selected);
    window.setTimeout(() => {
      lastSequenceMove = null;
      document.querySelectorAll('.sequence-item.moving-up, .sequence-item.moving-down').forEach((item) => item.classList.remove('moving-up', 'moving-down'));
    }, 480);
  }
});

document.addEventListener('dragstart', (event) => {
  const item = event.target.closest('[data-sequence-drag]');
  if (!item) return;
  draggedSequenceItem = { sequenceIndex: Number(item.dataset.sequenceDrag), itemIndex: Number(item.dataset.itemIndex) };
  item.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', `${draggedSequenceItem.sequenceIndex}:${draggedSequenceItem.itemIndex}`);
});

document.addEventListener('dragover', (event) => {
  const target = event.target.closest('[data-sequence-drag]');
  if (!target || !draggedSequenceItem || Number(target.dataset.sequenceDrag) !== draggedSequenceItem.sequenceIndex) return;
  event.preventDefault();
  document.querySelectorAll('.sequence-item.drag-over').forEach((item) => item.classList.remove('drag-over'));
  target.classList.add('drag-over');
  event.dataTransfer.dropEffect = 'move';
});

document.addEventListener('drop', (event) => {
  const target = event.target.closest('[data-sequence-drag]');
  if (!target || !draggedSequenceItem) return;
  const targetSequence = Number(target.dataset.sequenceDrag);
  const targetIndex = Number(target.dataset.itemIndex);
  if (targetSequence !== draggedSequenceItem.sequenceIndex) return;
  event.preventDefault();
  const key = `${selected.number}-${contextCurrentStep}-${targetSequence}`;
  const order = sequenceOrders[key];
  if (!order || targetIndex === draggedSequenceItem.itemIndex) return;
  const originalIndex = draggedSequenceItem.itemIndex;
  const [movedItem] = order.splice(originalIndex, 1);
  order.splice(targetIndex, 0, movedItem);
  lastSequenceMove = { sequenceIndex: targetSequence, itemIndex: targetIndex, direction: targetIndex < originalIndex ? 'up' : 'down' };
  draggedSequenceItem = null;
  contextActivityFeedback = null;
  renderContextActivity(selected);
  window.setTimeout(() => {
    lastSequenceMove = null;
    document.querySelectorAll('.sequence-item.moving-up, .sequence-item.moving-down').forEach((item) => item.classList.remove('moving-up', 'moving-down'));
  }, 480);
});

document.addEventListener('dragend', () => {
  draggedSequenceItem = null;
  document.querySelectorAll('.sequence-item.dragging, .sequence-item.drag-over').forEach((item) => item.classList.remove('dragging', 'drag-over'));
});

document.querySelector('#advanceStage').addEventListener('click', () => {
  const stations = overviewStations(selected);
  const station = stations[Math.max(0, Math.min(selectedOverviewIndex, stations.length - 1))];
  const state = overviewStationState(station.index);
  if ((state === 'available' || state === 'locked') && !reviewerMode) return;
  const target = station.index;
  if (target === STAGE_CONTEXT) {
    setInternalStage(STAGE_CONTEXT);
    openContextualization(selected);
    return;
  }
  if (target === 1) {
    const aeCount = expectedAeCount(selected);
    const aeIndex = activeInternalStage >= 1 && activeInternalStage <= aeCount ? activeInternalStage : 1;
    setInternalStage(aeIndex);
    void openAeJourney(selected, aeIndex);
    return;
  }
  if (target === STAGE_INTEGRATOR) {
    setInternalStage(STAGE_INTEGRATOR);
    openIntegrator(selected);
    return;
  }
  if (target === STAGE_EVALUATION) {
    setInternalStage(STAGE_EVALUATION);
    openEvaluation(selected);
    return;
  }
  if (target === STAGE_FEEDBACK) {
    setInternalStage(STAGE_FEEDBACK);
    const nextModule = modules[Number(selected.number)];
    if (nextModule) enterModule(nextModule);
  }
});

document.querySelector('#backToHome').addEventListener('click', openAccessView);
document.querySelector('#backToModule').addEventListener('click', () => enterModule(selected));
document.querySelector('#backFromAe').addEventListener('click', () => enterModule(selected));
document.querySelector('#backFromIntegrator').addEventListener('click', () => enterModule(selected));
document.querySelector('#backFromPractice').addEventListener('click', () => enterModule(selected));
document.querySelector('#backFromEvaluation').addEventListener('click', () => enterModule(selected));
document.querySelector('#enterDetail').addEventListener('click', () => enterModule(selected));
document.querySelector('#validateContextActivity').addEventListener('click', validateContextActivity);
document.querySelector('#nextContextActivity').addEventListener('click', () => {
  const plan = contextualizationPlanFor(selected);
  if (contextCurrentStep >= plan.steps.length) {
    if (contextAdvanceTimer) {
      window.clearTimeout(contextAdvanceTimer);
      contextAdvanceTimer = null;
    }
    void openAeJourney(selected, 1);
    return;
  }
  contextCurrentStep += 1;
  contextActivityFeedback = null;
  localStorage.setItem(`aulatp-context-${selected.number}-current`, String(contextCurrentStep));
  renderContextualization(selected);
  document.querySelector('#contextActivityPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#aeRoute').addEventListener('click', (event) => {
  const button = event.target.closest('[data-ae-stage]');
  if (!button || button.disabled) return;
  aeSelectedStageSequence = Number(button.dataset.aeStage);
  renderAeJourney(selected);
  document.querySelector('#aeStageDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.querySelector('#completeAeStage').addEventListener('click', () => { void completeSelectedAeStage(); });
document.querySelector('#continueNextAe').addEventListener('click', () => { void continueAeJourney(); });

document.querySelector('#integratorView').addEventListener('click', (event) => {
  const vitalStateButton = event.target.closest('[data-vital-state]');
  if (vitalStateButton) {
    const simulation = integratorContent()?.finalSimulation || {};
    const nextState = vitalStateButton.dataset.vitalState;
    if (!simulation.vitalStates?.[nextState]) return;
    integratorState.vitalState = nextState;
    saveIntegratorState();
    renderIntegrator();
    document.querySelector('[data-patient-simulator]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playInterfaceTone(nextState === 'stable' ? 'success' : 'tap');
    return;
  }

  if (event.target.closest('#resetPatientView')) {
    const model = document.querySelector('#integratorPatientModel');
    if (model) {
      model.cameraOrbit = '0deg 75deg 70%';
      model.cameraTarget = 'auto auto auto';
      model.fieldOfView = '24deg';
      model.jumpCameraToGoal?.();
    }
    showToast(`Vista del ${courseUiLabels.finalCaseEntity} restablecida.`);
    return;
  }

  const routeButton = event.target.closest('[data-integrator-step]');
  if (routeButton && !routeButton.disabled) {
    integratorState.activeStep = Number(routeButton.dataset.integratorStep);
    integratorOpenResource = null;
    saveIntegratorState();
    renderIntegrator();
    document.querySelector('#integratorStagePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const situationButton = event.target.closest('[data-progressive-number]');
  if (situationButton) {
    integratorState.currentSituation = Number(situationButton.dataset.progressiveNumber);
    saveIntegratorState();
    renderIntegrator();
    return;
  }

  if (event.target.closest('#checkProgressive')) {
    const content = integratorContent();
    const number = integratorState.currentSituation;
    const situation = content.progressiveSituations[number - 1];
    const selectedOption = document.querySelector('input[name="progressive-answer"]:checked');
    const hint = document.querySelector('#integratorInlineHint');
    if (!selectedOption) {
      hint.hidden = false;
      hint.innerHTML = '<strong>Selecciona una respuesta.</strong> Luego podrás comprobar tu decisión.';
      return;
    }
    if (Number(selectedOption.value) !== situation.answer) {
      hint.hidden = false;
      hint.innerHTML = `<strong>Pista:</strong> ${situation.hint}`;
      return;
    }
    integratorState.progressiveAnswers[number] = situation.answer;
    const nextPending = content.progressiveSituations.findIndex((item, index) => !Object.prototype.hasOwnProperty.call(integratorState.progressiveAnswers, index + 1));
    if (nextPending >= 0) integratorState.currentSituation = nextPending + 1;
    saveIntegratorState();
    renderIntegrator();
    showToast(`Situación ${number} resuelta correctamente.`);
    return;
  }

  const resourceButton = event.target.closest('[data-integrator-resource]');
  if (resourceButton) {
    const key = resourceButton.dataset.integratorResource;
    integratorOpenResource = key;
    if (!integratorState.reviewedResources.includes(key)) integratorState.reviewedResources.push(key);
    saveIntegratorState();
    renderIntegrator();
    document.querySelector('#integratorResourcePanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  if (event.target.closest('[data-close-integrator-resource]')) {
    if (integratorVideoTimer) window.clearInterval(integratorVideoTimer);
    integratorVideoTimer = null;
    window.speechSynthesis?.cancel();
    integratorOpenResource = null;
    renderIntegrator();
    return;
  }

  if (event.target.closest('#playIntegratorVideo')) {
    const resource = integratorContent().resources.video;
    const button = document.querySelector('#playIntegratorVideo');
    const caption = document.querySelector('#integratorVideoCaption');
    const progress = document.querySelector('#integratorVideoProgress');
    if (integratorVideoTimer) {
      window.clearInterval(integratorVideoTimer);
      integratorVideoTimer = null;
      window.speechSynthesis?.cancel();
      button.textContent = '▶';
      button.setAttribute('aria-label', 'Reproducir recurso audiovisual');
      return;
    }
    const playStep = () => {
      const text = resource.videoSteps[integratorVideoIndex];
      caption.textContent = text;
      progress.style.width = `${((integratorVideoIndex + 1) / resource.videoSteps.length) * 100}%`;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'es-CL';
        speech.rate = 0.95;
        window.speechSynthesis.speak(speech);
      }
      integratorVideoIndex += 1;
      if (integratorVideoIndex >= resource.videoSteps.length) {
        window.clearInterval(integratorVideoTimer);
        integratorVideoTimer = null;
        integratorVideoIndex = 0;
        button.textContent = '↻';
        button.setAttribute('aria-label', 'Reproducir nuevamente');
      }
    };
    button.textContent = 'Ⅱ';
    button.setAttribute('aria-label', 'Pausar recurso audiovisual');
    playStep();
    if (integratorVideoIndex !== 0) integratorVideoTimer = window.setInterval(playStep, 6500);
    return;
  }

  if (event.target.closest('#completeIntegratorStep')) {
    completeActiveIntegratorStep();
    return;
  }

  if (event.target.closest('#continueAfterIntegrator')) {
    openEvaluation(selected);
  }
});

document.querySelector('#practiceView').addEventListener('click', (event) => {
  const modeButton = event.target.closest('[data-practice-mode]');
  if (modeButton) {
    setPracticeMode(modeButton.dataset.practiceMode);
    return;
  }
  const linkButton = event.target.closest('[data-practice-link]');
  if (linkButton) {
    openPracticeLink(linkButton.dataset.practiceLink);
    return;
  }
  if (event.target.closest('#newPracticeVariant')) {
    generateNewPracticeVariant();
    return;
  }
  if (event.target.closest('#checkPracticeAnswer')) {
    checkPracticeAnswer();
    return;
  }
  if (event.target.closest('#nextPracticeQuestion')) {
    nextPracticeQuestion();
    return;
  }
  if (event.target.closest('#restartPractice')) {
    restartFreePractice();
    return;
  }
  if (event.target.closest('#continueAfterPractice')) {
    openEvaluation(selected);
  }
});

document.querySelector('#evaluationView').addEventListener('input', () => {
  const content = evaluationContent();
  const state = collectEvaluationExportState(content, loadEvaluationState());
  if (!state.completed) { saveEvaluationState(state); updateEvaluationProgress(content, state); }
});

document.querySelector('#evaluationView').addEventListener('click', (event) => {
  if (event.target.closest('#completeEvaluation')) {
    completeEvaluation();
    return;
  }
  if (event.target.closest('[data-export-evaluation-questions-pdf]')) {
    exportEvaluationQuestionsPdf(selected);
    return;
  }
  if (event.target.closest('#saveTeacherEvaluation')) {
    saveFinalEvaluationForTeacher(selected);
    return;
  }
  if (event.target.closest('#exportEvaluationPdf') || event.target.closest('[data-export-evaluation-pdf]')) {
    exportEvaluationPdf(selected);
    return;
  }
  if (event.target.closest('#continueAfterEvaluation')) {
    continueAfterEvaluation();
  }
});

function updateReviewerControls(message) {
  const allowed = ['teacher', 'admin', 'superadmin'].includes(apiCourseState?.user?.role);
  if (!allowed) reviewerMode = false;
  document.body.classList.toggle('reviewer-mode', reviewerMode);
  const toggle = document.querySelector('#reviewerToggle');
  const status = document.querySelector('#reviewerStatus');
  if (toggle) {
    toggle.hidden = !allowed;
    toggle.classList.toggle('active', reviewerMode);
    toggle.textContent = reviewerMode ? 'Vista docente activa' : 'Vista docente';
  }
  if (status) status.textContent = message || (reviewerMode ? 'Modo revisión activo: navegación desbloqueada localmente.' : 'Modo revisión desactivado.');
}

function setReviewerMode(enabled, message) {
  if (!['teacher', 'admin', 'superadmin'].includes(apiCourseState?.user?.role)) return;
  reviewerMode = enabled;
  sessionStorage.setItem('aulatp-reviewer-mode', String(reviewerMode));
  updateReviewerControls(message);
  buildRoute();
  showSelected(selected);
}

function reviewerPanelOpen(open = true) {
  const panel = document.querySelector('#reviewerPanel');
  const toggle = document.querySelector('#reviewerToggle');
  panel.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (open) updateReviewerControls();
}

async function reviewerCompleteContextStep() {
  const activity = activityFor(selected, contextCurrentStep);
  if (!activity) return;
  const plan = contextualizationPlanFor(selected);
  contextCompleted.add(activity.number);
  localStorage.setItem(`aulatp-context-${selected.number}-current`, String(activity.number));
  localStorage.setItem(`aulatp-context-${selected.number}-completed`, JSON.stringify([...contextCompleted].sort((a, b) => a - b)));
  contextActivityFeedback = { type: 'success', message: completedActivityMessage(selected, activity) };
  void syncActivityCompletion(selected, activity).catch(() => {});
  if (activity.number >= plan.steps.length) {
    localStorage.setItem(`aulatp-module-${selected.number}-stage`, '1');
    showToast('Admin: contextualización completada. Abriendo AE 1.');
    await openAeJourney(selected, 1);
    return;
  }
  contextCurrentStep = Math.min(activity.number + 1, plan.steps.length);
  localStorage.setItem(`aulatp-context-${selected.number}-current`, String(contextCurrentStep));
  renderContextualization(selected);
  showToast(`Admin: estación ${activity.number} completada.`);
}

async function reviewerCompleteAeStage() {
  const learning = activeExpectedLearning();
  const stage = learning?.stages.find((item) => Number(item.sequence) === aeSelectedStageSequence);
  if (!learning || !stage) return;
  try {
    if (stage.id) {
      await apiRequest(`/api/ae-stages/${stage.id}/complete`, { method: 'POST', body: '{}' });
      await loadAeJourney(selected);
    } else {
      const key = `aulatp-ae-${selected.number}-${aeActiveSequence}-completed`;
      const completed = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
      completed.add(Number(stage.sequence));
      localStorage.setItem(key, JSON.stringify([...completed].sort((a, b) => a - b)));
      aeJourneyData = fallbackAeJourney(selected);
    }
  } catch (error) {
    const key = `aulatp-ae-${selected.number}-${aeActiveSequence}-completed`;
    const completed = new Set(JSON.parse(localStorage.getItem(key) || '[]'));
    completed.add(Number(stage.sequence));
    localStorage.setItem(key, JSON.stringify([...completed].sort((a, b) => a - b)));
    aeJourneyData = fallbackAeJourney(selected);
  }
  const updatedLearning = aeJourneyData.expected_learnings.find((item) => Number(item.sequence) === aeActiveSequence) || learning;
  const nextPending = updatedLearning.stages.find((item) => item.progress_status !== 'completed');
  if (nextPending) {
    aeSelectedStageSequence = Number(nextPending.sequence);
    renderAeJourney(selected);
    showToast(`Admin: etapa ${stage.sequence} completada.`);
    return;
  }
  const nextLearning = aeJourneyData.expected_learnings.find((item) => Number(item.sequence) === aeActiveSequence + 1);
  if (nextLearning) {
    showToast(`Admin: ${learning.code} completado. Abriendo ${nextLearning.code}.`);
    await openAeJourney(selected, Number(nextLearning.sequence));
  } else {
    showToast('Admin: AE completados. Abriendo Situación Integradora.');
    activeInternalStage = 4;
    localStorage.setItem(`aulatp-module-${selected.number}-stage`, '4');
    openIntegrator(selected);
  }
}

function reviewerCompleteIntegratorStep() {
  const content = integratorContent();
  if (!content || !integratorState) return;
  const step = integratorState.activeStep;
  if (step === 1) {
    content.progressiveSituations.forEach((situation, index) => { integratorState.progressiveAnswers[index + 1] = situation.answer; });
    markIntegratorStepComplete(1);
    return;
  }
  if (step === 2) {
    content.keywords.pairs.forEach((pair, index) => { integratorState.keywordAnswers[index] = pair.answer; });
    markIntegratorStepComplete(2);
    return;
  }
  if (step === 3) {
    integratorState.reviewedResources = Object.keys(content.resources);
    content.challengeQuestions.forEach((question, index) => { integratorState.challengeAnswers[index] = question.answer; });
    markIntegratorStepComplete(3);
    return;
  }
  content.finalQuestions.forEach((question, index) => { integratorState.finalAnswers[index] = question.answer; });
  const reviewerPatient = String(content.patient || 'la persona').split(',')[0];
  integratorState.reflection = integratorState.reflection || `Admin revisión: registro integrado de prueba con hallazgos prioritarios, acción realizada, comunicación al equipo y condición final de ${reviewerPatient} para validar el flujo completo del curso.`;
  markIntegratorStepComplete(4);
}

async function reviewerAdvanceCurrent() {
  setReviewerMode(true, 'Modo revisión activo: avanzando sin validación de estudiante.');
  const activeView = document.querySelector('.course-view.is-active')?.id;
  if (activeView === 'accessView') {
    enterModule(selected);
  } else if (activeView === 'learningView') {
    if (activeInternalStage === STAGE_CONTEXT) openContextualization(selected);
    else if (activeInternalStage >= 1 && activeInternalStage <= 3) await openAeJourney(selected, activeInternalStage);
    else if (activeInternalStage === STAGE_INTEGRATOR) openIntegrator(selected);
    else if (activeInternalStage === STAGE_EVALUATION) openEvaluation(selected);
    else {
      const nextModule = modules[Number(selected.number)];
      if (nextModule) enterModule(nextModule);
    }
  } else if (activeView === 'contextualizationView') {
    await reviewerCompleteContextStep();
  } else if (activeView === 'aeJourneyView') {
    await reviewerCompleteAeStage();
  } else if (activeView === 'integratorView') {
    reviewerCompleteIntegratorStep();
  } else if (activeView === 'practiceView') {
    reviewerCompletePractice();
  } else if (activeView === 'evaluationView') {
    const content = evaluationContent();
    if (content) {
      const state = loadEvaluationState();
      content.questions.forEach((question, index) => { state.answers[index] = question.answer; });
      state.reflection = state.reflection || `Admin revisión: evaluación final del módulo ${selected.number} completada con registro de aprendizaje, decisiones seguras y aspectos de continuidad para validar el flujo completo.`;
      state.completed = true;
      activeInternalStage = STAGE_FEEDBACK;
      saveEvaluationState(state);
      localStorage.setItem(`aulatp-module-${selected.number}-stage`, String(STAGE_FEEDBACK));
      renderEvaluation(selected);
      showToast('Admin: evaluación y cierre completados.');
    }
  }
  updateReviewerControls('Avance administrador aplicado en la pantalla actual.');
}

function reviewerOpenIntegrator() {
  setReviewerMode(true, 'Modo revisión activo: Situación Integradora disponible.');
  activeInternalStage = 4;
  activeAe = expectedAeCount(selected);
  localStorage.setItem(`aulatp-module-${selected.number}-stage`, '4');
  localStorage.setItem(`aulatp-module-${selected.number}-ae`, String(activeAe));
  openIntegrator(selected);
}

function reviewerResetLocal() {
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('aulatp-context-') || key?.startsWith('aulatp-ae-') || key?.startsWith('aulatp-integrator-') || key?.startsWith('aulatp-practice-') || key?.startsWith('aulatp-module-')) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem('aulatp-course-started', 'true');
  activeInternalStage = 0;
  activeAe = 1;
  showToast('Admin: revisión local reiniciada.');
  enterModule(selected);
}

function showLoginView(message = '') {
  document.querySelector('#authView').hidden = false;
  document.querySelector('#appShell').hidden = true;
  document.querySelector('#userSessionBar').hidden = true;
  document.querySelector('#reviewerPanel').hidden = true;
  document.querySelector('#tutorButton').hidden = true;
  document.querySelector('#accessibilityButton').hidden = true;
  document.querySelector('#practiceFloatingButton').hidden = true;
  document.querySelector('#supportDockButton').hidden = true;
  closeSupportDock({ restoreFocus: false });
  closeTutorPanel({ restoreFocus: false });
  if (tutorHistoryLoaded) {
    document.querySelector('#tutorMessages').replaceChildren();
    appendTutorMessage('assistant', tutorWelcomeMessage());
  }
  tutorHistoryLoaded = false;
  document.querySelector('#reviewerToggle').setAttribute('aria-expanded', 'false');
  const error = document.querySelector('#loginError');
  error.hidden = !message;
  error.textContent = message;
  renderCourseCatalogs();
}

function showAuthenticatedApp() {
  document.querySelector('#authView').hidden = true;
  document.querySelector('#appShell').hidden = false;
  document.querySelector('#userSessionBar').hidden = false;
  document.querySelector('#tutorButton').hidden = true;
  document.querySelector('#accessibilityButton').hidden = true;
  document.querySelector('#practiceFloatingButton').hidden = true;
  document.querySelector('#supportDockButton').hidden = false;
  updateReviewerControls();
  showCourseView('accessView');
  syncPracticeFloatingButton('accessView');
  syncSupportDock('accessView');
  showSelected(selected);
  renderCourseCatalogs();
  applyCourseRoute();
}

function applyCourseProfile() {
  if (!courseProfile.title) return;
  if (courseProfile.id) {
    document.body.classList.add(`course-${String(courseProfile.id).replace(/[^a-z0-9_-]/gi, '-').toLowerCase()}`);
  }
  document.title = `Aula TP Chile · ${courseProfile.title}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', courseProfile.metaDescription || `Ruta de módulos de aprendizaje: ${courseProfile.title}.`);
  document.querySelectorAll('[data-course-title]').forEach((element) => { element.textContent = courseProfile.title; });
  document.querySelectorAll('[data-course-specialty]').forEach((element) => { element.textContent = courseProfile.specialty || courseProfile.title; });
  document.querySelectorAll('[data-course-demo-note]').forEach((element) => { element.textContent = courseProfile.demoNote || `Acceso directo por clave al curso de ${courseProfile.title}.`; });
  document.querySelectorAll('[data-course-login-subtitle]').forEach((element) => { element.textContent = courseProfile.loginSubtitle || 'Aprende, practica y avanza a tu ritmo.'; });
  const heroDescription = document.querySelector('#courseHeroDescription');
  if (heroDescription && courseProfile.heroDescription) heroDescription.textContent = courseProfile.heroDescription;
  document.querySelectorAll('[data-course-hero-kicker]').forEach((element) => {
    element.textContent = courseProfile.heroKicker || 'Módulos especialidad';
  });
  document.querySelectorAll('[data-course-hero-plan]').forEach((element) => {
    element.textContent = courseProfile.heroPlan || courseProfile.level || 'Plan común';
  });
  const courseLibrary = document.querySelector('.course-library-strip');
  if (courseLibrary) {
    courseLibrary.classList.toggle('is-single-course', singleCourseCatalog);
    courseLibrary.hidden = !isGeneralCatalog;
  }
  const libraryKicker = document.querySelector('.library-heading span');
  if (libraryKicker && courseProfile.libraryKicker) libraryKicker.textContent = courseProfile.libraryKicker;
  const libraryTitle = document.querySelector('#courseLibraryTitle');
  if (libraryTitle && courseProfile.libraryTitle) libraryTitle.textContent = courseProfile.libraryTitle;
  const libraryDescription = document.querySelector('.library-heading p');
  if (libraryDescription && courseProfile.libraryDescription) libraryDescription.textContent = courseProfile.libraryDescription;
  const tutorSafetyNote = document.querySelector('#tutorSafetyNote');
  if (tutorSafetyNote) tutorSafetyNote.textContent = courseUiLabels.tutorSafetyNote;
  const contextCaseTypeLabel = document.querySelector('#contextCaseTypeLabel');
  if (contextCaseTypeLabel) contextCaseTypeLabel.textContent = courseUiLabels.contextCaseType;
  const practiceCaseTypeLabel = document.querySelector('#practiceCaseTypeLabel');
  if (practiceCaseTypeLabel) practiceCaseTypeLabel.textContent = courseUiLabels.practiceCaseType;
  const practiceIntroText = document.querySelector('#practiceIntroText');
  if (practiceIntroText) practiceIntroText.textContent = courseUiLabels.practiceIntro;
  const parseHours = (value) => Number(String(value || '').replace(/[^\d.]/g, '')) || 0;
  const totalAnnual = modules.reduce((sum, module) => sum + parseHours(module.hours), 0);
  const total3d = modules.reduce((sum, module) => sum + parseHours(module.hours3d), 0);
  document.querySelectorAll('[data-stat-modules]').forEach((el) => { el.textContent = String(modules.length); });
  document.querySelectorAll('[data-stat-hours-annual]').forEach((el) => { el.textContent = totalAnnual ? `${totalAnnual} h` : '—'; });
  document.querySelectorAll('[data-stat-hours-3d]').forEach((el) => { el.textContent = total3d ? `${total3d} h` : '—'; });
  if (courseUiLabels.decorativeSymbols) {
    const { primary = '✚', secondary = '♡', tertiary = '☷' } = courseUiLabels.decorativeSymbols;
    document.querySelectorAll('.auth-cross, .banner-heart').forEach((element) => { element.textContent = primary; });
    document.querySelectorAll('.auth-heart').forEach((element) => { element.textContent = secondary; });
    document.querySelectorAll('.hero-symbols').forEach((group) => {
      const symbols = group.querySelectorAll('span');
      if (symbols[0]) symbols[0].textContent = primary;
      if (symbols[1]) symbols[1].textContent = secondary;
      if (symbols[2]) symbols[2].textContent = tertiary;
    });
    document.querySelectorAll('.ae-hero-care span').forEach((element) => { element.textContent = secondary; });
    document.querySelectorAll('.ae-hero-care i').forEach((element) => { element.textContent = primary; });
  }
}

async function bootstrapApplication() {
  renderCourseCatalogs();
  applyCourseProfile();
  applyAccessibilityPreferences();
  try {
    await apiRequest('/api/me');
    await syncAccessibilityPreferences();
    await loadServerCourseState(true);
    showAuthenticatedApp();
  } catch (error) {
    if (error.status === 401 || (isLocalStaticPreview && error.status === 404)) {
      showLoginView();
    } else {
      showLoginView('No pudimos conectar con la plataforma. Verifica que la versión Docker esté activa.');
    }
  }
}

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.querySelector('#loginButton');
  const error = document.querySelector('#loginError');
  button.disabled = true;
  button.firstChild.textContent = 'Ingresando... ';
  error.hidden = true;
  try {
    await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.querySelector('#loginEmail').value,
        password: document.querySelector('#loginPassword').value
      })
    });
    await syncAccessibilityPreferences();
    await loadServerCourseState(true);
    showAuthenticatedApp();
  } catch (loginError) {
    if (isLocalStaticPreview && [404, 405, 501].includes(loginError.status)) {
      localStorage.setItem('aulatp-course-started', 'true');
      courseStarted = true;
      apiCourseState = null;
      serverModulesByNumber = new Map();
      showAuthenticatedApp();
    } else {
      error.textContent = loginError.message;
      error.hidden = false;
    }
  } finally {
    button.disabled = false;
    button.firstChild.textContent = 'Ingresar al curso seleccionado ';
  }
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' });
  } finally {
    apiCourseState = null;
    serverModulesByNumber = new Map();
    showLoginView();
  }
});

document.querySelector('#reviewerToggle').addEventListener('click', () => {
  reviewerPanelOpen(document.querySelector('#reviewerPanel').hidden);
});
document.querySelector('#closeReviewerPanel').addEventListener('click', () => reviewerPanelOpen(false));
document.querySelector('#reviewerAdvance').addEventListener('click', () => { void reviewerAdvanceCurrent(); });
document.querySelector('#reviewerUnlock').addEventListener('click', () => setReviewerMode(true, 'Navegación desbloqueada localmente para revisar todos los módulos.'));
document.querySelector('#reviewerIntegrator').addEventListener('click', reviewerOpenIntegrator);
document.querySelector('#reviewerReset').addEventListener('click', reviewerResetLocal);

document.querySelector('#tutorButton').addEventListener('click', openTutorPanel);
document.querySelector('#practiceFloatingButton').addEventListener('click', () => openFreePractice(selected));
document.querySelector('#supportDockButton').addEventListener('click', openSupportDock);
document.querySelector('#closeSupportDock').addEventListener('click', () => closeSupportDock());
document.querySelector('#supportDockBackdrop').addEventListener('click', () => closeSupportDock());
document.querySelector('#supportDockPanel').addEventListener('click', (event) => {
  const action = event.target.closest('[data-support-action]');
  if (!action || action.disabled) return;
  const support = action.dataset.supportAction;
  closeSupportDock({ restoreFocus: false });
  if (support === 'tutor') openTutorPanel();
  if (support === 'accessibility') openAccessibilityPanel();
  if (support === 'practice') openFreePractice(selected);
});
document.querySelector('.module-sidebar')?.addEventListener('click', (event) => {
  const action = event.target.closest('[data-support-action]');
  if (!action || action.disabled) return;
  const support = action.dataset.supportAction;
  if (support === 'tutor') openTutorPanel();
  if (support === 'accessibility') openAccessibilityPanel();
  if (support === 'practice') openFreePractice(selected);
});
document.querySelector('#backToModuleFooter')?.addEventListener('click', () => {
  if (selectedOverviewIndex > 0) {
    selectedOverviewIndex -= 1;
    renderModuleScreen(selected);
    syncCourseUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.querySelector('#backToHome')?.click();
});
document.querySelector('#stationReflectInput')?.addEventListener('input', writeStationReflection);
document.querySelector('#stationReflectCheck')?.addEventListener('change', writeStationReflection);
document.querySelector('#stationTemplateBody')?.addEventListener('input', (event) => {
  if (event.target.matches('#stationTemplateReflectInput')) writeStationReflection();
});
document.querySelector('#stationTemplateBody')?.addEventListener('change', (event) => {
  if (event.target.matches('#stationTemplateReflectCheck')) writeStationReflection();
});
window.addEventListener('popstate', () => {
  if (document.querySelector('#appShell')?.hidden !== false) return;
  applyCourseRoute();
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-open-practice-from-ris]')) return;
  openFreePractice(selected);
});
document.querySelector('#closeTutor').addEventListener('click', () => closeTutorPanel());
document.querySelector('#tutorBackdrop').addEventListener('click', () => closeTutorPanel());
document.querySelector('#tutorForm').addEventListener('submit', (event) => {
  event.preventDefault();
  void sendTutorMessage(document.querySelector('#tutorInput').value);
});
document.querySelector('#tutorInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.querySelector('#tutorForm').requestSubmit();
  }
});
document.querySelector('#tutorQuickActions').addEventListener('click', (event) => {
  const action = event.target.closest('[data-tutor-prompt]');
  if (!action) return;
  void sendTutorMessage(action.dataset.tutorPrompt || action.textContent);
});

document.querySelector('#accessibilityButton').addEventListener('click', openAccessibilityPanel);
document.querySelector('#closeAccessibility').addEventListener('click', closeAccessibilityPanel);
document.querySelector('#accessibilityBackdrop').addEventListener('click', closeAccessibilityPanel);
document.querySelectorAll('[data-accessibility-profile]').forEach((button) => {
  button.addEventListener('click', () => applyAccessibilityProfile(button.dataset.accessibilityProfile));
});
document.querySelectorAll('[data-text-scale]').forEach((button) => {
  button.addEventListener('click', () => {
    accessibilityPreferences.text_scale = button.dataset.textScale;
    playInterfaceTone('switch');
    accessibilityStatus(`Tamaño de texto: ${button.textContent.trim()}.`);
    queueAccessibilitySave();
  });
});
document.querySelectorAll('[data-accessibility-key]').forEach((input) => {
  input.addEventListener('change', () => {
    accessibilityPreferences[input.dataset.accessibilityKey] = input.checked;
    if (input.dataset.accessibilityKey === 'more_time' && input.checked && contextAdvanceTimer) {
      window.clearTimeout(contextAdvanceTimer);
      contextAdvanceTimer = null;
    }
    const label = input.closest('label')?.querySelector('strong')?.textContent || 'Preferencia';
    const state = input.checked ? 'activada' : 'desactivada';
    if (input.dataset.accessibilityKey === 'narration_enabled' && !input.checked) window.speechSynthesis?.cancel();
    if (input.dataset.accessibilityKey === 'sound_effects_enabled' && input.checked) playInterfaceTone('success');
    else playInterfaceTone('switch');
    queueAccessibilitySave(`${label} ${state}.`);
  });
});
document.querySelector('#ambientSound').addEventListener('change', (event) => {
  accessibilityPreferences.ambient_sound = event.target.value;
  startAmbientSound(accessibilityPreferences.ambient_sound);
  playInterfaceTone('switch');
  const label = event.target.selectedOptions[0]?.textContent || 'Ambiente';
  queueAccessibilitySave(`Ambiente relajante: ${label}.`);
});
document.querySelector('#narrationSpeed').addEventListener('change', (event) => {
  accessibilityPreferences.narration_speed = event.target.value;
  playInterfaceTone('switch');
  const label = event.target.selectedOptions[0]?.textContent || 'Normal';
  queueAccessibilitySave(`Velocidad de narración: ${label}.`);
});
document.querySelector('#audioVolume').addEventListener('input', (event) => {
  accessibilityPreferences.audio_volume = Number(event.target.value);
  if (accessibilityPreferences.ambient_sound !== 'off') startAmbientSound(accessibilityPreferences.ambient_sound);
  accessibilityStatus(`Volumen de apoyos: ${event.target.value}%.`);
});
document.querySelector('#audioVolume').addEventListener('change', (event) => {
  accessibilityPreferences.audio_volume = Number(event.target.value);
  playInterfaceTone('switch');
  queueAccessibilitySave(`Volumen de apoyos: ${event.target.value}%.`);
});
document.querySelector('#listenCurrentInstruction').addEventListener('click', speakCurrentInstruction);
document.querySelector('#stopNarration').addEventListener('click', () => {
  narrationStopRequested = true;
  window.speechSynthesis?.cancel();
  stopAmbientSound();
  if (accessibilityPreferences.ambient_sound !== 'off') {
    accessibilityPreferences.ambient_sound = 'off';
    queueAccessibilitySave('Ambiente relajante apagado.');
  }
  playInterfaceTone('tap');
  accessibilityStatus('Audio detenido: narración y ambiente apagados.');
});
document.querySelector('#resetAccessibility').addEventListener('click', () => {
  accessibilityPreferences = { ...defaultAccessibilityPreferences };
  stopAmbientSound();
  window.speechSynthesis?.cancel();
  playInterfaceTone('success');
  queueAccessibilitySave('Preferencias restablecidas.');
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.querySelector('#accessibilityPanel').hidden) closeAccessibilityPanel();
  if (event.key === 'Escape' && !document.querySelector('#tutorPanel').hidden) closeTutorPanel();
});

void bootstrapApplication();
