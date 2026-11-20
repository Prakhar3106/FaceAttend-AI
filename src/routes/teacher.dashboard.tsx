import { createFileRoute } from '@tanstack/react-router';
import { TeacherDashboard } from '@/views/teacher/TeacherDashboard';

export const Route = createFileRoute('/teacher/dashboard')({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard · FaceAttend AI" },
      { name: "description", content: "Your classes, sections and attendance overview." },
      { property: "og:title", content: "Teacher Dashboard · FaceAttend AI" },
      { property: "og:description", content: "Your classes, sections and attendance overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherDashboard,
});
