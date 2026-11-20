import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/admin/reports')({
  head: () => ({
    meta: [
      { title: "Attendance Reports · FaceAttend AI" },
      { name: "description", content: "Filter, print and export attendance reports." },
      { property: "og:title", content: "Attendance Reports · FaceAttend AI" },
      { property: "og:description", content: "Filter, print and export attendance reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
