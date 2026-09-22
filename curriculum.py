"""Programa MINEDUC 3° medio · Refrigeración y Climatización (Decreto 0954/2015).

Solo cuatro módulos de 3° medio. 4° medio queda fuera de esta versión.
Textos de AE y criterios: transcripción del PDF depositado en docs/fuentes/.
"""
from copy import deepcopy

PDF = 'docs/fuentes/MINEDUC_Refrigeracion_y_Climatizacion_programa.pdf'
PROPUESTA = 'docs/fuentes/Propuesta_Aula_TP_Chile.docx'
INFOGRAFIA = 'docs/fuentes/infografia-estructura-aula-tp.png'
TIME_FACTOR = 5
OFFICIAL_HP = {1: 190, 2: 190, 3: 228, 4: 228}
MODULE_TITLES = {
    1: 'Lectura de planos y cubicación de materiales de proyectos',
    2: 'Instrumentos de medición y de verificación',
    3: 'Instalación y montaje de redes de refrigeración y climatización',
    4: 'Instalación y montaje de equipos',
}
SCOPE = (
    'Versión 3° medio: cuatro módulos técnicos (190, 190, 228 y 228 HP). '
    'Los módulos 5 a 8 y Emprendimiento y empleabilidad corresponden a 4° medio y no se simulan aquí.'
)

