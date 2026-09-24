"""Unpublished Forestal draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'forestry_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/forestal.pdf'
DOSSIERS = [
    ('Vivero forestal simulado', 'plan de producción, ficha de especies y registro ambiental', 'El registro de humedad no coincide con el valor de referencia de la ficha.', 'análisis de propagación y consulta al encargado'),
    ('Unidad de inventario forestal', 'mapa, datos de parcelas y planilla de mediciones', 'Una medición de parcela está duplicada en la planilla.', 'inventario corregido y justificación de cálculo'),
    ('Área de sanidad forestal', 'ficha de observación, mapa de focos y pauta sanitaria', 'La identificación del foco no coincide entre el mapa y el registro.', 'informe de observación y derivación técnica'),
    ('Taller de herramientas forestales', 'inventario, bitácora y manual preventivo', 'Una herramienta aparece disponible pese a tener una revisión pendiente.', 'control de condición y retiro preventivo simulado'),
    ('Planificación silvícola', 'plan de manejo, mapa y registro de terreno', 'La intervención propuesta se ubica fuera del sector aprobado.', 'revisión del plan y registro de discrepancia'),
    ('Planificación de cosecha simulada', 'mapa operativo, orden y pauta de seguridad', 'La zona señalada en la orden difiere de la delimitación del mapa.', 'identificación de riesgo y consulta antes de intervenir'),
    ('Control de producción forestal', 'metas, guía de despacho y registro de volumen', 'El volumen consolidado no coincide con las guías del período.', 'conciliación de producción y observaciones'),
    ('Prevención de incendios forestales', 'mapa de riesgo, aviso simulado y protocolo de emergencia', 'La ubicación del aviso corresponde a una zona de acceso restringido.', 'evaluación del riesgo, alerta y derivación a equipos competentes'),
    ('Emprendimiento forestal simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida preventiva indicada en el plan.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Forestal', 'forestal', SOURCE)


def install_forestry_draft(con):
    install_draft(con, 'Forestal', draft_modules())


def install_forestry_course(con):
    install_course(
        con,
        'Forestal',
        draft_modules(),
        'forestal-mineduc-draft-v1',
        'forestal-mineduc-v1',
    )
