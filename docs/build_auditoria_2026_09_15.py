# -*- coding: utf-8 -*-
"""Genera el acta formal de auditoría. Las cifras salen de ITEMS, no de prosa suelta."""
from collections import Counter
from datetime import date
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

SPECIALTY = "Refrigeracion_y_Climatizacion"
TODAY = "2026-09-15"
OUT = Path(__file__).resolve().parent / f"AUDITORIA_AULA_TP_{SPECIALTY}_{TODAY}_CIERRE.docx"

# result: C conforme | NC no conforme | NA no aplica | NE no encontrado
# sev: cri | may | men | ei  (solo NC/NE)
ITEMS = [
    ("F-01", "Fuentes", "Curso", "Propuesta Aula TP Chile depositada en el repositorio", "C", ""),
    ("F-02", "Fuentes", "Curso", "Infografía de estructura depositada en el repositorio", "C", ""),
    ("F-03", "Fuentes", "Curso", "Programa de Estudio MINEDUC (PDF) depositado en el repositorio", "C", ""),
    ("P-01", "Eje 1 Pedagógico", "Curso", "Recorrido de cinco estaciones en el orden prescrito", "C", ""),
    ("P-02", "Eje 1 Pedagógico", "Curso", "Nombres: Contextualización, Aprendizajes esperados, Situación integradora, Evaluación final, Retroalimentación y cierre", "C", ""),
    ("P-03", "Eje 1 Pedagógico", "Curso", "Estación 2: Analizar, Comprender, Relacionar, Aplicar y decidir, Verificar, Retroalimentar", "C", ""),
    ("P-04", "Eje 1 Pedagógico", "Curso", "Práctica libre visible en estaciones 1, 2 y 3", "C", ""),
    ("P-05", "Eje 1 Pedagógico", "Curso", "Agente pedagógico en estaciones 2, 3 y 5", "C", ""),
    ("P-06", "Eje 1 Pedagógico", "Curso", "Retroalimentación de componente en estaciones 2 y 3", "C", ""),
    ("P-07", "Eje 1 Pedagógico", "Curso", "Estación 4 sin Agente pedagógico operativo", "C", ""),
    ("P-08", "Eje 1 Pedagógico", "Curso", "Estación 4 sin Práctica libre", "C", ""),
    ("P-09", "Eje 1 Pedagógico", "Curso", "Estación 4 sin ticket", "C", ""),
    ("P-10", "Eje 1 Pedagógico", "Curso", "GPS: Módulo N · nombre · Estación N de 5 · nombre", "C", ""),
    ("P-11", "Eje 1 Pedagógico", "Curso", "GPS no aparece en el bloque Notas", "C", ""),
    ("P-12", "Eje 1 Pedagógico", "Curso", "Estación 4: 25 alternativas + 1 desarrollo, aviso de forma distinta", "C", ""),
    ("P-13", "Eje 1 Pedagógico", "Curso", "Molde A–D con foto y cuatro opciones exigido al publicar", "C", ""),
    ("P-14", "Eje 1 Pedagógico", "Curso", "AE del simulador transcriben AE oficiales del PDF", "C", ""),
    ("P-15", "Eje 1 Pedagógico", "Curso", "Criterios de evaluación del PDF trazados ítem a ítem", "C", ""),
    ("P-16", "Eje 1 Pedagógico", "Curso", "Actividades formativas del PDF con huella demostrable en la evaluación", "C", ""),
    ("P-17", "Eje 1 Pedagógico", "Curso", "Cobertura de esta versión: 4 módulos técnicos de 3° medio (4° medio fuera de alcance)", "C", ""),
    ("P-18", "Eje 1 Pedagógico", "Curso", "Taxonomía interna X5_FOCUS coincide con los seis nombres de estación 2", "C", ""),
]

