"""Datos curriculares literales de los Programas de Estudio MINEDUC adjuntos.

Las actividades de Aula TP se generan a partir de estos datos, pero no se
presentan como texto oficial. Los textos de OA, AE, nombres y horas de este
archivo corresponden a las tablas de plan de estudio y vision global.
"""


def oa(code, title):
    return {'code': code, 'title': title}


def ae(code, title):
    return {'code': code, 'title': title}


def module(title, hp, year, objectives, expected, section='Plan de estudio'):
    return {
        'title': title,
        'hp': hp,
        'year': year,
        'section': section,
        'oa': objectives,
        'aes': expected,
    }


EMPLOYABILITY_AES = [
    ae('AE 1', 'Diseña y ejecuta un proyecto para concretar iniciativas de emprendimiento, identificando las acciones a realizar, el cronograma de su ejecución y los presupuestos, definiendo alternativas de financiamiento y evaluando y controlando su avance.'),
    ae('AE 2', 'Maneja la legislación laboral y previsional chilena como marco regulador de las relaciones entre trabajadores y empleadores, identificando los derechos y deberes de ambas partes, tanto individuales como colectivos, y la reconoce como base para establecer buenas relaciones laborales.'),
    ae('AE 3', 'Prepara los elementos necesarios para participar de un proceso de incorporación al mundo del trabajo, valorando y planificando su trayectoria formativa y laboral.'),
    ae('AE 4', 'Selecciona alternativas de capacitación y de educación superior para fortalecer sus competencias o desarrollar nuevas y adquirir certificaciones, ya sea e-learning o presenciales, evaluando las diversas opciones de financiamiento.'),
]


ELECTRICITY_OA = {
    1: oa('OA 1', 'Leer y utilizar especificaciones técnicas, planos, diagramas y proyectos de instalación eléctricos.'),
    2: oa('OA 2', 'Dibujar circuitos eléctricos con software de CAD en planos de plantas libres, aplicando la normativa eléctrica vigente.'),
    3: oa('OA 3', 'Ejecutar instalaciones de alumbrado en baja tensión con un máximo de 10 kW de potencia instalada total, sin alimentadores, aplicando la normativa eléctrica vigente, de acuerdo a los planos, a la memoria de cálculo y a los presupuestos con cubicación de materiales y mano de obra.'),
    4: oa('OA 4', 'Ejecutar instalaciones de calefacción y fuerza motriz en baja tensión, con un máximo de 5 kW de potencia total instalada, sin alimentadores, aplicando la normativa eléctrica vigente, de acuerdo a los planos, a la memoria de cálculo y a los presupuestos con cubicación de materiales y mano de obra.'),
    5: oa('OA 5', 'Cubicar materiales e insumos para instalaciones eléctricas de baja tensión, de acuerdo a los planos y a las especificaciones técnicas y aplicando los principios matemáticos que correspondan.'),
    6: oa('OA 6', 'Mantener y reemplazar componentes, equipos y sistemas eléctricos monofásicos y trifásicos, utilizando las herramientas, los instrumentos y los insumos apropiados, considerando las pautas de mantenimiento, los procedimientos, las especificaciones técnicas, las recomendaciones de los fabricantes, la normativa y los estándares de seguridad.'),
    7: oa('OA 7', 'Ejecutar sistemas de control, fuerza y protecciones eléctricas de máquinas, equipos e instalaciones eléctricas según los requerimientos del proyecto y las especificaciones del fabricante, respetando la normativa eléctrica y de control del medio ambiente vigente.'),
    8: oa('OA 8', 'Modificar programas y parámetros en equipos y sistemas eléctricos y electrónicos, utilizados en control de procesos, según los requerimientos operacionales del equipo o de la planta y la normativa eléctrica vigente.'),
}


