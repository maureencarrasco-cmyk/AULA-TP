"""Unpublished Gráfica draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'graphics_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/grafica.pdf'
DOSSIERS = [
    ('Área de preimpresión', 'orden de trabajo, archivo digital y reporte de verificación', 'El archivo entregado contiene un vínculo de imagen que no figura en la carpeta recibida.', 'archivo verificado y observación de preflight'),
    ('Sala de preparación de prensa', 'orden de producción, ficha de máquina y pauta de seguridad', 'La configuración registrada corresponde a un sustrato distinto del solicitado.', 'lista de preparación y discrepancias documentadas'),
    ('Taller de impresión', 'prueba aprobada, orden de tiraje y registro de calidad', 'La muestra impresa difiere de la prueba aprobada en un elemento de color.', 'informe de control del producto gráfico'),
    ('Bodega de insumos gráficos', 'especificación del trabajo, inventario y ficha de materiales', 'El material disponible no coincide con el gramaje solicitado en la orden.', 'selección de insumos y consulta técnica'),
    ('Área de encuadernación', 'especificación de terminación, pliego impreso y pauta de armado', 'El orden de páginas del pliego no corresponde a la secuencia de la publicación.', 'propuesta de encuadernación y verificación de secuencia'),
    ('Equipo de imposición', 'archivo final, esquema de pliegos y prueba de color', 'Una página aparece en una posición distinta de la prevista en el esquema.', 'imposición corregida y registro de prueba'),
    ('Área de salida a impresión', 'archivo aprobado, parámetros de salida y prueba digital', 'La versión enviada a salida no coincide con la versión aprobada.', 'control de versión y comprobación de salida'),
    ('Taller de postimpresión', 'diseño de embalaje, pauta de recubrimiento y muestra', 'La línea de pliegue de la muestra no coincide con el diseño aprobado.', 'revisión de postimpresión con pendiente identificado'),
    ('Emprendimiento gráfico escolar', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto no incluye una terminación ofrecida en la propuesta.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Gráfica', 'grafica', SOURCE)


def install_graphics_draft(con):
    install_draft(con, 'Gráfica', draft_modules())


def install_graphics_course(con):
    install_course(
        con,
        'Gráfica',
        draft_modules(),
        'grafica-mineduc-draft-v1',
        'grafica-mineduc-v1',
    )
