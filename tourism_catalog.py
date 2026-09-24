"""Unpublished Tourism Services draft grounded in the MINEDUC module pages."""

import json
from pathlib import Path

from tp_draft_builder import build_draft, install_course, install_draft


ROOT = Path(__file__).resolve().parent
OFFICIAL = json.loads((ROOT / 'tourism_official.json').read_text(encoding='utf-8'))
SOURCE = 'docs/fuentes/tp-programas/servicios-turismo.pdf'
DOSSIERS = [
    ('Agencia de viajes', 'solicitud del viajero, disponibilidad y registro de reserva ficticios', 'La fecha confirmada no coincide con la solicitada por el viajero.', 'reserva corregida y confirmación verificable'),
    ('Mostrador de información turística', 'consulta del visitante y fichas de servicios', 'La ficha consultada no confirma la condición de accesibilidad solicitada.', 'respuesta de orientación con fuente y pendiente identificado'),
    ('Oficina de información de destinos de Chile', 'ficha patrimonial, mapa y perfil del visitante', 'La descripción del recorrido omite una restricción indicada en la ficha.', 'propuesta de visita fundamentada'),
    ('Equipo de operación turística', 'itinerario, pronóstico oficial y protocolo de seguridad', 'El itinerario mantiene una actividad exterior pese a una alerta en el pronóstico.', 'decisión preventiva y plan alternativo documentado'),
    ('Atención oral a visitantes', 'solicitud en inglés, ficha del servicio y guion de respuesta', 'El guion oral omite una condición de la reserva expresada por el visitante.', 'respuesta oral en inglés verificada con la ficha'),
    ('Diseño de recorrido internacional', 'ficha de patrimonio mundial, mapa y requerimiento del grupo', 'La visita propuesta supera el tiempo disponible del grupo.', 'itinerario internacional ajustado y fundamentado'),
    ('Guía de un grupo turístico', 'lista de participantes, itinerario y protocolo de conducción', 'El recuento previo a la salida no coincide con la lista registrada.', 'registro de conducción y medida de verificación'),
    ('Equipo de programación turística', 'perfil del grupo, servicios disponibles y presupuesto ficticio', 'El programa incluye una actividad que no está confirmada por el proveedor.', 'programa turístico viable con pendiente documentado'),
    ('Atención escrita a visitantes', 'correo en inglés, condiciones del servicio y borrador de respuesta', 'El borrador confirma un horario distinto del indicado en el servicio.', 'respuesta escrita en inglés revisada'),
    ('Emprendimiento turístico escolar', 'propuesta, presupuesto y cronograma ficticios', 'Un servicio incluido en la propuesta no tiene costo considerado.', 'plan de emprendimiento con control de avance'),
]


def draft_modules():
    return build_draft(OFFICIAL, DOSSIERS, 'Servicios de Turismo', 'turismo', SOURCE)


def install_tourism_draft(con):
    install_draft(con, 'Servicios de Turismo', draft_modules())


def install_tourism_course(con):
    install_course(
        con,
        'Servicios de Turismo',
        draft_modules(),
        'turismo-mineduc-draft-v1',
        'turismo-mineduc-v1',
    )
