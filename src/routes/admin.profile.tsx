import { createFileRoute } from '@tanstack/react-router';
import { InstituteProfilePage } from '@/views/admin/InstituteProfilePage';

export const Route = createFileRoute('/admin/profile')({
  head: () => ({
    meta: [
      { title: "Admin Profile · FaceAttend AI" },
      { name: "description", content: "Main Admin and institute profile." },
      { property: "og:title", content: "Admin Profile · FaceAttend AI" },
      { property: "og:description", content: "Main Admin and institute profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstituteProfilePage,
});
