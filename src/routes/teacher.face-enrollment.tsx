import { createFileRoute } from '@tanstack/react-router';
import { FaceEnrollmentPage } from '@/views/common/FaceEnrollmentPage';

export const Route = createFileRoute('/teacher/face-enrollment')({
  head: () => ({
    meta: [
      { title: "Teacher Face Enrollment · FaceAttend AI" },
      { name: "description", content: "Enroll faces of students in your sections." },
      { property: "og:title", content: "Teacher Face Enrollment · FaceAttend AI" },
      { property: "og:description", content: "Enroll faces of students in your sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaceEnrollmentPage,
});
