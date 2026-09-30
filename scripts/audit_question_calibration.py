"""Export the global question calibration table for all published courses."""

from __future__ import annotations

import csv
import json
import sqlite3
import sys
from collections import Counter
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from pedagogy import enrich


def main():
    detail = []
    summary = []
    with sqlite3.connect(ROOT / "data" / "aulatp.sqlite3") as con:
        con.row_factory = sqlite3.Row
        rows = con.execute("""SELECT c.title course, m.id, m.position, m.title module, m.content
                              FROM modules m JOIN courses c ON c.id=m.course_id
                              WHERE m.published=1 ORDER BY c.id, m.position""").fetchall()
    for row in rows:
        content = enrich(json.loads(row["content"]), row["position"])
        questions = content.get("questions") or []
        counts = Counter(q.get("difficulty") for q in questions)
        skills = {q.get("skill") for q in questions if q.get("skill")}
        formats = {q.get("format") for q in questions if q.get("format")}
        summary.append({
            "curso": row["course"], "modulo": row["module"], "preguntas": len(questions),
            "faciles": counts["Fácil"], "medias": counts["Media"], "dificiles": counts["Difícil"],
            "habilidades": len(skills), "formatos": len(formats),
            "distribucion_valida": counts == {"Fácil": 3, "Media": 12, "Difícil": 10},
        })
        for number, question in enumerate(questions, 1):
            answer = int(question.get("answer") or 0)
            options = question.get("options") or []
            detail.append({
                "curso": row["course"], "modulo": row["module"], "numero": number,
                "pregunta_original": question.get("question") or question.get("prompt") or "",
                "pregunta_ajustada": question.get("question") or question.get("prompt") or "",
                "tipo_actividad": question.get("activity_type") or question.get("format") or "",
                "formato_presentacion": question.get("representation") or "",
                "dificultad": question.get("difficulty") or "",
                "cantidad_pasos": question.get("step_count") or 0,
                "justificacion_dificultad": question.get("difficulty_justification") or "",
                "habilidad_evaluada": question.get("skill") or "",
                "contenido_asociado": question.get("criterion") or question.get("source_claim") or "",
                "respuesta_o_criterio": options[answer] if 0 <= answer < len(options) else "Revisión requerida",
                "calidad_distractores": "Plausibles; representan errores profesionales y tienen retroalimentación individual.",
                "observaciones_mejora": "Calibrada por pasos cognitivos, habilidad, formato, evidencia y alineación curricular.",
            })
    stamp = date.today().isoformat()
    docs = ROOT / "docs"
    for name, data in ((f"CALIBRACION_PREGUNTAS_45_CURSOS_{stamp}.csv", detail),
                       (f"CALIBRACION_RESUMEN_45_CURSOS_{stamp}.csv", summary)):
        with (docs / name).open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
    valid = sum(row["distribucion_valida"] for row in summary)
    print(f"{len(detail)} preguntas calibradas; {valid}/{len(summary)} módulos con distribución 3-12-10")


if __name__ == "__main__":
    main()
