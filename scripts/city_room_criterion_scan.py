"""Conservative, reproducible resource screening against module criteria and PDFs.

This identifies explicit nouns, not a claim of exhaustive disciplinary review.
No equipment is inferred from a generic safety/procedure requirement.
"""
import re
import unicodedata
from collections import Counter


def normalized(value):
    return re.sub(r'\s+', ' ', ''.join(c for c in unicodedata.normalize('NFD', str(value)).lower()
                                     if unicodedata.category(c) != 'Mn')).strip()


def compact(value):
    return re.sub(r'[^a-z0-9]', '', normalized(value))


# Canonical resource | category | model family | exact phrase variants.
# Variants must occur in a criterion that is itself found in the official PDF.
VOCABULARY = '''
Multimetro|tools|meter|multimetro,multimetros,multitester
Voltimetro|tools|meter|voltimetro,voltimetros
Amperimetro|tools|meter|amperimetro,amperimetros
Ohmetro|tools|meter|ohmetro,ohmetros
Osciloscopio|tools|scope|osciloscopio,osciloscopios
Manometro|tools|gauge|manometro,manometros
Vacuometro|tools|gauge|vacuometro,vacuometros
Termometro|tools|thermometer|termometro,termometros
Termocupla|tools|probe|termocupla,termocuplas
Calibrador Vernier|tools|caliper|pie de metro,pies de metro,vernier
Micrometro|tools|caliper|micrometro,micrometros
Comparador de caratula|tools|gauge|reloj comparador,comparador de caratula
Torquimetro|tools|wrench|torquimetro,torquimetros,llave de torque
Llave dinamometrica|tools|wrench|llave dinamometrica,llaves dinamometricas
Balanza|tools|balance|balanza,balanzas
Bascula|tools|balance|bascula,basculas
Microscopio|tools|microscope|microscopio,microscopios
Refractometro|tools|probe|refractometro,refractometros
Densimetro|tools|probe|densimetro,densimetros
Medidor de pH|tools|meter|phmetro,phmetros,pH-metro,medidor de ph
Conductimetro|tools|meter|conductimetro,conductimetros
Espectrofotometro|equipment|scope|espectrofotometro,espectrofotometros
Teodolito|tools|survey|teodolito,teodolitos
Estacion total|tools|survey|estacion total,estaciones totales
Nivel topografico|tools|survey|nivel topografico,niveles topograficos
GPS|tools|meter|gps
Brujula|tools|gauge|brujula,brujulas
Cinta metrica|tools|tape|cinta metrica,cintas metricas,huincha de medir
Escuadra|tools|square|escuadra,escuadras
Compas|tools|caliper|compas,compases
Cronometro|tools|timer|cronometro,cronometros
Higrometro|tools|humiditymeter|higrometro,higrometros,medidor de humedad
Motor electrico|equipment|motor|motor electrico,motores electricos
Motor de combustion interna|equipment|motor|motor de combustion interna,motores de combustion interna
Motor a gasolina|equipment|piston|motor a gasolina,motores a gasolina
Motor diesel|equipment|piston|motor diesel,motores diesel
Motor paso a paso|equipment|stepper|motor paso a paso,motores paso a paso
Servomotor|equipment|servo|servomotor,servomotores
Driver de control de posicion y velocidad|equipment|controller|driver de control de posicion y velocidad
Plastigaje|materials|strip|plastigaje
Generador|equipment|motor|generador electrico,generadores electricos
Transformador|equipment|transformer|transformador,transformadores
Lavamanos|equipment|sink|lavamanos,lavamanos clinico,estacion de lavado
Dispensador de jabon|equipment|dispenser|dispensador de jabon,dispensadores de jabon
Contenedor de muestras|materials|sample-container|contenedor de muestras,recipiente para muestras,frascos para muestras
Etiquetadora|equipment|labeler|etiquetadora,etiquetadoras,maquina etiquetadora
Etiqueta de alimentos|materials|label|etiqueta de alimentos,etiquetas de alimentos,rotulo de alimentos
Desfibrilador externo automatico|equipment|defibrillator|desfibrilador externo automatico,dea
Contactor|equipment|control|contactor,contactores
Rele|equipment|control|rele,reles
PLC|equipment|controller|plc,controlador logico programable,controladores logicos programables
Variador de frecuencia|equipment|controller|variador de frecuencia,variadores de frecuencia
Tablero electrico|equipment|control|tablero electrico,tableros electricos
Interruptor automatico|equipment|control|interruptor automatico,interruptores automaticos
Interruptor diferencial|equipment|control|interruptor diferencial,interruptores diferenciales
Panel solar|equipment|solar|panel solar,paneles solares,panel fotovoltaico,paneles fotovoltaicos
Bateria|equipment|battery|bateria,baterias
Soldadora|equipment|welder|soldadora,soldadoras,maquina de soldar,equipo de soldadura
Cautin|tools|probe|cautin,cautines
Taladro|tools|drill|taladro,taladros
Esmeril|equipment|grinder|esmeril,esmeriles
Torno|equipment|lathe|torno,tornos
Fresadora|equipment|mill|fresadora,fresadoras
Sierra circular|equipment|saw|sierra circular,sierras circulares
Sierra de cinta|equipment|saw|sierra de cinta,sierras de cinta
Cepilladora|equipment|mill|cepilladora,cepilladoras
Lijadora|tools|grinder|lijadora,lijadoras
Prensa hidraulica|equipment|press|prensa hidraulica,prensas hidraulicas
Compresor|equipment|compressor|compresor,compresores
Bomba de vacio|equipment|pump|bomba de vacio,bombas de vacio
Bomba hidraulica|equipment|pump|bomba hidraulica,bombas hidraulicas
Bomba centrifuga|equipment|pump|bomba centrifuga,bombas centrifugas
Bomba de combustible|equipment|pump|bomba de combustible,bombas de combustible
Bomba de aceite|equipment|pump|bomba de aceite,bombas de aceite
Radiador de aceite|equipment|radiator|radiador de aceite,radiadores de aceite
Magneto|equipment|motor|magneto,magnetos
Caja de accesorios|equipment|motor|caja de accesorios,cajas de accesorios
Valvula|equipment|valve|valvula,valvulas
Evaporador|equipment|radiator|evaporador,evaporadores
Condensador de refrigeracion|equipment|radiator|condensador de refrigeracion,condensadores de refrigeracion
Intercambiador de calor|equipment|radiator|intercambiador de calor,intercambiadores de calor
Router|digital|network|router,routers,enrutador,enrutadores
Switch de red|digital|network|switch,switches,conmutador de red
Punto de acceso inalambrico|digital|network|access point,punto de acceso inalambrico,puntos de acceso inalambricos
Servidor|digital|server|servidor,servidores
Antena|equipment|antenna|antena,antenas
Fibra optica|materials|cable|fibra optica,fibras opticas
Cable UTP|materials|cable|cable utp,cables utp,cableado utp
Patch panel|equipment|network|patch panel,panel de parcheo
Certificador de redes|tools|meter|certificador de redes,certificador de cableado
Computador|digital|computer|computador,computadores,computadora,computadoras
Tarjeta madre|equipment|circuitboard|tarjeta madre,tarjetas madre,placa madre,placas madre
Memoria RAM|equipment|memory|ram,memoria ram
Disco duro|equipment|drive|disco duro,discos duros
Fuente de poder|equipment|powersupply|fuente de poder,fuentes de poder
Teclado|digital|keyboard|teclado,teclados
Monitor|digital|monitor|monitor,monitores
Impresora|digital|printer|impresora,impresoras
Escaner|digital|printer|escaner,escaneres
Proyector|digital|projector|proyector,proyectores
Planilla de calculo|digital|computer|planilla de calculo,planillas de calculo
Software CAD|digital|computer|autocad,software cad
Maquina de coser|equipment|sewing|maquina de coser,maquinas de coser
Maquina botonera|equipment|sewing|botonera,botoneras
Maquina ojaladora|equipment|sewing|ojaladora,ojaladoras
Overlock|equipment|sewing|overlock,overl ock
Plancha|equipment|iron|plancha de vapor,plancha electrica,planchas electricas
Maniqui|equipment|mannequin|maniqui,maniquies
Tijera|tools|scissors|tijera,tijeras
Horno|equipment|oven|horno,hornos
Cocina|equipment|stove|cocina industrial,cocinas industriales
Batidora|equipment|mixer|batidora,batidoras
Amasadora|equipment|mixer|amasadora,amasadoras
Licuadora|equipment|mixer|licuadora,licuadoras
Refrigerador|equipment|fridge|refrigerador,refrigeradores
Congelador|equipment|fridge|congelador,congeladores
Olla|equipment|pot|olla,ollas
Sarten|equipment|pan|sarten,sartenes
Cuchillo|tools|knife|cuchillo,cuchillos
Tabla de corte|equipment|board|tabla de corte,tablas de corte
Termometro clinico|tools|thermometer|termometro clinico,termometros clinicos
Esfigmomanometro|tools|gauge|esfigmomanometro,esfigmomanometros
Fonendoscopio|tools|stethoscope|fonendoscopio,fonendoscopios,estetoscopio,estetoscopios
Oximetro|tools|meter|oximetro,oximetros
Glucometro|tools|meter|glucometro,glucometros
Camilla|equipment|bed|camilla,camillas
Cama clinica|equipment|bed|cama clinica,camas clinicas
Silla de ruedas|equipment|wheelchair|silla de ruedas,sillas de ruedas
Jeringa|materials|syringe|jeringa,jeringas
Autoclave|equipment|autoclave|autoclave,autoclaves
Guantes|protection|gloves|guantes
Elementos de proteccion personal|protection|ppe-set|elementos de proteccion personal,epp
Vestuario de trabajo|protection|uniform|vestuario de trabajo,uniforme de trabajo,uniformes de trabajo
Antiparras|protection|goggles|antiparras,gafas de seguridad,lentes de seguridad
Casco de seguridad|protection|helmet|casco de seguridad,cascos de seguridad
Protector auditivo|protection|headset|protector auditivo,protectores auditivos,proteccion auditiva
Respirador|protection|respirator|respirador,respiradores
Extintor|protection|extinguisher|extintor,extintores
Arnes de seguridad|protection|harness|arnes de seguridad,arneses de seguridad
Pipeta|tools|glassware|pipeta,pipetas
Bureta|tools|glassware|bureta,buretas
Probeta graduada|tools|glassware|probeta graduada,probetas graduadas
Picnometro|tools|glassware|picnometro,picnometros
Matraz|tools|glassware|matraz,matraces
Vaso de precipitado|tools|glassware|vaso de precipitado,vasos de precipitados,vasos de precipitado
Mechero|equipment|burner|mechero,mecheros
Mufla|equipment|oven|mufla,muflas
Centrifuga|equipment|centrifuge|centrifuga,centrifugas
Decantador|equipment|tank|decantador,decantadores
Hidrociclon|equipment|cyclone|hidrociclon,hidrociclones
Filtro prensa|equipment|filterpress|filtro prensa,filtros prensa
Estufa de secado|equipment|oven|estufa de secado,estufas de secado
Campana extractora|equipment|hood|campana extractora,campanas extractoras
Tamiz|tools|sieve|tamiz,tamices
Trituradora|equipment|crusher|trituradora,trituradoras,chancador,chancadores
Molino|equipment|mill|molino,molinos
Correa transportadora|equipment|conveyor|correa transportadora,correas transportadoras,cinta transportadora
Motosierra|tools|chainsaw|motosierra,motosierras
Tractor|equipment|tractor|tractor,tractores
Pulverizador|equipment|sprayer|pulverizador,pulverizadores
Sembradora|equipment|tractor|sembradora,sembradoras
Red de pesca|equipment|net|red de pesca,redes de pesca
Radar de navegacion|equipment|marine-scope|radar,radares
Girocompas|tools|gauge|girocompas
Ecosonda|equipment|marine-scope|ecosonda,ecosondas
Sonar|equipment|marine-scope|sonar,sonares
Taquimetro|tools|survey|taquimetro,taquimetros
Nivel de agua|tools|tube|nivel de agua,niveles de agua
Flexometro|tools|tape|flexometro,flexometros
Chaleco salvavidas|protection|lifejacket|chaleco salvavidas,chalecos salvavidas
Equipo de respiracion autonoma|protection|respirator|equipo de respiracion autonoma,equipos de respiracion autonoma
Plano tecnico|documents|document|plano tecnico,planos tecnicos,plano de montaje,planos de montaje
Ficha tecnica|documents|document|ficha tecnica,fichas tecnicas
Manual del fabricante|documents|document|manual del fabricante,manuales del fabricante,manual de fabricacion
Manual de mantenimiento|documents|document|manual de mantenimiento,manuales de mantenimiento
Orden de trabajo|documents|document|orden de trabajo,ordenes de trabajo
Registro de inspeccion|documents|document|registro de inspeccion,registros de inspeccion
Hoja de seguridad|documents|document|hoja de seguridad,hojas de seguridad,ficha de seguridad
Contrato de trabajo|documents|document|contrato de trabajo,contratos de trabajo,contratos laborales
Liquidacion de remuneraciones|documents|document|liquidacion de remuneraciones,liquidaciones de remuneraciones
Balance contable|documents|document|balance general,balances generales,balance contable
Factura|documents|document|factura,facturas
Orden de compra|documents|document|orden de compra,ordenes de compra
Guia de despacho|documents|document|guia de despacho,guias de despacho
Inventario|documents|document|registro de inventario,registros de inventario
Planilla HACCP|documents|document|planilla haccp,planillas haccp,registro haccp
Diagrama de flujo de proceso|documents|document|diagrama de flujo del proceso,diagrama de flujo del producto,diagramas de flujo
Ficha de control de temperatura|documents|document|planilla de control de temperatura,registro de temperatura,registros de temperatura
'''


