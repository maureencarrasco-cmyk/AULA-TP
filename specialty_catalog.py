"""Cursos completos construidos desde los programas MINEDUC adjuntos.

La interfaz conserva las cinco estaciones del curso base. Las consignas son
adaptaciones didácticas y no autorizan intervenciones eléctricas o clínicas.
"""

from copy import deepcopy

from official_curricula import (
    ADULT_MENTION_MODULES,
    ELECTRICITY_MODULES as OFFICIAL_ELECTRICITY_MODULES,
    NURSING_COMMON_MODULES,
    NURSING_MENTION_MODULES,
)


MINEDUC_ELECTRICIDAD = 'docs/fuentes/MINEDUC_Electricidad_programa.pdf'
MINEDUC_ENFERMERIA = 'docs/fuentes/MINEDUC_Atencion_de_Enfermeria_programa.pdf'
MINEDUC_ELECTRICIDAD_URL = 'https://www.curriculumnacional.cl/614/articles-34320_programa.pdf'
MINEDUC_ENFERMERIA_URL = 'https://www.curriculumnacional.cl/614/articles-34350_programa.pdf'
SEC_RIC_URL = 'https://www.sec.cl/reglamento-de-seguridad-de-las-instalaciones-de-consumo-de-energia-electrica-decreto-08/'


def _ae(code, title, criteria):
    lesson = [
        f'Este aprendizaje se trabaja mediante evidencia documental y situaciones simuladas: {title}',
        'Antes de decidir, distingue el dato observado, el protocolo o documento aplicable y la información que debe confirmar una persona autorizada.',
    ]
    experiences = [
        {
            'id': f'{code}-x1', 'type': 'hotspot', 'activity_kind': 'observe',
            'label': 'Analizar', 'skill': 'Representar', 'difficulty': 'Inicial',
            'prompt': f'Explora el escenario de este aprendizaje y abre los cuatro puntos. Explica qué evidencia aporta cada uno para «{title}».',
            'spots': [
                {'id': 'evidencia', 'x': 20, 'y': 30, 'label': 'Evidencia', 'note': 'Identifica el dato observable y su fuente.'},
                {'id': 'criterio', 'x': 72, 'y': 26, 'label': 'Criterio', 'note': 'Relaciona el dato con el criterio aplicable.'},
                {'id': 'resguardo', 'x': 32, 'y': 72, 'label': 'Resguardo', 'note': 'Reconoce la medida de seguridad o el límite del rol.'},
                {'id': 'registro', 'x': 78, 'y': 68, 'label': 'Registro', 'note': 'Comprueba qué debe quedar documentado.'},
            ],
            'answer': ['evidencia', 'criterio', 'resguardo', 'registro'],
        },
        {
            'id': f'{code}-x2', 'type': 'match', 'activity_kind': 'relate',
            'label': 'Comprender', 'skill': 'Modelar', 'difficulty': 'Inicial',
            'prompt': 'Relaciona cada componente de la decisión técnica con su función.',
            'left': ['Evidencia', 'Criterio', 'Resguardo', 'Registro'],
            'right': ['Dato comprobable del caso', criteria[0], 'Condición de seguridad y supervisión', 'Trazabilidad de la decisión'],
            'answer': [[0, 0], [1, 1], [2, 2], [3, 3]],
        },
        {
            'id': f'{code}-x3', 'type': 'order', 'activity_kind': 'sequence',
            'label': 'Relacionar', 'skill': 'Resolver problemas', 'difficulty': 'Intermedia',
            'prompt': 'Ordena la secuencia de análisis antes de ejecutar o autorizar una acción.',
            'items': ['Leer la indicación y reconocer el propósito', 'Identificar la evidencia disponible', 'Contrastar la evidencia con el criterio', 'Aplicar los resguardos y límites del rol', 'Registrar la decisión y los pendientes'],
            'answer': [0, 1, 2, 3, 4],
        },
        {
            'id': f'{code}-x4', 'type': 'choice', 'activity_kind': 'decide',
            'label': 'Aplicar y decidir', 'skill': 'Resolver problemas', 'difficulty': 'Intermedia',
            'prompt': f'El caso no contiene todos los antecedentes para aplicar «{criteria[1] if len(criteria)>1 else criteria[0]}». ¿Qué decisión corresponde?',
            'options': ['Detener la decisión, solicitar el antecedente y dejar registro del pendiente.', 'Completar el dato por experiencia y continuar.', 'Omitir el criterio porque el resto del caso parece correcto.', 'Cerrar la tarea sin comunicar la diferencia.'],
            'answer': 0,
        },
        {
            'id': f'{code}-x5', 'type': 'choice', 'activity_kind': 'verify',
            'label': 'Verificar', 'skill': 'Argumentar', 'difficulty': 'Avanzada',
            'prompt': f'¿Qué evidencia demuestra mejor el criterio «{criteria[-1]}»?',
            'options': ['Un registro que identifica dato, criterio, acción, responsable y verificación.', 'Una conclusión sin fuente porque la acción ya terminó.', 'Una fotografía sin fecha, unidad ni relación con el criterio.', 'Una explicación basada solamente en cómo suele hacerse.'],
            'answer': 0,
        },
        {
            'id': f'{code}-x6', 'type': 'reflect', 'activity_kind': 'reflect',
            'label': 'Retroalimentar', 'skill': 'Argumentar', 'difficulty': 'Intermedia',
            'prompt': f'Revisa tu decisión sobre «{title}». Explica qué mejorarías y cómo comprobarías el resultado sin exceder tu rol.',
        },
    ]
    return {
        'title': title,
        'short_title': title.split(',')[0][:86],
        'description': title,
        'official_code': code,
        'criteria': criteria,
        'lesson': lesson,
        'example': 'En el caso simulado, registra el dato disponible, aplica el criterio indicado y declara cualquier antecedente pendiente.',
        'steps': [
            f'Analiza la evidencia relacionada con: {title}',
            'Explica el concepto o protocolo que orienta la decisión.',
            'Relaciona el dato observado con el criterio de evaluación.',
            'Decide una acción segura dentro de tu rol y justifícala.',
            'Verifica tu decisión con el documento, protocolo o indicación disponible.',
            'Identifica una mejora y explica cómo comprobarías su resultado.',
        ],
        'experiences': experiences,
    }


def _rotate(correct, distractors, shift):
    options = [correct, *distractors]
    shift %= len(options)
    options = options[shift:] + options[:shift]
    return options, options.index(correct)


