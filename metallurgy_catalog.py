"""Unpublished Metalurgia Extractiva draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'metallurgy_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/metalurgia-extractiva.pdf'
DOSSIERS = [
    ('Laboratorio metalúrgico simulado', 'orden de análisis, ficha de muestra y resultados ficticios', 'El identificador de muestra difiere entre orden y resultado.', 'control de trazabilidad y reporte de discrepancia'),
    ('Control de proceso minero', 'plan de muestreo, bitácora y registros ficticios', 'Una muestra se registra fuera de la etapa indicada en el plan.', 'revisión de secuencia y consulta técnica'),
    ('Bodega de insumos metalúrgicos', 'inventario, guía y registro de consumo', 'El saldo de inventario no coincide con los movimientos del período.', 'conciliación y observación documentada'),
    ('Comité de prevención minera', 'normativa, mapa de riesgos y permiso simulado', 'El permiso omite un peligro consignado en el mapa.', 'análisis preventivo y derivación al supervisor'),
    ('Planificación de transformación mecánica', 'diagrama de proceso, orden y pauta de seguridad', 'La etapa programada difiere de la secuencia aprobada.', 'revisión documental y suspensión preventiva simulada'),
    ('Control de acondicionamiento químico', 'ficha de proceso, registros ficticios y pauta ambiental', 'Un parámetro consignado no coincide con el rango de referencia.', 'reporte de anomalía y consulta al responsable'),
    ('Análisis de hidrometalurgia', 'diagrama, bitácora y resultados ficticios', 'Un lote presenta códigos distintos entre diagrama y bitácora.', 'conciliación de trazabilidad y evaluación documental'),
    ('Control de fundición y refinería', 'orden, informe de calidad y pauta preventiva', 'La especificación del producto difiere del informe final.', 'informe de no conformidad y derivación técnica'),
    ('Emprendimiento metalúrgico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida ambiental prevista.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Metalurgia Extractiva', 'metalurgia-extractiva', SOURCE)


def install_metallurgy_draft(con):
    install_draft(con, 'Metalurgia Extractiva', draft_modules())


def install_metallurgy_course(con):
    install_course(con, 'Metalurgia Extractiva', draft_modules(),
                   'metalurgia-extractiva-mineduc-draft-v1',
                   'metalurgia-extractiva-mineduc-v1')
