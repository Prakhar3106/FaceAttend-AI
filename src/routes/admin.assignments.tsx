import { createFileRoute } from '@tanstack/react-router';
import { TeacherManagementPage } from '@/views/admin/TeacherManagementPage';

export const Route = createFileRoute('/admin/assignments')({
  head: () => ({
    meta: [
      { title: "Teacher Assignments · FaceAttend AI" },
      { name: "description", content: "Assign faculty to classes, sections and subjects." },
      { property: "og:title", content: "Teacher Assignments · FaceAttend AI" },
      { property: "og:description", content: "Assign faculty to classes, sections and subjects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherManagementPage,
});
