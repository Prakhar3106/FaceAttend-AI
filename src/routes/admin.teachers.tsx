import { createFileRoute } from '@tanstack/react-router';
import { TeacherManagementPage } from '@/views/admin/TeacherManagementPage';

export const Route = createFileRoute('/admin/teachers')({
  head: () => ({
    meta: [
      { title: "Teachers · FaceAttend AI" },
      { name: "description", content: "Manage faculty accounts, photos and details." },
      { property: "og:title", content: "Teachers · FaceAttend AI" },
      { property: "og:description", content: "Manage faculty accounts, photos and details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherManagementPage,
});
