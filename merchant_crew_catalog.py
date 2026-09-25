"""Unpublished merchant-crew draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'merchant_crew_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/tripulacion-naves-mercantes-especiales.pdf'
DOSSIERS = [
    ('Planificación de maniobras de cubierta', 'orden ficticia, ficha de equipo y pauta de seguridad', 'El equipo asignado difiere del autorizado en la orden.', 'detección de incompatibilidad y consulta al oficial responsable'),
    ('Control de máquinas de cubierta', 'bitácora, manual y registro de inspección', 'Una máquina figura disponible pese a una alerta pendiente.', 'informe de condición y retiro preventivo simulado'),
    ('Comité de seguridad de la nave', 'mapa de riesgos, protocolo y parte de incidente ficticio', 'La ubicación reportada no coincide con la zona del mapa.', 'análisis del riesgo y derivación al equipo competente'),
    ('Simulador documental de puente', 'orden de navegación, registro de instrumentos y bitácora', 'El rumbo anotado difiere entre la orden y la bitácora.', 'verificación de datos y comunicación al oficial a cargo'),
    ('Escenario de primeros auxilios', 'caso ficticio, protocolo institucional y registro de alerta', 'No hay constancia de la activación del canal de emergencia.', 'priorización del aviso y coordinación con personal capacitado'),
    ('Sala de máquinas simulada', 'plan de funcionamiento, lecturas ficticias y manual', 'Una lectura aparece fuera del rango indicado por el plan.', 'reporte de anomalía y derivación al responsable'),
    ('Mantenimiento marino documental', 'historial, orden de trabajo y ficha técnica', 'El historial muestra una intervención que no aparece en la orden.', 'revisión de mantenimiento y consulta técnica'),
    ('Centro de comunicaciones de nave', 'protocolo, mensaje ficticio y bitácora', 'La posición transmitida difiere de la posición registrada.', 'verificación de mensaje y reporte por el canal formal'),
    ('Emprendimiento marítimo simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de seguridad prevista.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Tripulación de Naves Mercantes y Especiales', 'tripulacion-naves-mercantes-especiales', SOURCE)


def install_merchant_crew_draft(con):
    install_draft(con, 'Tripulación de Naves Mercantes y Especiales', draft_modules())


def install_merchant_crew_course(con):
    install_course(
        con,
        'Tripulación de Naves Mercantes y Especiales',
        draft_modules(),
        'tripulacion-naves-mercantes-especiales-mineduc-draft-v1',
        'tripulacion-naves-mercantes-especiales-mineduc-v1',
    )
