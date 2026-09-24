"""Unpublished food-industry draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'food_industry_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/elaboracion-industrial-alimentos.pdf'
DOSSIERS = [
    ('Recepción de planta alimentaria', 'orden de compra, ficha de recepción y registro de lote', 'El lote recibido no coincide con el consignado en la orden.', 'registro de recepción y consulta por discrepancia'),
    ('Bodega de insumos alimentarios', 'inventario, ficha de producto y registro de almacenamiento', 'La ubicación registrada difiere de la informada en el inventario.', 'propuesta de ubicación y control de trazabilidad'),
    ('Línea de elaboración simulada', 'orden de producción, pauta de higiene y registro de proceso', 'La pauta de higiene no está validada para el turno indicado.', 'revisión documental y suspensión preventiva de la etapa'),
    ('Equipo de aseguramiento de calidad', 'especificación, resultados simulados y ficha de no conformidad', 'Un resultado registrado está fuera del rango de la especificación.', 'informe de no conformidad y decisión de retención simulada'),
    ('Planificación de conservación', 'ficha de producto, parámetros de referencia y registro de lote', 'El tratamiento consignado no corresponde al definido para ese producto.', 'comparación de tratamientos y consulta técnica'),
    ('Control de procesos alimentarios', 'planilla de producción, bitácora y pauta de control', 'Una lectura de la bitácora no aparece en la planilla consolidada.', 'conciliación de registros y observación de trazabilidad'),
    ('Gestión de desechos de planta', 'registro de residuos, clasificación y pauta ambiental', 'La categoría de un residuo difiere entre dos documentos.', 'clasificación razonada y derivación al responsable'),
    ('Área de envasado simulado', 'arte de etiqueta, ficha de producto y registro de lote', 'La etiqueta muestra un lote distinto del registrado para el producto.', 'control de rotulación y corrección documentada'),
    ('Emprendimiento alimentario simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una etapa de control de calidad propuesta.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Elaboración Industrial de Alimentos', 'elaboracion-industrial-alimentos', SOURCE)


def install_food_industry_draft(con):
    install_draft(con, 'Elaboración Industrial de Alimentos', draft_modules())