SCENARIOS = {
    'electricidad': [
        ('El plano vigente identifica el motor M-02 y la placa del equipo recibido indica M-03.',
         '¿Qué haces antes de aceptar ese equipo?',
         'Contrasto la placa con la ficha de M-03 y el proyecto; registro la diferencia y consulto al responsable.',
         'Instalo M-03 porque ambos equipos parecen equivalentes.',
         'Cambio la etiqueta de la placa para que coincida con el plano.',
         'Cierro la recepción sin informar la diferencia.',
         'La coincidencia visual no demuestra que el equipo cumpla el proyecto.'),
        ('Una planilla de verificación anota 3,2 para un conductor, pero omite magnitud, unidad e instrumento.',
         '¿Qué permite interpretar ese resultado?',
         'Solicito magnitud, unidad, instrumento y registro de medición antes de compararlo con el criterio.',
         'Lo interpreto como amperios porque se trata de un circuito.',
         'Lo doy por conforme porque el número es bajo.',
         'Copio 3,2 en el acta de aprobación sin aclaraciones.',
         'Un número sin magnitud ni unidad no permite una comparación técnica verificable.'),
        ('La orden menciona una exigencia RIC, pero no identifica el pliego aplicable ni su versión.',
         '¿Cómo fundamentas la decisión normativa?',
         'Consulto el pliego RIC aplicable en la SEC y confirmo su alcance con la persona autorizada.',
         'Aplico cualquier pliego porque todos cubren la misma instalación.',
         'Sustituyo el pliego por una publicación sin fecha.',
         'Declaro cumplimiento normativo sin identificar la regla usada.',
         'La referencia normativa debe ser identificable y aplicable al caso.'),
        ('El informe de ensayo dice «aprobado», pero no identifica fecha, responsable ni resultado medido.',
         '¿Puede cerrarse la verificación?',
         'Solicito el resultado trazable y la validación de quien esté autorizado antes de cerrar el informe.',
         'Acepto el visto bueno verbal como resultado medido.',
         'Agrego una fecha estimada para completar el documento.',
         'Energizo para comprobarlo sin autorización.',
         'Un resultado sin trazabilidad no acredita la verificación registrada.'),
        ('La orden pide canalización C-04; el plano actualizado marca C-05 para ese tramo.',
         '¿Cuál es la acción documentable?',
         'Comparo revisiones, comunico la discrepancia y espero la definición autorizada antes de ejecutar.',
         'Uso C-04 porque figura en la orden más antigua.',
         'Uso C-05 sin registrar por qué cambió.',
         'Borro una de las referencias para eliminar la diferencia.',
         'Una discrepancia documental debe resolverse antes de ejecutar el tramo.'),
    ],
    'enfermeria': [
        ('En el caso simulado, la identificación de la persona no coincide con la ficha de atención.',
         '¿Qué corresponde dentro del rol técnico?',
         'Detengo la acción, verifico la identidad según protocolo local y aviso al profesional responsable.',
         'Continúo porque el nombre de pila es parecido.',
         'Corrijo la identificación por intuición.',
         'Registro la atención como completa sin resolver la diferencia.',
         'La identidad debe confirmarse mediante el procedimiento institucional antes de actuar.'),
        ('Una indicación del caso está incompleta y no permite conocer con certeza la acción solicitada.',
         '¿Qué haces con esa indicación?',
         'Pido aclaración al profesional responsable y dejo constancia del pendiente antes de ejecutar.',
         'Interpreto el dato faltante según una experiencia anterior.',
         'Realizo una acción distinta sin consultar.',
         'Marco la indicación como ejecutada para cerrar el turno.',
         'Una indicación ambigua requiere aclaración de quien tenga atribución para darla.'),
        ('Durante la observación aparece un cambio respecto del registro previo; el caso no aporta diagnóstico.',
         '¿Cómo comunicas el hallazgo?',
         'Describo el dato observable, registro cuándo se observó y aviso según el protocolo local.',
         'Escribo un diagnóstico propio sin evaluación profesional.',
         'Omito el cambio porque podría ser transitorio.',
         'Modifico el registro anterior para que ambas anotaciones coincidan.',
         'Comunicar datos observables no equivale a formular un diagnóstico fuera del rol.'),
        ('El material del caso contiene datos personales y una solicitud de compartirlos fuera del equipo autorizado.',
         '¿Qué resguardo aplicas?',
         'Protejo los datos y consulto el canal autorizado antes de compartir cualquier antecedente.',
         'Envío una foto por mensajería personal para ahorrar tiempo.',
         'Comparto todo el registro porque la solicitud parece urgente.',
         'Elimino el antecedente para evitar una consulta.',
         'El uso de datos personales requiere el canal y autorización correspondientes.'),
        ('La entrega de turno cita una nota antigua como si describiera el estado actual.',
         '¿Qué información debe verificarse?',
         'Comparo fecha y fuente de las notas, registro la discrepancia y la comunico al equipo responsable.',
         'Copio la nota antigua como observación actual.',
         'Cambio su fecha para que coincida con el turno.',
         'Descarto la nota nueva sin revisarla.',
         'La vigencia y procedencia del registro importan para interpretar el caso.'),
    ],
    'climate': [
        ('El plano identifica equipo EQ-02, mientras la placa del equipo recibido indica EQ-03.',
         '¿Qué se verifica antes del montaje?',
         'Contrasto placa, ficha y plano; documento la diferencia y solicito definición autorizada.',
         'Monto EQ-03 porque la carcasa parece igual.',
         'Reetiqueto el plano sin dejar registro.',
         'Cierro la recepción sin comparar la ficha.',
         'La compatibilidad no se establece por apariencia.'),
        ('La lectura anotada es 24,5 y no aparecen magnitud, unidad ni instrumento.',
         '¿Cómo interpretas esa lectura?',
         'Solicito magnitud, unidad e instrumento antes de comparar la lectura con una especificación.',
         'Asumo que representa grados Celsius.',
         'La considero conforme porque parece un valor habitual.',
         'Completo la unidad sin volver al registro original.',
         'Una medición sin unidad ni instrumento no permite una conclusión técnica.'),
        ('La etiqueta del cilindro del caso no coincide con el refrigerante indicado en la orden.',
         '¿Qué haces con esa diferencia?',
         'Suspendo la decisión de uso y pido verificar identificación y procedimiento a personal autorizado.',
         'Uso el cilindro porque su color parece correcto.',
         'Cambio la etiqueta por la indicada en la orden.',
         'Omito la diferencia en el registro.',
         'La identificación del fluido debe verificarse antes de cualquier intervención.'),
        ('Dos trazados se cruzan en planta, pero no se muestran cotas de altura ni sección.',
         '¿Qué permite concluir la evidencia?',
         'Solicito sección y cotas de la revisión vigente antes de afirmar una interferencia.',
         'Afirmo una colisión solo por el cruce dibujado.',
         'Desvío un trazado sin autorización.',
         'Doy por inexistente la interferencia sin revisar otra vista.',
         'Una planta sin altura no basta para resolver un cruce espacial.'),
        ('El acta de mantención enumera tareas, pero no incluye resultado de verificación ni responsable.',
         '¿Cómo se cierra el trabajo?',
         'Pido el resultado y la revisión autorizada; registro el pendiente antes de cerrar el acta.',
         'Declaro conforme porque las tareas figuran en la lista.',
         'Invento un resultado de ensayo probable.',
         'Elimino el campo de verificación.',
         'Una lista de tareas no sustituye evidencia de verificación.'),
    ],
    'empleabilidad': [
        ('Un presupuesto del caso enumera materiales y horas, pero omite la cantidad de una partida.',
         '¿Qué haces antes de informar el total?',
         'Solicito la cantidad faltante y dejo el total como pendiente hasta recalcular.',
         'Asigno una unidad a la partida sin consultar.',
         'Excluyo la partida sin informarlo.',
         'Presento el total como definitivo.',
         'Un presupuesto requiere cantidades verificables.'),
        ('La propuesta cita un plazo de cinco días y el calendario adjunto marca siete.',
         '¿Cómo presentas el plazo?',
         'Comparo las versiones y pido confirmar el plazo antes de comprometer la entrega.',
         'Elijo cinco días porque parece más competitivo.',
         'Cambio el calendario sin comunicarlo.',
         'Omito el plazo en la propuesta.',
         'El compromiso debe basarse en una versión acordada.'),
        ('Una oferta de trabajo solicita una certificación que no figura en los antecedentes de la persona.',
         '¿Qué registro es correcto?',
         'Declaro solo formación acreditada y verifico si la certificación es requisito obligatorio.',
         'Agrego la certificación porque podría obtenerse después.',
         'Adjunto un certificado de otra persona.',
         'Ignoro el requisito sin revisarlo.',
         'Los antecedentes formativos deben ser trazables.'),
        ('El contrato simulado cita una función diferente de la descrita en la oferta.',
         '¿Qué haces antes de aceptar?',
         'Pido aclaración escrita de la función y comparo ambos documentos.',
         'Supongo que la diferencia es solo de redacción.',
         'Cambio una copia del contrato por mi cuenta.',
         'Acepto sin leer el detalle restante.',
         'Una discrepancia contractual se aclara antes de decidir.'),
        ('La ficha de servicio promete una tarea que el equipo aún no ha autorizado ni presupuestado.',
         '¿Cómo informas al cliente simulado?',
         'Distingo la tarea confirmada de la pendiente y solicito definición antes de comprometerla.',
         'Prometo la tarea para cerrar la venta.',
         'Facturo el trabajo como realizado.',
         'Oculto la limitación del equipo.',
         'Un alcance pendiente no debe presentarse como servicio confirmado.'),
    ],
}


