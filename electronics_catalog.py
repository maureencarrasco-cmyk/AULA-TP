"""Unpublished Electronics draft grounded in MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'electronics_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/electronica.pdf'
DOSSIERS = [
    ('Taller de proyectos electrónicos', 'plano, lista de componentes y ficha del fabricante', 'El componente solicitado no coincide con la referencia del plano.', 'revisión de proyecto y lista de materiales'),
    ('Mesa de reparación de circuitos', 'esquema, registro de mediciones simuladas y pauta de seguridad', 'El valor registrado en un punto de prueba difiere del valor esperado en la pauta.', 'informe de diagnóstico sin energizar el circuito real'),
    ('Laboratorio de equipos digitales', 'diagrama de bloques, inventario y registro de pruebas', 'La versión del módulo digital anotada en el inventario difiere de la instalada.', 'comprobación de ensamblaje y compatibilidad'),
    ('Laboratorio de control domótico', 'plano del recinto, ficha de sensores y secuencia de control', 'La ubicación propuesta del sensor no corresponde al área indicada en el plano.', 'ajuste fundamentado de la lógica de control'),
    ('Taller de control electrónico de potencia', 'manual del equipo, historial y pauta de inspección', 'El registro de operación indica una condición distinta de la permitida en el manual.', 'informe de verificación y resguardo'),
    ('Equipo de diagnóstico industrial', 'bitácora de fallas, diagrama funcional y datos de prueba simulados', 'La hipótesis de falla no explica uno de los eventos registrados.', 'diagnóstico argumentado y pruebas pendientes'),
    ('Laboratorio de control eléctrico industrial', 'diagrama de control, secuencia programada y pauta de prueba', 'La secuencia simulada no respeta la condición de detención definida en el proyecto.', 'revisión de programa y verificación segura'),
    ('Taller de montaje industrial', 'plano de montaje, inventario y ficha del equipo', 'Un dispositivo previsto en el plano no aparece en el inventario recibido.', 'plan de montaje y discrepancias documentadas'),
    ('Equipo de automatización', 'matriz de entradas y salidas, lógica de control y resultados de simulación', 'Una salida se activa ante una entrada distinta de la especificada.', 'propuesta de corrección y prueba de la lógica'),
    ('Emprendimiento de servicios electrónicos', 'propuesta de servicio, presupuesto y cronograma ficticios', 'El presupuesto omite un componente considerado en la propuesta.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Electrónica', 'electronica', SOURCE)


def install_electronics_draft(con):
    install_draft(con, 'Electrónica', draft_modules())


def install_electronics_course(con):
    install_course(
        con,
        'Electrónica',
        draft_modules(),
        'electronica-mineduc-draft-v1',
        'electronica-mineduc-v1',
    )
