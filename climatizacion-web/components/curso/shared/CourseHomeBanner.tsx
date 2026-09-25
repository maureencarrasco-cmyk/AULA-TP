import type { CourseHubConfig } from "@/lib/course-hubs";
import "@/app/curso/shared/course-home-banner.css";

export default function CourseHomeBanner({ hub }: { hub: CourseHubConfig }) {
  return (
    <header className="course-home-banner" data-specialty={hub.slug}>
      <div className="course-home-banner__inner">
        <div className="course-home-banner__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/climatizacion/aula-tp-chile-logo-corporativo.jpg" alt="Aula TP Chile" />
          <small>Formación técnica con sentido</small>
        </div>
        <div className="course-home-banner__copy">
          <p className="course-home-banner__brand">Aula TP Chile</p>
          <p className="course-home-banner__kicker">Módulos especialidad</p>
          <h1>{hub.title}</h1>
          <p className="course-home-banner__plan">{hub.level}</p>
          <p className="course-home-banner__desc">{hub.description}</p>
        </div>
        <div
          className="course-home-banner__photo"
          style={{ ["--hero-photo" as string]: `url("${hub.heroImage}")` }}
          aria-hidden
        />
      </div>
    </header>
  );
}