SHORT_AE = {
    1: [
        'Lee planos de refrigeración y climatización',
        'Lee y utiliza especificaciones técnicas',
        'Cubica elementos y materiales (NCh353/2000)',
    ],
    2: [
        'Utiliza instrumentos de medición y verificación',
        'Verifica parámetros medidos con los manuales',
        'Registra lecturas y elabora el informe',
    ],
    3: [
        'Realiza uniones soldadas según normativa',
        'Arma redes de tuberías',
        'Instala redes y verifica hermeticidad',
    ],
    4: [
        'Lee planos y especificaciones de instalación',
        'Instala equipos y componentes',
        'Instala dispositivos de control automático',
    ],
}
# el AE 4 (informe de cubicación) se integra en el AE 3. El módulo 2 declara dos AE:
# el tercero reúne el criterio de registro e informe (1.5 y 2.3).
OFFICIAL = {
    1: {
        'oa': [
            'OA 1. Leer y utilizar planos de redes de cañería y redes de ductos, simbología y especificaciones técnicas de proyectos de refrigeración y climatización, verificando su adecuación a las condiciones reales de la obra que facilitarían u obstaculizarían la realización del proyecto.',
            'OA 2. Cubicar elementos y materiales, de acuerdo a volúmenes y superficies, para la elaboración de proyectos de refrigeración, climatización, calefacción y ventilación, utilizando programas computacionales apropiados.',
        ],
        'aes': [
            {
                'code': 'M1-AE1',
                'page': 35,
                'title': 'Lee planos de refrigeración y climatización, utilizando la simbología técnica respectiva para reconocer el espacio físico donde se instalarán las distintas redes de refrigeración y climatización, en relación con las normas de dibujo técnico establecidas de calefacción y ventilación.',
                'criteria': [
                    '1.1 Utiliza simbología técnica relativa a la especialidad y normas de dibujo técnico, para diferenciar entre una planta de cielo y una planta normal, en un plano de refrigeración y climatización.',
                    '1.2 Utiliza simbología técnica relativa a la especialidad y normas de dibujo técnico, para identificar la ubicación espacial del trazado de cañerías o ductos, en un plano de refrigeración y climatización.',
                    '1.3 Utiliza simbología técnica relativa a la especialidad y normas de dibujo técnico para detectar posibles interferencias entre equipos, tuberías, ductos y elementos estructurales o de otros servicios, que dificulten la ejecución del proyecto en un plano de refrigeración y climatización.',
                    '1.4 Elabora un informe técnico indicando las posibles anomalías encontradas en los planos analizados, utilizando tecnologías de la información.',
                ],
            },
            {
                'code': 'M1-AE2',
                'page': 36,
                'title': 'Lee y utiliza las especificaciones técnicas de proyectos de refrigeración y climatización, para conocer las indicaciones técnicas y el tipo de material que se empleará en la ejecución de los trabajos y poder determinar posibles interferencias o dificultades en las etapas del proyecto.',
                'criteria': [
                    '2.1 Lee las indicaciones entregadas en las especificaciones técnicas relativas a la forma en que se deben realizar los trabajos en la ejecución de proyectos de refrigeración y climatización.',
                    '2.2 Lee las especificaciones técnicas para conocer el tipo de material a utilizar en la ejecución de proyectos de refrigeración y climatización.',
                    '2.3 Lee las especificaciones técnicas para detectar posibles interferencias entre equipos, tuberías y ductos en la ejecución de proyectos de refrigeración y climatización.',
                    '2.4 Lee las especificaciones técnicas para detectar posibles interferencias con elementos estructurales o de otros servicios que dificulten la ejecución de proyectos de refrigeración y climatización.',
                    '2.5 Elabora un informe técnico de la actividad realizada, indicando posibles anomalías encontradas en las especificaciones técnicas, utilizando tecnologías de la información.',
                ],
            },
            {
                'code': 'M1-AE3',
                'page': 37,
                'title': 'Cubica elementos y materiales de acuerdo a los requerimientos del lugar, indicados en el plano respectivo mediante un software de diseño para determinar cantidad de materiales y elementos a emplear en la ejecución del proyecto. Se consideran las indicaciones de la Norma Chilena relativa a Cubicaciones (NCh353/2000), aplicada a proyectos de refrigeración, climatización, calefacción y ventilación.',
                'criteria': [
                    '3.1 Realiza un listado de requerimientos para un recinto determinado, en función de lo que se indica en la lectura del plano entregado.',
                    '3.2 Calcula superficies y volúmenes a partir de un recinto determinado, de acuerdo a las mediciones obtenidas de planos respectivos del proyecto, especificando la cantidad de materiales y componentes a utilizar en la ejecución del proyecto.',
                    '3.3 Calcula la cantidad de elementos y materiales para un determinado recinto, de acuerdo a lo establecido por el proyecto, utilizando un software de diseño.',
                    '3.4 Valoriza el costo de componentes y elementos a utilizar en la ejecución del proyecto, para determinar el costo final de la cubicación, considerando las indicaciones de la Norma Chilena relativa a Cubicaciones (NCh353/2000).',
                    '4.1 Realiza un listado de materiales de acuerdo a los cálculos realizados, trabajando en equipos y utilizando procesadores de texto y planillas de cálculo.',
                    '4.3 Elabora un informe de cubicación de elementos y materiales, según los cálculos realizados, de acuerdo con lo establecido en la Norma Chilena relativa a Cubicaciones.',
                ],
            },
        ],
        'pdf_activities': [
            {'name': 'Recopilación de información contenida en planos', 'hours': 5, 'ae': 0, 'criteria': ['1.2', '1.3', '1.4']},
        ],
    },
    2: {
        'oa': [
            'OA 3. Realizar mediciones y controles de verificación de distintas magnitudes relacionadas con el proyecto, de acuerdo a las especificaciones técnicas, normas de seguridad, prevención de riesgos y protección del medio ambiente.',
        ],
        'aes': [
            {
                'code': 'M2-AE1',
                'page': 47,
                'title': 'Utiliza instrumentos de medición y verificación de distintos parámetros, de acuerdo a las indicaciones establecidas desde fábrica, considerando técnicas apropiadas y normas de seguridad necesarias para el uso del instrumento.',
                'criteria': [
                    '1.1 Lee y extrae información técnica y de seguridad de instrumentos, desde el catálogo de fabricación, para un buen uso del instrumento.',
                    '1.2 Utiliza instrumentos de medición, considerando los protocolos establecidos y de seguridad determinados por el fabricante, trabajando en equipo y coordinando acciones con otros en las tareas a realizar.',
                    '1.3 Mide magnitudes físicas, para detectar posibles fallas y verificar el correcto funcionamiento de los equipos, considerando las indicaciones de seguridad establecidas desde fábrica.',
                    '1.4 Realiza cálculos matemáticos para convertir las unidades de medida de distintas magnitudes físicas, de acuerdo a los requerimientos propios de la utilización de los instrumentos.',
                    '1.5 Registra valores obtenidos de la lectura de instrumentos para elaborar informes de resultados, de acuerdo a pautas entregadas.',
                ],
            },
            {
                'code': 'M2-AE2',
                'page': 48,
                'title': 'Verifica parámetros medidos por los instrumentos, comparándolos con datos de manuales de fabricación de los equipos, para determinar posibles ajustes que deben realizarse a equipos dentro del sistema de refrigeración.',
                'criteria': [
                    '2.1 Verifica que los valores medidos en los equipos de refrigeración se ajusten a los establecidos en su fabricación, comparándolos con resultados de otros equipos.',
                    '2.2 Realiza ajustes respectivos a equipos de refrigeración, de acuerdo con los datos entregados por los instrumentos y la comparación con lo establecido en su fabricación.',
                    '2.3 Realiza un informe de resultados obtenidos, de acuerdo a pautas establecidas, utilizando procesadores de textos y entregándolos al o la docente.',
                ],
            },
            {
                'code': 'M2-AE3',
                'page': 47,
                'title': 'Registra valores obtenidos de la lectura de instrumentos para elaborar informes de resultados, de acuerdo a pautas entregadas.',
                'criteria': [
                    '1.5 Registra valores obtenidos de la lectura de instrumentos para elaborar informes de resultados, de acuerdo a pautas entregadas.',
                    '2.3 Realiza un informe de resultados obtenidos, de acuerdo a pautas establecidas, utilizando procesadores de textos y entregándolos al o la docente.',
                ],
            },
        ],
        'pdf_activities': [
            {'name': 'Uso de instrumentos de medición', 'hours': 5, 'ae': 0, 'criteria': ['1.2']},
        ],
    },
    3: {
        'oa': [
            'OA 4. Armar, instalar y aislar redes de ductos y cañerías para el flujo de refrigerantes, aire, agua y fluidos especiales para los sistemas de refrigeración, ventilación, climatización y calefacción, realizando uniones soldadas que aseguren la hermeticidad, de acuerdo a la Norma chilena NCh3241 de Buenas Prácticas.',
        ],
        'aes': [
            {
                'code': 'M3-AE1',
                'page': 57,
                'title': 'Realiza unión de diferentes tipos de materiales, utilizando soldaduras autorizadas por la normativa y considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad.',
                'criteria': [
                    '1.1 Arma una unión de tuberías y hojalatería utilizando soldadura blanda, de acuerdo a las características técnicas de los materiales, aplicando las metodologías establecidas desde fábrica junto con la normativa técnica y de seguridad respectivas.',
                    '1.3 Realiza unión en tuberías de cobre utilizando soldadura fuerte, de acuerdo a las características técnicas de los materiales.',
                    '1.5 Verifica que los distintos tipos de soldaduras realizadas cumplan con las indicaciones establecidas por los fabricantes y la Norma Chilena de Buenas Prácticas (NCh3241).',
                ],
            },
            {
                'code': 'M3-AE2',
                'page': 58,
                'title': 'Arma diferentes redes de tuberías utilizando diversas soldaduras, considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.',
                'criteria': [
                    '2.1 Prepara el lugar de trabajo de tal manera que no existan objetos que dificulten la tarea o que produzcan accidentes en su ejecución.',
                    '2.2 Realiza un listado de materiales, equipos y herramientas necesarias para la ejecución del armado de redes de tuberías.',
                    '2.3 Arma redes de tuberías de acuerdo a lo indicado por los planos del proyecto.',
                    '2.6 Verifica que los trabajos de armado realizados cumplan con las indicaciones establecidas por las especificaciones técnicas.',
                ],
            },
            {
                'code': 'M3-AE3',
                'page': 59,
                'title': 'Instala diferentes redes de tuberías para la conducción de agua, aire y refrigerantes, asegurando su estabilidad mediante fijaciones apropiadas al plano y al material que las sustentará, considerando las técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.',
                'criteria': [
                    '3.1 Realiza un listado de materiales, equipos y herramientas necesarias para la instalación de redes de tuberías.',
                    '3.2 Monta redes de tuberías sobre distintos materiales (hormigón, albañilería, tabiquería, etc.), de acuerdo a las especificaciones técnicas y planos respectivos.',
                    '3.3 Realiza pruebas de hermeticidad de acuerdo a las especificaciones técnicas.',
                    '3.5 Verifica que la instalación de diferentes tipos de tuberías cumplan con las indicaciones establecidas por los fabricantes y la Norma chilena NCh3241 de Buenas Prácticas.',
                ],
            },
        ],
        'pdf_activities': [
            {'name': 'Armado de redes de tuberías', 'hours': 6, 'ae': 1, 'criteria': ['2.3', '2.6']},
        ],
    },
    4: {
        'oa': [
            'OA 5. Instalar equipos y componentes de sistemas de refrigeración, calefacción, climatización y ventilación de energías diversas, incluidos los dispositivos electrónicos de control automático, de acuerdo a las especificaciones técnicas del proyecto y las orientaciones del profesional encargado, considerando la Norma chilena NCh3241 de Buenas Prácticas.',
        ],
        'aes': [
            {
                'code': 'M4-AE1',
                'page': 69,
                'title': 'Lee y utiliza planos, junto con las especificaciones técnicas de distintos sistemas y equipos de refrigeración y climatización, para identificar las dificultades que podrían presentar en la instalación.',
                'criteria': [
                    '1.1 Establece posibles problemas en la instalación de equipos y sistemas, a través de la lectura de las especificaciones técnicas.',
                    '1.2 Chequea las especificaciones que deben tener las obras previas en los recintos, de acuerdo a planos y especificaciones técnicas del proyecto, para permitir la correcta instalación de los distintos sistemas y equipos de refrigeración y climatización.',
                ],
            },
            {
                'code': 'M4-AE2',
                'page': 70,
                'title': 'Instala equipos y componentes de sistemas de refrigeración, climatización, calefacción y ventilación disponibles para instalaciones domiciliarias, considerando las especificaciones técnicas establecidas por los manuales de instalación, la normativa técnica y de seguridad respectiva.',
                'criteria': [
                    '2.1 Prepara el lugar de montaje de acuerdo a especificaciones técnicas y planos respectivos.',
                    '2.2 Realiza un listado de materiales, equipos y herramientas necesarias para la instalación de equipos y componentes de sistemas de refrigeración, de acuerdo a lo indicado por los planos respectivos.',
                    '2.3 Instala equipos y componentes de sistemas de refrigeración, climatización, calefacción y ventilación, aplicando técnicas establecidas por las especificaciones técnicas y planos respectivos.',
                    '2.4 Verifica que la instalación de equipos y componentes del sistema cumplan con las indicaciones establecidas por sus fabricantes y la Norma chilena NCh3241 de Buenas Prácticas.',
                ],
            },
            {
                'code': 'M4-AE3',
                'page': 70,
                'title': 'Instala dispositivos de control automáticos, considerando las especificaciones técnicas establecidas desde fábrica, la normativa técnica y de seguridad respectiva.',
                'criteria': [
                    '3.1 Realiza un listado de materiales, equipos y herramientas necesarias para la instalación de dispositivos de control automáticos, de acuerdo a planos y especificaciones técnicas.',
                    '3.2 Instala dispositivos electrónicos de control de instalaciones en distintos sistemas y equipos de refrigeración y climatización, de acuerdo a las especificaciones técnicas y planos respectivos.',
                    '3.3 Verifica que la instalación de dispositivos electrónicos de control cumpla con las indicaciones establecidas por sus fabricantes y la Norma chilena NCh3241 de Buenas Prácticas.',
                ],
            },
        ],
        'pdf_activities': [
            {'name': 'Instalación de equipos y componentes', 'hours': 6, 'ae': 1, 'criteria': ['2.3', '2.4']},
        ],
    },
}

