import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '@/views/admin/AdminDashboard';

export const Route = createFileRoute('/admin/analytics')({
  head: () => ({
    meta: [
      { title: "Analytics · FaceAttend AI" },
      { name: "description", content: "Attendance analytics across departments and sections." },
      { property: "og:title", content: "Analytics · FaceAttend AI" },
      { property: "og:description", content: "Attendance analytics across departments and sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});
