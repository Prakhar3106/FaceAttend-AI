import { createFileRoute } from '@tanstack/react-router';
import { LiveAttendancePage } from '@/views/teacher/LiveAttendancePage';

export const Route = createFileRoute('/teacher/live-attendance')({
  head: () => ({
    meta: [
      { title: "Live AI Attendance · FaceAttend AI" },
      { name: "description", content: "Take attendance with live face recognition." },
      { property: "og:title", content: "Live AI Attendance · FaceAttend AI" },
      { property: "og:description", content: "Take attendance with live face recognition." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LiveAttendancePage,
});