ACTIVITY_KINDS = [
    ('observe', 'Observación anotada', 'Recorre la foto o el plano y marca las zonas que importan al oficio.'),
    ('walk3d', 'Recorrido espacial interactivo', 'Gira, acerca y abre los puntos del equipo. La representación espacial guía la inspección.'),
    ('video', 'Secuencia en video', 'Ve el procedimiento 45–90 s. Se detiene en el gesto que importa.'),
    ('read', 'Lectura de oficio', 'Saca el dato de un display, una etiqueta, un plano o una ficha técnica.'),
    ('procedure', 'Procedimiento', 'Ordena o ejecuta los pasos en el escenario (armar, instalar, verificar).'),
    ('cube', 'Cubicación', 'Calcula material o medida con lo que hay en obra, no en abstracto.'),
    ('context', 'Variación de contexto', 'Misma instalación, otra hora, clima o ciudad. Cambia la lectura.'),
    ('before', 'Antes / después', 'Deja evidencia del estado inicial y del cierre.'),
    ('error', 'Trabajo del error', 'Encuentra el descuido o reconstruye por qué falló.'),
    ('argue', 'Argumentación breve', 'Da una razón técnica o de seguridad al maestro o al cliente.'),
    ('pair', 'Términos pareados de oficio', 'Une pieza–función o lectura–falla sobre la imagen o el 3D.'),
    ('log', 'Bitácora de turno', 'Escribe qué vio, qué hizo y qué quedó pendiente.'),
    ('agent', 'Consulta acotada al Agente', 'Puede preguntar una vez. El Agente no suelta la respuesta; devuelve una pregunta.'),
    ('integrate3d', 'Integración 3D', 'Cierra la estación 3 aplicando varios AE en el mismo espacio.'),
]


