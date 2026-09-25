"""Unpublished Telecomunicaciones draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'telecom_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/telecomunicaciones.pdf'
DOSSIERS = [
    ('Equipo de planificación de enlaces', 'esquema de comunicaciones, inventario y ficha técnica', 'El tipo de enlace indicado en el esquema no coincide con la ficha del equipo.', 'revisión técnica del esquema y materiales'),
    ('Mesa de mantenimiento de terminales', 'orden de trabajo, manual del terminal y registro de pruebas', 'El terminal registrado tiene una versión diferente de la indicada en la orden.', 'informe de verificación y mantenimiento'),
    ('Laboratorio de configuración de redes', 'plano lógico, parámetros de interfaces y pruebas de conectividad', 'Una interfaz está asignada a un segmento distinto del previsto en el plano.', 'plan de configuración y comprobación de red'),
    ('Taller de circuitos electrónicos', 'esquema, especificaciones y mediciones simuladas', 'Una lectura del registro no corresponde al punto señalado en el esquema.', 'informe de diagnóstico y mediciones pendientes'),
    ('Equipo de instalación de servicios', 'solicitud del cliente, ficha del servicio y prueba de aceptación', 'La configuración entregada no contempla una condición confirmada en la solicitud.', 'registro de instalación y verificación del servicio'),
    ('Laboratorio de comunicaciones inalámbricas', 'plano de cobertura, configuración y resultados de prueba', 'Una zona prevista en el proyecto no tiene cobertura en la simulación.', 'propuesta de ajuste y prueba de cobertura'),
    ('Equipo de telefonía convergente', 'diagrama de voz y datos, parámetros de servicio y bitácora', 'El terminal de voz queda asociado a un segmento distinto del definido en el diagrama.', 'revisión de red telefónica y prueba de servicio'),
    ('Administración de servidores de red', 'solicitud de acceso, matriz de permisos y registro del sistema', 'Una cuenta conserva permisos que no figuran en la solicitud vigente.', 'plan de corrección y comprobación de permisos'),
    ('Equipo de mantenimiento de banda ancha', 'historial de fallas, ficha del enlace y resultados de prueba simulados', 'El informe de cierre no explica una medición fuera del rango entregado en la ficha.', 'diagnóstico documentado y prueba pendiente'),
    ('Emprendimiento de servicios de telecomunicaciones', 'propuesta, presupuesto y cronograma ficticios', 'El presupuesto omite un recurso del servicio ofrecido.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Telecomunicaciones', 'telecomunicaciones', SOURCE)


def install_telecom_draft(con):
    install_draft(con, 'Telecomunicaciones', draft_modules())


def install_telecom_course(con):
    install_course(con, 'Telecomunicaciones', draft_modules(),
                   'telecomunicaciones-mineduc-draft-v1',
                   'telecomunicaciones-mineduc-v1')
