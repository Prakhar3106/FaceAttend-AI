import { createFileRoute } from '@tanstack/react-router';
import { StudentCalendarPage } from '@/views/student/StudentCalendarPage';

export const Route = createFileRoute('/student/monthly')({
  head: () => ({
    meta: [
      { title: "Monthly Attendance · FaceAttend AI" },
      { name: "description", content: "Month view of your attendance." },
      { property: "og:title", content: "Monthly Attendance · FaceAttend AI" },
      { property: "og:description", content: "Month view of your attendance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentCalendarPage,
});