def formative_pack(mid):
    prompts = {
        1: {
            'observe': 'Marca en la planta la leyenda, el trazo discontinuo y el recinto de la sala.',
            'walk3d': 'Recorre UE-01, UI-01 y el control. Entra al recinto y contrasta etiquetas.',
            'video': 'Observa la secuencia de lectura de plano: cajetín, leyenda, trazado, interferencia.',
            'read': 'Lee el cajetín: escala, revisión y recinto. Anota el dato, no el color.',
            'procedure': 'Ordena: identificar revisión → leer leyenda → ubicar equipos → registrar diferencias.',
            'cube': 'Los tramos A 2,5 m y B 150 cm no se suman en crudo. Unifica la unidad.',
            'context': 'Son las 18:40 en Valdivia y la luz del taller ya no alcanza. ¿Qué cambia en tu lectura?',
            'before': 'Estado inicial: leyenda incompleta. Cierre: consulta documentada, no una suposición.',
            'error': 'Alguien pintó de azul líquido y succión. Reconstruye por qué falló la identificación.',
            'argue': 'Explica al maestro, en dos frases, por qué no se firma un plano con revisión distinta al listado.',
            'pair': 'Une sobre el plano: trazo discontinuo–función por leyenda; cota–medida verificada.',
            'log': 'Bitácora: qué viste, qué consultaste, qué quedó pendiente para el AE 1.',
            'agent': 'Una pregunta al Agente. Te devolverá otra pregunta, no la solución.',
            'integrate3d': 'En el mismo recinto aplica AE 1, 2 y 3: plano, especificación y cubicación.',
        },
        2: {
            'observe': 'Marca visor, unidad y punto de medición en la foto del instrumento.',
            'walk3d': 'Acerca TERM-01, la ficha y el registro. Entra a cada evidencia.',
            'video': 'Secuencia: identificar magnitud → intervalo → leer visor → registrar con unidad.',
            'read': 'El visor muestra 21,2 °C. Extrae valor, unidad y punto. No completes lo que no está.',
            'procedure': 'Ordena el protocolo de medición del fabricante antes de interpretar.',
            'cube': 'Convierte 80 cm y 0,8 m a la misma unidad. Es la misma longitud.',
            'context': 'Misma sala, 14:00 en Antofagasta. El visor subió 3 °C. ¿Cambia el criterio o el contexto?',
            'before': 'Antes: fila “25” sin unidad. Después: la fila queda marcada como incompleta.',
            'error': 'Se borró el 28,1 °C para “arreglar” el promedio. Reconstruye el descuido.',
            'argue': 'Dile al cliente, en dos frases, por qué 25 sin unidad no es una lectura.',
            'pair': 'Une lectura–falla: 25 sin unidad; intervalo 50–150 °C–valor esperado 15 °C.',
            'log': 'Bitácora de laboratorio: instrumento, punto, valor, unidad, pendiente.',
            'agent': 'Una pregunta. El Agente te devolverá otra.',
            'integrate3d': 'En la mesa 3D aplica los tres AE: usar, verificar e informar.',
        },
        3: {
            'observe': 'Marca uniones, tramos y el cruce sin cota de altura.',
            'walk3d': 'Recorre tramo A, cruce B y accesorio C-01. Entra al trazado.',
            'video': 'Secuencia de armado: preparar puesto → listar materiales → unir → verificar hermeticidad.',
            'read': 'Lee la etiqueta C-01 en planta y en el detalle. ¿Es una pieza o dos?',
            'procedure': 'Ordena soldadura blanda, verificación visual y prueba de hermeticidad.',
            'cube': 'A 2,5 m + B 150 cm + C 3,0 m. Reserva 10 % solo si el enunciado la pide.',
            'context': 'Obra de noche en Punta Arenas. El cobre está frío. ¿Qué cambia en la unión?',
            'before': 'Antes: cruce sin cota. Después: consulta de altura registrada.',
            'error': 'Se soldó sin EPP. Reconstruye el descuido de seguridad (NCh3241).',
            'argue': 'Explica al maestro por qué un cruce en planta no prueba colisión.',
            'pair': 'Une soldadura fuerte–cobre; emballetado–hojalatería.',
            'log': 'Bitácora de red: uniones hechas, prueba pendiente, consulta abierta.',
            'agent': 'Una pregunta. El Agente responde con otra pregunta.',
            'integrate3d': 'En la maqueta 3D aplica unión, armado e instalación.',
        },
        4: {
            'observe': 'Marca equipo, acceso lateral y control en el recinto.',
            'walk3d': 'Gira alrededor de EQ-02. Entra al acceso de 24 cm y al control.',
            'video': 'Secuencia: obras previas → listado → montaje → verificar control.',
            'read': 'Lee la ficha: 30 cm de acceso. Lee la maqueta: 24 cm.',
            'procedure': 'Ordena preparación del lugar, montaje y verificación NCh3241.',
            'cube': 'Lista los materiales que aparecen en el plano para EQ-02 y CTRL.',
            'context': 'Mismo closet, 08:00 en Iquique. El rack no se apaga. ¿Qué cambia?',
            'before': 'Antes: CTRL-02 recibido. Después: pendiente de compatibilidad con CTRL-01.',
            'error': 'Se firmó la instalación con 24 cm. Reconstruye por qué falla el acceso.',
            'argue': 'Dile al cliente, en dos frases, por qué no se certifica el control sin ficha.',
            'pair': 'Une EQ-02–equipo recibido; 24 cm–acceso insuficiente según ficha.',
            'log': 'Bitácora de montaje: qué se instaló, qué se verificó, qué quedó abierto.',
            'agent': 'Una pregunta. El Agente no entrega la respuesta.',
            'integrate3d': 'En el recinto 3D aplica planos, montaje y control automático.',
        },
    }[int(mid)]
    pack = []
    for kind, label, hint in ACTIVITY_KINDS:
        item = {
            'kind': kind, 'label': label, 'hint': hint,
            'prompt': prompts[kind], 'station': 3,
            'action': 'Marca, responde y verifica.',
        }
        item.update(pack_interact(mid, kind))
        pack.append(item)
    return pack