FOURTH_CLIMATE_SCENARIOS = {
    'puesta': [
        ('El área está despejada, pero falta confirmar anclaje, ventilación y acceso de servicio.', '¿Qué corresponde antes de posicionar el equipo?', 'Verifico las condiciones del fabricante, registro pendientes y preparo el área antes de mover el equipo.', 'Ubico el equipo y reviso el acceso al final.', 'Compenso la falta de acceso con una extensión.', 'Doy por conforme el recinto porque está despejado.', 'El espacio debe comprobarse antes del traslado y posicionamiento.'),
        ('La orden indica un refrigerante y el cilindro recibido presenta otra identificación.', '¿Qué haces antes de la carga?', 'Detengo la tarea, verifico orden, equipo y cilindro con personal autorizado y registro la diferencia.', 'Cargo una pequeña cantidad para probar.', 'Cambio la etiqueta del cilindro.', 'Elijo el fluido por el color del envase.', 'La identidad del refrigerante debe ser trazable antes de manipularlo.'),
        ('La ficha exige vacío y hermeticidad, pero el registro solo consigna la hora de inicio.', '¿Puede iniciarse la carga?', 'No; solicito resultados verificables de vacío y hermeticidad antes de continuar.', 'Sí, porque el procedimiento comenzó.', 'Completo resultados estimados.', 'Inicio y verifico fugas después.', 'El inicio del procedimiento no acredita sus resultados.'),
        ('Los parámetros iniciales están en rango, pero faltan sentido de giro y protecciones.', '¿Cómo continúas la puesta en marcha?', 'Completo la secuencia del fabricante y registro cada resultado antes de cerrar.', 'Declaro operativo el sistema.', 'Anulo temporalmente las protecciones.', 'Omito el sentido de giro si no hay ruido.', 'La puesta en marcha exige completar todas las comprobaciones.'),
        ('El acta tiene mediciones, pero no identifica instrumento, unidad ni responsable.', '¿Cómo se cierra el registro?', 'Completo la trazabilidad y obtengo la validación autorizada.', 'Agrego unidades probables.', 'Firmo por la persona responsable.', 'Archivo el acta porque contiene números.', 'Una medición sin trazabilidad no permite validar el resultado.'),
    ],
    'diagnostico': [
        ('El sistema tiene baja capacidad y el registro histórico omite las condiciones de medición.', '¿Cuál es el primer paso diagnóstico?', 'Confirmo condiciones, instrumentos y valores comparables antes de formular hipótesis.', 'Concluyo falta de refrigerante.', 'Cambio un componente para descartar.', 'Ignoro el historial.', 'Un síntoma aislado no demuestra una causa.'),
        ('La medición difiere del fabricante, pero el instrumento no tiene verificación vigente.', '¿Cómo interpretas el dato?', 'Lo dejo como antecedente no confirmado y solicito una medición con instrumento apto.', 'Lo uso como prueba definitiva.', 'Ajusto el valor al rango esperado.', 'Descarto la especificación.', 'La confiabilidad del instrumento condiciona la conclusión.'),
        ('La inspección detecta escarcha, pero no hay datos de temperatura, presión ni flujo.', '¿Qué conclusión es válida?', 'Registro el signo y solicito datos antes de atribuir una causa.', 'Diagnostico una obstrucción.', 'Retiro la escarcha y cierro.', 'Declaro pérdida de refrigerante.', 'Un signo orienta la revisión, pero no basta para diagnosticar.'),
        ('Dos hipótesis explican el mismo síntoma y requieren verificaciones distintas.', '¿Cómo decides la comprobación?', 'Priorizo una prueba segura que discrimine entre ambas y documento el resultado.', 'Elijo la causa más frecuente.', 'Ejecuto ambas reparaciones.', 'Cierro como indeterminado.', 'La prueba debe aportar evidencia para diferenciar causas.'),
        ('La falla requiere una intervención que no puede hacerse con seguridad en terreno.', '¿Qué decisión corresponde?', 'Aíslo según procedimiento, registro el diagnóstico y derivo al taller o personal autorizado.', 'Improviso una reparación.', 'Mantengo el equipo funcionando.', 'Elimino la advertencia.', 'La factibilidad y el límite del rol determinan dónde corregir la falla.'),
    ],
    'mantencion': [
        ('El plan indica una tarea preventiva que el historial registra como reciente.', '¿Qué debes verificar?', 'Confirmo fecha, condición actual y criterio del fabricante antes de reprogramar o ejecutar.', 'La repito sin revisar.', 'La elimino del plan.', 'Copio el registro anterior.', 'El historial y la condición actual orientan la mantención.'),
        ('La inspección detecta suciedad y una conexión con deterioro.', '¿Cómo priorizas?', 'Evalúo el riesgo y separo la limpieza de una posible corrección técnica autorizada.', 'Limpio y doy todo por resuelto.', 'Ajusto la conexión energizada.', 'Ignoro la suciedad.', 'Cada hallazgo requiere una acción acorde con su riesgo.'),
        ('La orden correctiva tiene un síntoma, pero no diagnóstico ni repuesto autorizado.', '¿Puede iniciarse la reparación?', 'No; confirmo diagnóstico, alcance, repuesto y autorización.', 'Sí, si el repuesto parece compatible.', 'Desarmo para descubrir la falla.', 'Sustituyo la pieza más económica.', 'La mantención correctiva requiere diagnóstico y alcance definidos.'),
        ('Después de la mantención solo se registra que el equipo funciona.', '¿Qué falta?', 'Registrar pruebas, valores, criterio aplicado y responsable de la verificación.', 'Agregar una fotografía.', 'Cambiar “funciona” por “aprobado”.', 'Cerrar porque encendió.', 'El funcionamiento aparente no sustituye una verificación documentada.'),
        ('El resultado posterior sigue fuera de especificación.', '¿Cómo cierras la orden?', 'La mantengo abierta, registro el resultado y escalo la decisión.', 'Escribo el valor esperado.', 'Ajusto otra parte sin diagnóstico.', 'Entrego sin observaciones.', 'Un resultado fuera de criterio exige continuar el tratamiento de la falla.'),
    ],
    'refrigerantes': [
        ('El cilindro de recuperación no tiene identificación legible ni registro de contenido.', '¿Qué corresponde antes de usarlo?', 'Lo separo, impido su uso y solicito identificación conforme al protocolo.', 'Identifico por el color.', 'Lo uso brevemente.', 'Escribo el fluido más probable.', 'El almacenamiento exige identificación y trazabilidad.'),
        ('No se ha comprobado capacidad ni condición del cilindro de recuperación.', '¿Cómo procedes?', 'Verifico cilindro, capacidad, equipo y conexiones antes de iniciar bajo supervisión.', 'Inicio y controlo visualmente.', 'Uso cualquier cilindro.', 'Libero presión si se completa.', 'La recuperación requiere comprobar los medios de contención.'),
        ('El refrigerante recuperado presenta indicios de mezcla o contaminación.', '¿Puede reciclarse como puro?', 'No; identifico la condición, lo mantengo segregado y aplico el procedimiento autorizado.', 'Sí, después de filtrarlo.', 'Lo mezclo con refrigerante nuevo.', 'Cambio la etiqueta.', 'La factibilidad del reciclaje depende de la condición del fluido.'),
        ('El recinto tiene ventilación insuficiente y cilindros sin sujeción.', '¿Qué acción corresponde?', 'Detengo el ingreso e informo que deben corregirse ventilación y sujeción.', 'Almaceno por poco tiempo.', 'Abro una puerta.', 'Apilo los cilindros.', 'Las condiciones del recinto forman parte del almacenamiento seguro.'),
        ('El registro omite origen, tipo de refrigerante y destino.', '¿Está completa la trazabilidad?', 'No; completo origen, identificación, cantidad, responsable y destino.', 'Sí, porque tiene cantidad.', 'Agrego solo la fecha.', 'Elimino el campo de origen.', 'La gestión ambiental requiere seguir el refrigerante hasta su destino.'),
    ],
}


