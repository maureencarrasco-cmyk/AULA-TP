"""Five diagnostic moments; none require solving the professional case."""

ACTIVITIES = [
    'Conoce el contexto profesional', 'Observa y reconoce',
    'Conecta con lo que ya sabes', 'Descubre por qu\u00e9 esto importa',
    'Anticipa lo que aprender\u00e1s',
]

# The structure is shared, while the objects and work setting follow the course.
PROFILES = [
    (('refrigeraci', 'climatizaci'), 'una instalaci\u00f3n de refrigeraci\u00f3n y climatizaci\u00f3n',
     ['Plano t\u00e9cnico', 'Simbolog\u00eda t\u00e9cnica', 'Equipos de climatizaci\u00f3n', 'Medidas o dimensiones', 'Especificaciones t\u00e9cnicas', 'Tuber\u00edas o conexiones'],
     ['Interpretar planos', 'Reconocer simbolog\u00eda t\u00e9cnica', 'Leer especificaciones t\u00e9cnicas', 'Identificar componentes', 'Relacionar informaci\u00f3n de distintos documentos']),
    (('enfermer',), 'un entorno de atenci\u00f3n de enfermer\u00eda bajo supervisi\u00f3n',
     ['Registros de atenci\u00f3n', 'Indicaciones del equipo de salud', 'Materiales de cuidado', 'Instrumentos', 'Medidas de higiene', 'Condiciones del entorno'],
     ['Comprender registros e indicaciones', 'Reconocer materiales', 'Identificar medidas de higiene', 'Comprender los l\u00edmites del rol t\u00e9cnico', 'Relacionar informaci\u00f3n del cuidado']),
    (('gastronom', 'alimentos'), 'un espacio de elaboraci\u00f3n y servicio de alimentos',
     ['Ingredientes', 'Equipos y utensilios', 'Fichas de elaboraci\u00f3n', 'Medidas o cantidades', 'Condiciones de higiene', 'Almacenamiento'],
     ['Leer fichas de elaboraci\u00f3n', 'Reconocer ingredientes', 'Identificar equipos', 'Comprender medidas de higiene', 'Relacionar las etapas de un proceso']),
    (('hoteler', 'turismo'), 'un servicio de atenci\u00f3n a visitantes y hu\u00e9spedes',
     ['Personas y roles', 'Espacios de atenci\u00f3n', 'Reservas o registros', 'Informaci\u00f3n del servicio', 'Equipamiento', 'Se\u00f1alizaci\u00f3n'],
     ['Comprender informaci\u00f3n del servicio', 'Reconocer necesidades de las personas', 'Interpretar registros', 'Identificar roles', 'Relacionar las etapas de la atenci\u00f3n']),
    (('programaci', 'conectividad', 'telecomunic', 'electr\u00f3nica'), 'un entorno de sistemas, redes y tecnolog\u00eda',
     ['Equipos o dispositivos', 'Conexiones', 'Esquemas o diagramas', 'C\u00f3digo o configuraciones', 'Registros del sistema', 'Documentaci\u00f3n t\u00e9cnica'],
     ['Interpretar diagramas', 'Reconocer dispositivos', 'Comprender registros', 'Leer documentaci\u00f3n t\u00e9cnica', 'Relacionar componentes de un sistema']),
    (('p\u00e1rvulos',), 'un espacio educativo de atenci\u00f3n a ni\u00f1os y ni\u00f1as',
     ['Espacios educativos', 'Materiales did\u00e1cticos', 'Rutinas', 'Personas y roles', 'Registros de observaci\u00f3n', 'Condiciones de cuidado'],
     ['Comprender rutinas', 'Reconocer materiales', 'Identificar necesidades de cuidado', 'Interpretar observaciones', 'Relacionar actividades con su prop\u00f3sito']),
    (('administraci', 'contabilidad'), 'un espacio de gesti\u00f3n administrativa y documental',
     ['Documentos', 'Planillas', 'Registros', 'Datos de personas o productos', 'Personas y roles', 'Etapas de un proceso'],
     ['Interpretar documentos', 'Reconocer datos relevantes', 'Comprender registros', 'Identificar roles', 'Relacionar informaci\u00f3n de distintas fuentes']),
    (('agropecu', 'forestal', 'acuicultura', 'pesquer'), 'un entorno de producci\u00f3n y manejo de recursos naturales',
     ['Organismos o recursos', 'Equipos y herramientas', 'Registros de producci\u00f3n', 'Condiciones del entorno', 'Medidas o cantidades', 'Etapas de manejo'],
     ['Reconocer recursos', 'Interpretar registros', 'Comprender condiciones del entorno', 'Identificar equipos', 'Relacionar las etapas de producci\u00f3n']),
    (('portuari', 'naves'), 'un entorno de operaciones de transporte mar\u00edtimo y portuario',
     ['Equipos', 'Cargas o materiales', 'Se\u00f1alizaci\u00f3n', 'Registros de operaci\u00f3n', 'Personas y roles', 'Condiciones de seguridad'],
     ['Interpretar registros', 'Reconocer equipos', 'Comprender se\u00f1alizaci\u00f3n', 'Identificar roles', 'Relacionar las etapas de una operaci\u00f3n']),
    (('geolog', 'minera', 'metalurgia', 'qu\u00edmica'), 'un entorno de observaci\u00f3n, muestreo y procesos t\u00e9cnicos',
     ['Muestras o materiales', 'Instrumentos', 'Registros de datos', 'Diagramas de proceso', 'Unidades de medida', 'Condiciones de seguridad'],
     ['Reconocer materiales', 'Interpretar registros', 'Comprender unidades de medida', 'Identificar instrumentos', 'Relacionar datos y procesos']),
    (('vestuario', 'gr\u00e1fica', 'muebles'), 'un taller de dise\u00f1o y elaboraci\u00f3n de productos',
     ['Dise\u00f1os o modelos', 'Materiales', 'Herramientas', 'Medidas', 'Fichas de trabajo', 'Etapas de elaboraci\u00f3n'],
     ['Interpretar dise\u00f1os', 'Reconocer materiales', 'Comprender fichas de trabajo', 'Identificar herramientas', 'Relacionar las etapas de elaboraci\u00f3n']),
    (('electricidad', 'mec\u00e1nica', 'construcci', 'sanitarias', 'montaje', 'dibujo'), 'un taller o una instalaci\u00f3n t\u00e9cnica',
     ['Planos o esquemas', 'Simbolog\u00eda', 'Equipos o componentes', 'Medidas o dimensiones', 'Especificaciones t\u00e9cnicas', 'Conexiones o uniones'],
     ['Interpretar planos o esquemas', 'Reconocer simbolog\u00eda', 'Leer especificaciones', 'Identificar componentes', 'Relacionar informaci\u00f3n de distintos documentos']),
]