def procedure_parts(mid):
    packs = {
        1: [
            {'id': 'recinto', 'label': '1 Recinto', 'x': 12, 'y': 22, 'value': 'Sala 3°', 'detail': 'Paso 1 · Identifica el recinto en planta antes de leer redes.', 'step': 1},
            {'id': 'leyenda', 'label': '2 Leyenda', 'x': 32, 'y': 18, 'value': 'Incompleta', 'detail': 'Paso 2 · La función del trazo sale de la leyenda, no del color.', 'step': 2},
            {'id': 'trazado', 'label': '3 Trazado', 'x': 55, 'y': 38, 'value': 'Cañerías', 'detail': 'Paso 3 · Ubica el trazado espacial de cañerías o ductos.', 'step': 3},
            {'id': 'interfer', 'label': '4 Cruce', 'x': 72, 'y': 30, 'value': 'Sin cota', 'detail': 'Paso 4 · Un cruce en planta no prueba colisión sin altura.', 'step': 4},
            {'id': 'equipo', 'label': '5 Equipo', 'x': 48, 'y': 58, 'value': 'UI-01', 'detail': 'Paso 5 · Contrasta etiqueta de equipo con el listado.', 'step': 5},
            {'id': 'control', 'label': '6 Control', 'x': 78, 'y': 62, 'value': 'Muro', 'detail': 'Paso 6 · El control debe coincidir en planta y esquema.', 'step': 6},
            {'id': 'drenaje', 'label': '7 Drenaje', 'x': 28, 'y': 70, 'value': 'Sin destino', 'detail': 'Paso 7 · Origen sin descarga: queda como pendiente.', 'step': 7},
            {'id': 'cierre', 'label': '8 Cierre', 'x': 88, 'y': 78, 'value': 'Consulta', 'detail': 'Paso 8 · Cierra con informe de anomalías y consulta, no con una suposición.', 'step': 8},
        ],
        2: [
            {'id': 'catalogo', 'label': '1 Catálogo', 'x': 14, 'y': 24, 'value': 'Fábrica', 'detail': 'Paso 1 · Extrae seguridad e intervalo desde el catálogo.', 'step': 1},
            {'id': 'instrumento', 'label': '2 TERM-01', 'x': 38, 'y': 32, 'value': '20,0 °C', 'detail': 'Paso 2 · Identifica magnitud, unidad y resolución del visor.', 'step': 2},
            {'id': 'punto', 'label': '3 Punto A', 'x': 62, 'y': 28, 'value': 'Sala', 'detail': 'Paso 3 · Sin punto de medición no hay comparación.', 'step': 3},
            {'id': 'intervalo', 'label': '4 Intervalo', 'x': 80, 'y': 40, 'value': '−10/50', 'detail': 'Paso 4 · Comprueba que el valor esperado cabe en el intervalo.', 'step': 4},
            {'id': 'registro', 'label': '5 Registro', 'x': 30, 'y': 62, 'value': '25 ?', 'detail': 'Paso 5 · La fila 25 sin unidad es un error de registro.', 'step': 5},
            {'id': 'conversion', 'label': '6 Unidad', 'x': 55, 'y': 70, 'value': 'cm/m', 'detail': 'Paso 6 · Convierte unidades antes de interpretar.', 'step': 6},
            {'id': 'criterio', 'label': '7 Criterio', 'x': 74, 'y': 68, 'value': '18–22 °C', 'detail': 'Paso 7 · Compara con el criterio del ejercicio, no con “lo normal”.', 'step': 7},
            {'id': 'informe', 'label': '8 Informe', 'x': 88, 'y': 80, 'value': 'Límites', 'detail': 'Paso 8 · Informa valor, unidad, punto y lo que falta.', 'step': 8},
        ],
        3: [
            {'id': 'puesto', 'label': '1 Puesto', 'x': 16, 'y': 22, 'value': 'Libre', 'detail': 'Paso 1 · Prepara el lugar: sin objetos que produzcan accidente.', 'step': 1},
            {'id': 'listado', 'label': '2 Listado', 'x': 34, 'y': 30, 'value': 'Materiales', 'detail': 'Paso 2 · Lista materiales, equipos y herramientas del armado.', 'step': 2},
            {'id': 'union', 'label': '3 Unión', 'x': 52, 'y': 24, 'value': 'Soldadura', 'detail': 'Paso 3 · Unión de cobre o hojalatería según material y normativa.', 'step': 3},
            {'id': 'tramo', 'label': '4 Tramo A', 'x': 70, 'y': 36, 'value': '2,5 m', 'detail': 'Paso 4 · Arma el tramo según plano. Unifica unidades.', 'step': 4},
            {'id': 'cruce', 'label': '5 Cruce', 'x': 42, 'y': 58, 'value': 'Cota ?', 'detail': 'Paso 5 · Cruce sin cota vertical: no se concluye colisión.', 'step': 5},
            {'id': 'fijacion', 'label': '6 Fijación', 'x': 64, 'y': 64, 'value': 'Soporte', 'detail': 'Paso 6 · Monta sobre hormigón, albañilería o tabique según ficha.', 'step': 6},
            {'id': 'prueba', 'label': '7 Hermeticidad', 'x': 80, 'y': 58, 'value': 'Pendiente', 'detail': 'Paso 7 · Prueba de hermeticidad según especificación y NCh3241.', 'step': 7},
            {'id': 'cierre', 'label': '8 Verificar', 'x': 88, 'y': 78, 'value': 'NCh3241', 'detail': 'Paso 8 · Verifica armado e instalación contra el plano y la norma.', 'step': 8},
        ],
        4: [
            {'id': 'planos', 'label': '1 Planos', 'x': 14, 'y': 20, 'value': 'Dossier', 'detail': 'Paso 1 · Lee planos y especificaciones: busca dificultades de instalación.', 'step': 1},
            {'id': 'obras', 'label': '2 Obras previas', 'x': 34, 'y': 32, 'value': 'Recinto', 'detail': 'Paso 2 · Chequea obras previas del recinto antes de montar.', 'step': 2},
            {'id': 'listado', 'label': '3 Listado', 'x': 54, 'y': 22, 'value': 'Herramientas', 'detail': 'Paso 3 · Lista materiales, equipos y herramientas del montaje.', 'step': 3},
            {'id': 'equipo', 'label': '4 EQ-02', 'x': 72, 'y': 38, 'value': 'Recibido', 'detail': 'Paso 4 · El modelo recibido debe coincidir con el dossier.', 'step': 4},
            {'id': 'acceso', 'label': '5 Acceso', 'x': 40, 'y': 58, 'value': '24 cm', 'detail': 'Paso 5 · Ficha pide 30 cm; la maqueta muestra 24 cm.', 'step': 5},
            {'id': 'montaje', 'label': '6 Montaje', 'x': 62, 'y': 68, 'value': 'Lugar', 'detail': 'Paso 6 · Instala según manual, plano y seguridad.', 'step': 6},
            {'id': 'control', 'label': '7 CTRL', 'x': 80, 'y': 62, 'value': 'CTRL-02', 'detail': 'Paso 7 · Control recibido CTRL-02 versus dossier CTRL-01.', 'step': 7},
            {'id': 'cierre', 'label': '8 NCh3241', 'x': 88, 'y': 80, 'value': 'Verificar', 'detail': 'Paso 8 · Verifica equipo y control contra fabricante y NCh3241.', 'step': 8},
        ],
    }
    return deepcopy(packs.get(int(mid), packs[1]))


