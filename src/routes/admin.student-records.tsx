import { createFileRoute } from '@tanstack/react-router';
import { StudentManagementPage } from '@/views/admin/StudentManagementPage';

export const Route = createFileRoute('/admin/student-records')({
  head: () => ({
    meta: [
      { title: "Student Records · FaceAttend AI" },
      { name: "description", content: "Institute student directory and records." },
      { property: "og:title", content: "Student Records · FaceAttend AI" },
      { property: "og:description", content: "Institute student directory and records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentManagementPage,
});