def _scenario(module, index):
    title = module['title'].lower()
    if 'puesta en marcha' in title:
        return FOURTH_CLIMATE_SCENARIOS['puesta'][index % 5]
    if 'diagnóstico' in title or 'diagnostico' in title:
        return FOURTH_CLIMATE_SCENARIOS['diagnostico'][index % 5]
    if 'mantención' in title or 'mantencion' in title:
        return FOURTH_CLIMATE_SCENARIOS['mantencion'][index % 5]
    if 'reciclaje' in title or 'refrigerantes' in title:
        return FOURTH_CLIMATE_SCENARIOS['refrigerantes'][index % 5]
    key = 'empleabilidad' if 'emprendimiento' in title or 'empleabilidad' in title else module.get('specialty_key')
    return SCENARIOS.get(key, SCENARIOS['climate'])[index % 5]


def _cases(module, image):
    aes = module['aes']
    ae_count = max(1, len(aes))
    electricity = module.get('specialty_key') == 'electricidad'
    rows = []
    for i in range(15):
        ae_index = i % ae_count
        criterion = aes[ae_index]['criteria'][i % len(aes[ae_index]['criteria'])]
        evidence, question, correct, *rest = _scenario(module, i)
        options, answer = _rotate(correct, rest[:3], i)
        rows.append({
            'title': f'{module["title"]} · situación {i + 1}',
            'context': (
                ('Consulta el RIC antes de tomar una decisión. ' if electricity else '')
                + f'{evidence} Relaciona la decisión con «{criterion}» sin añadir datos que el caso no entrega.'
            ),
            'question': question,
            'options': options,
            'answer': answer,
            'explanation': rest[3],
            'ae': ae_index,
            'criterion': criterion,
            'image': image,
            'alt': f'Escenario simulado de {module["title"]}; la imagen contextualiza la situación y no revela la respuesta.',
            'caption': 'Escenario formativo simulado. La ejecución real requiere autorización, supervisión y protocolos vigentes.',
            'format': ['decisión', 'documento', 'secuencia', 'seguridad', 'registro'][i % 5],
            'difficulty': ['Inicial', 'Intermedia', 'Avanzada'][i % 3],
            'form': (i % 9) + 1,
        })
    return rows


def _questions(module, image):
    aes = module['aes']
    ae_count = max(1, len(aes))
    electricity = module.get('specialty_key') == 'electricidad'
    rows = []
    for i in range(25):
        ae_index = i % ae_count
        criterion = aes[ae_index]['criteria'][i % len(aes[ae_index]['criteria'])]
        evidence, question, correct, *rest = _scenario(module, i)
        options, answer = _rotate(correct, rest[:3], i + 1)
        rows.append({
            'id': i,
            'stimulus': evidence,
            'question': f'Caso simulado {i + 1}: {question} Criterio de aprendizaje: «{criterion}».',
            'options': options,
            'answer': answer,
            'explanation': rest[3],
            'ae': ae_index,
            'criterion': criterion,
            'image': image,
            'alt': f'Evidencia contextual del módulo {module["title"]}; no contiene pistas sobre la alternativa correcta.',
            'caption': 'Evidencia de evaluación en contexto simulado.',
            'form': (i % 9) + 1,
            'skill': ['Interpretar', 'Relacionar', 'Aplicar', 'Verificar'][i % 4],
            'difficulty': ['Inicial', 'Intermedia', 'Avanzada'][i % 3],
        })
    return rows


