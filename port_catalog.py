"""Unpublished Operaciones Portuarias draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'port_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/operaciones-portuarias.pdf'
DOSSIERS = [
    ('Oficina documental portuaria', 'manifiesto ficticio, guía y registro aduanero', 'El identificador de carga difiere entre el manifiesto y la guía.', 'conciliación documental y consulta de discrepancia'),
    ('Planificación de contenedores', 'lista de bultos, plano y pauta de control', 'La lista de bultos no coincide con el inventario del contenedor simulado.', 'registro de faltantes y revisión de consolidación'),
    ('Comité de seguridad portuaria', 'mapa de riesgos, permiso simulado y pauta preventiva', 'El permiso indica un área distinta de la señalada en el mapa.', 'análisis de riesgo y suspensión preventiva documentada'),
    ('Centro de coordinación de cargas', 'plan de distribución, registro de carga y cronograma', 'La carga asignada a una zona supera el valor consignado en el plan.', 'revisión de distribución y derivación al supervisor'),
    ('Recepción y despacho documental', 'orden de despacho, comprobante y bitácora ficticios', 'La hora de recepción no coincide entre comprobante y bitácora.', 'trazabilidad corregida y observación registrada'),
    ('Planificación de estiba simulada', 'plano de nave, manifiesto y pauta de seguridad', 'La ubicación propuesta para una carga difiere del plano aprobado.', 'identificación de incompatibilidad y consulta técnica'),
    ('Tramitación de movimiento portuario', 'solicitud, itinerario y registro de transporte', 'El destino de la solicitud no coincide con el itinerario.', 'revisión del trámite y control de versión'),
    ('Zona de depósito simulada', 'inventario, plano de almacenamiento y ficha de carga', 'Un bulto figura en una zona distinta de la indicada en el plano.', 'localización documentada y propuesta de corrección'),
    ('Emprendimiento logístico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un servicio incluido en la oferta.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Operaciones Portuarias', 'operaciones-portuarias', SOURCE)


def install_port_draft(con):
    install_draft(con, 'Operaciones Portuarias', draft_modules())


def install_port_course(con):
    install_course(
        con,
        'Operaciones Portuarias',
        draft_modules(),
        'operaciones-portuarias-mineduc-draft-v1',
        'operaciones-portuarias-mineduc-v1',
    )
