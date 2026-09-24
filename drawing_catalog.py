"""Unpublished Dibujo Técnico draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'drawing_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/dibujo-tecnico.pdf'
DOSSIERS = [
    ('Oficina de dibujo técnico', 'plano, leyenda y ficha de requerimientos', 'Un símbolo del plano no corresponde a la leyenda entregada.', 'registro de lectura de planos y consulta técnica'),
    ('Equipo de levantamiento', 'croquis de terreno, notas de medición y ficha del encargo', 'Una cota del croquis no coincide con la anotación tomada en terreno.', 'plano manual de levantamiento con discrepancia identificada'),
    ('Equipo de representación arquitectónica', 'archivo CAD, croquis y pauta de capas', 'Un recinto aparece en una capa distinta de la indicada en la pauta.', 'plano digital revisado y control de versión'),
    ('Taller de dibujo mecánico', 'croquis de pieza, vistas y plano de conjunto', 'Una perforación aparece en una vista pero no en la vista correspondiente.', 'plano de pieza y conjunto coherente'),
    ('Laboratorio de modelado virtual', 'planos base, modelo tridimensional y lista de componentes', 'Una abertura del plano no aparece en la maqueta virtual.', 'modelo virtual contrastado con planos'),
    ('Equipo de instalaciones domiciliarias', 'plano de arquitectura, trazados de instalaciones y observaciones', 'Dos trazados previstos ocupan el mismo espacio sin una solución documentada.', 'plano de instalaciones con interferencia señalada'),
    ('Equipo de sistemas constructivos', 'cortes, elevaciones y detalles constructivos', 'El nivel indicado en el detalle no coincide con el corte general.', 'detalle digital coordinado con el proyecto'),
    ('Oficina de montaje industrial', 'plano de montaje, ficha del equipo y modelo digital', 'El espacio libre del modelo no corresponde al requerido por la ficha del equipo.', 'plano de montaje con pendiente de verificación'),
    ('Equipo de cubicación', 'planos revisados, cuadro de partidas y mediciones', 'Una partida aparece contabilizada en dos vistas del proyecto.', 'cubicación trazable sin duplicaciones'),
    ('Sala de impresión de planos', 'archivo final, escala indicada y prueba de impresión', 'La prueba impresa no conserva la escala declarada en el plano.', 'plano reproducido con escala verificada'),
    ('Emprendimiento de servicios de dibujo', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una entrega incluida en la propuesta.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Dibujo Técnico', 'dibujo', SOURCE)


def install_drawing_draft(con):
    install_draft(con, 'Dibujo Técnico', draft_modules())
