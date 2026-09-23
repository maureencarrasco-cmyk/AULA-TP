#!/usr/bin/env python3
"""Revisión de flujo y lógica pedagógica — Aula TP Chile.

Lee las definiciones de estaciones en el repo (Climatización, Administración,
LMS Electricidad/Enfermería) y valida la ruta obligatoria:

    Contextualización → AE → Situación integradora → Evaluación final → Cierre

Uso:
    python3 tools/revisar_flujo.py
    python3 tools/revisar_flujo.py --curso climatizacion
    python3 tools/revisar_flujo.py --json
    python3 tools/revisar_flujo.py --estricto   # warnings cuentan como fallo
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

CANONICAL_FASES = (
    "contextualizacion",
    "estacion_ae",
    "situacion_integradora",
    "evaluacion_final",
    "retroalimentacion",
)

FASE_RANK = {name: index for index, name in enumerate(CANONICAL_FASES)}

LMS_OVERVIEW_NAMES = (
    "Contextualización",
    "Aprendizajes Esperados",
    "Situación Integradora",
    "Evaluación Final",
    "Retroalimentación y Cierre",
)

NURSING_LEAK = re.compile(
    r"\b(paciente|clínico|clinico|cuidados básicos|enfermer[íi]a|"
    r"signos vitales|asepsia|higiene y confort)\b",
    re.IGNORECASE,
)


@dataclass
class Finding:
    severity: str  # error | warning | info
    course: str
    module: str
    code: str
    message: str
    where: str = ""

    def as_dict(self) -> dict[str, str]:
        return {
            "severity": self.severity,
            "course": self.course,
            "module": self.module,
            "code": self.code,
            "message": self.message,
            "where": self.where,
        }


@dataclass
class Station:
    id: str
    orden: int | None
    slug: str
    titulo: str
    fase: str
    horas: float | None
    ae: list[str]
    permite_agente: bool | None
    eval_formal: bool
    bloqueado: bool | None
    opciones_ok: int
    opciones_total: int
    pregunta: str
    evidencia: str
    source: str


@dataclass
class ModuleFlow:
    course: str
    key: str
    title: str
    stations: list[Station] = field(default_factory=list)
    extra: dict[str, Any] = field(default_factory=dict)


def repo_root(start: Path | None = None) -> Path:
    here = (start or Path(__file__).resolve()).parent
    for candidate in [here, *here.parents]:
        if (candidate / "course_portal").is_dir() and (candidate / "climatizacion-web").is_dir():
            return candidate
    return Path.cwd()


# ---------------------------------------------------------------------------
# Lectura ligera de objetos JS/TS (sin ejecutar el código)
# ---------------------------------------------------------------------------

def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _skip_ws_and_comments(text: str, i: int) -> int:
    n = len(text)
    while i < n:
        if text[i] in " \t\r\n":
            i += 1
            continue
        if text.startswith("//", i):
            nl = text.find("\n", i)
            i = n if nl < 0 else nl + 1
            continue
        if text.startswith("/*", i):
            end = text.find("*/", i + 2)
            i = n if end < 0 else end + 2
            continue
        break
    return i


def _scan_string(text: str, i: int) -> tuple[str, int]:
    quote = text[i]
    i += 1
    chars: list[str] = []
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == "\\" and i + 1 < n:
            chars.append(text[i + 1])
            i += 2
            continue
        if quote == "`" and ch == "$" and i + 1 < n and text[i + 1] == "{":
            chars.append("${…}")
            depth = 1
            i += 2
            while i < n and depth:
                if text[i] in "\"'`":
                    _, i = _scan_string(text, i)
                    continue
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                i += 1
            continue
        if ch == quote:
            return "".join(chars), i + 1
        chars.append(ch)
        i += 1
    return "".join(chars), i


def _scan_value(text: str, i: int) -> tuple[Any, int]:
    i = _skip_ws_and_comments(text, i)
    if i >= len(text):
        return None, i
    ch = text[i]
    if ch in "\"'`":
        return _scan_string(text, i)
    if text.startswith("true", i) and _is_boundary(text, i + 4):
        return True, i + 4
    if text.startswith("false", i) and _is_boundary(text, i + 5):
        return False, i + 5
    if text.startswith("null", i) and _is_boundary(text, i + 4):
        return None, i + 4
    if ch.isdigit() or (ch == "-" and i + 1 < len(text) and text[i + 1].isdigit()):
        m = re.match(r"-?\d+(?:\.\d+)?", text[i:])
        assert m
        raw = m.group(0)
        return (float(raw) if "." in raw else int(raw)), i + len(raw)
    if ch == "[":
        items: list[Any] = []
        i += 1
        while True:
            i = _skip_ws_and_comments(text, i)
            if i < len(text) and text[i] == "]":
                return items, i + 1
            value, i = _scan_value(text, i)
            items.append(value)
            i = _skip_ws_and_comments(text, i)
            if i < len(text) and text[i] == ",":
                i += 1
                continue
            if i < len(text) and text[i] == "]":
                return items, i + 1
            return items, i
    if ch == "{":
        obj, i = _scan_object(text, i)
        return obj, i
    ident = re.match(r"[A-Za-z_][\w.]*", text[i:])
    if ident:
        j = i + ident.end()
        j = _skip_ws_and_comments(text, j)
        if j < len(text) and text[j] == "(":
            args, k = parse_call_args(text, j)
            return {"__call__": ident.group(0), "args": args}, k
        return ident.group(0), i + ident.end()
    return text[i], i + 1


def _is_boundary(text: str, i: int) -> bool:
    return i >= len(text) or not (text[i].isalnum() or text[i] == "_")


def _scan_object(text: str, i: int) -> tuple[dict[str, Any], int]:
    assert text[i] == "{"
    i += 1
    data: dict[str, Any] = {}
    while True:
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == "}":
            return data, i + 1
        if i < len(text) and text[i] in "\"'`":
            key, i = _scan_string(text, i)
        else:
            m = re.match(r"[A-Za-z_][\w]*", text[i:])
            if not m:
                return data, i
            key = m.group(0)
            i += m.end()
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == ":":
            i += 1
        value, i = _scan_value(text, i)
        data[key] = value
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == ",":
            i += 1
            continue
        if i < len(text) and text[i] == "}":
            return data, i + 1
        return data, i


def _find_assigned_value(text: str, idx: int, open_char: str) -> int:
    """Skip TypeScript type annotations (`: Foo[] =`) and find the assigned value."""
    eq = text.find("=", idx)
    if eq < 0:
        return text.find(open_char, idx)
    i = _skip_ws_and_comments(text, eq + 1)
    if i < len(text) and text[i] == open_char:
        return i
    return text.find(open_char, eq)


def parse_array_of_objects(text: str, marker: str) -> list[Any]:
    idx = text.find(marker)
    if idx < 0:
        return []
    bracket = _find_assigned_value(text, idx, "[")
    if bracket < 0:
        return []
    items: list[Any] = []
    i = bracket + 1
    while True:
        i = _skip_ws_and_comments(text, i)
        if i >= len(text) or text[i] == "]":
            return items
        value, i = _scan_value(text, i)
        items.append(value)
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == ",":
            i += 1


def parse_named_object(text: str, marker: str) -> dict[str, Any]:
    idx = text.find(marker)
    if idx < 0:
        return {}
    brace = _find_assigned_value(text, idx, "{")
    if brace < 0:
        return {}
    obj, _ = _scan_object(text, brace)
    return obj


def parse_call_args(text: str, i: int) -> tuple[list[Any], int]:
    """Parse argument list starting at '('."""
    assert text[i] == "("
    i += 1
    args: list[Any] = []
    while True:
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == ")":
            return args, i + 1
        value, i = _scan_value(text, i)
        args.append(value)
        i = _skip_ws_and_comments(text, i)
        if i < len(text) and text[i] == ",":
            i += 1
            continue
        if i < len(text) and text[i] == ")":
            return args, i + 1
        return args, i


def station_from_st_args(args: list[Any]) -> dict[str, Any] | None:
    if len(args) < 5:
        return None
    extra = args[5] if len(args) > 5 and isinstance(args[5], dict) else {}
    extra = {key: value for key, value in extra.items() if key != "__call__"}
    return {
        "id": args[0],
        "fase": args[1],
        "titulo": args[2],
        "minutes": args[3],
        "body": args[4] if isinstance(args[4], list) else [],
        **extra,
    }


def materialize_station(item: Any) -> dict[str, Any] | None:
    if isinstance(item, dict) and item.get("__call__") == "st":
        return station_from_st_args(item.get("args") or [])
    if isinstance(item, dict) and item.get("id") and item.get("fase"):
        return item
    return None


def parse_st_stations(text: str) -> list[dict[str, Any]]:
    """Parse stations: [ st(...), st(...) ] used in administracion-course.ts."""
    stations: list[dict[str, Any]] = []
    for match in re.finditer(r"(?<!function )\bst\s*\(", text):
        args, _ = parse_call_args(text, match.end() - 1)
        item = station_from_st_args(args)
        if item:
            stations.append(item)
    return stations


def _str(value: Any) -> str:
    return "" if value is None else str(value)


def _num(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _bool(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    return None


def _list_str(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item) for item in value if item is not None]


def station_from_clim(obj: dict[str, Any], source: str) -> Station:
    opciones = obj.get("opciones") if isinstance(obj.get("opciones"), list) else []
    ok = 0
    for option in opciones:
        if isinstance(option, dict) and option.get("correcta") is True:
            ok += 1
    return Station(
        id=_str(obj.get("id")),
        orden=int(obj["orden"]) if isinstance(obj.get("orden"), (int, float)) else None,
        slug=_str(obj.get("slug")),
        titulo=_str(obj.get("titulo")),
        fase=_str(obj.get("fase")),
        horas=_num(obj.get("horas")),
        ae=_list_str(obj.get("aeCodigos")),
        permite_agente=_bool(obj.get("permiteAgente")),
        eval_formal=bool(obj.get("esEvaluacionFormal")),
        bloqueado=_bool(obj.get("bloqueadoHastaCompletarAnterior")),
        opciones_ok=ok,
        opciones_total=len(opciones),
        pregunta=_str(obj.get("preguntaPedagogica")),
        evidencia=_str(obj.get("evidenciaMinima")),
        source=source,
    )


def station_from_admin(obj: dict[str, Any], index: int, oa: str, source: str) -> Station:
    quiz = obj.get("quiz") if isinstance(obj.get("quiz"), list) else []
    erp = obj.get("erp") if isinstance(obj.get("erp"), dict) else {}
    opciones_total = len(quiz)
    opciones_ok = 0
    for item in quiz:
        if not isinstance(item, dict):
            continue
        answer = item.get("answer")
        options = item.get("options") if isinstance(item.get("options"), list) else []
        if isinstance(answer, int) and 0 <= answer < len(options):
            opciones_ok += 1
    return Station(
        id=_str(obj.get("id")),
        orden=index,
        slug=_str(obj.get("id")),
        titulo=_str(obj.get("titulo")),
        fase=_str(obj.get("fase")),
        horas=(_num(obj.get("minutes")) or 0) / 60.0,
        ae=[oa] if oa else [],
        permite_agente=False,
        eval_formal=obj.get("fase") == "evaluacion_final",
        bloqueado=False,
        opciones_ok=opciones_ok,
        opciones_total=opciones_total,
        pregunta=_str(obj.get("titulo")),
        evidencia=_str((erp or {}).get("mission") or ""),
        source=source,
    )


# ---------------------------------------------------------------------------
# Carga de cursos
# ---------------------------------------------------------------------------

def load_climatizacion(root: Path) -> list[ModuleFlow]:
    lib = root / "climatizacion-web" / "lib"
    modules: list[ModuleFlow] = []
    for path in sorted(lib.glob("m*-estaciones.ts")):
        text = _read(path)
        meta = parse_named_object(text, "export const M")
        marker = re.search(r"export const ESTACIONES_M\d+", text)
        stations_raw = parse_array_of_objects(text, marker.group(0)) if marker else []
        number = meta.get("moduloNumero") or path.stem[1]
        title = _str(meta.get("nombre") or path.stem)
        flow = ModuleFlow(
            course="climatizacion",
            key=f"clim-m{number}",
            title=f"M{number} · {title}",
            extra={
                "oa": _str(meta.get("oa")),
                "horasAulaTp": meta.get("horasAulaTp"),
                "horasEvaluacionFinal": meta.get("horasEvaluacionFinal"),
                "file": str(path.relative_to(root)),
                "has_unlock": "function stationIsUnlocked" in text,
                "has_complete": "function canCompleteStation" in text,
            },
        )
        flow.stations = [
            station_from_clim(item, str(path.relative_to(root)))
            for item in stations_raw
            if isinstance(item, dict)
        ]
        modules.append(flow)
    return modules


def load_administracion(root: Path) -> list[ModuleFlow]:
    path = root / "climatizacion-web" / "lib" / "administracion-course.ts"
    if not path.exists():
        return []
    text = _read(path)
    raw_modules = parse_array_of_objects(text, "export const ADMIN_MODULES")
    all_st = parse_st_stations(text)
    shell = root / "climatizacion-web" / "components" / "curso" / "administracion" / "AdminModuleShell.tsx"
    shell_text = _read(shell) if shell.exists() else ""
    shell_skips = "open: true" in shell_text and "bloqueadoHastaCompletarAnterior: false" in shell_text
    modules: list[ModuleFlow] = []
    cursor = 0
    for raw in raw_modules:
        numero = raw.get("numero")
        title = _str(raw.get("title"))
        oa = _str(raw.get("oa"))
        declared = raw.get("stations")
        materialized = [
            item
            for item in (materialize_station(raw_item) for raw_item in (declared or []))
            if item
        ] if isinstance(declared, list) else []
        if materialized:
            stations_raw = materialized
            cursor += len(materialized)
        else:
            stations_raw = all_st[cursor : cursor + 5]
            cursor += 5
        flow = ModuleFlow(
            course="administracion",
            key=f"admin-m{numero}",
            title=f"M{numero} · {title}",
            extra={
                "oa": oa,
                "file": str(path.relative_to(root)),
                "shell_skips": shell_skips,
            },
        )
        flow.stations = [
            station_from_admin(item, index, oa, str(path.relative_to(root)))
            for index, item in enumerate(stations_raw)
        ]
        modules.append(flow)
    return modules


def load_lms(root: Path) -> list[ModuleFlow]:
    path = root / "course_portal" / "app.js"
    text = _read(path)
    overview = parse_array_of_objects(text, "function overviewStations")
    internal = parse_array_of_objects(text, "const internalStages =")
    modules_raw = parse_array_of_objects(text, "const FALLBACK_ELECTRICITY_MODULES")
    nursing_raw = parse_array_of_objects(text, "const FALLBACK_NURSING_MODULES")
    if not modules_raw:
        modules_raw = parse_array_of_objects(text, "const modules = courseProfile.modules ||")
    uses_split_fallback = (
        "FALLBACK_ELECTRICITY_MODULES" in text
        and "FALLBACK_NURSING_MODULES" in text
        and "fallbackModulesForCourse" in text
    )
    inline_nursing_modules = bool(re.search(r"const modules = courseProfile\.modules \|\| \[", text))
    stages = {
        "STAGE_CONTEXT": _const_int(text, "STAGE_CONTEXT"),
        "STAGE_INTEGRATOR": _const_int(text, "STAGE_INTEGRATOR"),
        "STAGE_EVALUATION": _const_int(text, "STAGE_EVALUATION"),
        "STAGE_FEEDBACK": _const_int(text, "STAGE_FEEDBACK"),
    }
    rail_state_fn = _js_fn_body(text, "overviewStationState")
    rail_click = _js_click_chunk(text, "[data-internal-stage]", "[data-ae]")
    no_lock_in_state = "return 'locked'" not in rail_state_fn and 'return "locked"' not in rail_state_fn
    rail_click_skips = bool(rail_click) and "locked" not in rail_click

    def as_station(item: dict[str, Any], index: int) -> Station:
        name = _str(item.get("name") or item.get("titulo"))
        fase = _fase_from_name(name)
        duration = _str(item.get("duration"))
        hours = _parse_duration_hours(duration)
        return Station(
            id=f"lms-{index}-{_str(item.get('index') or index)}",
            orden=index,
            slug=_str(item.get("index")),
            titulo=name,
            fase=fase,
            horas=hours,
            ae=[],
            permite_agente=None if fase != "evaluacion_final" else False,
            eval_formal=fase == "evaluacion_final",
            bloqueado=None,
            opciones_ok=0,
            opciones_total=0,
            pregunta=_str(item.get("purpose") or item.get("subtitle")),
            evidencia=_str(item.get("activity")),
            source="course_portal/app.js",
        )

    overview_flow = ModuleFlow(
        course="lms",
        key="lms-overview",
        title="Ruta de módulo LMS (Electricidad / Enfermería)",
        stations=[as_station(item, index) for index, item in enumerate(overview)],
        extra={
            "file": "course_portal/app.js",
            "internal_stages": [_str(item.get("name")) for item in internal],
            "stage_constants": stages,
            "overview_indices": [item.get("index") for item in overview],
            "fallback_modules": len(modules_raw) + len(nursing_raw),
            "rail_click_skips": rail_click_skips,
            "state_never_locked": no_lock_in_state,
            "rail_buttons_disabled": "disabled" in _js_fn_body(text, "buildInternalRoute")
            and "locked" in _js_fn_body(text, "buildInternalRoute"),
        },
    )
    fallback = ModuleFlow(
        course="lms",
        key="lms-fallback",
        title="Fallbacks LMS por especialidad",
        extra={
            "file": "course_portal/app.js",
            "uses_split_fallback": uses_split_fallback,
            "inline_nursing_modules": inline_nursing_modules,
            "electricity": [
                {"number": item.get("number"), "title": item.get("title"), "short": item.get("short")}
                for item in modules_raw
            ],
            "nursing": [
                {"number": item.get("number"), "title": item.get("title"), "short": item.get("short")}
                for item in nursing_raw
            ],
            "modules": [
                {"number": item.get("number"), "title": item.get("title"), "short": item.get("short")}
                for item in modules_raw
            ],
        },
    )
    return [overview_flow, fallback]


def _js_fn_body(text: str, name: str) -> str:
    match = re.search(rf"function {re.escape(name)}\s*\([^)]*\)\s*\{{", text)
    if not match:
        return ""
    i = match.end() - 1
    depth = 0
    start = i
    while i < len(text):
        ch = text[i]
        if ch in "\"'`":
            quote = ch
            i += 1
            while i < len(text) and text[i] != quote:
                if text[i] == "\\":
                    i += 2
                    continue
                i += 1
            i += 1
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
        i += 1
    return text[start:]


def _js_click_chunk(text: str, start_sel: str, end_sel: str) -> str:
    start = text.find(f"closest('{start_sel}')")
    end = text.find(f"closest('{end_sel}')")
    if start < 0 or end <= start:
        return ""
    return text[start:end]


def _const_int(text: str, name: str) -> int | None:
    m = re.search(rf"const {name} = (\d+);", text)
    return int(m.group(1)) if m else None


def _fase_from_name(name: str) -> str:
    n = name.lower()
    if "contextual" in n:
        return "contextualizacion"
    if "aprendizaje" in n or n.startswith("ae"):
        return "estacion_ae"
    if "integrad" in n:
        return "situacion_integradora"
    if "evalua" in n:
        return "evaluacion_final"
    if "retro" in n or "cierre" in n:
        return "retroalimentacion"
    return ""


def _parse_duration_hours(raw: str) -> float | None:
    if not raw:
        return None
    hours = re.search(r"([\d.,]+)\s*h", raw, re.I)
    if hours:
        return float(hours.group(1).replace(",", "."))
    minutes = re.search(r"([\d.,]+)\s*min", raw, re.I)
    if minutes:
        return float(minutes.group(1).replace(",", ".")) / 60.0
    return None


# ---------------------------------------------------------------------------
# Reglas
# ---------------------------------------------------------------------------

class Review:
    def __init__(self) -> None:
        self.findings: list[Finding] = []

    def add(
        self,
        severity: str,
        course: str,
        module: str,
        code: str,
        message: str,
        where: str = "",
    ) -> None:
        self.findings.append(Finding(severity, course, module, code, message, where))

    def check_module(self, flow: ModuleFlow) -> None:
        if flow.key in ("lms-fallback", "lms-fallback-enfermeria"):
            self._check_lms_fallback(flow)
            return
        if flow.key == "lms-overview":
            self._check_lms_overview(flow)
            return
        self._check_station_route(flow)

    def _check_station_route(self, flow: ModuleFlow) -> None:
        course, module = flow.course, flow.key
        stations = flow.stations
        if not stations:
            self.add("error", course, module, "empty", "El módulo no declara estaciones.", flow.extra.get("file", ""))
            return

        ids = [s.id for s in stations]
        dupes = [key for key, count in Counter(ids).items() if key and count > 1]
        if dupes:
            self.add("error", course, module, "dup-id", f"Ids repetidos: {', '.join(dupes)}.")

        slugs = [s.slug for s in stations if s.slug]
        slug_dupes = [key for key, count in Counter(slugs).items() if count > 1]
        if slug_dupes:
            self.add("error", course, module, "dup-slug", f"Slugs repetidos: {', '.join(slug_dupes)}.")

        ordens = [s.orden for s in stations if s.orden is not None]
        if ordens:
            expected = list(range(min(ordens), min(ordens) + len(stations)))
            if sorted(ordens) != expected:
                self.add(
                    "error",
                    course,
                    module,
                    "orden",
                    f"orden no es consecutivo: {ordens} (se esperaba {expected}).",
                )

        fases = [s.fase for s in stations]
        if fases[0] != "contextualizacion":
            self.add("error", course, module, "start", f"La ruta no parte en contextualización ({fases[0] or 'vacía'}).")
        if fases[-1] != "retroalimentacion":
            self.add("error", course, module, "end", f"La ruta no cierra en retroalimentación ({fases[-1] or 'vacía'}).")

        missing = [fase for fase in CANONICAL_FASES if fase not in fases]
        if missing:
            self.add("warning", course, module, "missing-fase", f"Faltan fases: {', '.join(missing)}.")

        ranks = [FASE_RANK.get(fase, -1) for fase in fases]
        last_rank = -1
        for station, rank in zip(stations, ranks):
            if rank < 0:
                self.add("error", course, module, "fase", f"Fase desconocida «{station.fase}».", station.id)
                continue
            if rank < last_rank:
                self.add(
                    "error",
                    course,
                    module,
                    "fase-order",
                    f"«{station.titulo}» ({station.fase}) aparece después de una fase posterior.",
                    station.id,
                )
            last_rank = max(last_rank, rank)

        first = stations[0]
        if first.bloqueado is True:
            self.add("error", course, module, "lock-first", "La primera estación no debería exigir la anterior.", first.id)

        if flow.course == "climatizacion":
            unlocked_later = [s for s in stations[1:] if s.bloqueado is False]
            if unlocked_later:
                self.add(
                    "warning",
                    course,
                    module,
                    "lock-gap",
                    "Estaciones posteriores se pueden abrir sin completar la anterior: "
                    + ", ".join(s.id for s in unlocked_later),
                )
            if not flow.extra.get("has_unlock"):
                self.add("error", course, module, "no-unlock", "Falta stationIsUnlocked en el archivo de estaciones.")
            if not flow.extra.get("has_complete"):
                self.add("error", course, module, "no-complete", "Falta canCompleteStation en el archivo de estaciones.")

        if flow.course == "administracion" and flow.extra.get("shell_skips"):
            if not any(item.code == "admin-skip" for item in self.findings):
                self.add(
                    "error",
                    course,
                    module,
                    "admin-skip",
                    "AdminModuleShell abre todas las estaciones (open: true) y bloqueadoHastaCompletarAnterior: false. Se puede saltar a evaluación sin completar la anterior.",
                    "AdminModuleShell.tsx",
                )

        evals = [s for s in stations if s.fase == "evaluacion_final"]
        if not evals:
            self.add("error", course, module, "no-eval", "No hay estación de evaluación final.")
        for station in evals:
            if station.permite_agente is True:
                self.add(
                    "error",
                    course,
                    module,
                    "eval-tutor",
                    "La evaluación final deja el agente pedagógico activo.",
                    station.id,
                )
            if flow.course == "climatizacion" and not station.eval_formal:
                self.add(
                    "error",
                    course,
                    module,
                    "eval-flag",
                    "Falta esEvaluacionFormal en la evaluación final.",
                    station.id,
                )
            if station.horas is not None and abs(station.horas - 2) > 0.25 and flow.course == "climatizacion":
                self.add(
                    "warning",
                    course,
                    module,
                    "eval-hours",
                    f"Evaluación dura {station.horas} h; el contrato Aula TP es 2 h.",
                    station.id,
                )

        ae_stations = [s for s in stations if s.fase == "estacion_ae"]
        for station in ae_stations:
            if not station.ae:
                self.add("warning", course, module, "ae-empty", "Estación AE sin códigos de aprendizaje esperado.", station.id)

        for station in stations:
            if not station.pregunta.strip():
                self.add("warning", course, module, "no-question", "Sin pregunta pedagógica.", station.id)
            if flow.course == "climatizacion" and station.opciones_total == 0:
                self.add("error", course, module, "no-options", "Estación sin alternativas interactivas.", station.id)
            if station.opciones_total and station.opciones_ok == 0:
                self.add("error", course, module, "no-correct", "Ninguna alternativa está marcada como correcta.", station.id)
            if flow.course == "administracion" and station.fase == "evaluacion_final" and station.opciones_total == 0:
                self.add("warning", course, module, "admin-eval-empty", "Evaluación final de Administración sin quiz.", station.id)
            if flow.course == "climatizacion" and NURSING_LEAK.search(station.titulo + station.pregunta):
                self.add("error", course, module, "leak", "Copy de Enfermería en Climatización.", station.id)

        if flow.course == "climatizacion":
            hours = sum(s.horas or 0 for s in stations)
            cierre = sum(s.horas or 0 for s in stations if s.fase == "retroalimentacion")
            declared = _num(flow.extra.get("horasAulaTp"))
            if declared and abs(hours - declared) > 1:
                if abs(hours - cierre - declared) <= 1:
                    self.add(
                        "info",
                        course,
                        module,
                        "hours-cierre",
                        f"Suma de estaciones = {hours:.1f} h; horasAulaTp = {declared} sin las {cierre:.1f} h de cierre.",
                    )
                else:
                    self.add(
                        "warning",
                        course,
                        module,
                        "hours-sum",
                        f"Suma de estaciones = {hours:.1f} h vs horasAulaTp = {declared}.",
                    )

    def check_shells(self, root: Path) -> None:
        clim_shell = root / "climatizacion-web" / "components" / "curso" / "shared" / "AulaModuleShell.tsx"
        if clim_shell.exists() and "setSpotlightUnlockThroughOrden" in _read(clim_shell):
            self.add(
                "warning",
                "climatizacion",
                "aula-shell",
                "deeplink-unlock",
                "?estacion= abre esa estación y desbloquea las anteriores (spotlight) aunque no estén completadas. Sirve para demo; en aula se puede saltar la ruta.",
                str(clim_shell.relative_to(root)),
            )
        admin_page = root / "climatizacion-web" / "app" / "curso" / "administracion" / "[modulo]" / "page.tsx"
        admin_shell = root / "climatizacion-web" / "components" / "curso" / "administracion" / "AdminModuleShell.tsx"
        if admin_page.exists() and "initialStation" in _read(admin_page):
            shell = _read(admin_shell) if admin_shell.exists() else ""
            if "adminStationIsOpen" not in shell:
                self.add(
                    "warning",
                    "administracion",
                    "admin-shell",
                    "deeplink-skip",
                    "?estacion= abre cualquier estación de Administración sin exigir la anterior.",
                    str(admin_page.relative_to(root)),
                )

    def _check_lms_overview(self, flow: ModuleFlow) -> None:
        names = [s.titulo for s in flow.stations]
        if names != list(LMS_OVERVIEW_NAMES):
            self.add(
                "error",
                flow.course,
                flow.key,
                "lms-names",
                f"La ruta LMS no coincide con la plantilla de 5 estaciones: {names}.",
            )
        else:
            self.add("info", flow.course, flow.key, "lms-ok", "Ruta visual de 5 estaciones alineada a la plantilla.")

        stages = flow.extra.get("stage_constants") or {}
        raw_indices = flow.extra.get("overview_indices") or []
        indices = [
            stages[item] if isinstance(item, str) and item in stages else item
            for item in raw_indices
        ]
        expected = [
            stages.get("STAGE_CONTEXT"),
            1,
            stages.get("STAGE_INTEGRATOR"),
            stages.get("STAGE_EVALUATION"),
            stages.get("STAGE_FEEDBACK"),
        ]
        if indices != expected:
            self.add(
                "error",
                flow.course,
                flow.key,
                "lms-index",
                f"Índices overview {indices} no calzan con STAGE_* {expected}. Continuar puede abrir la vista incorrecta.",
            )

        internal = flow.extra.get("internal_stages") or []
        if len(internal) == 7 and len(flow.stations) == 5:
            self.add(
                "info",
                flow.course,
                flow.key,
                "lms-collapse",
                "internalStages tiene 7 pasos (AE 1–3 separados) y el mapa muestra 5. Es coherente si AE se colapsa en una estación.",
            )

        if flow.extra.get("state_never_locked"):
            self.add(
                "error",
                flow.course,
                flow.key,
                "lms-nolock",
                "overviewStationState nunca devuelve «locked»: las estaciones futuras quedan clicables en el riel.",
                "course_portal/app.js",
            )

        if flow.extra.get("rail_click_skips"):
            self.add(
                "error",
                flow.course,
                flow.key,
                "lms-skip",
                "El click en [data-internal-stage] no exige completar la anterior. El botón Continuar sí se deshabilita, pero el riel izquierdo abre Evaluación o Cierre.",
                "course_portal/app.js",
            )

    def _check_lms_fallback(self, flow: ModuleFlow) -> None:
        electricity = flow.extra.get("electricity") or flow.extra.get("modules") or []
        nursing = flow.extra.get("nursing") or []
        if flow.extra.get("inline_nursing_modules") or (
            not flow.extra.get("uses_split_fallback") and electricity and NURSING_LEAK.search(
                " ".join(f"{item.get('title') or ''} {item.get('short') or ''}" for item in electricity)
            )
        ):
            self.add(
                "warning",
                flow.course,
                flow.key,
                "fallback-nursing",
                "El fallback de app.js es de Enfermería. Electricidad depende de window.AulaTPCourseProfile; si el perfil no carga, se mezclan cursos.",
                "course_portal/app.js",
            )
            return
        elec_blob = " ".join(f"{item.get('title') or ''} {item.get('short') or ''}" for item in electricity)
        if electricity and NURSING_LEAK.search(elec_blob):
            self.add(
                "error",
                flow.course,
                flow.key,
                "fallback-leak",
                "El fallback de Electricidad contiene copy de Enfermería.",
                "course_portal/app.js",
            )
        if flow.extra.get("uses_split_fallback") and not electricity:
            self.add("warning", flow.course, flow.key, "no-elec-fallback", "Falta FALLBACK_ELECTRICITY_MODULES.")
        if flow.extra.get("uses_split_fallback") and not nursing:
            self.add("warning", flow.course, flow.key, "no-nursing-fallback", "Falta FALLBACK_NURSING_MODULES.")


def print_text(modules: Iterable[ModuleFlow], findings: list[Finding]) -> None:
    print("Aula TP Chile · revisión de flujo y lógica")
    print("=" * 64)
    by_course: dict[str, list[ModuleFlow]] = {}
    for module in modules:
        by_course.setdefault(module.course, []).append(module)

    for course, items in by_course.items():
        print(f"\n▸ {course}")
        for module in items:
            if not module.stations:
                extras = module.extra.get("modules")
                if extras:
                    label = ", ".join(_str(m.get("short")) for m in extras)
                    nursing = module.extra.get("nursing") or []
                    extra_n = f"; Enfermería: {', '.join(_str(m.get('short')) for m in nursing)}" if nursing else ""
                    print(f"  {module.title}: {len(extras)} módulos ({label}{extra_n})")
                continue
            chain = " → ".join(f"{s.orden if s.orden is not None else '?'}:{s.fase or '?'}" for s in module.stations)
            print(f"  {module.title}")
            print(f"    {len(module.stations)} estaciones · {chain}")

    print("\nHallazgos")
    print("-" * 64)
    if not findings:
        print("Sin hallazgos.")
        return
    order = {"error": 0, "warning": 1, "info": 2}
    for item in sorted(findings, key=lambda f: (order[f.severity], f.course, f.module, f.code)):
        mark = {"error": "✗", "warning": "!", "info": "·"}[item.severity]
        loc = f" @ {item.where}" if item.where else ""
        print(f"{mark} [{item.severity}] {item.course}/{item.module} {item.code}{loc}")
        print(f"    {item.message}")

    counts = Counter(f.severity for f in findings)
    print("\nResumen: "
          + ", ".join(f"{counts[key]} {key}" for key in ("error", "warning", "info") if counts[key]))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Revisa flujo y lógica de los cursos Aula TP.")
    parser.add_argument("--root", type=Path, default=None, help="Raíz del repo aulatp")
    parser.add_argument("--curso", choices=("climatizacion", "administracion", "lms", "todos"), default="todos")
    parser.add_argument("--json", action="store_true", help="Salida JSON")
    parser.add_argument("--estricto", action="store_true", help="Warnings también fallan el código de salida")
    args = parser.parse_args(argv)

    root = repo_root(args.root)
    modules: list[ModuleFlow] = []
    if args.curso in ("todos", "climatizacion"):
        modules.extend(load_climatizacion(root))
    if args.curso in ("todos", "administracion"):
        modules.extend(load_administracion(root))
    if args.curso in ("todos", "lms"):
        modules.extend(load_lms(root))

    review = Review()
    for module in modules:
        review.check_module(module)
    if args.curso in ("todos", "climatizacion", "administracion"):
        review.check_shells(root)

    if args.json:
        print(
            json.dumps(
                {
                    "root": str(root),
                    "modules": [
                        {
                            "course": m.course,
                            "key": m.key,
                            "title": m.title,
                            "stations": [
                                {
                                    "id": s.id,
                                    "orden": s.orden,
                                    "fase": s.fase,
                                    "titulo": s.titulo,
                                    "horas": s.horas,
                                }
                                for s in m.stations
                            ],
                        }
                        for m in modules
                    ],
                    "findings": [f.as_dict() for f in review.findings],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print_text(modules, review.findings)

    errors = sum(1 for f in review.findings if f.severity == "error")
    warnings = sum(1 for f in review.findings if f.severity == "warning")
    if errors:
        return 1
    if args.estricto and warnings:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