ELECTRICITY_MODULES = [
    module('Instalación de motores eléctricos y equipos de calefacción', 152, '3° medio', [ELECTRICITY_OA[4]], [
        ae('M1-AE1', 'Instala motores eléctricos en baja tensión, de acuerdo a los requerimientos y considerando la normativa eléctrica vigente.'),
        ae('M1-AE2', 'Instala equipos de calefacción en baja tensión, de acuerdo a los requerimientos y considerando la normativa eléctrica vigente.'),
    ]),
    module('Instalaciones eléctricas domiciliarias', 228, '3° medio', [ELECTRICITY_OA[1], ELECTRICITY_OA[3]], [
        ae('M2-AE1', 'Monta ductos y canalizaciones para instalación eléctrica domiciliaria, de acuerdo a los planos, al proyecto eléctrico y a la normativa vigente.'),
        ae('M2-AE2', 'Realiza cableado y conexionado de conductores y componentes de una instalación eléctrica de alumbrado, de acuerdo las especificaciones técnicas del plano o proyecto eléctrico, considerando la normativa vigente.'),
        ae('M2-AE3', 'Instala tablero eléctrico y elementos de protección eléctrica para instalación eléctrica de alumbrado, de acuerdo a las especificaciones técnicas del plano y/o proyecto eléctrico, considerando la normativa vigente.'),
    ]),
    module('Elaboración de proyectos eléctricos', 228, '3° medio', [ELECTRICITY_OA[1], ELECTRICITY_OA[2], ELECTRICITY_OA[5]], [
        ae('M3-AE1', 'Utiliza sistemas computacionales para la ejecución de programas de diseño de circuitos eléctricos, de acuerdo a lo expresado en la solicitud.'),
        ae('M3-AE2', 'Dibuja circuitos eléctricos según las especificaciones y requerimientos de un proyecto, considerando la normativa eléctrica.'),
        ae('M3-AE3', 'Dimensiona cantidad de materiales para ejecutar la instalación eléctrica de circuitos, de acuerdo a los planos, a la normativa eléctrica y a las especificaciones técnicas.'),
    ]),
    module('Mantenimiento de máquinas, equipos y sistemas eléctricos', 228, '3° medio', [ELECTRICITY_OA[6]], [
        ae('M4-AE1', 'Realiza mantenimiento preventivo de equipos, máquinas y sistemas eléctricos para prevenir fallas y dar continuidad a los servicios, considerando la normativa vigente.'),
        ae('M4-AE2', 'Realiza mantenimiento correctivo de equipos y sistemas eléctricos para restablecer o mejorar su funcionamiento, de acuerdo a los informes de falla o a las pautas de mantenimiento, a la normativa vigente y a las normas de seguridad.'),
    ]),
    module('Instalación de sistemas de control eléctrico industrial', 228, '4° medio', [ELECTRICITY_OA[5], ELECTRICITY_OA[7]], [
        ae('M5-AE1', 'Instala circuitos eléctricos para el control y comando de equipos, máquinas e instalaciones eléctricas, de acuerdo a la normativa vigente.'),
        ae('M5-AE2', 'Instala circuitos de fuerza para abastecer de energía a equipos, máquinas y sistemas eléctricos, de acuerdo a la normativa vigente.'),
        ae('M5-AE3', 'Instala tablero eléctrico, sistemas y dispositivos de protección para proteger máquinas y usuarios, de acuerdo a la normativa vigente.'),
        ae('M5-AE4', 'Instala cuadros de maniobra para el control o temporización de máquinas, equipos e instalaciones eléctricas.'),
    ]),
    module('Instalaciones eléctricas industriales', 228, '4° medio', [ELECTRICITY_OA[4]], [
        ae('M6-AE1', 'Ejecuta instalación eléctrica de fuerza motriz de acuerdo a las especificaciones técnicas del plano o proyecto eléctrico, considerando las exigencias generales para instalaciones de fuerza y de calefacción de la normativa vigente.'),
        ae('M6-AE2', 'Realiza instalación eléctrica de calefacción de acuerdo a las especificaciones técnicas del proyecto eléctrico, considerando las exigencias y normativa generales para instalaciones de calefacción.'),
        ae('M6-AE3', 'Instala tablero eléctrico y dispositivos de protección en instalación eléctrica de calefacción y fuerza motriz de acuerdo a las especificaciones técnicas del plano o proyecto eléctrico, considerando las exigencias generales para instalaciones de fuerza y calefacción de la normativa vigente.'),
    ]),
    module('Instalación de equipos electrónicos de potencia', 152, '4° medio', [ELECTRICITY_OA[7]], [
        ae('M7-AE1', 'Instala dispositivos electrónicos de potencia para el control de sistemas o equipos eléctricos, de acuerdo a las especificaciones técnicas y a los estándares de calidad.'),
        ae('M7-AE2', 'Instala circuitos de control utilizando dispositivos electrónicos de potencia de acuerdo a los requerimientos técnicos.'),
    ]),
    module('Automatización de sistemas eléctricos industriales', 152, '4° medio', [ELECTRICITY_OA[8]], [
        ae('M8-AE1', 'Maneja y ajusta parámetros en equipos y sistemas eléctricos y electrónicos utilizados en control de procesos, según los requerimientos operacionales del equipo o de la planta y la normativa eléctrica vigente.'),
        ae('M8-AE2', 'Programa dispositivos de automatización de procesos industriales, de acuerdo a los requerimientos y a las especificaciones técnicas.'),
    ]),
    module('Emprendimiento y empleabilidad', 76, '4° medio', [], EMPLOYABILITY_AES, 'Objetivos de Aprendizaje Genéricos'),
]


