import { createFileRoute } from '@tanstack/react-router';
import { InstituteProfilePage } from '@/views/admin/InstituteProfilePage';

export const Route = createFileRoute('/admin/institute')({
  head: () => ({
    meta: [
      { title: "Institute Profile · FaceAttend AI" },
      { name: "description", content: "Official institute identity, logo, campus photograph and departments." },
      { property: "og:title", content: "Institute Profile · FaceAttend AI" },
      { property: "og:description", content: "Official institute identity, logo, campus photograph and departments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InstituteProfilePage,
});
