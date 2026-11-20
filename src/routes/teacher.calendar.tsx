import { createFileRoute } from '@tanstack/react-router';
import { StudentCalendarPage } from '@/views/student/StudentCalendarPage';

export const Route = createFileRoute('/teacher/calendar')({
  head: () => ({
    meta: [
      { title: "Attendance Calendar · FaceAttend AI" },
      { name: "description", content: "Calendar view of attendance." },
      { property: "og:title", content: "Attendance Calendar · FaceAttend AI" },
      { property: "og:description", content: "Calendar view of attendance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentCalendarPage,
});
