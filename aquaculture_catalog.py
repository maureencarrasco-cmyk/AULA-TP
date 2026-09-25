"""Unpublished Acuicultura draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'aquaculture_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/acuicultura.pdf'
DOSSIERS = [
    ('Centro de reproducción acuícola simulado', 'ficha de especie, registro de lote y parámetros ambientales', 'Un parámetro del registro no coincide con el rango indicado en la ficha.', 'evaluación de lote y consulta al responsable'),
    ('Centro de engorde simulado', 'plan de alimentación, biometría y bitácora', 'La biometría consignada difiere del dato usado en el plan.', 'comparación de registros y propuesta de revisión'),
    ('Sala de sistemas de cultivo', 'manual, historial y registro de funcionamiento', 'Un equipo aparece habilitado pese a una alerta pendiente.', 'informe de condición y derivación preventiva'),
    ('Comité de seguridad ambiental', 'mapa de riesgos, registro de incidentes y protocolo', 'Un incidente se ubica fuera del sector señalado en el mapa.', 'análisis de riesgo y observación documentada'),
    ('Planificación de cosecha simulada', 'orden de cosecha, ficha de lote y pauta sanitaria', 'El lote programado no coincide con la autorización de cosecha.', 'control documental y suspensión preventiva simulada'),
    ('Unidad de captación de semillas', 'ficha de especie, plan de captación y registro ambiental', 'El período registrado no coincide con el plan aprobado.', 'revisión de oportunidad y consulta técnica'),
    ('Supervisión de trabajo subacuático simulado', 'permiso, mapa de zona y protocolo de emergencia', 'El permiso identifica una zona distinta de la señalada en el mapa.', 'detección de incompatibilidad y derivación al supervisor de buceo'),
    ('Oficina de información acuícola', 'planilla de producción, bitácora y ficha de trazabilidad', 'Un lote figura con dos fechas de cosecha distintas.', 'conciliación de datos y corrección justificada'),
    ('Emprendimiento acuícola simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de bioseguridad prevista.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Acuicultura', 'acuicultura', SOURCE)


def install_aquaculture_draft(con):
    install_draft(con, 'Acuicultura', draft_modules())


def install_aquaculture_course(con):
    install_course(
        con,
        'Acuicultura',
        draft_modules(),
        'acuicultura-mineduc-draft-v1',
        'acuicultura-mineduc-v1',
    )
