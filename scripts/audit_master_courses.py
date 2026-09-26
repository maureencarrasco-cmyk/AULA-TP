"""Evidence-based master audit for every published Aula TP course."""

import csv
import json
import os
import sqlite3
import sys
import unicodedata
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from instructional_quality import contract_is_complete
from pedagogy import enrich, publication_gaps


def _all_activities(content):
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


def _checks(content, specialty):
    aes = content.get("aes") or []
    activities = list(_all_activities(content))
    media = content.get("media_resources") or []
    cases = content.get("cases") or []
    questions = content.get("questions") or []
    plan = content.get("planning") or {}
    trace = content.get("traceability") or []
    access = content.get("accessibility_audit") or {}
    curriculum = content.get("curriculum") or content.get("official_source") or {}
    specialty_source = content.get("specialty_source") or content.get("official_source") or {}
    source_text = " ".join(str(curriculum.get(k) or "") for k in ("label", "title", "status", "pdf", "url")).casefold()
    specialty_terms = [word for word in specialty.casefold().replace(",", " ").split() if len(word) > 4]
    local_docs = " ".join(str(item.get("pdf") or "") for item in trace)
    local_docs = "".join(ch for ch in unicodedata.normalize("NFD", local_docs.casefold()) if unicodedata.category(ch) != "Mn")
    normalized_terms = ["".join(ch for ch in unicodedata.normalize("NFD", term) if unicodedata.category(ch) != "Mn")
                        for term in specialty_terms]
    didactic_fields = ("prior_knowledge", "new_knowledge", "cognitive_action", "scaffolding",
                       "evidence", "feedback", "transfer")
    return {
        "Alineacion OA/AE": bool(specialty_source.get("oa") or (content.get("official_source") or {}).get("oa")
                                    or all(ae.get("oa") for ae in aes)
                                    or specialty_source.get("oa_applicability")
                                    or (content.get("official_source") or {}).get("oa_applicability"))
                              and all(ae.get("official_code") for ae in aes),
        "Criterios oficiales": all(ae.get("criteria") for ae in aes),
        "Fuente MINEDUC": bool(curriculum.get("url")),
        "Fuente oficial pertinente": bool(specialty_terms) and any(term in source_text for term in specialty_terms),
        "Documento local pertinente": bool(normalized_terms) and any(term in local_docs for term in normalized_terms),
        "Trazabilidad actividad-evidencia": all(any(x.get("ae_code") == ae.get("official_code") and x.get("criterion") and x.get("activity") for x in trace) for ae in aes),
        "Instrucciones autonomas": bool(activities) and all(contract_is_complete(c) for c, _ in activities),
        "Conocimientos previos": bool(activities) and all((d or {}).get("prior_knowledge") for _, d in activities),
        "Secuencia didactica": bool(activities) and all(all((d or {}).get(k) for k in didactic_fields) for _, d in activities),
        "Progresion de dificultad": all(len({x.get("difficulty") for x in ae.get("experiences") or []}) >= 2 for ae in aes),
        "Aprendizaje activo": all(len({x.get("activity_kind") for x in ae.get("experiences") or []}) >= 4 and any(x.get("activity_kind") in {"pair", "procedure", "error", "argue", "relate", "sequence", "decide", "verify", "reflect"} for x in ae.get("experiences") or []) for ae in aes),
        "Contexto profesional": len(cases) >= 15 and bool(content.get("practice")),
        "Resolucion de problemas": any(x.get("activity_kind") in {"procedure", "error", "decide", "verify"} for ae in aes for x in ae.get("experiences") or []),
        "Transito de representaciones": bool(activities) and all((d or {}).get("initial_register") and (d or {}).get("final_register") for _, d in activities),
        "Diversidad de evidencias": len({(d or {}).get("evidence") for _, d in activities}) >= 5,
        "Evaluacion formativa": bool(content.get("formative_pack")) and bool(content.get("evaluation_plan")),
        "Evaluacion final": len(questions) >= 25 and all(len(q.get("options") or []) == 4 for q in questions),
        "Error y retroalimentacion": bool(content.get("feedback_instruction")) and all((d or {}).get("feedback") for _, d in activities),
        "Transferencia": bool(activities) and all((d or {}).get("transfer") for _, d in activities),
        "Autonomia": all((c or {}).get("start") and (c or {}).get("completion") for c, _ in activities),
        "Accesibilidad declarada": bool(access.get("representation") and access.get("action_expression") and access.get("participation")),
        "Multimedia con proposito": bool(media) and all(x.get("oa") and x.get("ae") and x.get("purpose") for x in media),
        "Video con subtitulos declarado": bool(content.get("video") and content.get("vtt")) or any(x.get("video") and x.get("vtt") for x in media),
        "Tres recursos 3D declarados con proposito": sum(1 for x in media if x.get("kind") == "3d" or x.get("type") == "3d" or x.get("tipo") == "3d") >= 3,
        "Cinco estaciones": not publication_gaps(content, specialty),
        "Tiempos factor x5": int(plan.get("time_factor") or 0) == 5 and bool(plan.get("station_minutes")),
        "Informacion por actor": len(content.get("community_reporting") or []) >= 7,
        "Fuente por item": all(q.get("source_url") and q.get("source_claim") and q.get("source_scope") for q in cases + questions),
    }