NURSING_COMMON_OA = {
    1: oa('OA 1', 'Aplicar cuidados básicos de enfermería, higiene y confort a personas en distintas etapas del ciclo vital, de acuerdo a principios técnicos y protocolos establecidos, brindando un trato digno, acogedor y coherente con los derechos y deberes del paciente.'),
    2: oa('OA 2', 'Medir, controlar y registrar parámetros de salud de los pacientes, como peso, talla, temperatura, signos vitales y presión arterial, aplicando instrumentos de medición apropiados.'),
    3: oa('OA 3', 'Aplicar estrategias de promoción de salud, prevención de enfermedades, hábitos de alimentación saludable para fomentar una vida adecuada para la familia y comunidad de acuerdo a modelos definidos por las políticas de salud.'),
    4: oa('OA 4', 'Mantener las condiciones sanitarias y de seguridad en las dependencias donde se encuentran las personas bajo su cuidado, de acuerdo a las normas sanitarias y de seguridad vigentes.'),
    5: oa('OA 5', 'Contribuir a la prevención y control de infecciones en las personas bajo su cuidado, aplicando normas de asepsia y antisepsia.'),
    6: oa('OA 6', 'Registrar información, en forma digital y manual, relativa al control de salud de las personas bajo su cuidado, y relativa a procedimientos administrativos de ingreso, permanencia y egreso de establecimientos de salud o estadía, resguardando la privacidad de las personas.'),
}