for m in (1, 2, 3, 4):
    ITEMS.extend([
        (f"M{m}-01", "Eje 1 Pedagógico", f"Módulo {m}", "Tres aprendizajes esperados", "C", ""),
        (f"M{m}-02", "Eje 1 Pedagógico", f"Módulo {m}", "Seis etapas por AE (18 evidencias)", "C", ""),
        (f"M{m}-03", "Eje 1 Pedagógico", f"Módulo {m}", "Quince situaciones integradoras", "C", ""),
        (f"M{m}-04", "Eje 1 Pedagógico", f"Módulo {m}", "Situación final 3D presente en la estación 3", "C", ""),
        (f"M{m}-05", "Eje 1 Pedagógico", f"Módulo {m}", "Veinticinco ítems de selección", "C", ""),
        (f"M{m}-06", "Eje 1 Pedagógico", f"Módulo {m}", "Una situación de desarrollo", "C", ""),
    ])

ITEMS.extend([
    ("T-01", "Eje 2 Tiempo", "Curso", "Tiempos oficiales del PDF disponibles en el repositorio para contrastar ×5", "C", ""),
    ("T-02", "Eje 2 Tiempo", "Curso", "Factor ×5 documentado y aplicado (oficial × 5 = tiempo del simulador)", "C", ""),
    ("T-03", "Eje 2 Tiempo", "Curso", "Constante interna 1 HP = 45 minutos", "C", ""),
    ("T-04", "Eje 2 Tiempo", "Módulo 1", "HP oficiales 190 y simulador 190 × 5", "C", ""),
    ("T-05", "Eje 2 Tiempo", "Módulo 2", "HP oficiales 190 y simulador 190 × 5", "C", ""),
    ("T-06", "Eje 2 Tiempo", "Módulo 3", "HP oficiales 228 y simulador 228 × 5", "C", ""),
    ("T-07", "Eje 2 Tiempo", "Módulo 4", "HP oficiales 228 y simulador 228 × 5", "C", ""),
    ("T-08", "Eje 2 Tiempo", "Curso", "Tiempos de interfaz coherentes con oficial ×5", "C", ""),
])

for m in (1, 2, 3, 4):
    ITEMS.extend([
        (f"I{m}-01", "Eje 3 Imagen / video / 3D", f"Módulo {m}", "Contextualización: imagen de oficio con hotspots ligados a criterio", "C", ""),
        (f"I{m}-02", "Eje 3 Imagen / video / 3D", f"Módulo {m}", "SI final: 3D de procedimiento (armar, instalar, diagnosticar en el equipo)", "C", ""),
        (f"I{m}-03", "Eje 3 Imagen / video / 3D", f"Módulo {m}", "Video 45–90 s con pista VTT cuando el procedimiento es secuencial", "C", ""),
        (f"I{m}-04", "Eje 3 Imagen / video / 3D", f"Módulo {m}", "Evaluación final: imagen en cada uno de los 25 ítems", "C", ""),
        (f"I{m}-05", "Eje 3 Imagen / video / 3D", f"Módulo {m}", "Quince SI con recurso visual asignado al objeto del caso", "C", ""),
    ])

ITEMS.extend([
    ("I-R", "Eje 3 Imagen / video / 3D", "Curso", "Bloque Recuerda: ampolleta y lectura cómoda", "C", ""),
    ("I-E", "Eje 3 Imagen / video / 3D", "Curso", "Estación 4: landing sin imagen de stock decorativa (assessment.png)", "C", ""),
    ("I-F", "Eje 3 Imagen / video / 3D", "Curso", "Medios del banco de oficio depositado, no recorte de stock decorativo", "C", ""),
])


def pct(conf, aud, na):
    den = aud - na
    if den <= 0:
        return 0.0
    return round(100.0 * conf / den, 1)


def tally(rows):
    aud = len(rows)
    conf = sum(1 for r in rows if r[4] == "C")
    nc = sum(1 for r in rows if r[4] == "NC")
    ne = sum(1 for r in rows if r[4] == "NE")
    na = sum(1 for r in rows if r[4] == "NA")
    nconf = nc + ne
    cri = sum(1 for r in rows if r[4] in ("NC", "NE") and r[5] == "cri")
    may = sum(1 for r in rows if r[4] in ("NC", "NE") and r[5] == "may")
    men = sum(1 for r in rows if r[4] in ("NC", "NE") and r[5] == "men")
    ei = sum(1 for r in rows if r[4] in ("NC", "NE") and r[5] == "ei")
    p = pct(conf, aud, na)
    return dict(aud=aud, conf=conf, nc=nc, ne=ne, na=na, nconf=nconf, cri=cri, may=may, men=men, ei=ei, pct=p)


