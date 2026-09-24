"""Unpublished Explotación Minera draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'mining_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/explotacion-minera.pdf'
DOSSIERS = [
    ('Oficina de planos mineros', 'plano de ubicación, zonificación y orden ficticia', 'La ubicación señalada en la orden no coincide con la zona autorizada.', 'lectura comparada y consulta al supervisor'),
    ('Control de fortificación simulado', 'mapa de labores, informe de inspección y pauta preventiva', 'El informe omite un sector marcado para revisión.', 'registro de hallazgo y suspensión preventiva simulada'),
    ('Planificación documental de faena', 'permiso ficticio, mapa de exclusión y protocolo de seguridad', 'El permiso identifica una zona distinta de la aprobada en el mapa.', 'detección de incompatibilidad y derivación al responsable autorizado'),
    ('Comité legal y de seguridad minera', 'normativa, matriz de riesgos y registro de inspección', 'Un peligro registrado no aparece en la matriz vigente.', 'análisis preventivo y observación documentada'),
    ('Control de ventilación y drenaje', 'diagrama, lecturas ficticias y bitácora', 'Una lectura no coincide con el rango de referencia del plan.', 'reporte de anomalía y consulta técnica'),
    ('Gabinete de muestreo minero', 'plan, etiquetas y cadena de custodia ficticia', 'El código de una muestra difiere entre etiqueta y registro.', 'conciliación de trazabilidad y reporte'),
    ('Oficina de cubicación y transporte', 'plano, metrado y guía de transporte ficticia', 'El volumen de la guía difiere del calculado en la planilla.', 'cubicación revisada y justificación de diferencia'),
    ('Control de chancado simulado', 'diagrama de proceso, bitácora y pauta de seguridad', 'La etapa registrada no coincide con el flujo aprobado.', 'identificación de desvío y derivación al supervisor'),
    ('Emprendimiento minero simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida ambiental prevista.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Explotación Minera', 'explotacion-minera', SOURCE)


def install_mining_draft(con):
    install_draft(con, 'Explotación Minera', draft_modules())