NURSING_COMMON_MODULES = [
    module('Aplicación de cuidados básicos', 228, '3° medio', [NURSING_COMMON_OA[1]], [
        ae('PC-M1-AE1', 'Atiende integralmente y con los cuidados básicos de enfermería, a las y los pacientes y su familia según la etapa del ciclo vital, considerando las necesidades básicas, los derechos del paciente y la calidad de la atención en salud.'),
        ae('PC-M1-AE2', 'Ejecuta los procedimientos de higiene y confort a pacientes pediátricos y adultos, de acuerdo al plan de atención de enfermería, respetando la privacidad, el pudor y el protocolo establecido.'),
        ae('PC-M1-AE3', 'Realiza las actividades y tareas de prevención de alteración de las necesidades básicas, considerando las normas de calidad de atención y los derechos de las y los pacientes.'),
    ], 'Plan común'),
    module('Medición y control de parámetros básicos en salud', 152, '3° medio', [NURSING_COMMON_OA[2]], [
        ae('PC-M2-AE1', 'Controla los signos vitales de acuerdo a la indicación profesional, al plan de atención y necesidad de la o el paciente, considerando los principios de asepsia, antisepsia y seguridad.'),
        ae('PC-M2-AE2', 'Efectúa control de antropometría a pacientes pediátricos y adultos, cumpliendo las normas establecidas y el protocolo definido en el establecimiento.'),
        ae('PC-M2-AE3', 'Organiza equipos, materiales e insumos, para realizar el control de signos vitales y antropometría a pacientes, de acuerdo a los protocolos establecidos.'),
    ], 'Plan común'),
    module('Promoción de la salud y prevención de la enfermedad', 190, '3° medio', [NURSING_COMMON_OA[3]], [
        ae('PC-M3-AE1', 'Realiza acciones de prevención de enfermedades en distintos grupos etarios, y promueve el modelo de salud familiar desde su nivel de competencias y de acuerdo a lo establecido por el MINSAL.'),
        ae('PC-M3-AE2', 'Ejecuta acciones de prevención de riesgos para la salud de las personas asociadas a la manipulación e ingesta de agua y alimentos, la disposición de residuos domiciliarios, la contaminación atmosférica y las condiciones de la vivienda, considerando los estándares de saneamiento básico.'),
        ae('PC-M3-AE3', 'Colabora en la ejecución del plan de salud comunal y programas nacionales de promoción de la salud y prevención de enfermedades en relación con la prevención de problemas infectocontagiosos, digestivos, respiratorios, enfermedades crónicas, entre otros, establecidos por el MINSAL.'),
    ], 'Plan común'),
    module('Higiene y bioseguridad del ambiente', 190, '3° medio', [NURSING_COMMON_OA[4]], [
        ae('PC-M4-AE1', 'Aplica los procedimientos de aseo e higiene diariamente en la unidad de paciente y en su entorno más inmediato, de acuerdo a las normas sanitarias básicas de los centros de salud.'),
        ae('PC-M4-AE2', 'Mantiene un ambiente clínico seguro para cada paciente durante el proceso de atención, aplicando las normas de seguridad de la institución.'),
    ], 'Plan común'),
    module('Sistemas de registro e información en salud', 76, '3° medio', [NURSING_COMMON_OA[6]], [
        ae('PC-M5-AE1', 'Registra en forma digital o manual la información relativa al control de salud de las personas bajo su cuidado, según las normas vigentes.'),
        ae('PC-M5-AE2', 'Registra la información relativa a los procedimientos administrativos de ingreso, permanencia y egreso de sus pacientes.'),
        ae('PC-M5-AE3', 'Usa las TIC en los procesos administrativos para la admisión y el egreso de pacientes, de acuerdo a las normas establecidas.'),
    ], 'Plan común'),
    module('Prevención y control de infecciones intrahospitalarias', 228, '4° medio', [NURSING_COMMON_OA[5]], [
        ae('PC-M6-AE1', 'Brinda cuidados de enfermería respetando las normas de asepsia y antisepsia durante el proceso de atención de pacientes.'),
        ae('PC-M6-AE2', 'Aplica, durante la atención de cada paciente, las barreras protectoras y las medidas de aislamiento establecidas en el plan de atención.'),
        ae('PC-M6-AE3', 'Realiza el lavado, preparación y esterilización de materiales e instrumental, de acuerdo a la normativa vigente y a lo determinado por el establecimiento.'),
    ], 'Plan común'),
]


ADULT_MENTION_OA = {
    1: oa('OA 1', 'Realizar actividades sociales y recreativas orientadas a los intereses, necesidades y características biopsicosociales de las personas adultas mayores, entregando apoyo personalizado, aplicando técnicas de motivación, seleccionando recursos y materiales apropiados y resguardando la seguridad individual y grupal.'),
    2: oa('OA 2', 'Informar a las familias respecto del estado integral del adulto mayor de acuerdo a los requerimientos de la familia y a los procedimientos y protocolos de la institución, utilizando técnicas de comunicación efectiva.'),
    3: oa('OA 3', 'Atender las necesidades de alimentación y nutrición del adulto mayor, preparando, presentando y sirviendo el alimento de acuerdo al grado de autonomía de la persona y sus preferencias, aplicando los procedimientos y técnicas ergonómicas pertinentes, resguardando los principios nutricionales, dietéticos, de higiene y de seguridad.'),
    4: oa('OA 4', 'Atender al adulto mayor en situaciones de emergencia y accidentes, aplicando técnicas de primeros auxilios y protocolos establecidos, resguardando la seguridad individual y del grupo.'),
    5: oa('OA 5', 'Administrar productos farmacológicos de aplicación sencilla, tales como grageas y gotas por vía oral, aplicación de ungüentos en la piel e inyecciones intramusculares para diferentes tratamientos, de acuerdo a las instrucciones del profesional médico que los ha prescrito.'),
    6: oa('OA 6', 'Atender las necesidades de higiene y confort de las personas adultos mayores durante su permanencia en establecimientos de larga estadía o domicilio, aplicando los procedimientos y técnicas ergonómicas pertinentes, respetando su privacidad y grado de autonomía, creando ambientes adecuados a sus necesidades y brindando una acogida favorable en el acompañamiento.'),
}