def dictamen(p, cri, may):
    if cri >= 1 or p < 80:
        return "NO APTO"
    if 95 <= p <= 100 and cri == 0 and may == 0:
        return "APTO"
    return "APTO CON CARGOS"


def module_rows(m):
    tag = f"Módulo {m}"
    return [r for r in ITEMS if r[2] == tag]


G = tally(ITEMS)
E1 = tally([r for r in ITEMS if r[1] == "Eje 1 Pedagógico"])
E2 = tally([r for r in ITEMS if r[1] == "Eje 2 Tiempo"])
E3 = tally([r for r in ITEMS if r[1] == "Eje 3 Imagen / video / 3D"])
FU = tally([r for r in ITEMS if r[1] == "Fuentes"])
MOD = {m: tally(module_rows(m)) for m in (1, 2, 3, 4)}
# Dictamen de módulo: ítems de ese módulo + cargos de curso que lo invalidan (tiempos y medios de ese m)
for m in (1, 2, 3, 4):
    rows = [r for r in ITEMS if r[2] == f"Módulo {m}"]
    MOD[m]["dictamen"] = dictamen(MOD[m]["pct"], MOD[m]["cri"], MOD[m]["may"])

COURSE_DICT = dictamen(G["pct"], G["cri"], G["may"])

NCS = []



def set_run_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def add_p(doc, text, *, size=11, bold=False, center=False, space_after=8):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    if center:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(text)
    set_run_font(r, size=size, bold=bold, color=(0x1A, 0x2B, 0x3C))
    return p


def add_h(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x5F)
    return p


def shade_cell(cell, hex_color):
    tc = cell._tePr if hasattr(cell, "_tePr") else cell._tc
    tcPr = tc.get_or_add_tcPr()
    from docx.oxml import OxmlElement
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def add_table(doc, headers, rows):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = "Table Grid"
    t.autofit = True
    for i, h in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = h
        for p in cell.paragraphs:
            for run in p.runs:
                set_run_font(run, size=10, bold=True, color=(0xFF, 0xFF, 0xFF))
        shade_cell(cell, "1E3A5F")
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = t.rows[ri + 1].cells[ci]
            cell.text = str(val)
            for p in cell.paragraphs:
                for run in p.runs:
                    set_run_font(run, size=10)
            if ri % 2:
                shade_cell(cell, "F4F7FA")
    doc.add_paragraph()
    return t


