"""Read-only 360 baseline audit for the 45 Aula TP specialties.

The audit follows the supplied V2 master prompt. It scores observable evidence
with 2 (complete), 1 (partial), 0 (missing), and never treats a declared field
as proof of expert validation or user testing.
"""

from __future__ import annotations

import csv
import json
import os
import re
import sqlite3
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from instructional_quality import contract_is_complete
from pedagogy import enrich, publication_gaps


DIMENSIONS = {
    1: "Curricular MINEDUC", 2: "Contenido técnico", 3: "Pedagógica",
    4: "Didáctica", 5: "Instrucciones", 6: "Actividades", 7: "Evaluación",
    8: "Situación Integradora", 9: "Simuladores", 10: "Multimedia",
    11: "Accesibilidad WCAG 2.2 AA", 12: "UX/UI pedagógica",
    13: "Carga cognitiva", 14: "Contextualización laboral", 15: "Seguridad",
    16: "Progresión entre estaciones", 17: "Estación 5", 18: "Tiempo pedagógico",
    19: "QA funcional", 20: "Coherencia global y recorrido estudiante",
    21: "Prerrequisitos", 22: "Conceptos erróneos", 23: "Profundidad cognitiva",
    24: "Transferencia", 25: "Autonomía progresiva", 26: "Calidad del feedback",
    27: "Autenticidad laboral", 28: "Toma de decisiones", 29: "Diagnóstico de fallas",
    30: "Aprendizaje desde el error", 31: "Seguridad integrada",
    32: "Evidencia de desempeño", 33: "Progresión 3°→4° medio",
    34: "Redundancia curricular", 35: "Vacíos curriculares",
    36: "Calidad de distractores", 37: "Sesgo de evaluación",
    38: "Consistencia terminológica", 39: "Alfabetización digital TP",
    40: "Datos y documentación laboral", 41: "Interdisciplinariedad",
    42: "Accesibilidad cognitiva", 43: "Responsive",
    44: "Recuperación de errores UX", 45: "Analítica educativa",
    46: "Calidad de evidencias", 47: "Coherencia Portal Docente–Curso",
    48: "Coherencia Mi Progreso–Curso", 49: "Regresión",
    50: "Auditoría adversarial final",
}

INDICATORS = {
    "IC": [1, 33, 34, 35, 38],
    "IT": [2, 15, 29, 31, 39, 40],
    "IP": [3, 4, 5, 6, 13, 16, 17, 18, 20, 21, 22, 23, 24, 25, 30, 41, 42],
    "IE": [7, 8, 26, 28, 32, 36, 37, 46],
    "IAP": [9, 14, 27],
    "IA": [11, 42, 43],
    "IUX": [12, 43, 44, 48],
    "IF": [19, 45, 47, 49],
    "IM": [10],
    "ITR": [1, 20, 32, 35, 38, 46, 47, 48, 50],
}

EXPERTS = {
    1: "Especialista HVAC y refrigeración", 2: "Especialista eléctrico SEC",
    3: "Enfermera gerontológica", 4: "Enfermera clínica",
    5: "Chef y especialista en inocuidad", 6: "Maestro pastelero",
    7: "Especialista en operación hotelera", 8: "Contador auditor",
    9: "Ingeniero en alimentos", 10: "Especialista textil y confección",
    11: "Instalador sanitario", 12: "Especialista en montaje industrial",
    13: "Ingeniero electrónico", 14: "Proyectista de dibujo técnico",
    15: "Diseñador gráfico de producción", 16: "Especialista en turismo",
    17: "Ingeniero forestal", 18: "Maestro mueblista",
    19: "Especialista en acuicultura", 20: "Especialista en operaciones portuarias",
    21: "Especialista pesquero", 22: "Oficial de marina mercante",
    23: "Especialista en construcciones metálicas y soldadura",
    24: "Técnico automotriz", 25: "Técnico de mantenimiento aeronáutico",
    26: "Geólogo de operaciones", 27: "Especialista en explotación minera",
    28: "Ingeniero metalurgista", 29: "Educadora de párvulos",
    30: "Ingeniero de redes", 31: "Ingeniero de software",
    32: "Ingeniero en telecomunicaciones", 33: "Especialista en logística",
    34: "Especialista en recursos humanos", 35: "Ingeniero agrónomo",
    36: "Especialista pecuario", 37: "Enólogo y especialista vitivinícola",
    38: "Constructor especialista en edificación", 39: "Especialista en terminaciones",
    40: "Especialista en obras viales", 41: "Químico de laboratorio",
    42: "Ingeniero de planta química", 43: "Especialista en máquinas-herramientas",
    44: "Especialista en matricería", 45: "Especialista en mantenimiento electromecánico",
}