def context_plan(content, course, module_title):
    specialty = str(course.get('specialty') or course.get('title') or 'la especialidad')
    profile = next((p for p in PROFILES if any(word in specialty.casefold() for word in p[0])), None)
    if profile is None:
        profile = ((), 'un entorno de trabajo de la especialidad',
                   ['Personas y roles', 'Documentos', 'Equipos', 'Materiales', 'Datos', 'Condiciones del entorno'],
                   ['Comprender documentos', 'Reconocer elementos', 'Interpretar datos', 'Identificar roles', 'Relacionar informaci\u00f3n'])
    _, setting, elements, learning = profile
    climate_plans = 'climatizaci\u00f3n en un edificio educacional' in str(content.get('case_title', '')).casefold()
    title = content.get('case_title') or module_title
    scenario = (f'En {setting}, el equipo de trabajo recibe antecedentes relacionados con {module_title}. '
                'Antes de comenzar, observa los recursos, documentos y elementos disponibles para conocer la situaci\u00f3n.')
    application = f'En situaciones de {specialty} donde es necesario comprender los antecedentes y el entorno antes de participar en un trabajo relacionado con {module_title}.'
    consequence = 'Una informaci\u00f3n mal interpretada puede provocar errores en el trabajo, en el uso de los recursos o en la comunicaci\u00f3n del equipo.'
    relevance = f'Comprender los documentos, datos y elementos de {specialty} permite reconocer qu\u00e9 se necesita hacer, en qu\u00e9 contexto y bajo qu\u00e9 condiciones, respetando los protocolos y los l\u00edmites del rol t\u00e9cnico.'
    if climate_plans:
        scenario = ('Un t\u00e9cnico debe revisar la documentaci\u00f3n de climatizaci\u00f3n de una sala antes de comenzar el trabajo. '
                    'Para comprender correctamente el proyecto debe observar planos, documentos, equipos, s\u00edmbolos, dimensiones y especificaciones t\u00e9cnicas.')
        application = 'En situaciones donde t\u00e9cnicos de refrigeraci\u00f3n y climatizaci\u00f3n deben interpretar planos y documentaci\u00f3n antes de instalar, revisar, mantener o intervenir un sistema.'
        consequence = 'Un plano mal interpretado puede provocar que un equipo, una tuber\u00eda o una conexi\u00f3n sea ubicada incorrectamente.'
        relevance = 'Interpretar correctamente planos, s\u00edmbolos y especificaciones permite comprender qu\u00e9 se debe realizar, d\u00f3nde debe realizarse y bajo qu\u00e9 condiciones antes de intervenir una instalaci\u00f3n.'
    return dict(version=1, activities=ACTIVITIES, title=title, scenario=scenario,
                application=application, consequence=consequence, relevance=relevance,
                elements=elements + ['Otro elemento que conozcas'], learning=learning[:3] + [learning[3] + ' y ' + learning[4][0].lower() + learning[4][1:]],
                importance_question='\u00bfPor qu\u00e9 crees que un t\u00e9cnico debe comprender la documentaci\u00f3n antes de comenzar el trabajo?',
                importance_options=['Para trabajar siguiendo correctamente la informaci\u00f3n del proyecto.',
                                    'Para evitar tener que utilizar los documentos durante el trabajo.',
                                    'Para reemplazar las especificaciones t\u00e9cnicas por experiencia personal.',
                                    'Para detectar datos faltantes y consultar antes de tomar una decisi\u00f3n.'],
                importance_feedback=['Correcto. La documentaci\u00f3n t\u00e9cnica permite comprender previamente qu\u00e9 debe realizarse y bajo qu\u00e9 condiciones.',
                                     'Los documentos siguen siendo necesarios durante el trabajo. Comprenderlos primero ayuda a utilizarlos con sentido.',
                                     'La experiencia no reemplaza las especificaciones. Es importante conocer la informaci\u00f3n del proyecto antes de actuar.',
                                     'Bien. Revisar la documentaci\u00f3n permite reconocer lo que falta confirmar y consultar antes de actuar.'])


