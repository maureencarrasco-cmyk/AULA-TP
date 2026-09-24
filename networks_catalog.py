"""Unpublished Conectividad y Redes draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'networks_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/conectividad-redes.pdf'
DOSSIERS = [
    ('Taller de instalación de red local', 'plano de red, inventario de cableado y ficha de puntos inalámbricos', 'Un punto de conexión del plano no aparece en el inventario de materiales.', 'lista de materiales y revisión de instalación'),
    ('Área de preparación de equipos', 'orden de ensamblaje, ficha del equipo y registro de pruebas', 'La memoria instalada no coincide con la requerida en la orden.', 'registro de configuración y comprobación'),
    ('Mesa de soporte de aplicaciones', 'solicitud del usuario, requisitos del programa e inventario de licencias', 'La versión disponible no figura entre las compatibles con el equipo.', 'plan de instalación y comunicación al usuario'),
    ('Laboratorio de servicios en red', 'diagrama LAN, parámetros del servicio y resultados de conectividad', 'El servicio responde desde un equipo pero no desde otro segmento de la red.', 'informe de configuración y prueba de conexión'),
    ('Equipo de seguridad de una red local', 'política de acceso, reglas del dispositivo y registro de eventos ficticios', 'Una regla permite tráfico que la política indica restringir.', 'revisión de configuración y medida de resguardo'),
    ('Taller de mantenimiento de red', 'cronograma, inventario de equipos y pauta del fabricante', 'Un equipo del inventario figura intervenido sin la verificación prevista.', 'registro de mantenimiento y pendientes'),
    ('Área de actualización de software', 'inventario de versiones, ventana de mantenimiento y plan de reversión', 'La actualización propuesta no incluye un paso para comprobar el servicio.', 'secuencia de actualización y verificación'),
    ('Unidad de respaldo de información', 'política de copias, registro de ejecución y prueba de restauración ficticia', 'El último respaldo aparece completo, pero no tiene prueba de restauración.', 'plan de recuperación y verificación de integridad'),
    ('Emprendimiento de soporte de redes', 'propuesta de servicio, presupuesto y cronograma ficticios', 'El presupuesto no contempla un insumo del servicio ofrecido.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Conectividad y Redes', 'redes', SOURCE)


def install_networks_draft(con):
    install_draft(con, 'Conectividad y Redes', draft_modules())
