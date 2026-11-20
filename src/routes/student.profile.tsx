import { createFileRoute } from '@tanstack/react-router';
import { StudentProfilePage } from '@/views/student/StudentProfilePage';

export const Route = createFileRoute('/student/profile')({
  head: () => ({
    meta: [
      { title: "My Profile · FaceAttend AI" },
      { name: "description", content: "Your academic identity and contact details." },
      { property: "og:title", content: "My Profile · FaceAttend AI" },
      { property: "og:description", content: "Your academic identity and contact details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentProfilePage,
});
