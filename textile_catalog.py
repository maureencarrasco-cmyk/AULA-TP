"""Unpublished Vestuario y Confección Textil draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'textile_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/vestuario-confeccion-textil.pdf'
DOSSIERS = [
    ('Estudio de patronaje digital', 'orden de diseño, medidas y patrón digital', 'El patrón guardado no refleja una medida aprobada en la orden.', 'comparación de patrón y ajuste documentado'),
    ('Oficina de producción textil', 'boceto, especificación y ficha técnica', 'La ficha indica un insumo distinto del aprobado en el boceto.', 'ficha técnica revisada y control de versión'),
    ('Taller de máquinas de confección', 'bitácora, manual y pauta preventiva', 'La bitácora registra una falla pendiente que no figura en la orden.', 'informe de condición y derivación al responsable'),
    ('Planificación de corte simulado', 'orden, patrón y plano de tendido', 'El plano de tendido emplea una orientación distinta a la prevista para la tela.', 'revisión de aprovechamiento y consulta técnica'),
    ('Taller de confección', 'ficha técnica, muestra y pauta de terminación', 'La terminación de la muestra difiere de la definida en la ficha.', 'control de terminaciones y propuesta de corrección'),
    ('Estudio de diseño computacional', 'brief, paleta y propuesta digital', 'La propuesta usa una tela no contemplada en el brief aprobado.', 'diseño digital revisado y justificación de cambios'),
    ('Área de escalado industrial', 'patrón base, tabla de tallas y registro de escalado', 'Una talla escalada no coincide con la tabla de medidas.', 'comparación de tallas y registro de discrepancia'),
    ('Planificación de confección industrial', 'secuencia de operaciones, ficha y control de lote', 'La secuencia omite una operación indicada en la ficha.', 'flujo de producción corregido en simulación'),
    ('Control de calidad textil', 'pauta de calidad, muestra y registro de defectos', 'El defecto detectado no aparece en el registro de inspección.', 'informe de calidad y decisión simulada de retención'),
    ('Emprendimiento textil simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una terminación incluida en la oferta.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Vestuario y Confección Textil', 'vestuario-confeccion-textil', SOURCE)


def install_textile_draft(con):
    install_draft(con, 'Vestuario y Confección Textil', draft_modules())
