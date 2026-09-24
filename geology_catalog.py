"""Unpublished Asistencia en Geología draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'geology_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/asistencia-geologia.pdf'
DOSSIERS = [
    ('Planificación de campaña geológica', 'mapa, lista de recursos y plan de campamento ficticio', 'La ubicación del campamento no coincide con la zona autorizada.', 'revisión documental y consulta al responsable'),
    ('Comité de seguridad geológica', 'protocolo, mapa de riesgos y permiso ficticio', 'El permiso omite un riesgo identificado en el mapa.', 'análisis preventivo y derivación al supervisor'),
    ('Gabinete de muestras geológicas', 'fichas de rocas, fotografías y registro de muestra', 'Una muestra figura con dos clasificaciones diferentes.', 'comparación de evidencias y clasificación justificada'),
    ('Oficina de cartografía', 'mapa topográfico, datos de terreno y croquis', 'La cota del croquis difiere del mapa de referencia.', 'lectura comparada y corrección documentada'),
    ('Planificación de sondaje simulado', 'mapa, orden de prospección y pauta de seguridad', 'El punto de sondaje consignado queda fuera del sector aprobado.', 'detección de incompatibilidad y suspensión preventiva simulada'),
    ('Control de muestreo geológico', 'plan de muestreo, etiquetas y cadena de custodia ficticia', 'El código de una muestra no coincide con la cadena de custodia.', 'conciliación de trazabilidad y observación'),
    ('Gestión de datos geológicos', 'bitácora, archivo de datos y pauta de transferencia', 'Un registro de terreno no aparece en el archivo transferido.', 'control de integridad y reporte de datos'),
    ('Logística de equipos geológicos', 'inventario, bitácora y manual de equipo', 'Un instrumento figura listo pese a una revisión pendiente.', 'reporte de condición y retiro preventivo simulado'),
    ('Emprendimiento geológico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida preventiva del plan.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Asistencia en Geología', 'asistencia-geologia', SOURCE)


def install_geology_draft(con):
    install_draft(con, 'Asistencia en Geología', draft_modules())