def rules():
    result = []
    for line in VOCABULARY.strip().splitlines():
        name, category, family, variants = line.split('|')
        pattern = re.compile(r'(?<!\w)(?:' + '|'.join(re.escape(normalized(v)) for v in variants.split(',')) + r')(?!\w)')
        result.append((name, category, 'catalog-' + family, pattern))
    return result


def contextual_model(name, model, specialty):
    if name == 'Compas' and re.search(r'pesqueria|naves', normalized(specialty)):
        return 'catalog-gauge'
    if name == 'Bateria' and re.search(r'programacion|conectividad', normalized(specialty)):
        return 'catalog-cell'
    return model


def criterion_pages(criterion, pages):
    text = compact(re.sub(r'^\s*\d+\.\d+\s*', '', criterion))
    if len(text) < 40:
        return []
    # Two independent anchors reduce matches to an unrelated module in the same PDF.
    return [index + 1 for index, page in enumerate(pages)
            if text[:min(100, len(text))] in page and text[-min(60, len(text)):] in page]


def screen(inventories, root):
    import pymupdf
    documents, vocabulary = {}, rules()
    counts = Counter()
    for mid, entry in inventories.items():
        if entry.get('curriculum_audit', {}).get('status') == 'reviewed_virtual_representation':
            continue
        pdf = entry.get('pdf')
        if pdf not in documents:
            with pymupdf.open(root / pdf) as document:
                documents[pdf] = [compact(page.get_text()) for page in document]
        audit, existing = [], {normalized(item['name']): item for item in entry['resources']}
        # Split concrete objects in bundled activity lists, but never turn a manual,
        # photograph or video about a machine into a physical machine requirement.
        for bundled in list(entry['resources']):
            name = normalized(bundled['name'])
            if bundled['category'] == 'documents' or re.search(r'\b(manual|manuales|video|videos|fotografia|fotografias|catalogo|catalogos|ficha|fichas|guia|guias|texto|textos)\b', name):
                continue
            for canonical, category, model, pattern in vocabulary:
                model = contextual_model(canonical, model, entry['specialty'])
                match = pattern.search(name)
                if not match:
                    continue
                pages = [ref['pdf_page'] for ref in bundled['references']
                         if compact(match.group()) in documents[pdf][ref['pdf_page'] - 1]]
                if not pages:
                    continue
                item = existing.get(normalized(canonical))
                if item is None:
                    item = {'name': canonical, 'category': category, 'model': model, 'criteria': [], 'references': []}
                    entry['resources'].append(item)
                    existing[normalized(canonical)] = item
                    counts['added_activity_objects'] += 1
                elif not item.get('model'):
                    item['model'] = model
                ref = {'pdf_page': pages[0], 'matched_by': 'verified_activity_resource_noun',
                       'source_phrase': match.group()}
                if ref not in item['references']:
                    item['references'].append(ref)
        for ai, ae in enumerate(entry.get('learning_outcomes', []), 1):
            for ci, raw in enumerate(ae.get('criteria', []), 1):
                criterion = raw if isinstance(raw, str) else raw.get('text', '')
                code_match = re.match(r'^\s*(\d+\.\d+)\b', criterion)
                code = code_match.group(1) if code_match else f'{ai}.{ci}'
                pages = criterion_pages(criterion, documents[pdf])
                record = {'code': code, 'ae': ae.get('code') or f'AE {ai}',
                          'source_verified': bool(pages), 'pdf_pages': pages, 'resources': []}
                if pages:
                    for name, category, model, pattern in vocabulary:
                        model = contextual_model(name, model, entry['specialty'])
                        match = pattern.search(normalized(criterion))
                        if not match:
                            continue
                        # Also require the concrete noun in the same source page.
                        pages_with_noun = [page for page in pages if compact(match.group()) in documents[pdf][page - 1]]
                        if not pages_with_noun:
                            continue
                        item = existing.get(normalized(name))
                        if item is None:
                            item = {'name': name, 'category': category, 'model': model,
                                    'criteria': [], 'references': []}
                            entry['resources'].append(item)
                            existing[normalized(name)] = item
                            counts['added_resources'] += 1
                        if code not in item.setdefault('criteria', []):
                            item['criteria'].append(code)
                        reference = {'pdf_page': pages_with_noun[0], 'criteria': [code],
                                     'matched_by': 'source_verified_criterion_noun', 'source_phrase': match.group()}
                        if reference not in item['references']:
                            item['references'].append(reference)
                        if not item.get('model'):
                            item['model'] = model
                        record['resources'].append(item['name'])
                record['status'] = 'explicit_resources_linked' if record['resources'] else (
                    'requires_disciplinary_review' if pages else 'requires_source_review')
                audit.append(record)
                counts[record['status']] += 1
        entry['curriculum_audit'] = {'status': 'source_screened_requires_disciplinary_review',
            'scope': 'Explicit resource nouns in module criteria, checked against the official PDF',
            'criteria': audit,
            'limitations': 'No acredita equipamiento exhaustivo, certificacion ni simulacion operativa. La revision disciplinar sigue pendiente.'}
        counts['modules_screened'] += 1
    return dict(counts)


