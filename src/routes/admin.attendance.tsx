import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/views/common/ReportsPage';

export const Route = createFileRoute('/admin/attendance')({
  head: () => ({
    meta: [
      { title: "Attendance Records · FaceAttend AI" },
      { name: "description", content: "Institute attendance ledger." },
      { property: "og:title", content: "Attendance Records · FaceAttend AI" },
      { property: "og:description", content: "Institute attendance ledger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportsPage,
});
