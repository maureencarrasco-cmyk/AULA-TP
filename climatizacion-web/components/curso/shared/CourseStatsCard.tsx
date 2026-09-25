import "@/app/curso/climatizacion/hub.css";

type CourseStatsStatus = "En curso" | "Disponible" | "Próximamente" | "Completado";

export type CourseStats = {
  modules: string | number;
  hoursAnnual: string;
  hours3d: string;
  status: CourseStatsStatus;
};

export default function CourseStatsCard({
  modules,
  hoursAnnual,
  hours3d,
  status,
  label = "Resumen de módulos",
}: CourseStats & { label?: string }) {
  const statusClass =
    status === "Próximamente" ? "is-soon" : status === "Completado" ? "is-done" : "is-live";
  return (
    <section className="aula-course-stats" aria-label={label}>
      <div>
        <span className="aula-stat-icon" aria-hidden>
          <i className="aula-ico aula-ico-clipboard" />
        </span>
        <strong>Módulos</strong>
        <b>{modules}</b>
      </div>
      <div>
        <span className="aula-stat-icon" aria-hidden>
          <i className="aula-ico aula-ico-clock" />
        </span>
        <strong>Horas anuales</strong>
        <b>{hoursAnnual}</b>
      </div>
      <div>
        <span className="aula-stat-icon" aria-hidden>
          <i className="aula-ico aula-ico-cube" />
        </span>
        <strong>Horas 3D</strong>
        <b>{hours3d}</b>
      </div>
      <div>
        <span className="aula-stat-icon" aria-hidden>
          <i className="aula-ico aula-ico-check" />
        </span>
        <strong>Estado</strong>
        <b className={`aula-stat-status ${statusClass}`}>
          <i />
          <span>{status}</span>
        </b>
      </div>
    </section>
  );
}