def _formative(module, image):
    rows = []
    ae_count = max(1, len(module['aes']))
    for i in range(14):
        ae_index = i % ae_count
        criterion = module['aes'][ae_index]['criteria'][i % len(module['aes'][ae_index]['criteria'])]
        rows.append({
            'id': f'F{i + 1:02}', 'station': 3, 'kind': 'read',
            'label': f'Lectura de evidencia {i + 1}',
            'prompt': f'Localiza en el recurso el antecedente asociado a «{criterion}» y registra qué debes verificar.',
            'ae': ae_index,
            'criterion': criterion,
            'task': {
                'image': image,
                'video': None,
                'vtt': None,
                'spots': [], 'parts': [], 'steps': [], 'left': [], 'right': [],
                'extract': {'field': 'Dato o indicación visible', 'answer': ['protocolo', 'registro', 'criterio', 'indicación'], 'clue': 'Transcribe el dato y conserva su contexto.'},
                'cube': {}, 'keys': [], 'ok_ids': [],
            },
        })
    return rows


def _encargos(module, count):
    rows = []
    ae_count = max(1, len(module['aes']))
    for i in range(count):
        ae = i % ae_count + 1
        rows.append({
            'id': f'{module["position"]}.{i + 1:02}',
            'station': 2 if i % 2 == 0 else 3,
            'ae': ae,
            'minutes': 60,
            'title': f'Encargo de oficio {i + 1} · {module["title"]}',
            'prompt': 'Revisa el caso simulado, identifica un dato comprobable y redacta una decisión dentro de tu rol.',
            'product': 'Registro breve con evidencia, criterio aplicado, decisión segura y antecedente pendiente',
            'kind': ['document', 'read', 'procedure', 'reflect'][i % 4],
        })
    return {'count': count, 'hours': float(count), 'items': rows}


def _module(position, title, hp, aes, specialty_key, source, source_url, scope,
            practice=None, oa=None, year=None, plan_section=None):
    image = f'/static/headers/{specialty_key}/e3.png?v=3'
    module = {'position': position, 'title': title, 'aes': aes, 'specialty_key': specialty_key}
    oa = deepcopy(oa or [])
    content = {
        'specialty_key': specialty_key,
        'specialty': {'electricidad': 'Electricidad', 'enfermeria': 'Atención de Enfermería', 'climate': 'Refrigeración y Climatización'}.get(specialty_key, 'Especialidad TP'),
        'specialty_source': {
            'pdf': source, 'url': source_url, 'official_hp': hp, 'title': title,
            'scope': scope, 'decree': 'Decreto Supremo N° 452/2013',
            'oa': oa, 'year': year, 'plan_section': plan_section,
            'official_ae_count': len(aes),
        },
        'context': f'En un entorno formativo de {title}, recibes un caso simulado asociado a los OA y AE oficiales del módulo, con registros, indicaciones y un antecedente incompleto. Debes observar, aplicar el aprendizaje esperado, resguardar la seguridad y explicar qué debe verificarse antes de actuar.',
        'case_title': title,
        'application': 'En situaciones formativas y laborales simuladas, respetando protocolos, autorización, supervisión y límites del rol técnico.',
        'reflection_prompt': '¿Qué dato revisarías primero, qué criterio aplicarías y qué situación deberías escalar a una persona autorizada?',
        'aes': deepcopy(aes),
        'rubric': [
            {'name': 'Identificación de evidencia', 'max': 5},
            {'name': 'Aplicación del criterio técnico', 'max': 5},
            {'name': 'Seguridad y límites del rol', 'max': 5},
            {'name': 'Decisión justificada', 'max': 5},
            {'name': 'Registro y verificación', 'max': 5},
        ],
        'development': f'Analiza un caso simulado de {title}. Identifica la evidencia disponible, relaciónala con los aprendizajes esperados oficiales del módulo, explica una decisión segura dentro del rol técnico, señala qué antecedente falta y describe cómo debería verificarse bajo supervisión antes de cerrar el registro.',
        'practice': practice or {'type': 'measurement', 'title': f'Práctica libre · {title}', 'unit': 'registro', 'values': [1, 2, 3], 'reference': [1, 3]},
        'curriculum': {
            'label': f'Programa de Estudio MINEDUC · {title}', 'url': source_url,
            'pdf': source, 'status': scope + ' Las situaciones y datos de esta simulación son adaptaciones didácticas locales.',
            'consulted': '2026-09-21',
        },
        'scene': {
            'title': f'Recorrido espacial interactivo · {title}',
            'prompt': 'Inspecciona cada punto del escenario, relaciona la evidencia con los AE oficiales del módulo y redacta una conclusión que distinga lo verificado de lo pendiente.',
            'parts': [
                {'id': 'evidencia', 'label': 'EVIDENCIA', 'value': 'Revisar', 'detail': 'Identifica el dato observable y conserva su fuente.'},
                {'id': 'criterio', 'label': 'CRITERIO', 'value': 'Aplicar', 'detail': 'Relaciona la evidencia con el criterio y el protocolo del caso.'},
                {'id': 'resguardo', 'label': 'RESGUARDO', 'value': 'Confirmar', 'detail': 'Declara el límite del rol y la supervisión requerida.'},
                {'id': 'registro', 'label': 'REGISTRO', 'value': 'Cerrar', 'detail': 'Comunica decisión, evidencia y pendiente de manera trazable.'},
            ],
            'image': image, 'media_kind': 'interactive-procedure',
            'caption': 'Recorrido formativo. No reemplaza prácticas presenciales, protocolos institucionales ni supervisión profesional.',
            'alt': f'Escenario profesional simulado de {title} con cuatro puntos de inspección.',
        },
        'agent_hints': [
            'Separa el dato visible de lo que todavía requiere confirmación.',
            'Relaciona tu decisión con el AE y con el criterio presentado.',
            'Explica el resguardo de seguridad, privacidad o supervisión que corresponde.',
        ],
        'version': 'especialidades-mineduc-v3',
    }
    if specialty_key == 'electricidad':
        content['regulatory_resource'] = {
            'label': 'SEC · Pliegos Técnicos Normativos RIC',
            'url': SEC_RIC_URL,
            'instruction': 'Consulta el RIC antes de tomar una decisión cuando el caso requiera aplicar normativa eléctrica.',
        }
        for item in content['aes']:
            item['lesson'].append('Cuando la decisión dependa de normativa eléctrica, consulta el RIC aplicable antes de responder.')
    module['aes'] = content['aes']
    content['cases'] = _cases(module, image)
    content['questions'] = _questions(module, f'/static/headers/{specialty_key}/e4.png?v=3')
    content['formative_pack'] = _formative(module, image)
    content['encargos'] = _encargos(module, max(12, min(38, round(hp / 6))))
    from technical_sources import governance
    content['technical_validation'] = governance(specialty_key, source_url, source)
    return content


