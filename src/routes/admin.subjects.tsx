import { createFileRoute } from '@tanstack/react-router';
import { SubjectManagementPage } from '@/views/admin/SubjectManagementPage';

export const Route = createFileRoute('/admin/subjects')({
  head: () => ({
    meta: [
      { title: "Subjects · FaceAttend AI" },
      { name: "description", content: "Curriculum subjects and faculty in-charge." },
      { property: "og:title", content: "Subjects · FaceAttend AI" },
      { property: "og:description", content: "Curriculum subjects and faculty in-charge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubjectManagementPage,
});
