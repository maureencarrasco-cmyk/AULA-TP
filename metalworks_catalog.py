"""Unpublished Construcciones Metálicas draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'metalworks_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/construcciones-metalicas.pdf'
DOSSIERS = [
    ('Oficina de proyectos metálicos', 'plano de conjunto, simbología y especificaciones', 'Una cota del plano no coincide con la lista de piezas.', 'lectura de plano y consulta de discrepancia'),
    ('Área de trazado simulado', 'croquis, medidas y registro de materiales', 'La medida transcrita a la hoja de trazado difiere del croquis aprobado.', 'verificación de trazado en papel y registro de corrección'),
    ('Taller de mantenimiento', 'ficha de equipo, historial y pauta preventiva', 'El historial muestra una revisión pendiente que no figura en la orden.', 'informe de condición y derivación al responsable'),
    ('Planificación de mecanizado', 'plano, orden de trabajo y pauta de seguridad', 'El material especificado en la orden difiere del indicado en el plano.', 'secuencia simulada y control documental previo'),
    ('Planificación de corte y soldadura', 'plano de unión, orden y ficha preventiva', 'La unión de la orden no coincide con el detalle del plano.', 'análisis de riesgo y solicitud de aclaración antes de intervenir'),
    ('Proyecto de armado simulado', 'plano de montaje, inventario y pauta de inspección', 'Falta una pieza en el inventario respecto de la secuencia aprobada.', 'plan de armado revisado y registro de faltantes'),
    ('Control ambiental de estructuras', 'fichas de recubrimiento, residuos y pauta ambiental', 'Un residuo está clasificado de forma distinta en dos registros.', 'clasificación justificada y consulta de manejo seguro'),
    ('Oficina de cubicación', 'planos, metrado y presupuesto de referencia', 'La cantidad presupuestada no coincide con las medidas del plano.', 'cubicación comprobada y diferencia documentada'),
    ('Emprendimiento metalmecánico simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una etapa incluida en la propuesta.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Construcciones Metálicas', 'construcciones-metalicas', SOURCE)


def install_metalworks_draft(con):
    install_draft(con, 'Construcciones Metálicas', draft_modules())


def install_metalworks_course(con):
    install_course(
        con,
        'Construcciones Metálicas',
        draft_modules(),
        'construcciones-metalicas-mineduc-draft-v1',
        'construcciones-metalicas-mineduc-v1',
    )