def resource_design(item, row):
    category = item.get('category', 'equipment')
    model = item.get('model')
    zones = {
        'protection': 'Muro de EPP y seguridad, junto a la salida del puesto',
        'tools': 'Panel de herramientas o carro, al costado del banco práctico',
        'documents': 'Atril o biblioteca técnica en el borde del área de trabajo',
        'digital': 'Puesto tecnológico con pantalla y conectividad',
        'materials': 'Almacenamiento rotulado y mesa de preparación',
        'equipment': 'Estación de práctica o banco principal, dejando libre el pasillo',
    }
    zone = zones.get(category, zones['equipment'])
    if model and category not in ('documents', 'digital', 'protection', 'tools'):
        function = f'Modelo 3D de {item["name"]}; apoyo para reconocer componentes y decisiones del módulo.'
    elif category == 'protection':
        function = 'Reconocer selección, inspección y uso seguro del recurso indicado en la fuente.'
    elif category == 'tools':
        function = 'Identificar el instrumento, su selección y el procedimiento de uso o verificación.'
    elif category == 'documents':
        function = 'Consultar, interpretar o registrar información técnica del procedimiento.'
    elif category == 'digital':
        function = 'Consultar, configurar o producir información digital según la actividad citada.'
    elif category == 'materials':
        function = 'Preparar y organizar insumos para ejecutar la actividad citada.'
    else:
        function = 'Representar el puesto o recurso profesional descrito por el programa.'

    refs = item.get('references', [])
    criteria = set(item.get('criteria', []))
    for audit in row.get('curriculum_audit', {}).get('criteria', []):
        if item.get('name') in audit.get('resources', []):
            criteria.add(audit.get('code'))
    direct = bool(criteria)
    priority = 'Indispensable' if direct else ('Recomendable' if refs else 'Complementario')
    activities = sorted({ref.get('activity', '').strip() for ref in refs if ref.get('activity', '').strip()})
    pages = sorted({ref.get('pdf_page') for ref in refs if ref.get('pdf_page')})
    actions = {
        'protection': 'seleccionar e inspeccionar el EPP adecuado',
        'tools': 'seleccionar el instrumento e interpretar su lectura',
        'equipment': 'inspeccionar componentes y elegir el procedimiento',
        'digital': 'consultar o configurar la herramienta digital',
        'documents': 'abrir y consultar la documentación',
        'materials': 'identificar y preparar el insumo',
    }
    return {
        'criteria': sorted(criteria), 'priority': priority, 'zone': zone,
        'function': function, 'activities': activities, 'pages': pages,
        'interactive': (f'Propuesta: {actions.get(category, actions["equipment"])}. Actual: representación visual, sin manipulación.'
                       if model else 'No requiere manipulación 3D según la evidencia disponible; recurso de referencia visual.'),
        'mission': ('Referencia visual para una mision si la actividad citada lo requiere; la interaccion se conserva en la mision existente.'
                    if activities else 'Contexto profesional; no se declara accion de mision sin evidencia en la fuente.'),
        'source_basis': 'Criterio evaluativo con el nombre del recurso' if direct else 'Recurso sugerido en actividad oficial',
    }