ADULT_MENTION_MODULES = [
    module('Necesidades psicosociales del adulto mayor', 76, '4° medio', [ADULT_MENTION_OA[1]], [
        ae('AM-M1-AE1', 'Aplica técnicas de comunicación efectiva con el fin de conocer las características, habilidades, necesidades e intereses de los adultos mayores en relación con los ámbitos social y recreativo.'),
        ae('AM-M1-AE2', 'Planifica y programa actividades recreativas para el desarrollo integral del adulto mayor, de acuerdo a su motivación y condiciones de dependencia física y psíquica, considerando los recursos que brinda la comunidad, la situación ambiental, elementos de seguridad, materiales, vestuario y recursos económicos.'),
    ], 'Mención Adulto Mayor'),
    module('Orientación familiar para el cuidado del adulto mayor', 76, '4° medio', [ADULT_MENTION_OA[2]], [
        ae('AM-M2-AE1', 'Mantiene informada a la familia respecto del cuidado integral del adulto mayor y de las normas y protocolos de la institución.'),
        ae('AM-M2-AE2', 'Involucra y hace participar a la familia en el programa de mantención de las capacidades del adulto mayor.'),
    ], 'Mención Adulto Mayor'),
    module('Alimentación y nutrición del adulto mayor', 114, '4° medio', [ADULT_MENTION_OA[3]], [
        ae('AM-M3-AE1', 'Fomenta la participación activa del adulto mayor en su alimentación y nutrición mediante la colaboración constante en su actividad diaria (dentro de su hogar o en el establecimiento de atención especializada).'),
        ae('AM-M3-AE2', 'Explica al adulto mayor la importancia y los beneficios de una alimentación equilibrada para la conservación de la salud.'),
        ae('AM-M3-AE3', 'Prepara alimentos para el adulto mayor cumpliendo las normas sanitarias e higiénicas exigidas y utilizando los implementos adecuados.'),
        ae('AM-M3-AE4', 'Apoya y realiza las actividades de alimentar y servir los alimentos al adulto mayor según nivel de autonomía, cumpliendo indicaciones médicas y nutricionales y considerando técnicas de presentación y de atención postalimentación.'),
    ], 'Mención Adulto Mayor'),
    module('Atención de primeros auxilios del adulto mayor', 76, '4° medio', [ADULT_MENTION_OA[4]], [
        ae('AM-M4-AE1', 'Colabora en la atención del adulto mayor frente a alteraciones graves de su condición de salud, con los recursos disponibles y de acuerdo a sus competencias y a los protocolos de la institución, e informa a quien corresponda, según la norma.'),
        ae('AM-M4-AE2', 'Colabora en la aplicación de los primeros auxilios al adulto mayor en caso de accidentes, considerando las indicaciones médicas y de enfermería, el nivel de autonomía y la condición clínica del adulto mayor, e informa a quien corresponda, según la norma.'),
    ], 'Mención Adulto Mayor'),
    module('Administración de medicamentos', 114, '4° medio', [ADULT_MENTION_OA[5]], [
        ae('AM-M5-AE1', 'Prepara medicamentos indicados al adulto mayor, de acuerdo a la prescripción médica e indicación de enfermería, aplicando los principios de asepsia y antisepsia, la técnica descrita en el manual de procedimientos de enfermería y las indicaciones establecidas por el laboratorio farmacéutico.'),
        ae('AM-M5-AE2', 'Administra medicamentos por vía natural e intramuscular, aplicando los principios de asepsia y antisepsia y las técnicas y las normas descritas en el manual de procedimientos de enfermería, de acuerdo a los protocolos establecidos, a las indicaciones médicas y bajo supervisión profesional.'),
    ], 'Mención Adulto Mayor'),
    module('Higiene y confort del adulto mayor', 76, '4° medio', [ADULT_MENTION_OA[6]], [
        ae('AM-M6-AE1', 'Asiste al adulto mayor en las actividades de higiene y confort, respetando su privacidad y fomentando el autocuidado y la independencia, de acuerdo a su capacidad.'),
        ae('AM-M6-AE2', 'Aplica técnicas de conservación y fortalecimiento de la movilidad y autonomía del adulto mayor durante la aplicación de técnicas de higiene y confort en la sala de baño o habitación del adulto.'),
    ], 'Mención Adulto Mayor'),
    module('Emprendimiento y empleabilidad', 76, '4° medio', [], EMPLOYABILITY_AES, 'Objetivos de Aprendizaje Genéricos'),
]


