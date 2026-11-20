import { createFileRoute } from '@tanstack/react-router';
import { StudentDashboard } from '@/views/student/StudentDashboard';

export const Route = createFileRoute('/student/subjects')({
  head: () => ({
    meta: [
      { title: "Subject-wise Attendance · FaceAttend AI" },
      { name: "description", content: "Attendance by subject." },
      { property: "og:title", content: "Subject-wise Attendance · FaceAttend AI" },
      { property: "og:description", content: "Attendance by subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentDashboard,
});
