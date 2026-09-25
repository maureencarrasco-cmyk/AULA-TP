import { redirect } from "next/navigation";
import { COURSE_CATALOG_HREF } from "@/lib/course-portal";

export default function CursoIndexPage() {
  redirect(COURSE_CATALOG_HREF);
}
