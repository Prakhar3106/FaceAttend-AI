import { createFileRoute } from '@tanstack/react-router';
import { LiveAttendancePage } from '@/views/teacher/LiveAttendancePage';

export const Route = createFileRoute('/admin/attendance-live')({
  head: () => ({
    meta: [
      { title: "Live Monitoring · FaceAttend AI" },
      { name: "description", content: "Live camera face recognition attendance." },
      { property: "og:title", content: "Live Monitoring · FaceAttend AI" },
      { property: "og:description", content: "Live camera face recognition attendance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LiveAttendancePage,
});