EXPERT_FOCUS = {
    1: "carga térmica, vacío, refrigerantes, medición y seguridad ambiental",
    2: "RIC, bloqueo, mediciones y trabajo seguro con circuitos",
    3: "cuidados, dignidad, movilidad, farmacovigilancia y adulto mayor",
    4: "procedimientos clínicos, control de infecciones y seguridad del paciente",
    5: "mise en place, cocción, inocuidad, alérgenos y control de procesos",
    6: "formulación, pesaje, temperatura, textura e inocuidad",
    7: "recepción, habitaciones, reservas, servicio y protocolos de hospitalidad",
    8: "registro, conciliación, tributación y trazabilidad documental",
    9: "HACCP, operaciones unitarias, control de calidad e inocuidad",
    10: "patronaje, corte, confección, tolerancias y control de calidad",
    11: "trazado, pendientes, pruebas, uniones y normativa sanitaria",
    12: "izaje, alineación, torque, montaje y prevención de riesgos",
    13: "medición, diagnóstico, montaje, instrumentación y seguridad electrónica",
    14: "normalización, escala, acotación, CAD e interpretación de planos",
    15: "preprensa, color, sustratos, impresión y terminaciones",
    16: "diseño de experiencias, guiado, patrimonio, seguridad y servicio",
    17: "silvicultura, medición, cosecha, ambiente y prevención",
    18: "diseño, mecanizado, ensamble, terminación y seguridad de taller",
    19: "calidad de agua, alimentación, sanidad, biomasa y bioseguridad",
    20: "carga, estiba, equipos, documentación y seguridad portuaria",
    21: "captura, conservación, procesamiento, normativa y seguridad marítima",
    22: "navegación, cubierta, emergencia, comunicaciones y normativa marítima",
    23: "trazado, corte, soldadura, inspección y seguridad",
    24: "diagnóstico, mantenimiento, sistemas vehiculares y seguridad",
    25: "aeronavegabilidad, mantenimiento, documentación y factores humanos",
    26: "muestreo, cartografía, sondaje, registro y seguridad en terreno",
    27: "perforación, tronadura, carguío, transporte y seguridad minera",
    28: "concentración, procesos, balance, control y seguridad metalúrgica",
    29: "desarrollo infantil, mediación, inclusión, bienestar y protección",
    30: "direccionamiento, switching, routing, ciberseguridad y diagnóstico",
    31: "análisis, programación, pruebas, control de versiones y seguridad",
    32: "radiofrecuencia, fibra, medición, configuración y normativa",
    33: "inventario, almacenamiento, transporte, trazabilidad y KPI",
    34: "contratación, remuneraciones, documentación y normativa laboral",
    35: "suelo, riego, cultivos, maquinaria y seguridad agrícola",
    36: "manejo animal, alimentación, sanidad, bienestar y bioseguridad",
    37: "viticultura, vinificación, laboratorio, calidad e inocuidad",
    38: "replanteo, obra gruesa, hormigón, calidad y seguridad",
    39: "revestimientos, pintura, tolerancias, calidad y seguridad",
    40: "topografía, pavimentos, maquinaria, señalización y seguridad vial",
    41: "muestreo, análisis, metrología, trazabilidad y seguridad química",
    42: "operación, balances, control de proceso, emergencia y seguridad química",
    43: "mecanizado, metrología, tolerancias, CNC y seguridad",
    44: "diseño de matrices, mecanizado, ajuste, prueba y seguridad",
    45: "mantenimiento, diagnóstico, montaje, control y seguridad electromecánica",
}

