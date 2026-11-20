import { createFileRoute } from '@tanstack/react-router';
import { StudentDashboard } from '@/views/student/StudentDashboard';

export const Route = createFileRoute('/student/dashboard')({
  head: () => ({
    meta: [
      { title: "Student Dashboard · FaceAttend AI" },
      { name: "description", content: "Your personal attendance overview." },
      { property: "og:title", content: "Student Dashboard · FaceAttend AI" },
      { property: "og:description", content: "Your personal attendance overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentDashboard,
});
