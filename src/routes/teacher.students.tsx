import { createFileRoute } from '@tanstack/react-router';
import { TeacherStudentsPage } from '@/views/teacher/TeacherStudentsPage';

export const Route = createFileRoute('/teacher/students')({
  head: () => ({
    meta: [
      { title: "My Students · FaceAttend AI" },
      { name: "description", content: "Students in your assigned sections." },
      { property: "og:title", content: "My Students · FaceAttend AI" },
      { property: "og:description", content: "Students in your assigned sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherStudentsPage,
});