def _oficio_src(mid):
    names = {
        1: 'oficio-plano-leyenda', 2: 'oficio-visor-21c',
        3: 'oficio-tramos', 4: 'oficio-equipo-ctrl',
    }
    return f"/static/themes/oficio/{names.get(int(mid), names[1])}.png?v=3"


def pack_interact(mid, kind):
    """Carga interactiva: el estudiante actúa; no solo lee."""
    mid = int(mid)
    img = _oficio_src(mid)
    video = f'/static/media/m{mid}-secuencia.mp4'
    vtt = f'/static/media/m{mid}-secuencia.vtt'
    spots = {
        1: [
            {'id': 'leyenda', 'label': 'Leyenda', 'x': 18, 'y': 78, 'ok': True, 'note': 'La función sale de la leyenda, no del color.'},
            {'id': 'trazo', 'label': 'Trazo', 'x': 58, 'y': 36, 'ok': True, 'note': 'El trazo discontinuo se lee con la leyenda.'},
            {'id': 'sala', 'label': 'Sala', 'x': 72, 'y': 28, 'ok': True, 'note': 'El recinto es el primer dato de planta.'},
            {'id': 'nota', 'label': 'Notas', 'x': 84, 'y': 70, 'ok': False, 'note': 'Las notas no sustituyen la leyenda.'},
        ],
        2: [
            {'id': 'visor', 'label': 'Visor', 'x': 62, 'y': 42, 'ok': True, 'note': 'Valor y unidad salen del visor.'},
            {'id': 'unidad', 'label': 'Unidad', 'x': 78, 'y': 58, 'ok': True, 'note': 'Sin unidad no hay lectura.'},
            {'id': 'punto', 'label': 'Punto', 'x': 28, 'y': 62, 'ok': True, 'note': 'El punto de medición ancla el dato.'},
            {'id': 'fondo', 'label': 'Fondo', 'x': 12, 'y': 18, 'ok': False, 'note': 'El fondo no es el dato.'},
        ],
        3: [
            {'id': 'union', 'label': 'Unión', 'x': 32, 'y': 48, 'ok': True, 'note': 'Marca las uniones del tramo.'},
            {'id': 'tramo', 'label': 'Tramo', 'x': 58, 'y': 40, 'ok': True, 'note': 'Unifica unidades antes de sumar.'},
            {'id': 'cruce', 'label': 'Cruce', 'x': 74, 'y': 30, 'ok': True, 'note': 'Sin cota de altura no hay colisión.'},
            {'id': 'suelo', 'label': 'Piso', 'x': 16, 'y': 82, 'ok': False, 'note': 'El piso no es el trazado.'},
        ],
        4: [
            {'id': 'equipo', 'label': 'Equipo', 'x': 48, 'y': 38, 'ok': True, 'note': 'Contrasta EQ con el dossier.'},
            {'id': 'acceso', 'label': 'Acceso', 'x': 22, 'y': 58, 'ok': True, 'note': 'Ficha 30 cm · maqueta 24 cm.'},
            {'id': 'control', 'label': 'Control', 'x': 76, 'y': 52, 'ok': True, 'note': 'CTRL recibido vs CTRL del plano.'},
            {'id': 'cielo', 'label': 'Cielo', 'x': 88, 'y': 12, 'ok': False, 'note': 'El cielo no es el equipo.'},
        ],
    }[mid]
    steps = {
        1: ['Identificar la revisión', 'Leer la leyenda', 'Ubicar equipos', 'Registrar diferencias'],
        2: ['Identificar magnitud', 'Comprobar el intervalo', 'Leer el visor', 'Registrar con unidad'],
        3: ['Preparar el puesto', 'Listar materiales', 'Unir según normativa', 'Probar hermeticidad'],
        4: ['Revisar obras previas', 'Listar herramientas', 'Montar el equipo', 'Verificar el control'],
    }[mid]
    pairs = {
        1: {'left': ['Trazo discontinuo', 'Cota'], 'right': ['Función por leyenda', 'Medida verificada']},
        2: {'left': ['25 sin unidad', 'Intervalo 50–150 °C'], 'right': ['Lectura incompleta', 'No cubre 15 °C']},
        3: {'left': ['Soldadura fuerte', 'Emballetado'], 'right': ['Cobre', 'Hojalatería']},
        4: {'left': ['EQ-02', '24 cm'], 'right': ['Equipo recibido', 'Acceso insuficiente']},
    }[mid]
    extract = {
        1: {'field': 'Escala del cajetín', 'ok': ['1:50', '1/50', '50'], 'clue': 'El dato está en el cajetín, no en el color.'},
        2: {'field': 'Valor del visor', 'ok': ['21,2', '21.2', '21,2 °c', '21.2°c'], 'clue': 'Copia valor, unidad y punto.'},
        3: {'field': 'Etiqueta C-01', 'ok': ['c-01', 'una', '1'], 'clue': 'Planta y detalle pueden ser la misma pieza.'},
        4: {'field': 'Acceso en maqueta (cm)', 'ok': ['24', '24 cm', '24cm'], 'clue': 'La ficha pide 30 cm.'},
    }[mid]
    cube = {
        1: {'ok': ['4', '4m', '4 m', '4.0', '4,0'], 'unit': 'm', 'clue': 'Convierte todas las longitudes a metros antes de sumar.'},
        2: {'ok': ['0,8', '0.8', '80 cm', '80cm', '0,8 m'], 'unit': 'm o cm', 'clue': 'Elige una unidad común y conserva esa unidad en el resultado.'},
        3: {'ok': ['7', '7m', '7 m', '7.0'], 'unit': 'm', 'clue': 'Unifica las tres medidas antes de sumar. Agrega reserva solo si el enunciado la pide.'},
        4: {'ok': ['eq-02', 'ctrl', 'listado'], 'unit': 'piezas del plano', 'clue': 'Lista las piezas que figuran en el plano y el listado.'},
    }[mid]
    keys = {
        'context': ['luz', 'valdivia', 'antofagasta', 'punta arenas', 'iquique', 'hora', 'clima', 'cambia'],
        'before': ['inicial', 'cierre', 'consulta', 'incompleta', 'pendiente'],
        'error': ['color', 'unidad', 'epp', 'acceso', 'promedio', 'descuido', 'nch'],
        'argue': ['firma', 'unidad', 'ficha', 'maestro', 'cliente', 'plano', 'control'],
        'log': ['vi', 'hice', 'pendiente', 'consult', 'turno'],
    }
    task = {
        'image': img, 'video': video, 'vtt': vtt,
        'spots': spots, 'parts': procedure_parts(mid)[:5],
        'steps': steps, 'left': pairs['left'], 'right': pairs['right'],
        'extract': extract, 'cube': cube,
        'keys': keys.get(kind) or [],
        'ok_ids': [s['id'] for s in spots if s.get('ok')],
    }
    return {'task': task}


