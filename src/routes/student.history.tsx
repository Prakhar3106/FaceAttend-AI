import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/student/history')({
  head: () => ({
    meta: [
      { title: "My Attendance History · FaceAttend AI" },
      { name: "description", content: "All your attendance records." },
      { property: "og:title", content: "My Attendance History · FaceAttend AI" },
      { property: "og:description", content: "All your attendance records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
