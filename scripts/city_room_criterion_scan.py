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
