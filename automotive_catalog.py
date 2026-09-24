"""Unpublished Mecánica Automotriz draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'automotive_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/mecanica-automotriz.pdf'
DOSSIERS = [
    ('Diagnóstico de motor simulado', 'orden de trabajo, manual y lecturas ficticias', 'Una lectura registrada no coincide con el rango del manual.', 'informe de discrepancia y consulta técnica'),
    ('Oficina de documentación automotriz', 'plano, manual de fabricante y ficha de vehículo', 'La versión del manual no corresponde al modelo consignado.', 'selección documental y control de versión'),
    ('Gestión de residuos automotrices', 'inventario de residuos, fichas y pauta ambiental', 'Un residuo está clasificado de forma distinta en dos registros.', 'clasificación razonada y derivación responsable'),
    ('Control de seguridad y confort', 'orden, historial y pauta de inspección', 'Una alerta previa no aparece en la nueva orden.', 'reporte de condición y prioridad de revisión'),
    ('Diagnóstico eléctrico simulado', 'diagrama, registro de mediciones ficticias y manual', 'La lectura anotada corresponde a un circuito diferente del diagrama.', 'verificación de circuito y observación técnica'),
    ('Planificación de mantenimiento de motores', 'historial, ficha de servicio y manual', 'La fecha de intervención difiere entre historial y ficha.', 'plan de mantenimiento revisado'),
    ('Control hidráulico y neumático', 'esquema, bitácora y registro de presión ficticio', 'Una presión registrada no coincide con el rango de referencia.', 'análisis documental y derivación al supervisor'),
    ('Revisión de transmisión y frenos', 'orden, manual y pauta de seguridad', 'Una observación de frenos falta en la orden de trabajo.', 'reporte preventivo y solicitud de inspección autorizada'),
    ('Revisión de dirección y suspensión', 'historial, pauta y resultados simulados', 'El resultado de inspección difiere del historial reciente.', 'comparación de registros y recomendación de verificación'),
    ('Emprendimiento automotriz simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una revisión ofrecida al cliente.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Mecánica Automotriz', 'mecanica-automotriz', SOURCE)


def install_automotive_draft(con):
    install_draft(con, 'Mecánica Automotriz', draft_modules())
