import { createFileRoute } from '@tanstack/react-router';
import { AcademicStructurePage } from '@/views/admin/AcademicStructurePage';

function Page() {
  return <AcademicStructurePage initialTab="classes" />;
}

export const Route = createFileRoute('/admin/classes')({
  head: () => ({
    meta: [
      { title: "Classes · FaceAttend AI" },
      { name: "description", content: "Class cohorts linked to courses and semesters." },
      { property: "og:title", content: "Classes · FaceAttend AI" },
      { property: "og:description", content: "Class cohorts linked to courses and semesters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
