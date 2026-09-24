"""Unpublished Muebles y Terminaciones en Madera draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'furniture_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/muebles-terminaciones-madera.pdf'
DOSSIERS = [
    ('Bodega de madera y componentes', 'orden de compra, inventario y guía de despacho', 'La cantidad recibida difiere de la indicada en la guía.', 'conciliación de abastecimiento y observación documentada'),
    ('Planificación de fabricación', 'plano, ficha técnica y lista de piezas', 'La dimensión de una pieza difiere entre el plano y la lista.', 'verificación de componentes y consulta técnica'),
    ('Oficina de cubicación', 'diseño de mueble, planilla y catálogo de materiales', 'La planilla no considera un panel incluido en el diseño.', 'cubicación revisada y justificación de consumo'),
    ('Control de calidad y seguridad', 'pauta de inspección, registro ambiental y ficha de producto', 'El registro de inspección omite un control exigido en la pauta.', 'informe de no conformidad y medida preventiva simulada'),
    ('Estudio de representación gráfica', 'croquis, medidas y propuesta digital', 'Una medida del modelo digital no coincide con el croquis aprobado.', 'plano revisado y control de versión'),
    ('Proyecto de armado simulado', 'despiece, secuencia y control de ajuste', 'Una unión prevista en el despiece no aparece en la secuencia.', 'secuencia corregida y comprobación documental'),
    ('Área de terminaciones', 'ficha de acabado, muestra y pauta de calidad', 'La muestra registra una terminación distinta de la solicitada.', 'evaluación de acabado y solicitud de aclaración'),
    ('Instalación simulada de mobiliario', 'plano de ubicación, inventario y pauta de montaje', 'La ubicación indicada no permite el ajuste previsto en el plano.', 'revisión de instalación y discrepancia documentada'),
    ('Taller de mantenimiento', 'manual, bitácora y orden de revisión', 'Un equipo figura disponible pese a una falla pendiente.', 'retiro preventivo simulado y reporte al responsable'),
    ('Emprendimiento maderero simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una terminación ofrecida al cliente.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Muebles y Terminaciones en Madera', 'muebles-terminaciones-madera', SOURCE)


def install_furniture_draft(con):
    install_draft(con, 'Muebles y Terminaciones en Madera', draft_modules())


def install_furniture_course(con):
    install_course(
        con,
        'Muebles y Terminaciones en Madera',
        draft_modules(),
        'muebles-terminaciones-madera-mineduc-draft-v1',
        'muebles-terminaciones-madera-mineduc-v1',
    )
