import { createFileRoute } from '@tanstack/react-router';
import { StudentManagementPage } from '@/views/admin/StudentManagementPage';

export const Route = createFileRoute('/admin/students')({
  head: () => ({
    meta: [
      { title: "Students · FaceAttend AI" },
      { name: "description", content: "Manage student records, photographs and logins." },
      { property: "og:title", content: "Students · FaceAttend AI" },
      { property: "og:description", content: "Manage student records, photographs and logins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentManagementPage,
});
