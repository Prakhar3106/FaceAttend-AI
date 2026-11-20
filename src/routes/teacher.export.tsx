import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/teacher/export')({
  head: () => ({
    meta: [
      { title: "Excel / CSV Export · FaceAttend AI" },
      { name: "description", content: "Export attendance as CSV." },
      { property: "og:title", content: "Excel / CSV Export · FaceAttend AI" },
      { property: "og:description", content: "Export attendance as CSV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
