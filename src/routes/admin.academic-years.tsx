import { createFileRoute } from '@tanstack/react-router';
import { AcademicStructurePage } from '@/views/admin/AcademicStructurePage';

function Page() {
  return <AcademicStructurePage initialTab="years" />;
}

export const Route = createFileRoute('/admin/academic-years')({
  head: () => ({
    meta: [
      { title: "Academic Years · FaceAttend AI" },
      { name: "description", content: "Register and switch the active academic year." },
      { property: "og:title", content: "Academic Years · FaceAttend AI" },
      { property: "og:description", content: "Register and switch the active academic year." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
