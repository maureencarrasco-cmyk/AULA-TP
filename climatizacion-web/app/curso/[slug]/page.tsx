import { notFound, redirect } from "next/navigation";
import CourseHub from "@/components/curso/shared/CourseHub";
import {
  getCourseHub,
  listCourseHubSlugs,
  resolveCourseSlug,
} from "@/lib/course-hubs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listCourseHubSlugs()
    .filter((slug) => slug !== "climatizacion" && slug !== "administracion")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const hub = getCourseHub(slug);
  if (!hub) return { title: "Curso Aula TP" };
  return {
    title: `Curso ${hub.title} | Aula TP`,
    description: hub.description,
  };
}

export default async function CursoHubPage({ params }: PageProps) {
  const { slug } = await params;
  const resolved = resolveCourseSlug(slug);
  if (slug !== resolved) {
    redirect(`/curso/${resolved}`);
  }
  if (resolved === "climatizacion") {
    redirect("/curso/climatizacion");
  }
  const hub = getCourseHub(slug);
  if (!hub) notFound();
  return <CourseHub hub={hub} />;
}