def apply_official(content, module_id=1):
    mid = int(module_id or 1)
    spec = OFFICIAL.get(mid)
    if not spec or not isinstance(content, dict):
        return content
    content['official_source'] = {
        'pdf': PDF, 'propuesta': PROPUESTA, 'infografia': INFOGRAFIA,
        'decreto': 'Decreto Exento de Educación n° 0954/2015',
        'scope': SCOPE, 'time_factor': TIME_FACTOR,
        'official_hp': OFFICIAL_HP.get(mid), 'title': MODULE_TITLES.get(mid),
        'oa': spec['oa'],
    }
    content['curriculum'] = {
        'status': SCOPE + ' Los AE y criterios se transcriben del PDF depositado. Las consignas de simulación son locales.',
        'label': 'Programa de Estudio MINEDUC · Refrigeración y Climatización (3° medio)',
        'url': 'https://www.curriculumnacional.cl/614/articles-34318_programa.pdf',
        'pdf': PDF,
    }
    content['formative_pack'] = formative_pack(mid)
    content['video'] = f'/static/media/m{mid}-secuencia.mp4'
    content['vtt'] = f'/static/media/m{mid}-secuencia.vtt'
    for i, ae in enumerate(content.get('aes') or []):
        if i >= len(spec['aes']):
            break
        src = spec['aes'][i]
        shorts = SHORT_AE.get(mid) or []
        ae['title'] = src['title']
        ae['short_title'] = shorts[i] if i < len(shorts) else src['title'][:80]
        ae['description'] = src['title']
        ae['official_code'] = src['code']
        ae['official_page'] = src['page']
        ae['criteria'] = src['criteria']
        ae['oa'] = spec['oa'][0] if spec['oa'] else ''
        if not ae.get('lesson'):
            ae['lesson'] = src['criteria'][:2]
        if not ae.get('example') or 'sin inventar' in str(ae.get('example') or '').lower() or 'inventes' in str(ae.get('example') or '').lower():
            ae['example'] = 'Trabaja con el dossier simulado. Transcribe el criterio oficial y deja evidencia con datos del documento.'
    return content
