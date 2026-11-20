import { createFileRoute } from '@tanstack/react-router';
import { TeacherDashboard } from '@/views/teacher/TeacherDashboard';

export const Route = createFileRoute('/teacher/profile')({
  head: () => ({
    meta: [
      { title: "Teacher Profile · FaceAttend AI" },
      { name: "description", content: "Your faculty profile and assignments." },
      { property: "og:title", content: "Teacher Profile · FaceAttend AI" },
      { property: "og:description", content: "Your faculty profile and assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherDashboard,
});