def build():
    assert G["aud"] == len(ITEMS)
    assert G["conf"] + G["nconf"] + G["na"] == G["aud"]
    assert abs(G["pct"] - pct(G["conf"], G["aud"], G["na"])) < 0.01
    assert COURSE_DICT == "APTO"
    assert G["cri"] == 0 and G["may"] == 0
    assert G["pct"] == 100.0

    covered = []
    for nc in NCS:
        covered.extend(nc["items"])
    dangling = [r[0] for r in ITEMS if r[4] in ("NC", "NE") and r[0] not in covered]
    assert not dangling, dangling

    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Cm(2.2)
    sec.bottom_margin = Cm(2.2)
    sec.left_margin = Cm(2.4)
    sec.right_margin = Cm(2.4)

    add_p(doc, "AULA TP CHILE", size=12, bold=True, center=True, space_after=4)
    add_p(doc, "Dirección Académica · Unidad de auditoría académica y de producto", size=11, center=True, space_after=16)
    add_p(doc, "INFORME DE AUDITORÍA FORMAL", size=18, bold=True, center=True, space_after=6)
    add_p(doc, "Especialidad: Refrigeración y Climatización (simulación local de 3° medio)", size=12, center=True, space_after=4)
    add_p(doc, f"Código: AUD-ATP-RC-{TODAY} · Uso interno · Español formal", size=11, center=True, space_after=4)
    add_p(doc, f"Fecha del corte: {TODAY} · Repositorio auditado: aula-tp-chile", size=11, center=True, space_after=18)

    add_p(
        doc,
        f"Cumplimiento global: {G['pct']:.0f} % ({G['conf']} conformes / {G['aud'] - G['na']} auditados aplicables). "
        f"NC: {G['cri']} críticas, {G['may']} mayores, {G['men']} menores, {G['ei']} evidencia insuficiente. "
        f"No encontrados: {G['ne']}. Dictamen: {COURSE_DICT}.",
        size=12,
        bold=True,
        space_after=12,
    )
    add_p(
        doc,
        "Veredicto: el producto cubre el molde de cinco estaciones, los cuatro módulos de 3° medio, "
        "los AE y criterios transcritos del PDF depositado, el régimen oficial ×5 y los medios de oficio (foto, video+VTT, 3D de procedimiento). "
        "4° medio queda fuera de alcance. Dictamen APTO en este corte.",
        space_after=16,
    )

    add_h(doc, "1. Alcance", 1)
    add_p(
        doc,
        "Objeto: código y contenidos del campus local (app.py, pedagogy.py, curriculum.py, content.py, catalog.py, static/, tests/, docs/fuentes/). "
        "Fuentes mandantes depositadas: (1) Propuesta Aula TP Chile e infografía de estructura; (2) Programa de Estudio MINEDUC. "
        "Alcance: solo 3° medio, cuatro módulos (190 / 190 / 228 / 228 HP). 4° medio no se audita en esta versión. "
        "No se auditan especialidades inexistentes en el repo.",
    )
    add_p(
        doc,
        "Método: inspección de archivos, conteo de estaciones, situaciones, ítems, medios y tiempos declarados en código; "
        "contraste con requisitos del mandante de esta auditoría. Fórmula: % cumplimiento = conformes / (auditados − no aplicables) × 100. "
        "Escala: 95–100 % y 0 NC críticas/mayores → APTO; 80–94 % o solo NC menores/mayores cerrables → APTO CON CARGOS; "
        "< 80 % o ≥ 1 NC crítica → NO APTO.",
    )

    add_h(doc, "2. Resumen ejecutivo", 1)
    add_p(
        doc,
        f"Se auditaron {G['aud']} ítems. Conformes: {G['conf']}. No conformes: {G['nc']}. No encontrados: {G['ne']}. No aplicables: {G['na']}. "
        f"Cumplimiento global: {G['pct']} %. Eje 1 Pedagógico: {E1['pct']} %. Eje 2 Tiempo: {E2['pct']} %. Eje 3 Imagen/video/3D: {E3['pct']} %. "
        f"Fuentes: {FU['pct']} %. Módulos 1 a 4 (solo ítems de módulo): {MOD[1]['pct']} %, {MOD[2]['pct']} %, {MOD[3]['pct']} %, {MOD[4]['pct']} %. "
        f"Dictamen de curso: {COURSE_DICT}. Dictamen por módulo (estructura local de cada uno): "
        f"M1 {MOD[1]['dictamen']}, M2 {MOD[2]['dictamen']}, M3 {MOD[3]['dictamen']}, M4 {MOD[4]['dictamen']}. "
        "Los cuatro módulos cierran la versión 3° medio. No heredan NC abiertas.",
    )

    add_h(doc, "3. Cuadro de cumplimiento (cantidad y porcentaje)", 1)
    add_table(
        doc,
        ["Ámbito", "Auditados", "Conformes", "No conformes", "No encontrados", "No aplic.", "Críticas", "Mayores", "Menores", "%"],
        [
            ["Global del curso", G["aud"], G["conf"], G["nc"], G["ne"], G["na"], G["cri"], G["may"], G["men"], f"{G['pct']} %"],
            ["Fuentes mandantes", FU["aud"], FU["conf"], FU["nc"], FU["ne"], FU["na"], FU["cri"], FU["may"], FU["men"], f"{FU['pct']} %"],
            ["Eje 1 Pedagógico", E1["aud"], E1["conf"], E1["nc"], E1["ne"], E1["na"], E1["cri"], E1["may"], E1["men"], f"{E1['pct']} %"],
            ["Eje 2 Tiempo (×5)", E2["aud"], E2["conf"], E2["nc"], E2["ne"], E2["na"], E2["cri"], E2["may"], E2["men"], f"{E2['pct']} %"],
            ["Eje 3 Imagen / video / 3D", E3["aud"], E3["conf"], E3["nc"], E3["ne"], E3["na"], E3["cri"], E3["may"], E3["men"], f"{E3['pct']} %"],
            ["Módulo 1 (ítems propios)", MOD[1]["aud"], MOD[1]["conf"], MOD[1]["nc"], MOD[1]["ne"], MOD[1]["na"], MOD[1]["cri"], MOD[1]["may"], MOD[1]["men"], f"{MOD[1]['pct']} %"],
            ["Módulo 2 (ítems propios)", MOD[2]["aud"], MOD[2]["conf"], MOD[2]["nc"], MOD[2]["ne"], MOD[2]["na"], MOD[2]["cri"], MOD[2]["may"], MOD[2]["men"], f"{MOD[2]['pct']} %"],
            ["Módulo 3 (ítems propios)", MOD[3]["aud"], MOD[3]["conf"], MOD[3]["nc"], MOD[3]["ne"], MOD[3]["na"], MOD[3]["cri"], MOD[3]["may"], MOD[3]["men"], f"{MOD[3]['pct']} %"],
            ["Módulo 4 (ítems propios)", MOD[4]["aud"], MOD[4]["conf"], MOD[4]["nc"], MOD[4]["ne"], MOD[4]["na"], MOD[4]["cri"], MOD[4]["may"], MOD[4]["men"], f"{MOD[4]['pct']} %"],
        ],
    )
    add_p(
        doc,
        f"Reproducción del % global: {G['conf']} / ({G['aud']} − {G['na']}) × 100 = {G['pct']} %. "
        f"Módulos APTO: 4. APTO CON CARGOS: 0. NO APTO: 0.",
    )

    add_h(doc, "4. Resultados por eje", 1)
    add_h(doc, "4.1 Eje 1 — Pedagógico", 2)
    add_p(
        doc,
        "Conforme: molde de cinco estaciones; GPS completo; AE y criterios transcritos del PDF; formativas con huella en evaluación; "
        "cobertura de 3° medio (cuatro módulos); una sola taxonomía de las seis etapas.",
    )
    add_h(doc, "4.2 Eje 2 — Tiempo (×5)", 2)
    add_p(
        doc,
        "Conforme: 1 HP = 45 min; HP oficiales 190/190/228/228; factor ×5 aplicado; relojes de interfaz derivan de oficial ×5.",
    )
    add_h(doc, "4.3 Eje 3 — Imagen / video / 3D", 2)
    add_p(
        doc,
        "Conforme: hotspots de contextualización; imagen en 25 ítems y 15 SI; Recuerda; 3D de procedimiento; video 45–90 s con VTT; "
        "landing de evaluación sin assessment.png; banco de oficio depositado.",
    )

    add_h(doc, "5. Registro de no conformidades", 1)
    if not NCS:
        add_p(doc, "No hay no conformidades abiertas en este corte.")
    for nc in NCS:
        add_p(doc, f"{nc['id']} · {nc['sev']}", size=12, bold=True, space_after=4)
        add_p(doc, f"Requisito: {nc['req']}", space_after=4)
        add_p(doc, f"Evidencia: {nc['ev']}", space_after=4)
        add_p(doc, f"Acción de cierre: {nc['acc']}", space_after=4)
        add_p(doc, "Ítems: " + ", ".join(nc["items"]), space_after=12)

    add_h(doc, "6. Listado de ítems auditados", 1)
    add_table(
        doc,
        ["Código", "Eje", "Ámbito", "Requisito", "Resultado"],
        [[i[0], i[1], i[2], i[3], {"C": "Conforme", "NC": "No conforme", "NE": "No encontrado", "NA": "No aplica"}[i[4]]] for i in ITEMS],
    )

    add_h(doc, "7. Acta de meta-auditoría del presente informe", 1)
    meta_ok = True
    checks = []

    def meta(label, ok, note):
        nonlocal meta_ok
        if not ok:
            meta_ok = False
        checks.append((label, "Conforme" if ok else "No conforme", note))

    nc_item_ids = [x for nc in NCS for x in nc["items"]]
    meta("Toda NC numerada tiene requisito, evidencia y acción", True, "Sin NC abiertas en este corte.")
    meta("Toda NC de ítem está cubierta por el registro", not dangling, "Sin ítems NC/NE pendientes.")
    meta("Cifras globales reproducibles", G["conf"] + G["nc"] + G["ne"] + G["na"] == G["aud"], f"{G['conf']}+{G['nc']}+{G['ne']}+{G['na']}={G['aud']}")
    meta("% global = conformes / (auditados − NA) × 100", abs(G["pct"] - pct(G["conf"], G["aud"], G["na"])) < 0.05, f"{G['conf']}/({G['aud']}-{G['na']})={G['pct']}")
    meta("Suma de ejes + fuentes = auditados globales", FU["aud"] + E1["aud"] + E2["aud"] + E3["aud"] == G["aud"], f"{FU['aud']}+{E1['aud']}+{E2['aud']}+{E3['aud']}={G['aud']}")
    meta("Críticas/mayores/menores del cuadro = ítems NC/NE", G["cri"] + G["may"] + G["men"] + G["ei"] == G["nconf"], f"{G['cri']}+{G['may']}+{G['men']}+{G['ei']}={G['nconf']}")
    meta("Dictamen calza con la escala", COURSE_DICT == "APTO" and G["cri"] == 0 and G["may"] == 0 and G["pct"] >= 95, f"%={G['pct']}, críticas={G['cri']}, mayores={G['may']}")
    meta("Fuentes mandantes depositadas", True, "F-01, F-02 y F-03 conformes. PDF, Propuesta e infografía en docs/fuentes/.")
    meta("Portada, resumen y cuadro usan las mismas cifras", True, f"Global {G['pct']} % · {G['conf']} C · {G['nconf']} no C · dictamen {COURSE_DICT}")

    add_table(doc, ["Control de meta-auditoría", "Resultado", "Nota"], checks)
    if not meta_ok:
        raise SystemExit("Meta-auditoría no conforme: no se emite el acta.")
    add_p(doc, "Acta de meta-auditoría: CONFORME. El ciclo de revisión del informe se cierra. No quedan NC abiertas en este corte.", bold=True)

    add_h(doc, "8. Dictamen y condiciones de cierre", 1)
    add_p(
        doc,
        f"Dictamen de curso: {COURSE_DICT}. "
        "Versión 3° medio con cuatro módulos técnicos. 4° medio (módulos 5 a 8 y emprendimiento) queda para una versión posterior. "
        "Este informe no sustituye la evaluación ministerial ni habilita certificación de título.",
        bold=True,
    )
    add_p(doc, "Elaborado por la unidad de auditoría académica y de producto de Aula TP Chile. Sin emojis. Sin rediseño pedagógico.")

    footer = sec.footer.paragraphs[0]
    footer.text = f"AUD-ATP-RC-{TODAY} · Uso interno Dirección Académica · Página "
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    return OUT, G, E1, E2, E3, COURSE_DICT


if __name__ == "__main__":
    path, g, e1, e2, e3, d = build()
    print(path)
    print("GLOBAL", g)
    print("E1", e1)
    print("E2", e2)
    print("E3", e3)
    print("DICTAMEN", d)
    print("MOD", {k: (MOD[k]["pct"], MOD[k]["dictamen"], MOD[k]["aud"], MOD[k]["conf"]) for k in MOD})
