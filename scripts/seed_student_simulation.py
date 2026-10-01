"""Crea una cohorte reproducible de 120 estudiantes para pruebas locales."""

from __future__ import annotations

import argparse
import json
import math
import random
import sqlite3
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB = ROOT / "data" / "aulatp.sqlite3"
COURSES = ("Electricidad", "Refrigeración y Climatización")
FIRST_NAMES = (
    "Camila", "Martina", "Valentina", "Antonia", "Isidora", "Javiera",
    "Benjamín", "Vicente", "Matías", "Tomás", "Diego", "Sebastián",
)
LAST_NAMES = (
    "González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras",
    "Silva", "Martínez", "Sepúlveda", "Morales", "Araya",
)


def clamp(value: float, low: int = 35, high: int = 98) -> int:
    return max(low, min(high, round(value)))


def completed_state(content: dict, score_pct: int, rng: random.Random, module_no: int) -> dict:
    aes = content.get("aes") or []
    ae_evidence = {}
    for ae_index in range(max(1, len(aes))):
        for step in range(6):
            ae_evidence[f"{ae_index}-{step}"] = {
                "text": f"Evidencia simulada AE {ae_index + 1}.{step + 1}: analiza datos, justifica la decisión y verifica el resultado.",
                "response": {"status": "completed", "confidence": rng.choice((2, 3, 3, 4))},
            }

    ae_profile = {}
    for ae_index in range(max(1, len(aes))):
        ae_profile[f"AE{ae_index + 1}"] = {
            "percent": clamp(score_pct + rng.randint(-8, 8)),
            "correct": max(1, round(score_pct / 20)),
            "total": 5,
        }

    cases = {
        str(index): {
            "choice": rng.randint(0, 3),
            "text": f"Situación {index + 1}: decisión técnica fundamentada con evidencia del caso.",
        }
        for index in range(15)
    }
    selection_score = max(1, min(25, round(score_pct * 25 / 100)))
    development_score = max(8, min(25, round((score_pct + rng.randint(-7, 6)) * 25 / 100)))
    return {
        "context": "Reconozco el contexto profesional, los riesgos y la información que debo verificar antes de actuar.",
        "ae": ae_evidence,
        "cases": cases,
        "scene": {"inspected": ["plano", "equipo", "seguridad", "registro"], "text": "Recorrido espacial completado y contrastado con la documentación técnica."},
        "exam": {
            "answers": {str(i): rng.randint(0, 3) for i in range(25)},
            "score": selection_score,
            "max_score": 25,
            "development": "Integro los antecedentes del módulo, justifico el procedimiento y verifico el cumplimiento técnico y de seguridad.",
            "profile": {"ae": ae_profile},
            "review": {
                "points": [max(1, min(5, round(development_score / 5) + rng.choice((-1, 0, 0, 1)))) for _ in range(5)],
                "score": development_score,
                "feedback": "Buen avance. Mantén la fundamentación técnica y explicita siempre cómo verificas tu decisión.",
            },
        },
        "draft": {},
        "reflection": f"En el módulo {module_no} mejoré mi capacidad para analizar, decidir y comprobar antes de ejecutar.",
        "plan": "Revisaré la normativa aplicable, practicaré el criterio con menor logro y registraré la evidencia de verificación.",
        "closed": True,
        "explore": {"observed": ["condiciones del entorno", "documentación", "medidas de seguridad"]},
        "ae_meta": {},
        "trace": [{"kind": "simulation", "estado": "COMPLETADO", "module": module_no}],
        "oficio": {},
        "encargos": {},
    }


