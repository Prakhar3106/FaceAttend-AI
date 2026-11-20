import { createFileRoute } from '@tanstack/react-router';
import { TeacherDashboard } from '@/views/teacher/TeacherDashboard';

export const Route = createFileRoute('/teacher/subjects')({
  head: () => ({
    meta: [
      { title: "My Subjects · FaceAttend AI" },
      { name: "description", content: "Subjects assigned to you." },
      { property: "og:title", content: "My Subjects · FaceAttend AI" },
      { property: "og:description", content: "Subjects assigned to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherDashboard,
});
