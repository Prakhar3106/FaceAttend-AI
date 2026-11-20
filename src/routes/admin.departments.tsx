import { createFileRoute } from '@tanstack/react-router';
import { InstituteProfilePage } from '@/views/admin/InstituteProfilePage';

export const Route = createFileRoute('/admin/departments')({
  head: () => ({
    meta: [
      { title: "Departments · FaceAttend AI" },
      { name: "description", content: "Academic departments of the institute." },
      { property: "og:title", content: "Departments · FaceAttend AI" },
      { property: "og:description", content: "Academic departments of the institute." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstituteProfilePage,
});
