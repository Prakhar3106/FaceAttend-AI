import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/teacher/history')({
  head: () => ({
    meta: [
      { title: "Attendance History · FaceAttend AI" },
      { name: "description", content: "Attendance recorded for your sections." },
      { property: "og:title", content: "Attendance History · FaceAttend AI" },
      { property: "og:description", content: "Attendance recorded for your sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