ELECTRICITY_MODULES = [
    ('Instalación de motores eléctricos y equipos de calefacción', 152, [
        _ae('M1-AE1', 'Instala motores eléctricos en baja tensión, de acuerdo a los requerimientos y considerando la normativa eléctrica vigente.', ['Identifica requerimientos, placa y documentación del motor.', 'Selecciona canalización, conductores y protecciones según el proyecto.', 'Verifica la instalación desenergizada y registra pendientes antes de una puesta en servicio autorizada.']),
        _ae('M1-AE2', 'Instala equipos de calefacción en baja tensión, de acuerdo a los requerimientos y considerando la normativa eléctrica vigente.', ['Contrasta equipo, potencia y especificaciones del proyecto.', 'Organiza materiales y protecciones sin intervenir una instalación energizada.', 'Registra comprobaciones y solicita autorización para la puesta en servicio.']),
        _ae('M1-AE1-2', 'Integra la verificación documental de motores y equipos de calefacción antes de su puesta en servicio.', ['Relaciona plano, memoria y ficha del fabricante.', 'Distingue comprobación documental de ensayo energizado.', 'Comunica resultados, límites y acciones pendientes.']),
    ]),
    ('Instalaciones eléctricas domiciliarias', 228, [
        _ae('M2-AE1', 'Monta ductos y canalizaciones para instalación eléctrica domiciliaria, de acuerdo a los planos, al proyecto eléctrico y a la normativa vigente.', ['Interpreta trazados, cotas y canalizaciones del proyecto.', 'Selecciona elementos compatibles con el ambiente y uso.', 'Verifica continuidad del trazado y registra interferencias.']),
        _ae('M2-AE2', 'Realiza cableado y conexionado de conductores y componentes de una instalación eléctrica de alumbrado, de acuerdo a las especificaciones técnicas del proyecto.', ['Identifica circuitos, conductores y terminales en planos.', 'Organiza una secuencia de trabajo desenergizada y supervisada.', 'Comprueba identificación y trazabilidad sin energizar el circuito.']),
        _ae('M2-AE3', 'Instala tablero eléctrico y elementos de protección para una instalación de alumbrado, considerando la normativa vigente.', ['Relaciona tablero, circuitos y protecciones del proyecto.', 'Verifica rotulación, accesibilidad y antecedentes técnicos.', 'Registra pendientes antes de inspección y puesta en servicio.']),
    ]),
    ('Elaboración de proyectos eléctricos', 228, [
        _ae('M3-AE1', 'Utiliza sistemas computacionales para la ejecución de programas de diseño de circuitos eléctricos, de acuerdo a lo solicitado.', ['Organiza capas, símbolos y datos del proyecto.', 'Conserva versión, escala y trazabilidad del archivo.', 'Exporta una revisión identificada para control.']),
        _ae('M3-AE2', 'Dibuja circuitos eléctricos según las especificaciones y requerimientos de un proyecto, considerando la normativa eléctrica.', ['Interpreta la solicitud y la documentación disponible.', 'Representa circuitos, protecciones y referencias de forma coherente.', 'Revisa discrepancias y no declara conformidad sin verificación.']),
        _ae('M3-AE3', 'Dimensiona la cantidad de materiales para ejecutar circuitos, de acuerdo a planos, normativa y especificaciones técnicas.', ['Extrae cantidades desde planos y especificaciones.', 'Unifica unidades y evita duplicar elementos entre vistas.', 'Presenta cubicación trazable con supuestos y pendientes.']),
    ]),
    ('Mantenimiento de máquinas, equipos y sistemas eléctricos', 228, [
        _ae('M4-AE1', 'Realiza mantenimiento preventivo de equipos, máquinas y sistemas eléctricos para prevenir fallas y dar continuidad al servicio.', ['Interpreta pauta, historial y especificaciones.', 'Planifica bloqueo, verificación y resguardos con personal autorizado.', 'Registra hallazgos sin intervenir equipos energizados.']),
        _ae('M4-AE2', 'Realiza mantenimiento correctivo de equipos y sistemas eléctricos para restablecer o mejorar su funcionamiento.', ['Analiza informe de falla y evidencia disponible.', 'Distingue diagnóstico simulado de intervención real autorizada.', 'Verifica documentalmente la reparación y registra el resultado.']),
        _ae('M4-AE1-2', 'Comunica y verifica el cierre de una intervención de mantenimiento eléctrico.', ['Relaciona hallazgo, acción y evidencia.', 'Controla pendientes y autorización de puesta en servicio.', 'Elabora un informe técnico comprensible y trazable.']),
    ]),
]


CARE_BASIC = [
    _ae('MC-AE1', 'Atiende integralmente y con cuidados básicos de enfermería a pacientes y su familia según la etapa del ciclo vital.', ['Reconoce necesidades, derechos y plan de atención.', 'Mantiene trato digno, comunicación y privacidad.', 'Informa cambios al profesional responsable.']),
    _ae('MC-AE2', 'Ejecuta procedimientos de higiene y confort de acuerdo al plan de atención, respetando privacidad, pudor y protocolo.', ['Prepara el entorno y los insumos indicados.', 'Respeta autonomía, privacidad y prevención de riesgos.', 'Registra la atención realizada bajo supervisión.']),
    _ae('MC-AE3', 'Realiza actividades de prevención de alteraciones de las necesidades básicas, considerando calidad y derechos del paciente.', ['Identifica factores de riesgo observables.', 'Aplica medidas preventivas indicadas en el plan.', 'Comunica y registra oportunamente cambios o pendientes.']),
]

HEALTH_PARAMETERS = [
    _ae('MC2-AE1', 'Controla signos vitales de acuerdo a la indicación profesional, el plan de atención y la necesidad del paciente.', ['Verifica identidad, indicación y condiciones previas.', 'Selecciona y prepara el instrumento correspondiente.', 'Registra valor, unidad, hora y comunica alteraciones.']),
    _ae('MC2-AE2', 'Efectúa control de antropometría a pacientes pediátricos y adultos, cumpliendo normas y protocolo.', ['Prepara equipo, entorno y registro.', 'Conserva unidad, condiciones y privacidad.', 'Compara solo con el criterio entregado y comunica resultados.']),
    _ae('MC2-AE3', 'Organiza equipos, materiales e insumos para controlar signos vitales y antropometría.', ['Revisa integridad, limpieza y disponibilidad.', 'Ordena materiales según procedimiento y bioseguridad.', 'Identifica faltantes y evita usar equipos sin verificación.']),
]


