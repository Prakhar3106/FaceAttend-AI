import { createFileRoute } from '@tanstack/react-router';
import { StudentDashboard } from '@/views/student/StudentDashboard';

export const Route = createFileRoute('/student/attendance')({
  head: () => ({
    meta: [
      { title: "My Attendance · FaceAttend AI" },
      { name: "description", content: "Your attendance summary." },
      { property: "og:title", content: "My Attendance · FaceAttend AI" },
      { property: "og:description", content: "Your attendance summary." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentDashboard,
});