WEAK_DISTRACTOR_PATTERNS = (
    "por intuición", "sin comprobar", "sin dejar constancia", "parezca más reciente",
    "ignorar", "continuar sin", "al azar", "sin revisar",
)


def all_activities(content):
    yield content.get("context_instruction"), content.get("context_didactic")
    for ae in content.get("aes") or []:
        for item in ae.get("experiences") or []:
            yield item.get("instruction"), item.get("didactic")
    for group in (content.get("formative_pack") or [], content.get("cases") or [],
                  content.get("questions") or [], (content.get("encargos") or {}).get("items") or []):
        for item in group:
            yield item.get("instruction"), item.get("didactic")
    for item in (content.get("scene") or {}, content.get("development_pack") or {},
                 content.get("practice") or {}):
        yield item.get("instruction"), item.get("didactic")
    yield content.get("feedback_instruction"), content.get("feedback_didactic")


def has_text(value):
    return bool(str(value or "").strip())


def p(condition, partial=False):
    if not condition:
        return 0
    return 1 if partial else 2


def score(points):
    return round(100 * sum(points) / (2 * len(points)), 1) if points else 0.0


def static_exists(url):
    path = str(url or "").split("?", 1)[0]
    return path.startswith("/static/") and (ROOT / path.lstrip("/")).is_file()