def save_context_step(state, index, response):
    """Allow any activity order; award progress only when all five are saved."""
    if type(index) is not int or index not in range(5) or not isinstance(response, dict):
        raise ValueError('Actividad de contextualizaci\u00f3n inv\u00e1lida.')
    sequence = state.setdefault('contextualization', {'version': 1, 'completed': [], 'responses': {}})
    done = sequence['completed']
    normalized = {}
    if index in (1, 4):
        field = 'recognized' if index == 1 else 'anticipated'
        values = response.get(field)
        limit = 7 if index == 1 else 5
        if not isinstance(values, list) or not values or any(type(v) is not int or v not in range(limit) for v in values):
            raise ValueError('Selecciona al menos un elemento. No se califica tu selecci\u00f3n.')
        normalized[field] = sorted(set(values))
        if index == 1:
            other = response.get('other', '')
            if not isinstance(other, str) or len(other) > 300:
                raise ValueError('Describe el otro elemento en una frase breve.')
            normalized['other'] = other.strip()
    elif index == 2:
        prior = response.get('prior', '')
        if not isinstance(prior, str) or not 3 <= len(prior.strip()) <= 1200:
            raise ValueError('Escribe una frase breve a partir de lo que ya sabes o has visto.')
        normalized['prior'] = prior.strip()
    elif index == 3:
        choice = response.get('importance')
        if type(choice) is not int or choice not in range(4):
            raise ValueError('Selecciona una alternativa y revisa su orientaci\u00f3n.')
        normalized['importance'] = choice
    sequence['responses'][str(index)] = normalized
    if index not in done:
        done.append(index)
        done.sort()
    if len(done) == 5:
        prior = sequence['responses']['2']['prior']
        state['context'] = f'Conoc\u00ed el contexto profesional y reconoc\u00ed elementos del escenario. Mis conocimientos previos: {prior}. Identifiqu\u00e9 por qu\u00e9 importa y anticip\u00e9 lo que necesito aprender.'
    return sequence