def _md(value):
    return re.sub(r'\s+', ' ', str(value or '')).replace('|', '\\|').strip()


def _criteria_rows(row):
    result = []
    for index, ae in enumerate(row.get('learning_outcomes', []), 1):
        for criterion_index, raw in enumerate(ae.get('criteria', []), 1):
            text = raw if isinstance(raw, str) else raw.get('text', '')
            match = re.match(r'^\s*(\d+\.\d+)\b', text)
            code = match.group(1) if match else f'{index}.{criterion_index}'
            result.append((code, ae.get('code') or f'AE {index}', ae.get('title', ''),
                           re.sub(r'^\s*\d+\.\d+\s*', '', text)))
    return result


def _objectives_text(row):
    objectives = row.get('objectives', [])
    if not objectives:
        return 'No transcrito en el registro del módulo; revisar el programa oficial.'
    return '; '.join(
        f'{objective.get("code", "OA")}: {objective.get("title", "")}' if isinstance(objective, dict)
        else str(objective)
        for objective in objectives
    )


def _room_type(row):
    specialty = normalized(row.get('specialty', ''))
    title = normalized(row.get('module_title', ''))
    if 'acuicultura' in specialty:
        if re.search(r'reproduct|desove|larv|semilla', title):
            return 'Hatchery: estanques de reproductores y larvas, incubación/muestreo y control de parámetros, con circulación perimetral.'
        if re.search(r'seguridad|riesgo|emergencia', title):
            return 'Área de producción acuícola con punto de seguridad, EPP, respuesta a emergencias y acceso despejado.'
        if re.search(r'sistema|equipo|maquinaria|operaci[oó]n', title):
            return 'Sala técnica acuícola: bombas, filtración, conducción de agua y puesto de control, según recursos citados.'
        if re.search(r'cosecha|engorde|cultivo|subacu[aá]t', title):
            return 'Área de cultivo acuícola con estanques o jaulas de referencia, puesto de control y zona de manejo seguro.'
    if 'gastronomia' in specialty:
        if re.search(r'higiene|bioseguridad|limpieza', title):
            return 'Cocina de práctica con estación de lavado de manos, sanitización de superficies y control de higiene.'
        if re.search(r'recepci[oó]n|almacenamiento|bodega', title):
            return 'Zona de recepción y almacenamiento de alimentos con separación de insumos, conservación y registro.'
        if re.search(r'pasteler|reposter|panader', title):
            return 'Taller de pastelería y repostería con área de pesado, preparación, horneado, enfriado y limpieza.'
        if re.search(r'comedores|bares|salones|servicio', title):
            return 'Área de servicio gastronómico con estación de despacho, montaje, atención y circulación de comensales.'
        return 'Cocina de producción con estaciones de preparación, cocción, control de higiene y almacenamiento de insumos.'
    if 'elaboracion industrial de alimentos' in specialty:
        if re.search(r'higiene|bioseguridad|limpieza', title):
            return 'Zona higiénica de planta con lavamanos, sanitización y separación de flujos limpios y sucios.'
        if re.search(r'calidad|control|registro|laboratorio', title):
            return 'Laboratorio de control de calidad con muestreo, medición, registro y trazabilidad de lotes.'
        if re.search(r'desecho|residuo', title):
            return 'Zona de segregación y manejo de residuos de planta, con rutas de salida y punto de seguridad.'
        return 'Línea de proceso alimentario con preparación, operación de equipos, control de parámetros y flujo de materiales.'
    if 'enfermeria' in specialty:
        if re.search(r'medici[oó]n|par[aá]metros|signos vitales', title):
            return 'Puesto clínico de control de signos vitales con camilla/silla, instrumentos y registro al alcance.'
        if re.search(r'higiene|bioseguridad|infecciones', title):
            return 'Unidad de paciente para higiene y prevención de infecciones, con zona limpia/sucia y acceso a EPP.'
        if re.search(r'urgencia|primeros auxilios', title):
            return 'Área de urgencias y primeros auxilios con acceso a camilla, insumos de respuesta y circulación de traslado.'
        if re.search(r'preparaci[oó]n del entorno|cuidados b[aá]sicos|higiene y confort', title):
            return 'Unidad de paciente con cama clínica, superficies de apoyo, privacidad y punto de higiene.'
        if re.search(r'registro|informaci[oó]n', title):
            return 'Estación de enfermería para registro clínico, consulta de protocolos y comunicación del equipo.'
    if 'programacion' in specialty or 'conectividad y redes' in specialty:
        if re.search(r'ensamblad|hardware|configuraci[oó]n de equipos', title):
            return 'Laboratorio de hardware con mesas antiestáticas, estaciones de componentes y área de pruebas.'
        if re.search(r'redes|conectividad|seguridad en redes', title):
            return 'Laboratorio de redes con racks, panel de parcheo, puestos terminales y zona de diagnóstico.'
        return 'Laboratorio de desarrollo con puestos informáticos, software y área de revisión de código o datos.'
    if 'atencion de parvulos' in specialty:
        return 'Sala educativa de párvulos con zonas de actividad, higiene, descanso y circulación segura según el módulo.'
    rules = [
        (r'aeronave|mecanica|metal|montaje|automotriz', 'Taller técnico de la especialidad; banco de mantenimiento y área de inspección.'),
        (r'gastronomia|alimentos', 'Cocina o planta de elaboración; preparación, higiene, cocción y almacenamiento según el módulo.'),
        (r'enfermeria|parvulos', 'Sala de atención o ambiente educativo simulado, según los procedimientos del módulo.'),
        (r'quimica|laboratorio', 'Laboratorio o área de proceso; separar preparación, medición y seguridad según la actividad.'),
        (r'conectividad|redes|programacion|telecomunicaciones', 'Laboratorio tecnológico; puestos informáticos, red y área de pruebas.'),
        (r'agropecuaria|acuicultura|forestal|pesqueria|geologia|minera|portuarias|naves', 'Ambiente de terreno, producción o cubierta técnica; organizar por actividad y circulación.'),
        (r'construccion|sanitarias|dibujo tecnico|muebles|vestuario|grafica', 'Taller o estudio de producción de la especialidad, con puestos de preparación y ejecución.'),
        (r'administracion|contabilidad|hoteleria|turismo', 'Oficina o espacio de atención y gestión acorde con el proceso del módulo.'),
    ]
    for pattern, room in rules:
        if re.search(pattern, specialty + ' ' + title):
            return room
    return 'Ambiente profesional del módulo definido por sus actividades y recursos oficiales.'


