import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/teacher/reports')({
  head: () => ({
    meta: [
      { title: "Teacher Reports · FaceAttend AI" },
      { name: "description", content: "Attendance reports for your sections." },
      { property: "og:title", content: "Teacher Reports · FaceAttend AI" },
      { property: "og:description", content: "Attendance reports for your sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