NURSING_MENTION_OA = {
    1: oa('OA 1', 'Realizar acciones de apoyo al tratamiento y rehabilitación de la salud a pacientes pediátricos y adultos, ambulatorios y hospitalizados, como controlar signos vitales, tomar muestras para exámenes de laboratorio, administrar medicamentos por diferentes vías (intramuscular, endovenosa, piel y mucosas), hacer curaciones básicas, de acuerdo con protocolos establecidos y las indicaciones de profesionales del área médica.'),
    2: oa('OA 2', 'Monitorear e informar al personal de salud el estado de pacientes que se encuentran en condiciones críticas de salud o con procedimientos invasivos, conforme a procedimientos establecidos y las indicaciones entregadas por el profesional médico o de enfermería.'),
    3: oa('OA 3', 'Preparar las instalaciones, equipos, instrumentos e insumos para la atención de salud de acuerdo al tipo de procedimiento a realizar y a las indicaciones entregadas por los profesionales clínicos, teniendo en consideración principios de asepsia y antisepsia, de seguridad y prevención de riesgos biomédicos.'),
}


NURSING_MENTION_MODULES = [
    module('Técnicas básicas de enfermería y del Programa Nacional de Inmunizaciones', 228, '4° medio', [NURSING_MENTION_OA[1]], [
        ae('ENF-M1-AE1', 'Ejecuta las indicaciones médicas para el tratamiento y rehabilitación de la salud de pacientes pediátricos y adultos hospitalizados, de acuerdo a los protocolos establecidos.'),
        ae('ENF-M1-AE2', 'Aplica acciones de vacunación, de acuerdo al Programa Nacional de Inmunizaciones, resguardando el bienestar de las personas y el cumplimiento de las normas y protocolos del Ministerio de Salud, siempre bajo la supervisión de un o una profesional del área de la salud.'),
        ae('ENF-M1-AE3', 'Refuerza las indicaciones médicas dadas para el tratamiento y rehabilitación de la salud de pacientes pediátricos y adultos ambulatorios, estableciendo una comunicación efectiva, respetuosa y responsable.'),
        ae('ENF-M1-AE4', 'Colabora con el equipo de salud en situaciones de emergencia médica en pacientes hospitalizados, de acuerdo al protocolo definido.'),
    ], 'Mención Enfermería'),
    module('Atención en servicios de urgencia y primeros auxilios', 228, '4° medio', [NURSING_MENTION_OA[2]], [
        ae('ENF-M2-AE1', 'Vigila el contexto clínico de pacientes en estado crítico o que han sido sometidos a procedimientos invasivos, de acuerdo a los estándares vigentes y a las indicaciones entregadas, e informa sobre posibles alteraciones a los o las profesionales.'),
        ae('ENF-M2-AE2', 'Colabora con el equipo de salud para brindar atención de urgencia a pacientes hospitalizados, de acuerdo a los estándares de la institución.'),
        ae('ENF-M2-AE3', 'Aplica con eficacia la atención básica de primeros auxilios, como parte del equipo responsable de la atención de la o el paciente, de acuerdo a las normas y procedimientos estándares.'),
    ], 'Mención Enfermería'),
    module('Preparación del entorno clínico', 76, '4° medio', [NURSING_MENTION_OA[3]], [
        ae('ENF-M3-AE1', 'Instala la unidad de paciente con los equipos y materiales requeridos para la hospitalización según la patología diagnosticada.'),
        ae('ENF-M3-AE2', 'Selecciona los insumos, materiales y equipos necesarios para realizar la atención de enfermería indicada, de acuerdo a cada paciente, los riesgos biomédicos y las condiciones de seguridad.'),
    ], 'Mención Enfermería'),
    module('Emprendimiento y empleabilidad', 76, '4° medio', [], EMPLOYABILITY_AES, 'Objetivos de Aprendizaje Genéricos'),
]