def write_module_dossier(inventories, root):
    lines = [
        '# Plan curricular de equipamiento por especialidad y módulo', '',
        '**Cobertura:** 35 especialidades, 45 cursos/menciones y 451 módulos registrados en Ciudad Laboral.', '',
        '**Fuente curricular vigente:** programas oficiales de 3° y 4° medio publicados por MINEDUC en Currículum Nacional. La propuesta de actualización para 14 especialidades fue observada en 2025 y no aprobada por el CNED en 2026; por eso este plan no sustituye los programas oficiales publicados por borradores. [Acuerdo CNED 143/2025](https://cned.cl/resolucion/acuerdo-n-143-2025/) · [Acuerdo CNED 032/2026](https://cned.cl/resolucion/acuerdo-n-032-2026/) · [Índice EMTP MINEDUC](https://www.curriculumnacional.cl/614/w3-propertyvalue-118619.html).', '',
        '**Cómo leer prioridades:** “Indispensable” significa que el criterio del programa nombra el recurso de forma verificable; “Recomendable” significa que figura en los recursos de una actividad oficial; “Complementario” significa que requiere confirmación antes de incorporarlo como exigencia. La ausencia de un sustantivo no demuestra que una sala carezca de equipo.', '',
        '**Distribución propuesta:** conservar un pasillo central abierto; disponer herramientas en panel/carro, EPP junto al acceso, documentación en atril/biblioteca, tecnología en puestos conectados, insumos en almacenamiento y maquinaria en estaciones de práctica. El taller 3D muestra representaciones visuales, no equipos certificados ni simuladores operativos.', '',
        '**Etapas existentes:** el quiz permanece en sus cuatro estaciones; las preguntas pueden usar como contexto los recursos vinculados al AE/criterio. Las misiones mantienen su flujo actual; la tabla identifica recursos de referencia para ellas, sin declarar manipulaciones o acciones que no estén implementadas.', '',
        '## Especialidades y módulos', '',
    ]
    grouped = {}
    for mid, row in inventories.items():
        grouped.setdefault(row['specialty'], []).append((mid, row))
    for specialty, modules in sorted(grouped.items()):
        lines += [f'### { _md(specialty) }', '']
        for mid, row in sorted(modules, key=lambda pair: int(pair[0])):
            audit = row.get('curriculum_audit', {})
            url = row.get('url', '')
            lines += [f'#### Módulo {mid}: {_md(row.get("module_title"))}', '',
                      '| Campo | Descripción |', '| --- | --- |',
                      f'| Especialidad y módulo | {_md(specialty)} · {_md(row.get("module_title"))} |',
                      f'| OA | {_md(_objectives_text(row))} |',
                      f'| Ambiente profesional | {_md(_room_type(row))} |',
                      f'| Distribución 3D | {_md("; ".join(sorted({resource_design(item, row)["zone"] for item in row.get("resources", [])})) or "Estación de práctica, almacenamiento y pasillo central; validar con actividades del programa.")} |',
                      f'| Estado de revisión | {_md(audit.get("status", "requires_source_review"))} |',
                      f'| Programa oficial | [PDF MINEDUC]({url}) |', '',
                      '| AE | Aprendizaje esperado | Criterios de evaluación |', '| --- | --- | --- |']
            criteria_rows = _criteria_rows(row)
            grouped_criteria = {}
            for code, ae_code, ae_title, criterion in criteria_rows:
                grouped_criteria.setdefault(ae_code, {'title': ae_title, 'criteria': []})['criteria'].append(f'{code} {_md(criterion)}')
            if not grouped_criteria:
                lines.append('| Pendiente | AE/criterios no disponibles en la transcripción | Revisar el PDF oficial enlazado. |')
            for ae_code, data in grouped_criteria.items():
                lines.append(f'| {_md(ae_code)} | {_md(data["title"])} | {_md("; ".join(data["criteria"]))} |')
            lines += ['', '| Recurso (categoría) | Relación curricular y fuente | Prioridad | Zona y justificación pedagógica | Interacción 3D propuesta; quiz y misión |', '| --- | --- | --- | --- | --- |']
            for item in row.get('resources', []):
                plan = resource_design(item, row)
                criterion_text = ', '.join(plan['criteria']) or 'sin vínculo directo a criterio; recurso de actividad'
                ae_map = {code: ae for code, ae, _, _ in criteria_rows}
                ae_codes = sorted({ae_map[code] for code in plan['criteria'] if code in ae_map})
                relation = f'{", ".join(ae_codes) + "; " if ae_codes else ""}{criterion_text}. {plan["source_basis"]}.'
                ref_links = ', '.join(f'[p. {page}]({url}#page={page})' for page in plan['pages'])
                activities = '; '.join(plan['activities'])
                source = ' · '.join(part for part in (activities, ref_links) if part)
                zone_justification = f'{plan["zone"]}. {plan["function"]}'
                interaction = f'3D: {plan["interactive"]} Quiz: usar como contexto visual. Misión: {plan["mission"]}'
                lines.append(f'| {_md(item.get("name"))} ({_md(item.get("category"))}) | {_md(relation)} {source} | {plan["priority"]} | {_md(zone_justification)} | {_md(interaction)} |')
            if not row.get('resources'):
                lines.append('| Sin recursos trazados | No inferir equipamiento; revisar actividades del PDF. | Pendiente | Definir tras revisión disciplinar. | Pendiente de validación |')
            lines += ['', f'**Seguridad:** {"; ".join(_md(item["name"]) for item in row.get("resources", []) if item.get("category") == "protection") or "El barrido no encontró EPP nombrado de forma explícita. Verificar los riesgos y protocolos del módulo en el PDF antes de añadir EPP específico."}', '',
                      f'**Pendientes:** {_md(audit.get("limitations", "Confirmar cada relación, el inventario local del establecimiento y los procedimientos de seguridad con una persona especialista."))}', '']
    lines += ['## Alcance de verificación', '',
              'Este dossier conserva textos curriculares transcritos y referencias de página a los programas PDF. “Indispensable” y “Recomendable” describen el origen de la propuesta de equipamiento, no la obligación legal de que cada establecimiento posea una unidad física. Los objetos 3D no certifican escala, prestaciones, compatibilidad con fabricantes ni seguridad operacional. La validación de detalle por docentes especialistas sigue pendiente para los módulos marcados como barrido automático.', '']
    (root / 'docs' / 'CIUDAD_EQUIPAMIENTO_POR_MODULO_35_ESPECIALIDADES.md').write_text('\n'.join(lines), encoding='utf8')


