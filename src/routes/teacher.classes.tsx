import { createFileRoute } from '@tanstack/react-router';
import { TeacherStudentsPage } from '@/views/teacher/TeacherStudentsPage';

export const Route = createFileRoute('/teacher/classes')({
  head: () => ({
    meta: [
      { title: "My Classes · FaceAttend AI" },
      { name: "description", content: "Classes assigned to you." },
      { property: "og:title", content: "My Classes · FaceAttend AI" },
      { property: "og:description", content: "Classes assigned to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherStudentsPage,
});
