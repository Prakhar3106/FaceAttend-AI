import { createFileRoute } from '@tanstack/react-router';
import { NotificationsPage } from '@/views/common/NotificationsPage';

export const Route = createFileRoute('/admin/notifications')({
  head: () => ({
    meta: [
      { title: "Admin Notifications · FaceAttend AI" },
      { name: "description", content: "Your institute notifications." },
      { property: "og:title", content: "Admin Notifications · FaceAttend AI" },
      { property: "og:description", content: "Your institute notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});