NON_AUTOMATED = {
    "Perfil de Egreso explicito": "No existe un campo verificable y uniforme por modulo.",
    "OAG con evidencia": "No existe un mapeo OAG-evidencia uniforme por modulo.",
    "Dos actividades sugeridas MINEDUC": "No se identifican dos actividades oficiales con pagina y equivalencia por modulo.",
    "Ejemplo de evaluacion MINEDUC": "No se identifica de forma uniforme el ejemplo oficial comparado.",
    "Vigencia documental confirmada": "Requiere comprobar version y vigencia en la fuente oficial.",
    "Exactitud tecnica validada": "Requiere docente o profesional competente por especialidad.",
    "Accesibilidad probada con usuarios": "La declaracion tecnica no sustituye pruebas con tecnologias de apoyo.",
    "Carga cognitiva observada": "Requiere observacion con estudiantes de 3 y 4 medio TP.",
    "Tiempos medidos con estudiantes": "El calculo x5 es una estimacion, no una medicion de uso real.",
}


def pct(value, total):
    return f"{100 * value / total:.1f}%" if total else "N/D"


def main():
    database = Path(os.environ.get("AUDIT_DATABASE", ROOT / "tmp" / "catalog-45-validation" / "aulatp.sqlite3"))
    with sqlite3.connect(database) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute("""SELECT c.title course, c.specialty, m.id module_id, m.title module,
                                     m.position, m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE m.published=1 ORDER BY c.id,m.position""").fetchall()
    if not rows:
        raise SystemExit("No published modules found")

    totals = defaultdict(lambda: [0, 0])
    courses = defaultdict(lambda: defaultdict(lambda: [0, 0]))
    findings = []
    requirement_a = {"Alineacion OA/AE", "Criterios oficiales", "Fuente MINEDUC",
                     "Fuente oficial pertinente", "Documento local pertinente", "Fuente por item"}
    requirement_b = {"Accesibilidad declarada", "Informacion por actor"}
    for row in rows:
        content = enrich(json.loads(row["content"]), row["position"])
        for indicator, passed in _checks(content, row["specialty"]).items():
            passed = bool(passed)
            totals[indicator][0] += passed
            totals[indicator][1] += 1
            courses[row["course"]][indicator][0] += passed
            courses[row["course"]][indicator][1] += 1
            if not passed:
                level = "A - Requisito curricular" if indicator in requirement_a else (
                    "B - Orientacion MINEDUC" if indicator in requirement_b else "C - Estandar Aula TP")
                findings.append({"curso": row["course"], "modulo": row["module"],
                                 "id_modulo": row["module_id"], "dimension": indicator,
                                 "nivel_exigencia": level,
                                 "estado": "No evidenciado", "impacto": "Alto" if indicator in {
                                     "Alineacion OA/AE", "Criterios oficiales", "Fuente MINEDUC", "Fuente oficial pertinente",
                                     "Documento local pertinente",
                                     "Evaluacion final", "Fuente por item"} else "Medio",
                                 "accion": "Completar o corregir evidencia verificable; volver a auditar."})

    docs = ROOT / "docs"
    docs.mkdir(exist_ok=True)
    csv_path = docs / "AUDITORIA_MAESTRA_45_CURSOS_HALLAZGOS.csv"
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=("curso", "modulo", "id_modulo", "dimension", "nivel_exigencia", "estado", "impacto", "accion"))
        writer.writeheader()
        writer.writerows(findings)

    passed = sum(v[0] for v in totals.values())
    measured = sum(v[1] for v in totals.values())
    lines = [
        "# Auditoria Maestra curricular, pedagogica e institucional", "",
        f"Fecha: {date.today().isoformat()}. Alcance: {len(courses)} cursos y {len(rows)} modulos publicados.",
        "", "## Regla de lectura", "",
        "Los porcentajes se calculan solo con evidencia estructurada observable. Presencia no equivale a calidad ni a logro. "
        "Los juicios que exigen fuente oficial vigente, observacion de usuarios o validacion disciplinar se informan como N/D.",
        "Las 70 reglas del Prompt Maestro se operacionalizan en 28 indicadores automaticos, 9 juicios no automatizables "
        "y 33 reglas de proceso, gobernanza, reporte o interpretacion que no deben convertirse artificialmente en porcentajes.",
        "", "## Resultado global medible", "",
        f"Cumplimiento de controles automatizables: **{pct(passed, measured)}** ({passed}/{measured}).", "",
        "| Indicador | Modulos con evidencia | Total | Porcentaje |", "|---|---:|---:|---:|",
    ]
    for name, (ok, total) in totals.items():
        lines.append(f"| {name} | {ok} | {total} | {pct(ok, total)} |")
    lines += ["", "## Juicios no automatizables", "", "| Dimension | Resultado | Fundamento |", "|---|---:|---|"]
    for name, reason in NON_AUTOMATED.items():
        lines.append(f"| {name} | N/D | {reason} |")
    lines += ["", "## Resultado por curso", "", "| Curso | Controles aprobados | Controles aplicados | Porcentaje |", "|---|---:|---:|---:|"]
    for course, indicators in courses.items():
        ok = sum(x[0] for x in indicators.values())
        total = sum(x[1] for x in indicators.values())
        lines.append(f"| {course} | {ok} | {total} | {pct(ok, total)} |")
    lines += [
        "", "## Brechas institucionales prioritarias", "",
        "1. Incorporar por modulo Perfil de Egreso, OAG y nivel de desarrollo con evidencia, sin inferirlos automaticamente.",
        "2. Identificar dos actividades sugeridas y el ejemplo de evaluacion del Programa MINEDUC, con pagina y equivalencia Aula TP.",
        "3. Registrar version, vigencia, fecha de consulta y clasificacion A/B/C de cada afirmacion curricular o normativa.",
        "4. Someter contenido, procedimientos y normativa sectorial a validacion de docentes o profesionales de cada especialidad.",
        "5. Validar accesibilidad, carga cognitiva y tiempos con estudiantes y tecnologias de apoyo.",
        "", "## Archivos de evidencia", "",
        f"- Hallazgos por modulo: `{csv_path.name}`.",
        "- Auditor previo de actividades, medios y fuentes: `AUDITORIA_9_PROMPTS_45_CURSOS_451_MODULOS_2026-09-25.md`.",
        "", "## Dictamen", "",
        "La plataforma presenta una base automatizada amplia de OA/AE, criterios, actividades, evaluacion, tiempos y evidencias. "
        "No corresponde declarar aprobacion pedagogica integral ni alineacion ministerial total mientras las nueve dimensiones N/D "
        "no sean documentadas y validadas por las personas competentes.",
    ]
    report = docs / f"AUDITORIA_MAESTRA_45_CURSOS_{date.today().isoformat()}.md"
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(courses)} courses, {len(rows)} modules, {len(findings)} findings")
    print(f"Automated evidence: {passed}/{measured} = {pct(passed, measured)}")
    print(report)


if __name__ == "__main__":
    main()
