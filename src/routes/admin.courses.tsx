import { createFileRoute } from '@tanstack/react-router';
import { AcademicStructurePage } from '@/views/admin/AcademicStructurePage';

function Page() {
  return <AcademicStructurePage initialTab="courses" />;
}

export const Route = createFileRoute('/admin/courses')({
  head: () => ({
    meta: [
      { title: "Courses · FaceAttend AI" },
      { name: "description", content: "Degree programs, durations and semesters." },
      { property: "og:title", content: "Courses · FaceAttend AI" },
      { property: "og:description", content: "Degree programs, durations and semesters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