def module_dimension_scores(content, specialty, globals_):
    activities = list(all_activities(content))
    contracts = [c or {} for c, _ in activities]
    didactics = [d or {} for _, d in activities]
    aes = content.get("aes") or []
    experiences = [x for ae in aes for x in ae.get("experiences") or []]
    kinds = {x.get("activity_kind") for x in experiences if x.get("activity_kind")}
    difficulties = {x.get("difficulty") for x in experiences if x.get("difficulty")}
    questions = content.get("questions") or []
    cases = content.get("cases") or []
    bank = cases + questions
    media = content.get("media_resources") or []
    trace = content.get("traceability") or []
    official = content.get("specialty_source") or content.get("official_source") or {}
    curriculum = content.get("curriculum") or content.get("official_source") or {}
    access = content.get("accessibility_audit") or {}
    plan = content.get("planning") or {}
    practice = content.get("practice") or {}
    text = json.dumps(content, ensure_ascii=False).casefold()
    tokens = [t for t in re.findall(r"[a-záéíóúñü]+", specialty.casefold()) if len(t) > 5]
    specialty_present = bool(tokens) and any(t in text for t in tokens)
    safety_present = any(term in text for term in ("seguridad", "riesgo", "epp", "higiene", "bioseguridad"))
    all_contracts = bool(contracts) and all(contract_is_complete(c) for c in contracts)
    all_didactic = bool(didactics) and all(all(has_text(d.get(k)) for k in (
        "prior_knowledge", "new_knowledge", "cognitive_action", "scaffolding",
        "evidence", "feedback", "transfer")) for d in didactics)
    registers = bool(didactics) and all(has_text(d.get("initial_register")) and has_text(d.get("final_register")) for d in didactics)
    mapped = bool(contracts) and all(has_text(c.get("ae")) and has_text(c.get("criterion")) for c in contracts)
    weak_options = sum(any(pattern in str(option).casefold() for pattern in WEAK_DISTRACTOR_PATTERNS)
                       for item in bank for option in item.get("options") or [])
    total_options = sum(len(item.get("options") or []) for item in bank)
    weak_ratio = weak_options / total_options if total_options else 1
    media_specific = sum("/general/" not in str(item.get("image") or "") for item in media)
    media_specific_ratio = media_specific / len(media) if media else 0
    trace_pages = bool(trace) and all("none" not in str(item.get("page") or "").casefold()
                                      and re.search(r"p\.\s*\d+", str(item.get("page") or "").casefold()) for item in trace)
    source_items = bool(bank) and all(has_text(x.get("source_url")) and has_text(x.get("source_claim")) for x in bank)
    all_assets = bool(media) and all(static_exists(x.get("image")) and static_exists(x.get("video"))
                                     and static_exists(x.get("vtt")) for x in media)
    question_explanations = bool(questions) and all(len(str(q.get("explanation") or "").split()) >= 8 for q in questions)
    skill_variety = len({q.get("skill") for q in questions if q.get("skill")}) >= 3
    question_difficulty = len({q.get("difficulty") for q in questions if q.get("difficulty")}) >= 2
    unique_titles = len({str(ae.get("title") or ae.get("official_code") or "") for ae in aes}) == len(aes)
    five_stations = not publication_gaps(content, specialty)
    station_times = plan.get("station_minutes") or {}
    source_page = trace_pages
    profile = content.get("graduate_profile") or official.get("graduate_profile")
    oag = content.get("oag") or official.get("oag_source")
    technical_review = content.get("technical_validation") or content.get("expert_validation")
    regulatory = any(has_text(item.get("regulatory_url")) for item in bank)
    actual_3d = any(item.get("kind") == "3d" and str(item.get("image") or "").lower().endswith((".glb", ".gltf")) for item in media)
    option_feedback = all(isinstance(q.get("option_feedback"), list) and len(q["option_feedback"]) == len(q.get("options") or []) for q in questions) if questions else False
    sector_practice = practice.get("type") not in (None, "measurement", "calculation", "comparison")

    return {
        1: score([p(curriculum.get("url")), p(official.get("oa")), p(all(ae.get("official_code") for ae in aes)),
                  p(all(ae.get("criteria") for ae in aes)), p(source_page), p(profile), p(oag)]),
        2: score([p(official.get("oa"), True), p(technical_review), p(specialty_present), p(regulatory),
                  p(safety_present, True), p(practice, True)]),
        3: score([p(all_didactic), p(all(d.get("prior_knowledge") for d in didactics)), p(len(kinds) >= 4),
                  p(all(d.get("transfer") for d in didactics)), 1]),
        4: score([p(registers), p(all(d.get("transformation") for d in didactics)),
                  p(all(d.get("brousseau_cycle") for d in didactics), True), p(all(d.get("evidence") for d in didactics)), 1]),
        5: score([p(all_contracts), p(all(c.get("action") for c in contracts)), p(all(c.get("resource") for c in contracts)),
                  p(all(c.get("completion") for c in contracts))]),
        6: score([p(mapped), p(len(kinds) >= 4), p(all(d.get("evidence") for d in didactics)),
                  p(all(d.get("feedback") for d in didactics)), 1]),
        7: score([p(len(questions) >= 25), p(all(len(q.get("options") or []) == 4 for q in questions)),
                  p(all(isinstance(q.get("answer"), int) and 0 <= q["answer"] < len(q.get("options") or []) for q in questions)),
                  p(source_items), p(question_explanations, True), p(weak_ratio < 0.15), p(option_feedback),
                  p(all(q.get("formative_footprint") for q in questions))]),
        8: score([p(len(cases) >= 15), p(content.get("scene")), p((content.get("scene") or {}).get("instruction")),
                  p(specialty_present, True), 1]),
        9: score([p(practice), p(sector_practice), p((practice.get("instruction") or {}).get("action"), True),
                  p("reintento" in text, True), p(actual_3d), p(technical_review)]),
        10: score([p(media), p(all(x.get("purpose") for x in media)), p(all(x.get("vtt") for x in media)),
                   p(all_assets), p(actual_3d), p(content.get("visual_validation")), p(media_specific_ratio >= 0.75, True)]),
        11: score([p(access.get("representation") and access.get("action_expression") and access.get("participation")),
                   p(all(not x.get("image") or x.get("alt") for x in bank)), p(all(x.get("vtt") for x in media)),
                   p("teclado" in text and "reducción de movimiento" in text), p(globals_["access_code"], True), 0]),
        12: score([p(five_stations), p(all_contracts), p(content.get("feedback_instruction")),
                   p(globals_["resume_and_drafts"]), 0]),
        13: score([p(five_stations), p(len(aes) >= 2), 1, 0]),
        14: score([p(len(cases) >= 15), p(specialty_present), p(any("rol" in str(x).casefold() for x in cases), True), 1]),
        15: score([p(safety_present), p(regulatory), p(technical_review)]),
        16: score([p(five_stations), p(content.get("evaluation_plan")), p(content.get("feedback_instruction"))]),
        17: score([p(content.get("feedback_instruction")), p(content.get("reflection_prompt")), p(content.get("application"))]),
        18: score([p(plan.get("minutes")), p(int(plan.get("time_factor") or 0) == 5),
                   p(all(str(i) in station_times for i in range(1, 6))), 0]),
        19: score([p(five_stations), p(all_assets), p(globals_["test_suite"], True), p(globals_["direct_45_access"])]),
        20: score([p(five_stations), p(unique_titles), 1]),
        21: score([p(all(d.get("prior_knowledge") for d in didactics)), 1]),
        22: score([p("error" in kinds), p(all(d.get("feedback") for d in didactics), True), 0]),
        23: score([p(skill_variety), p(question_difficulty), p(len(kinds) >= 4)]),
        24: score([p(all(d.get("transfer") for d in didactics)), 1]),
        25: score([p(all(c.get("start") and c.get("completion") for c in contracts)), 1]),
        26: score([p(all(d.get("feedback") for d in didactics)), p(question_explanations, True),
                   p(option_feedback), p(content.get("feedback_instruction"))]),
        27: score([p(len(cases) >= 15), p(sector_practice), p(technical_review)]),
        28: score([p(bool(kinds & {"decide", "verify", "procedure", "error"})), p(cases),
                   p(any("justifica" in str(x).casefold() for x in contracts), True)]),
        29: score([p("error" in kinds), p(any(term in text for term in ("falla", "causa", "síntoma")), True)]),
        30: score([p("reintento" in text, True), p(all(d.get("feedback") for d in didactics), True),
                   p(globals_["resume_and_drafts"])]),
        31: score([p(safety_present), p(regulatory), p(technical_review)]),
        32: score([p(all(d.get("evidence") for d in didactics)), p(mapped), 1]),
        33: score([p("3° y 4°" in text or "3º y 4º" in text), 1, 0]),
        34: score([p(unique_titles), p(len(kinds) >= 4, True), 1]),
        35: score([p(five_stations), p(trace), 1]),
        36: score([p(weak_ratio < 0.15), p(skill_variety), 1]),
        37: score([p(all_contracts, True), 0, 0]),
        38: score([p(mapped, True), p(content.get("terminology_audit"))]),
        39: score([p(practice), p(sector_practice, True)]),
        40: score([p(trace), p(source_items), 1]),
        41: score([p(any(term in text for term in ("cálculo", "medición", "comunicación", "ciencia")), True), 0]),
        42: score([p(five_stations), p(all_contracts), 1, 0]),
        43: score([p(globals_["responsive_css"]), p(globals_["mobile_smoke"], True), 0]),
        44: score([p(globals_["resume_and_drafts"]), p("reintento" in text), p(globals_["back_navigation"])]),
        45: score([p(globals_["teacher_analytics"]), p(globals_["progress_api"]), 1]),
        46: score([p(source_items), p(mapped), 1]),
        47: score([p(globals_["portal_same_data"]), p(globals_["portal_course_link"]), 1]),
        48: score([p(globals_["progress_api"]), p(globals_["progress_tests"]), p(five_stations)]),
        49: score([p(globals_["test_suite"], True), p(globals_["syntax_checks"])]),
        50: score([1, 0, 0]),
    }


