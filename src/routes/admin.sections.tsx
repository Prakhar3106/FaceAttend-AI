import { createFileRoute } from '@tanstack/react-router';
import { AcademicStructurePage } from '@/views/admin/AcademicStructurePage';

function Page() {
  return <AcademicStructurePage initialTab="sections" />;
}

export const Route = createFileRoute('/admin/sections')({
  head: () => ({
    meta: [
      { title: "Sections · FaceAttend AI" },
      { name: "description", content: "Dynamic sections for every class." },
      { property: "og:title", content: "Sections · FaceAttend AI" },
      { property: "og:description", content: "Dynamic sections for every class." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});
