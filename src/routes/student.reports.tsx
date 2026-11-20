import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/student/reports')({
  head: () => ({
    meta: [
      { title: "Download Report · FaceAttend AI" },
      { name: "description", content: "Download your attendance report." },
      { property: "og:title", content: "Download Report · FaceAttend AI" },
      { property: "og:description", content: "Download your attendance report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
