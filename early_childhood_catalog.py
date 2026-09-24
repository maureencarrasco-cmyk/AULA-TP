"""Unpublished Atención de Párvulos draft grounded in MINEDUC."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'early_childhood_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/atencion-parvulos.pdf'
DOSSIERS = [
    ('Sala de recursos educativos simulada', 'plan pedagógico, inventario y pauta de materiales', 'Un material propuesto no corresponde a la edad indicada en el plan.', 'selección justificada y consulta a la educadora'),
    ('Planificación de expresión musical', 'secuencia educativa, recursos y registro de observación ficticio', 'La duración propuesta difiere de la planificada para el grupo.', 'ajuste de secuencia bajo supervisión educativa'),
    ('Comunicación con familias simulada', 'comunicado ficticio, protocolo y registro de autorización', 'El comunicado incorpora información no autorizada para compartir.', 'revisión de privacidad y derivación a la educadora'),
    ('Análisis de salud infantil', 'situación ficticia, protocolo institucional y registro de aviso', 'El registro de observación no confirma que se informó al adulto responsable.', 'identificación de alerta y derivación a personal competente'),
    ('Planificación de recreación', 'plan de juego, mapa del espacio y pauta de bienestar', 'Una zona del juego presenta una restricción indicada en el mapa.', 'adaptación de actividad y consulta a la educadora'),
    ('Diseño de actividad educativa', 'objetivo, materiales y pauta de observación', 'La evidencia prevista no permite observar el aprendizaje indicado.', 'actividad y registro de observación revisados'),
    ('Rincón de literatura y teatro', 'guion breve, selección de textos y plan de grupo', 'El texto elegido no se ajusta al tramo etario descrito.', 'selección fundamentada y ajuste de mediación'),
    ('Planificación de alimentación infantil', 'menú ficticio, fichas de restricciones y protocolo', 'El menú asignado no refleja una restricción registrada.', 'detección de incompatibilidad y derivación al responsable'),
    ('Control de higiene y seguridad', 'pauta institucional, mapa de sala y registro de incidente ficticio', 'Un riesgo del mapa no aparece en la pauta del día.', 'reporte preventivo y consulta a la educadora'),
    ('Emprendimiento educativo simulado', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite una medida de seguridad prevista.', 'plan de emprendimiento con costos revisados'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Atención de Párvulos', 'atencion-parvulos', SOURCE)


def install_early_childhood_draft(con):
    install_draft(con, 'Atención de Párvulos', draft_modules())
