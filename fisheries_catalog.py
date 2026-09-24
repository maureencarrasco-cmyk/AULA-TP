"""Unpublished Pesquería draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'fisheries_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/pesqueria.pdf'
DOSSIERS = [
    ('Centro de planificación de navegación', 'carta náutica, pronóstico y bitácora ficticios', 'La hora de zarpe de la bitácora difiere de la ventana meteorológica registrada.', 'análisis de navegación y consulta al responsable'),
    ('Taller de implementos de pesca', 'inventario, ficha de equipo y registro de revisión', 'Un implemento figura disponible pese a una reparación pendiente.', 'informe de condición y retiro preventivo simulado'),
    ('Recepción de recursos hidrobiológicos', 'ficha de lote, registro de conservación y pauta sanitaria', 'La identificación del lote difiere entre dos registros.', 'control de trazabilidad y retención simulada'),
    ('Comité de seguridad marítima', 'mapa de riesgos, protocolo y parte de incidente ficticio', 'El incidente reportado no coincide con la zona indicada en el mapa.', 'identificación del riesgo y derivación al equipo competente'),
    ('Análisis de primeros auxilios', 'escenario ficticio, protocolo institucional y registro de aviso', 'El registro no confirma la activación del canal de emergencia.', 'decisión de alerta y coordinación con personal capacitado'),
    ('Planificación de faena pesquera simulada', 'plan de pesca, ficha de arte y pauta de seguridad', 'El arte asignado difiere del autorizado en el plan.', 'revisión documental y suspensión preventiva simulada'),
    ('Gestión de proyecto pesquero', 'plan de manejo, presupuesto y cronograma ficticios', 'La actividad propuesta se ubica fuera del área autorizada.', 'plan corregido y justificación ambiental'),
    ('Centro de comunicaciones marítimas', 'protocolo, mensaje simulado y bitácora', 'El mensaje recibido indica una posición distinta de la bitácora.', 'verificación de información y reporte al responsable'),
    ('Emprendimiento pesquero simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un control sanitario previsto.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Pesquería', 'pesqueria', SOURCE)


def install_fisheries_draft(con):
    install_draft(con, 'Pesquería', draft_modules())
