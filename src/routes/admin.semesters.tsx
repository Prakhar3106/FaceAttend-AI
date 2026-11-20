import { createFileRoute } from '@tanstack/react-router';
import { AcademicStructurePage } from '@/views/admin/AcademicStructurePage';

function Page() {
  return <AcademicStructurePage initialTab="courses" />;
}

export const Route = createFileRoute('/admin/semesters')({
  head: () => ({
    meta: [
      { title: "Semesters · FaceAttend AI" },
      { name: "description", content: "Semester structure of every course." },
      { property: "og:title", content: "Semesters · FaceAttend AI" },
      { property: "og:description", content: "Semester structure of every course." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
