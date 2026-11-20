import { createFileRoute } from '@tanstack/react-router';
import { TeacherStudentsPage } from '@/views/teacher/TeacherStudentsPage';

export const Route = createFileRoute('/teacher/sections')({
  head: () => ({
    meta: [
      { title: "My Sections · FaceAttend AI" },
      { name: "description", content: "Sections assigned to you." },
      { property: "og:title", content: "My Sections · FaceAttend AI" },
      { property: "og:description", content: "Sections assigned to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherStudentsPage,
});