def _electricity_course():
    scope = 'Ruta de cuatro módulos técnicos de tercero medio: 152, 228, 228 y 228 HP (836 HP oficiales).'
    modules = []
    for pos, (title, hp, aes) in enumerate(ELECTRICITY_MODULES, 1):
        modules.append({'title': title, 'position': pos, 'content': _module(pos, title, hp, aes, 'electricidad', MINEDUC_ELECTRICIDAD, MINEDUC_ELECTRICIDAD_URL, scope, {'type': 'equipment', 'title': f'Comprobador formativo · {title}', 'available': 24, 'required': 30})})
    return {'title': 'Electricidad', 'specialty': 'Electricidad', 'level': '3° medio', 'modules': modules}


def _adult_course():
    scope = 'Ruta de cuatro módulos seleccionados del plan común y de la mención Adulto Mayor. Total de la ruta: 532 HP oficiales.'
    data = [
        ('Aplicación de cuidados básicos', 228, CARE_BASIC),
        ('Medición y control de parámetros básicos en salud', 152, HEALTH_PARAMETERS),
        ('Necesidades psicosociales del adulto mayor', 76, [
            _ae('AM1-AE1', 'Aplica técnicas de comunicación efectiva para conocer características, habilidades, necesidades e intereses de las personas adultas mayores.', ['Usa escucha activa y lenguaje respetuoso.', 'Reconoce intereses sin infantilizar ni suponer.', 'Registra necesidades resguardando privacidad.']),
            _ae('AM1-AE2', 'Planifica actividades recreativas para el desarrollo integral del adulto mayor, de acuerdo a su motivación y condiciones de dependencia.', ['Relaciona intereses, autonomía y apoyos.', 'Selecciona recursos y resguardos pertinentes.', 'Evalúa participación y propone ajustes.']),
            _ae('AM1-AE1-2', 'Evalúa una actividad psicosocial y propone mejoras centradas en la persona adulta mayor.', ['Recoge evidencia de participación y bienestar.', 'Distingue preferencia personal de necesidad de apoyo.', 'Comunica mejoras al equipo responsable.']),
        ]),
        ('Orientación familiar para el cuidado del adulto mayor', 76, [
            _ae('AM2-AE1', 'Mantiene informada a la familia respecto del cuidado integral del adulto mayor y de las normas y protocolos institucionales.', ['Verifica qué información puede comunicar.', 'Usa lenguaje claro, respetuoso y sin diagnósticos propios.', 'Registra la comunicación según protocolo.']),
            _ae('AM2-AE2', 'Involucra y hace participar a la familia en el programa de mantención de las capacidades del adulto mayor.', ['Reconoce autonomía, preferencias y red de apoyo.', 'Propone acciones coherentes con el plan profesional.', 'Evalúa acuerdos y comunica dificultades.']),
            _ae('AM2-AE1-2', 'Organiza una comunicación trazable entre persona adulta mayor, familia y equipo de cuidado.', ['Resguarda consentimiento y privacidad.', 'Diferencia observación, interpretación e indicación profesional.', 'Define responsable, acuerdo y seguimiento.']),
        ]),
    ]
    modules = []
    for pos, (title, hp, aes) in enumerate(data, 1):
        modules.append({'title': title, 'position': pos, 'content': _module(pos, title, hp, aes, 'enfermeria', MINEDUC_ENFERMERIA, MINEDUC_ENFERMERIA_URL, scope)})
    return {'title': 'Atención de Enfermería, mención Adulto Mayor', 'specialty': 'Atención de Enfermería, mención Adulto Mayor', 'level': '3° y 4° medio', 'modules': modules}


def _nursing_course():
    scope = 'Ruta de cuatro módulos seleccionados del plan común y de la mención Enfermería. Total de la ruta: 836 HP oficiales.'
    data = [
        ('Aplicación de cuidados básicos', 228, CARE_BASIC),
        ('Medición y control de parámetros básicos en salud', 152, HEALTH_PARAMETERS),
        ('Técnicas básicas de enfermería y del Programa Nacional de Inmunizaciones', 228, [
            _ae('ENF1-AE1', 'Ejecuta indicaciones médicas para el tratamiento y rehabilitación de pacientes pediátricos y adultos hospitalizados, de acuerdo a protocolos.', ['Verifica identidad, indicación y supervisión profesional.', 'Prepara entorno e insumos conforme al protocolo.', 'Registra y comunica respuesta o evento observado.']),
            _ae('ENF1-AE2', 'Aplica acciones de vacunación de acuerdo al Programa Nacional de Inmunizaciones, bajo supervisión profesional.', ['Verifica indicación, identidad y cadena documental.', 'Reconoce resguardos, consentimiento y registro.', 'Informa eventos y completa trazabilidad bajo supervisión.']),
            _ae('ENF1-AE3-4', 'Refuerza indicaciones y colabora con el equipo de salud en situaciones simuladas, respetando protocolos y límites del rol.', ['Comunica indicaciones con claridad y confirma comprensión.', 'Reconoce signos de alerta del caso sin diagnosticar.', 'Escala oportunamente y registra la comunicación.']),
        ]),
        ('Atención en servicios de urgencia y primeros auxilios', 228, [
            _ae('ENF2-AE1', 'Vigila el contexto clínico de pacientes críticos o con procedimientos invasivos e informa posibles alteraciones.', ['Observa parámetros y condiciones indicadas.', 'Prioriza la comunicación según protocolo.', 'Registra hora, dato y profesional informado.']),
            _ae('ENF2-AE2', 'Colabora con el equipo de salud para brindar atención de urgencia a pacientes hospitalizados.', ['Reconoce funciones asignadas y cadena de mando.', 'Prepara recursos sin exceder competencias.', 'Mantiene seguridad, comunicación y registro.']),
            _ae('ENF2-AE3', 'Aplica atención básica de primeros auxilios como parte del equipo responsable, de acuerdo a normas y procedimientos.', ['Evalúa seguridad del entorno y solicita ayuda.', 'Sigue la secuencia indicada en el escenario supervisado.', 'Entrega información clara al equipo que continúa la atención.']),
        ]),
    ]
    modules = []
    for pos, (title, hp, aes) in enumerate(data, 1):
        modules.append({'title': title, 'position': pos, 'content': _module(pos, title, hp, aes, 'enfermeria', MINEDUC_ENFERMERIA, MINEDUC_ENFERMERIA_URL, scope)})
    return {'title': 'Atención de Enfermería, mención Enfermería', 'specialty': 'Atención de Enfermería, mención Enfermería', 'level': '3° y 4° medio', 'modules': modules}


