import { createFileRoute } from '@tanstack/react-router';
import { StudentProfilePage } from '@/views/student/StudentProfilePage';

export const Route = createFileRoute('/student/settings')({
  head: () => ({
    meta: [
      { title: "Student Settings · FaceAttend AI" },
      { name: "description", content: "Contact details and password." },
      { property: "og:title", content: "Student Settings · FaceAttend AI" },
      { property: "og:description", content: "Contact details and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentProfilePage,
});
