import { createFileRoute } from '@tanstack/react-router';
import { FaceEnrollmentPage } from '@/views/common/FaceEnrollmentPage';

export const Route = createFileRoute('/admin/face-enrollment')({
  head: () => ({
    meta: [
      { title: "Face Enrollment · FaceAttend AI" },
      { name: "description", content: "Capture and manage student face enrollment." },
      { property: "og:title", content: "Face Enrollment · FaceAttend AI" },
      { property: "og:description", content: "Capture and manage student face enrollment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaceEnrollmentPage,
});
