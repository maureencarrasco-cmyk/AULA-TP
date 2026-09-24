"""Unpublished Instalaciones Sanitarias draft linked to official MINEDUC modules."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'sanitary_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/instalaciones-sanitarias.pdf'
DOSSIERS = [
    ('Oficina de planos sanitarios', 'plano de redes, leyenda y especificación del proyecto', 'Un símbolo de la red no coincide con el indicado en la leyenda.', 'lectura documentada y consulta sobre el plano'),
    ('Equipo de trazado de redes', 'plano, croquis de terreno y registro de interferencias', 'El recorrido propuesto atraviesa un elemento no considerado en el plano.', 'trazado revisado con interferencia registrada'),
    ('Taller de agua potable', 'plano de red, lista de materiales y ficha de componentes', 'El accesorio recibido no coincide con la especificación del proyecto.', 'revisión documental de la red y sus materiales'),
    ('Equipo de alcantarillado', 'plano de evacuación, detalle de conexión y registro de obra', 'Una conexión ejecutada figura en un tramo diferente al del plano aprobado.', 'informe de discrepancia y verificación pendiente'),
    ('Equipo de riego agrícola', 'plano de riego, sectores de cultivo y listado de tuberías', 'Una zona prevista en el plano no aparece en el listado de ramales.', 'propuesta de red de riego revisada'),
    ('Oficina de cubicación sanitaria', 'planos revisados, cuadro de partidas y mediciones', 'Una longitud de tubería aparece contada en dos partidas.', 'cubicación trazable sin duplicación'),
    ('Taller de artefactos sanitarios', 'plano de ubicación, ficha del artefacto y pauta de inspección', 'El artefacto recibido difiere del identificado en el plano.', 'registro de instalación pendiente y consulta técnica'),
    ('Revisión documental de red de gas', 'plano aprobado, ficha del equipo y registro de autorización', 'La referencia del equipo en la ficha no coincide con la del plano.', 'informe de discrepancia para revisión de personal autorizado'),
    ('Equipo de mantenimiento de instalaciones', 'historial, plano y reporte de falla simulado', 'El reporte señala un tramo que no coincide con el identificado en el plano.', 'diagnóstico documental y derivación segura'),
    ('Emprendimiento de servicios sanitarios', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un insumo incluido en la propuesta.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Instalaciones Sanitarias', 'sanitarias', SOURCE)


def install_sanitary_draft(con):
    install_draft(con, 'Instalaciones Sanitarias', draft_modules())
