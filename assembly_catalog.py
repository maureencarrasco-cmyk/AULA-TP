"""Unpublished Montaje Industrial draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'assembly_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/montaje-industrial.pdf'
DOSSIERS = [
    ('Taller de uniones metálicas', 'plano, orden de reparación y pauta de seguridad', 'La unión representada en el plano no coincide con la registrada en la orden.', 'informe de discrepancia y propuesta de verificación supervisada'),
    ('Oficina técnica de montaje', 'planos de conjunto, simbología y lista de piezas', 'La lista de piezas indica una dimensión distinta a la cota del plano.', 'lectura comparada de planos y consulta técnica'),
    ('Área de planificación', 'croquis, medidas registradas y memoria de cálculo', 'Una medida anotada en terreno no coincide con el croquis de referencia.', 'registro de mediciones y cálculo revisado'),
    ('Planificación de izaje simulado', 'plan de levante, ficha de carga y pauta preventiva', 'La masa consignada en la ficha difiere de la indicada en el plan.', 'identificación de riesgo y suspensión preventiva documentada'),
    ('Área de tratamiento superficial', 'fichas de material, registro de residuos y pauta ambiental', 'El residuo registrado no coincide con la clasificación de la ficha.', 'clasificación documentada y consulta de manejo seguro'),
    ('Montaje industrial simulado', 'planos de fijación, lista de componentes y control de calidad', 'El tipo de fijación previsto no corresponde al detalle aprobado.', 'secuencia de montaje simulada y observaciones de control'),
    ('Equipo de mantenimiento', 'orden de trabajo, historial y registro de inspección', 'El historial señala una intervención pendiente que no aparece en la orden.', 'informe de mantenimiento y consulta al responsable'),
    ('Oficina de cubicación', 'planos, especificaciones y presupuesto de referencia', 'La cantidad calculada difiere del metrado de la especificación.', 'cubicación comprobada y justificación de diferencias'),
    ('Emprendimiento de servicios industriales simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un recurso indicado en el cronograma.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Montaje Industrial', 'montaje', SOURCE)


def install_assembly_draft(con):
    install_draft(con, 'Montaje Industrial', draft_modules())


def install_assembly_course(con):
    install_course(
        con,
        'Montaje Industrial',
        draft_modules(),
        'montaje-mineduc-draft-v1',
        'montaje-mineduc-v1',
    )
