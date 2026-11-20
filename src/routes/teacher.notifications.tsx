import { createFileRoute } from '@tanstack/react-router';
import { NotificationsPage } from '@/views/common/NotificationsPage';

export const Route = createFileRoute('/teacher/notifications')({
  head: () => ({
    meta: [
      { title: "Teacher Notifications · FaceAttend AI" },
      { name: "description", content: "Your notifications." },
      { property: "og:title", content: "Teacher Notifications · FaceAttend AI" },
      { property: "og:description", content: "Your notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});