def _official_aes(rows):
    """Convierte AE literales en contenido; la pauta didáctica no se rotula como CE oficial."""
    result = []
    for row in rows:
        item = _ae(row['code'], row['title'], [row['title']])
        item['official_title'] = row['title']
        item['criteria_origin'] = 'Indicador didáctico basado en la formulación literal del AE oficial.'
        result.append(item)
    return result


def _course_from_plan(title, specialty, specialty_key, plan, source, source_url):
    course_hp = sum(item['hp'] for item in plan)
    scope = (
        f'Plan completo de {specialty} para 3° y 4° medio: '
        f'{len(plan)} módulos y {course_hp} HP oficiales.'
    )
    modules = []
    for position, item in enumerate(plan, 1):
        aes = _official_aes(item['aes'])
        practice = None
        if specialty_key == 'electricidad':
            practice = {
                'type': 'equipment',
                'title': f'Comprobador formativo · {item["title"]}',
                'available': 24,
                'required': 30,
            }
        content = _module(
            position, item['title'], item['hp'], aes, specialty_key,
            source, source_url, scope, practice,
            oa=item['oa'], year=item['year'], plan_section=item['section'],
        )
        modules.append({'title': item['title'], 'position': position, 'content': content})
    return {'title': title, 'specialty': specialty, 'level': '3° y 4° medio', 'modules': modules}


def _official_electricity_course():
    return _course_from_plan(
        'Electricidad', 'Electricidad', 'electricidad', OFFICIAL_ELECTRICITY_MODULES,
        MINEDUC_ELECTRICIDAD, MINEDUC_ELECTRICIDAD_URL,
    )


def _official_adult_course():
    return _course_from_plan(
        'Atención de Enfermería, mención Adulto Mayor',
        'Atención de Enfermería, mención Adulto Mayor', 'enfermeria',
        [*NURSING_COMMON_MODULES, *ADULT_MENTION_MODULES],
        MINEDUC_ENFERMERIA, MINEDUC_ENFERMERIA_URL,
    )


def _official_nursing_course():
    return _course_from_plan(
        'Atención de Enfermería, mención Enfermería',
        'Atención de Enfermería, mención Enfermería', 'enfermeria',
        [*NURSING_COMMON_MODULES, *NURSING_MENTION_MODULES],
        MINEDUC_ENFERMERIA, MINEDUC_ENFERMERIA_URL,
    )


SPECIALTY_COURSES = [
    _official_electricity_course(),
    _official_adult_course(),
    _official_nursing_course(),
]


def install_specialty_courses(con):
    """Instala o actualiza solo contenido generado; conserva ediciones docentes y progreso."""
    import json
    from pedagogy import enrich

    version = 'especialidades-electricidad-enfermeria-v3'
    con.execute('CREATE TABLE IF NOT EXISTS content_updates(version TEXT PRIMARY KEY,applied TEXT DEFAULT CURRENT_TIMESTAMP)')
    if con.execute('SELECT 1 FROM content_updates WHERE version=?', (version,)).fetchone():
        return
    student = con.execute("SELECT id FROM users WHERE role='student' ORDER BY id LIMIT 1").fetchone()
    for course in SPECIALTY_COURSES:
        existing = con.execute('SELECT id FROM courses WHERE title=?', (course['title'],)).fetchone()
        if existing:
            course_id = existing['id']
            con.execute('UPDATE courses SET specialty=?,level=? WHERE id=?', (course['specialty'], course['level'], course_id))
        else:
            cur = con.execute('INSERT INTO courses(title,specialty,level) VALUES(?,?,?)', (course['title'], course['specialty'], course['level']))
            course_id = cur.lastrowid
        course_hp = sum(int(m['content']['specialty_source']['official_hp']) for m in course['modules'])
        course_question_total = len(course['modules']) * 5
        for module in course['modules']:
            found = con.execute('SELECT id,content FROM modules WHERE course_id=? AND position=?', (course_id, module['position'])).fetchone()
            content = deepcopy(module['content'])
            content['specialty_source'].update({
                'course_hp': course_hp,
                'question_count': 5,
                'course_question_total': course_question_total,
                'development_required': module['position'] == len(course['modules']),
                'evaluation_note': 'Cada módulo utiliza cinco preguntas; el último incorpora además un desarrollo integrador.',
            })
            enrich(content, module['position'])
            serialized = json.dumps(content, ensure_ascii=False)
            if found:
                previous = json.loads(found['content'] or '{}')
                if previous.get('version') not in ('especialidades-mineduc-v1', 'especialidades-mineduc-v2', 'especialidades-mineduc-v3'):
                    continue
                if con.execute('SELECT 1 FROM progress WHERE module_id=? LIMIT 1', (found['id'],)).fetchone():
                    continue
                con.execute(
                    'UPDATE modules SET title=?,published=1,content=? WHERE id=?',
                    (module['title'], serialized, found['id']),
                )
            else:
                con.execute(
                    'INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                    (course_id, module['title'], module['position'], 1, serialized),
                )
        if student:
            con.execute('INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)', (student['id'], course_id))
    con.execute('INSERT INTO content_updates(version) VALUES(?)', (version,))


def publish_unpublished_electricity(con):
    """Fill the Electricidad stub that the versioned installer skipped."""
    import json
    from pedagogy import enrich, publication_gaps

    course = _official_electricity_course()
    row = con.execute('SELECT id FROM courses WHERE title=?', (course['title'],)).fetchone()
    if not row:
        return
    course_id = row['id']
    course_hp = sum(int(m['content']['specialty_source']['official_hp']) for m in course['modules'])
    course_question_total = len(course['modules']) * 5
    for module in course['modules']:
        found = con.execute(
            'SELECT id,published FROM modules WHERE course_id=? AND position=?',
            (course_id, module['position']),
        ).fetchone()
        if found and found['published']:
            continue
        content = deepcopy(module['content'])
        content['specialty_source'].update({
            'course_hp': course_hp,
            'question_count': 5,
            'course_question_total': course_question_total,
            'development_required': module['position'] == len(course['modules']),
            'evaluation_note': 'Cada módulo utiliza cinco preguntas; el último incorpora además un desarrollo integrador.',
        })
        enrich(content, module['position'])
        gaps = publication_gaps(content, course['title'])
        if gaps:
            raise ValueError(f'Electricidad módulo {module["position"]} no publicable: {gaps[:3]}')
        serialized = json.dumps(content, ensure_ascii=False)
        if found:
            con.execute(
                'UPDATE modules SET title=?,published=1,content=? WHERE id=?',
                (module['title'], serialized, found['id']),
            )
        else:
            con.execute(
                'INSERT INTO modules(course_id,title,position,published,content) VALUES(?,?,?,?,?)',
                (course_id, module['title'], module['position'], 1, serialized),
            )
