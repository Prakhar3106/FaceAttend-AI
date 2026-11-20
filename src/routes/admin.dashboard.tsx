import { createFileRoute } from '@tanstack/react-router';
import { AdminDashboard } from '@/views/admin/AdminDashboard';

export const Route = createFileRoute('/admin/dashboard')({
  head: () => ({
    meta: [
      { title: "Admin Dashboard · FaceAttend AI" },
      { name: "description", content: "Institute-wide attendance overview, statistics and recent activity." },
      { property: "og:title", content: "Admin Dashboard · FaceAttend AI" },
      { property: "og:description", content: "Institute-wide attendance overview, statistics and recent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});
