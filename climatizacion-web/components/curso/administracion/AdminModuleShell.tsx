"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EstacionBase, FaseRuta } from "@/lib/aula-module-types";
import {
  ADMIN_MODULES,
  erpUrl,
  type AdminModule,
  type AdminStation,
} from "@/lib/administracion-course";
import StationRail, { railItemFromEstacion } from "@/components/curso/shared/StationRail";
import { ErpVistaIcon } from "@/components/curso/administracion/AdminIcons";
import { COURSE_CATALOG_HREF } from "@/lib/course-portal";
import "@/app/curso/climatizacion/hub.css";
import "@/app/curso/administracion/admin.css";

const LS_KEY = "aula-admin-progress-v1";

type Store = Record<string, string[]>;

function readStore(): Store {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function writeStore(next: Store) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

function toStripStations(mod: AdminModule): EstacionBase[] {
  return mod.stations.map((s, i) => ({
    id: s.id,
    orden: i + 1,
    slug: s.id,
    titulo: s.titulo,
    horas: s.minutes / 60,
    fase: s.fase as FaseRuta,
    aeCodigos: [mod.oa],
    ceCodigos: [],
    habilidad: s.hint,
    preguntaPedagogica: s.titulo,
    escenario: s.body[0] || s.titulo,
    interaccion: s.erp ? "Práctica en ERP Bazar Inteligente" : "Lectura y decisión",
    evidenciaMinima: s.erp?.checklist[0] || "Estación revisada",
    opciones: [],
    agente: [],
    permiteAgente: false,
    ctaCompletar: "Completar",
    ctaSiguiente: "Siguiente",
    bloqueadoHastaCompletarAnterior: false,
  }));
}

export default function AdminModuleShell({
  module: mod,
  initialStation,
}: {
  module: AdminModule;
  initialStation?: string;
}) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState(mod.stations[0]?.id);
  const [quizPick, setQuizPick] = useState<Record<number, number | null>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const store = readStore();
    setCompleted(store[mod.slug] || []);
  }, [mod.slug]);

  useEffect(() => {
    const wanted = initialStation || mod.stations[0]?.id;
    if (wanted && mod.stations.some((s) => s.id === wanted)) setCurrentId(wanted);
  }, [initialStation, mod]);

  const station = mod.stations.find((s) => s.id === currentId) || mod.stations[0];
  const stripStations = useMemo(() => toStripStations(mod), [mod]);
  const idx = mod.stations.findIndex((s) => s.id === station.id);
  const prev = mod.stations[idx - 1];
  const next = mod.stations[idx + 1];
  const nextMod = ADMIN_MODULES.find((m) => m.numero === mod.numero + 1);

  function markDone(id: string) {
    setCompleted((curr) => {
      if (curr.includes(id)) return curr;
      const nextIds = [...curr, id];
      const store = readStore();
      store[mod.slug] = nextIds;
      writeStore(store);
      return nextIds;
    });
  }

  function selectFase(first: EstacionBase) {
    setCurrentId(first.id);
    setQuizPick({});
    setQuizDone(false);
    setChecks({});
  }

  const allChecks = station.erp?.checklist.every((item) => checks[item]) ?? false;

  return (
    <div className="aula-font sites-hub admin-shell" data-specialty="administracion">
      <header className="sites-hub-top">
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link href="/curso/administracion">Volver al curso</Link>
          <span className="text-[var(--aula-text-muted)]">·</span>
          <Link href="/curso/administracion/erp">Experiencia ERP</Link>
          <span className="text-[var(--aula-text-muted)]">·</span>
          <Link href={COURSE_CATALOG_HREF}>Catálogo</Link>
        </nav>
      </header>

      <div className="sites-hub-hero-note mx-auto max-w-6xl px-4 pb-2 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--aula-blue)]">
          Administración · 3° medio · Módulo {mod.numero} · {mod.oa}
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--aula-navy)] sm:text-3xl">{mod.title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--aula-text-muted)]">{mod.blurb}</p>
      </div>

      <main className="sites-hub-main">
        <StationRail
          items={stripStations.map((estacion, index) =>
            railItemFromEstacion(estacion, {
              index,
              done: completed.includes(estacion.id),
              active: estacion.id === station.id,
              open: true,
            }),
          )}
          onSelect={(id) => {
            const next = stripStations.find((e) => e.id === id);
            if (next) selectFase(next);
          }}
        />

        <article className="admin-station" aria-labelledby="admin-station-title">
          <header className="admin-station-head">
            <div>
              <p>
                Estación {idx + 1} de {mod.stations.length} · {station.minutes} min
              </p>
              <h2 id="admin-station-title">{station.titulo}</h2>
            </div>
            {completed.includes(station.id) ? <span className="admin-pill is-done">Completada</span> : <span className="admin-pill">En desarrollo</span>}
          </header>

          {station.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {station.bullets ? (
            <ul>
              {station.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          {station.erp ? <ErpMission station={station} checks={checks} setChecks={setChecks} allChecks={allChecks} /> : null}

          {station.quiz ? (
            <QuizBlock
              station={station}
              quizPick={quizPick}
              setQuizPick={setQuizPick}
              quizDone={quizDone}
              setQuizDone={setQuizDone}
            />
          ) : null}

          <footer className="admin-station-nav">
            <button type="button" className="admin-btn ghost" disabled={!prev} onClick={() => prev && selectFase(stripStations[idx - 1])}>
              ← Anterior
            </button>
            <button
              type="button"
              className="admin-btn"
              onClick={() => {
                markDone(station.id);
                if (next) selectFase(stripStations[idx + 1]);
              }}
            >
              {next ? "Marcar y seguir →" : "Marcar estación completada"}
            </button>
          </footer>
        </article>

        {idx === mod.stations.length - 1 ? (
          <p className="admin-next-mod">
            {nextMod ? (
              <Link href={`/curso/administracion/${nextMod.slug}`}>Continuar al Módulo {nextMod.numero}: {nextMod.title} →</Link>
            ) : (
              <Link href="/curso/administracion/erp">Abrir práctica libre en el ERP →</Link>
            )}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function ErpMission({
  station,
  checks,
  setChecks,
  allChecks,
}: {
  station: AdminStation;
  checks: Record<string, boolean>;
  setChecks: (v: Record<string, boolean>) => void;
  allChecks: boolean;
}) {
  const erp = station.erp;
  if (!erp) return null;
  const src = erpUrl(erp.vista);
  return (
    <section className="admin-erp" aria-label="Experiencia ERP Bazar Inteligente">
      <div className="admin-erp-copy">
        <p className="admin-erp-kicker">
          <span className="admin-chip-ico">
            <ErpVistaIcon vista={erp.vista} />
          </span>
          Taller · ERP Bazar Inteligente
        </p>
        <h3>{erp.mission}</h3>
        <ol>
          {erp.checklist.map((item) => (
            <li key={item}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(checks[item])}
                  onChange={(e) => setChecks({ ...checks, [item]: e.target.checked })}
                />
                {item}
              </label>
            </li>
          ))}
        </ol>
        <div className="admin-erp-actions">
          <a className="admin-btn" href={src} target="_blank" rel="noreferrer">
            Abrir ERP en pestaña nueva
          </a>
          <span className={allChecks ? "admin-pill is-done" : "admin-pill"}>{allChecks ? "Misión lista" : "Marca la pauta al practicar"}</span>
        </div>
      </div>
      <iframe className="admin-erp-frame" title="ERP Bazar Inteligente" src={src} />
    </section>
  );
}

function QuizBlock({
  station,
  quizPick,
  setQuizPick,
  quizDone,
  setQuizDone,
}: {
  station: AdminStation;
  quizPick: Record<number, number | null>;
  setQuizPick: (v: Record<number, number | null>) => void;
  quizDone: boolean;
  setQuizDone: (v: boolean) => void;
}) {
  const quiz = station.quiz || [];
  const score = quiz.reduce((acc, q, i) => acc + (quizPick[i] === q.answer ? 1 : 0), 0);
  return (
    <section className="admin-quiz" aria-label="Evaluación">
      {quiz.map((q, i) => (
        <fieldset key={q.q}>
          <legend>
            {i + 1}. {q.q}
          </legend>
          {q.options.map((opt, oi) => (
            <label key={opt} className={quizDone && oi === q.answer ? "is-ok" : undefined}>
              <input
                type="radio"
                name={`q-${station.id}-${i}`}
                checked={quizPick[i] === oi}
                onChange={() => setQuizPick({ ...quizPick, [i]: oi })}
              />
              {opt}
            </label>
          ))}
          {quizDone ? <small>{q.why}</small> : null}
        </fieldset>
      ))}
      <button type="button" className="admin-btn" onClick={() => setQuizDone(true)} disabled={quiz.some((_, i) => quizPick[i] == null)}>
        Ver corrección
      </button>
      {quizDone ? (
        <p>
          <strong>
            {score} de {quiz.length} correctas.
          </strong>{" "}
          Revisa el fundamento bajo cada pregunta.
        </p>
      ) : null}
    </section>
  );
}