REFRIGERATION_OA = {
    6: oa('OA 6', 'Cargar fluidos y poner en marcha sistemas de refrigeración, climatización, calefacción y ventilación considerando las presiones y fuerzas indicadas por los fabricantes, el uso de refrigerantes amigables con el medio ambiente y la Norma Chilena NCh3241 de Buenas Prácticas.'),
    7: oa('OA 7', 'Inspeccionar y diagnosticar fallas del funcionamiento de los sistemas de refrigeración, climatización, calefacción y ventilación, respecto de las especificaciones técnicas del fabricante.'),
    8: oa('OA 8', 'Realizar el mantenimiento preventivo y correctivo de los sistemas de refrigeración, climatización, calefacción y ventilación, considerando los parámetros establecidos en los manuales de fabricación.'),
    9: oa('OA 9', 'Recuperar, reciclar y almacenar refrigerantes de los sistemas de refrigeración y climatización, utilizando las herramientas y equipos apropiados para una manipulación adecuada y segura, con los contenedores aprobados para la operación, de acuerdo a la Norma Chilena NCh3241 de Buenas Prácticas.'),
}


REFRIGERATION_FOURTH_MODULES = [
    module('Puesta en marcha de equipos de refrigeración y climatización', 228, '4° medio', [REFRIGERATION_OA[6]], [
        ae('M5-AE1', 'Prepara el espacio físico y el equipamiento para el correcto transporte del equipo de refrigeración requerido en la carga de fluidos en sistemas refrigerantes, aplicando las medidas de seguridad y el cuidado del medio ambiente necesarios para manipular fluidos en equipos de este especialidad, establecidas en la Norma Chilena de Buenas Prácticas (NCh3241).'),
        ae('M5-AE2', 'Carga fluidos en equipos de refrigeración, aplicando las medidas de seguridad y cuidado del medio ambiente necesarios para manipular fluidos en equipos de refrigeración y climatización, establecidos en la Norma Chilena de Buenas Prácticas (NCh3241).'),
        ae('M5-AE3', 'Pone en marcha sistemas de refrigeración, considerando las especificaciones técnicas establecidas desde fábrica, la normativa técnica, medio ambiental y de seguridad respectiva.'),
    ]),
    module('Diagnóstico en sistemas de refrigeración y climatización', 190, '4° medio', [REFRIGERATION_OA[7]], [
        ae('M6-AE1', 'Inspecciona instalaciones y equipos de refrigeración, climatización, calefacción y ventilación, contrastando la información obtenida con los manuales de funcionamiento y las especificaciones técnicas de los equipos.'),
        ae('M6-AE2', 'Diagnostica posibles fallas con la información obtenida a través de mediciones con instrumentos e inspección visual y propone posibles soluciones, de acuerdo con las especificaciones técnicas de su fabricación.'),
        ae('M6-AE3', 'Establece los tipos de fallas o mal funcionamiento que pueden corregirse en obra o en taller, de acuerdo a las especificaciones técnicas de los distintos equipos y sistemas.'),
    ]),
    module('Mantención de sistemas de refrigeración y climatización', 190, '4° medio', [REFRIGERATION_OA[8]], [
        ae('M7-AE1', 'Realiza mantenimiento preventivo considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento desde fábrica.'),
        ae('M7-AE2', 'Realiza mantenimiento correctivo, considerando las especificaciones del proyecto, las condiciones de obra y los manuales de funcionamiento y fabricación.'),
    ]),
    module('Reciclaje y almacenamiento de refrigerantes', 152, '4° medio', [REFRIGERATION_OA[9]], [
        ae('M8-AE1', 'Recupera refrigerantes en sistemas de refrigeración, aplicando las medidas de seguridad y cuidado del medio ambiente necesarios para manipular fluidos en equipos de refrigeración y climatización establecidos en la Norma Chilena de Buenas Prácticas (NCh3241).'),
        ae('M8-AE2', 'Recicla refrigerantes de los sistemas de refrigeración, aplicando protocolos de reciclaje de fluidos en equipos de refrigeración y climatización, de acuerdo con las indicaciones presentes en la Norma Chilena (NCh3241/2011).'),
        ae('M8-AE3', 'Almacena refrigerantes, aplicando los protocolos de almacenamiento de fluidos en equipos de refrigeración y climatización, de acuerdo con las indicaciones presentes en la Norma Chilena (NCh3241/2011).'),
    ]),
    module('Emprendimiento y empleabilidad', 76, '4° medio', [], EMPLOYABILITY_AES, 'Objetivos de Aprendizaje Genéricos'),
]