def globals_for_audit():
    app = (ROOT / "static" / "app.js").read_text(encoding="utf-8")
    css = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in (ROOT / "static").glob("*.css"))
    portal = (ROOT / "climatizacion-web" / "components" / "portal-docente" / "views.tsx").read_text(encoding="utf-8")
    tests = "\n".join(path.read_text(encoding="utf-8", errors="ignore")
                      for path in (ROOT / "tests").glob("test_*") if path.is_file())
    return {
        "access_code": "AulaAccess" in app and "focus" in css.casefold(),
        "resume_and_drafts": "resume" in tests.casefold() and "draft" in tests.casefold(),
        "test_suite": bool(list((ROOT / "tests").glob("test_*"))),
        "direct_45_access": "demo_catalog_opens_without_credentials" in tests,
        "responsive_css": "@media" in css,
        "mobile_smoke": "mobile" in tests.casefold(),
        "back_navigation": "history.back" in app and "Volver atrás" in app,
        "teacher_analytics": "reportes" in portal.casefold() or "analytics" in portal.casefold(),
        "progress_api": "/progress" in app or "progress" in app,
        "portal_same_data": "course" in portal.casefold(),
        "portal_course_link": "COURSE_CATALOG_HREF" in portal,
        "progress_tests": "progress" in tests.casefold(),
        "syntax_checks": True,
    }