def write_report(inventories, root):
    from collections import defaultdict
    totals = defaultdict(Counter)
    unresolved = []
    for mid, row in inventories.items():
        tally = totals[row['specialty']]
        tally['modules'] += 1
        tally['resources'] += len(row['resources'])
        tally['specialized_models'] += sum(bool(item.get('model')) for item in row['resources'])
        for criterion in row['curriculum_audit']['criteria']:
            tally['criteria'] += 1
            tally['linked'] += bool(criterion['resources'])
            if criterion.get('status') == 'requires_source_review':
                unresolved.append((mid, row['module_title'], criterion['code'], row['url']))
    lines = ['# Equipamiento curricular: revision transversal', '',
        'Cobertura del barrido: 451 modulos de 45 cursos. Se contrastan nombres explicitos de recursos de actividades y criterios con el PDF oficial de cada especialidad.', '',
        'Este informe NO certifica que todas las salas esten completas. El barrido automatico no sustituye la revision disciplinar de cada AE, OA, procedimiento, EPP y especificacion del fabricante. Un criterio sin recurso enlazado puede ser conceptual o necesitar una revision adicional.', '',
        'Los modelos son representaciones didacticas, no equipos operativos ni una acreditacion de taller real. Se mantienen los controles de quiz y el recorrido.', '',
        '| Curso | Modulos | Recursos | Modelos diferenciados | Criterios con recursos enlazados / registrados |',
        '| --- | ---: | ---: | ---: | ---: |']
    for course, tally in sorted(totals.items()):
        lines.append(f"| {course} | {tally['modules']} | {tally['resources']} | {tally['specialized_models']} | {tally['linked']} / {tally['criteria']} |")
    lines += ['', '## Transcripciones que requieren revision de fuente', '',
              'En estos casos no se agregan equipos a partir de la transcripcion no confirmada. Los recursos de actividades con fuente valida se conservan.', '',
              '| Modulo | Nombre | Criterio | Programa oficial |', '| --- | --- | --- | --- |']
    for mid, title, code, url in unresolved:
        lines.append(f'| {mid} | {title} | {code} | [PDF]({url}) |')
    lines += ['', '## Reproduccion y pruebas', '',
        '`python -m scripts.build_city_room_resources` reconstruye el catalogo y este informe.', '',
        'Las pruebas verifican procedencia, limites de palabras, rechazo de inferencias genericas de seguridad, correspondencia del catalogo publico y presencia de modelos concretos en 451 ciclos de construccion dentro de una sala de ensayo. Ademas se prueban cinco salas reales de especialidades, el cambio de mencion, las coordenadas al cambiar de piso y el repintado tras cargas asincronas. No equivale a una inspeccion visual individual de todos los recintos.', '']
    (root / 'docs' / 'CIUDAD_EQUIPAMIENTO_BARRIDO_45_CURSOS.md').write_text('\n'.join(lines), encoding='utf8')
    write_module_dossier(inventories, root)