def seed(db_path: Path, report_path: Path) -> dict:
    rng = random.Random(120_2026)
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    courses = {}
    for title in COURSES:
        row = con.execute("SELECT id,title,specialty FROM courses WHERE title=?", (title,)).fetchone()
        if not row:
            raise RuntimeError(f"No se encontró el curso {title}")
        modules = con.execute(
            "SELECT id,title,position,content FROM modules WHERE course_id=? AND published=1 ORDER BY position,id LIMIT 4",
            (row["id"],),
        ).fetchall()
        if len(modules) != 4:
            raise RuntimeError(f"{title} necesita al menos cuatro módulos publicados")
        courses[title] = (row, modules)

    con.execute("DELETE FROM progress WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'sim120_%')")
    con.execute("DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE username LIKE 'sim120_%')")
    con.execute("DELETE FROM users WHERE username LIKE 'sim120_%'")

    demo = con.execute("SELECT id FROM users WHERE username='estudiante'").fetchone()
    if not demo:
        raise RuntimeError("No existe el perfil demo 'estudiante'")
    selected_course_ids = [courses[title][0]["id"] for title in COURSES]
    selected_module_ids = [module["id"] for title in COURSES for module in courses[title][1]]
    con.execute(
        f"DELETE FROM enrollments WHERE user_id=? AND course_id IN ({','.join('?' for _ in selected_course_ids)})",
        [demo["id"], *selected_course_ids],
    )
    con.execute(
        f"DELETE FROM progress WHERE user_id=? AND module_id IN ({','.join('?' for _ in selected_module_ids)})",
        [demo["id"], *selected_module_ids],
    )
    shared_hash = generate_password_hash("SimulacionTP2026!")
    cohort = []
    module_results = defaultdict(list)
    specialty_results = defaultdict(list)
    base_date = datetime(2026, 8, 3, 14, 0, tzinfo=timezone.utc)

    for index in range(120):
        course_title = COURSES[0] if index < 60 else COURSES[1]
        course, modules = courses[course_title]
        if index == 0:
            user_id = demo["id"]
            display_name = "Estudiante Demo"
        else:
            username = f"sim120_{index + 1:03d}"
            display_name = f"{FIRST_NAMES[index % len(FIRST_NAMES)]} {LAST_NAMES[(index * 5) % len(LAST_NAMES)]}"
            cur = con.execute(
                "INSERT INTO users(username,name,password,role) VALUES(?,?,?,'student')",
                (username, display_name, shared_hash),
            )
            user_id = cur.lastrowid

        con.execute("INSERT OR IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)", (user_id, course["id"]))
        ability = clamp(rng.gauss(70, 11), 42, 94)
        student_scores = []
        for module_offset, module in enumerate(modules):
            growth = module_offset * rng.uniform(1.5, 3.8)
            score = clamp(ability + growth + rng.gauss(0, 5), 38, 98)
            state = completed_state(json.loads(module["content"] or "{}"), score, rng, module_offset + 1)
            updated = (base_date + timedelta(days=index % 20 + module_offset * 14, hours=index % 7)).isoformat()
            con.execute(
                "INSERT INTO progress(user_id,module_id,state,updated) VALUES(?,?,?,?) "
                "ON CONFLICT(user_id,module_id) DO UPDATE SET state=excluded.state,updated=excluded.updated",
                (user_id, module["id"], json.dumps(state, ensure_ascii=False), updated),
            )
            student_scores.append(score)
            module_results[(course_title, module_offset + 1)].append(score)
            specialty_results[course_title].append(score)
        cohort.append({
            "student_id": user_id,
            "name": display_name,
            "specialty": course_title,
            "completed_modules": 4,
            "average": round(sum(student_scores) / 4, 1),
            "scores": student_scores,
        })

    con.commit()
    counts = con.execute(
        "SELECT c.title,COUNT(DISTINCT e.user_id) students,COUNT(p.module_id) completed_records "
        "FROM enrollments e JOIN courses c ON c.id=e.course_id "
        "LEFT JOIN modules m ON m.course_id=c.id LEFT JOIN progress p ON p.module_id=m.id AND p.user_id=e.user_id "
        "WHERE c.title IN (?,?) GROUP BY c.id,c.title ORDER BY c.id",
        COURSES,
    ).fetchall()
    con.close()

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "seed": 120_2026,
        "students": 120,
        "specialties": {
            title: {
                "students": 60,
                "average": round(sum(values) / len(values), 1),
                "minimum": min(values),
                "maximum": max(values),
                "modules": [
                    {
                        "module": module_no,
                        "average": round(sum(module_results[(title, module_no)]) / 60, 1),
                        "minimum": min(module_results[(title, module_no)]),
                        "maximum": max(module_results[(title, module_no)]),
                    }
                    for module_no in range(1, 5)
                ],
            }
            for title, values in specialty_results.items()
        },
        "database_checks": [dict(row) for row in counts],
        "cohort": cohort,
    }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, default=DEFAULT_DB)
    parser.add_argument("--report", type=Path, default=ROOT / "docs" / "simulation-120-students.json")
    args = parser.parse_args()
    report = seed(args.db, args.report)
    print(json.dumps({"students": report["students"], "specialties": report["specialties"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