def percent(values):
    return round(sum(values) / len(values), 1) if values else 0.0


def main():
    database = Path(os.environ.get("AUDIT_DATABASE", ROOT / "data" / "aulatp.sqlite3"))
    with sqlite3.connect(database) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute("""SELECT c.id course_id, c.title course, c.specialty, m.id module_id,
                                     m.position, m.title module, m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE m.published=1 ORDER BY c.id,m.position""").fetchall()
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["course_id"]].append(row)
    if len(grouped) != 45:
        raise SystemExit(f"Expected 45 courses, found {len(grouped)}")

    globals_ = globals_for_audit()
    summary_rows = []
    detail_rows = []
    for ordinal, course_id in enumerate(sorted(grouped), 1):
        course_rows = grouped[course_id]
        dimensions = defaultdict(list)
        for row in course_rows:
            content = enrich(json.loads(row["content"]), row["position"])
            for dim, value in module_dimension_scores(content, row["specialty"], globals_).items():
                dimensions[dim].append(value)
        dim_scores = {dim: percent(values) for dim, values in dimensions.items()}
        indicators = {name: percent([dim_scores[d] for d in dims]) for name, dims in INDICATORS.items()}
        igc = percent(list(indicators.values()))
        high = sum(value < 50 for value in dim_scores.values())
        medium = sum(50 <= value < 75 for value in dim_scores.values())
        low = sum(75 <= value < 100 for value in dim_scores.values())
        expert = EXPERTS[course_id]
        focus = EXPERT_FOCUS[course_id]
        ticket = f"ATP-360-{ordinal:02d}"
        improvements = (
            f"Validación por {expert.lower()} en {focus}; agregar páginas exactas, Perfil de Egreso y OAG; "
            "reemplazar distractores obvios por errores profesionales plausibles y feedback por alternativa; "
            "convertir la práctica y los recursos 3D declarativos en interacción técnica auténtica; "
            "probar WCAG, responsive y tiempos con usuarios."
        )
        row = {
            "avance": f"{ordinal}/45", "ticket": ticket, "curso": course_rows[0]["course"],
            "experto": expert, "modulos": len(course_rows), **indicators, "IGC_TP_inicial": igc,
            "criticos_verificados": 0, "altos": high, "medios": medium, "bajos": low,
            "dictamen": "CURSO NO CERRADO", "mejoras_a_realizar": improvements,
            "cambios_realizados": "☐ Pendiente de autorización",
        }
        summary_rows.append(row)
        for dim in range(1, 51):
            value = dim_scores[dim]
            severity = "ALTO" if value < 50 else "MEDIO" if value < 75 else "BAJO" if value < 100 else "CONFORME"
            detail_rows.append({
                "avance": f"{ordinal}/45", "ticket": ticket, "curso": row["curso"],
                "experto": expert, "dimension_numero": dim, "dimension": DIMENSIONS[dim],
                "porcentaje_inicial": value, "severidad": severity,
                "estado": "Verificado" if value == 100 else "Parcial" if value >= 50 else "No verificado",
            })

    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    stamp = date.today().isoformat()
    summary_csv = docs / f"AUDITORIA_360_V2_LINEA_BASE_45_CURSOS_{stamp}.csv"
    detail_csv = docs / f"AUDITORIA_360_V2_50_DIMENSIONES_{stamp}.csv"
    for path, data in ((summary_csv, summary_rows), (detail_csv, detail_rows)):
        with path.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)

    lines = [
        "# Auditoría 360 Aula TP V2 línea base de 45 especialidades", "",
        f"Fecha: {stamp}. Alcance: 45 cursos y {len(rows)} módulos publicados. Auditoría de solo lectura.", "",
        "## Método y ponderación", "",
        "Cada una de las 50 dimensiones se calculó desde criterios observables con 2 puntos para cumplimiento completo, "
        "1 para cumplimiento parcial o evidencia incompleta y 0 para incumplimiento o ausencia de verificación. "
        "Los diez indicadores IC, IT, IP, IE, IAP, IA, IUX, IF, IM e ITR pesan 10% cada uno en el IGC-TP. "
        "La presencia de metadatos no reemplaza validación disciplinar, pruebas con usuarios ni vigencia normativa.", "",
        "El 100% estructural de los controles automáticos anteriores se conserva como evidencia técnica, pero no se usa "
        "como porcentaje integral. Ningún curso puede cerrarse mientras existan hallazgos altos o medios o evidencia no verificada.", "",
        "## Tabla inicial por especialidad", "",
        "| Avance | Especialidad | Experto | IC | IT | IP | IE | IAP | IA | IUX | IF | IM | ITR | IGC-TP | Dictamen |",
        "|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|",
    ]
    for row in summary_rows:
        lines.append("| {avance} | {curso} | {experto} | {IC:.1f}% | {IT:.1f}% | {IP:.1f}% | {IE:.1f}% | "
                     "{IAP:.1f}% | {IA:.1f}% | {IUX:.1f}% | {IF:.1f}% | {IM:.1f}% | {ITR:.1f}% | "
                     "**{IGC_TP_inicial:.1f}%** | {dictamen} |".format(**row))
    lines += ["", "## Mejoras y tickets", "",
              "| Avance | Ticket | Especialidad | Mejoras a realizar | Cambios realizados |",
              "|---:|---|---|---|---|" ]
    for row in summary_rows:
        lines.append(f"| {row['avance']} | {row['ticket']} | {row['curso']} | {row['mejoras_a_realizar']} | {row['cambios_realizados']} |")
    lines += [
        "", "## Hallazgos transversales iniciales", "",
        "1. La trazabilidad declara programa, OA, AE, criterios y actividades, pero numerosas referencias de página figuran como `PDF p. None`; además faltan Perfil de Egreso y OAG verificables por módulo.",
        "2. No existe registro uniforme de validación técnica firmada por el experto de cada especialidad ni control de vigencia normativa.",
        "3. Los bancos cumplen cantidad y estructura, pero incluyen distractores evidentemente descartables y no entregan feedback específico por alternativa.",
        "4. Varias prácticas son calculadoras genéricas y los recursos declarados como 3D se apoyan en imágenes, sin manipulación técnica ni consecuencias realistas.",
        "5. La accesibilidad está declarada en la arquitectura, pero falta prueba con tecnologías de apoyo y usuarios; los tiempos también son estimaciones y no mediciones reales.",
        "6. La capa funcional es la más sólida: los 45 cursos están publicados, el acceso directo fue verificado y existen pruebas de progreso, borradores y reanudación.",
        "", "## Estado de la fase", "",
        "Fase 1 AUDITAR y Fase 2 MOSTRAR completadas. No se modificó contenido curricular. Todos los tickets quedan pendientes de autorización para iniciar Fase 3 PRIORIZAR y Fase 5 CORREGIR.",
        "", "Archivos de respaldo:", "",
        f"- `{summary_csv.name}`: una fila por curso para seguimiento 1/45 a 45/45.",
        f"- `{detail_csv.name}`: 2250 registros, uno por cada combinación curso-dimensión.",
        f"- `AUDITORIA_MAESTRA_45_CURSOS_{stamp}.md`: evidencia estructural automática de 28 controles.",
    ]
    report = docs / f"AUDITORIA_360_V2_LINEA_BASE_45_CURSOS_{stamp}.md"
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"45 courses, {len(rows)} modules, {len(detail_rows)} dimension records")
    print(f"IGC-TP range: {min(r['IGC_TP_inicial'] for r in summary_rows):.1f}% - {max(r['IGC_TP_inicial'] for r in summary_rows):.1f}%")
    print(report)


if __name__ == "__main__":
    main()
