import { createFileRoute } from '@tanstack/react-router';
import { StudentCalendarPage } from '@/views/student/StudentCalendarPage';

export const Route = createFileRoute('/student/calendar')({
  head: () => ({
    meta: [
      { title: "My Attendance Calendar · FaceAttend AI" },
      { name: "description", content: "Day-by-day attendance calendar." },
      { property: "og:title", content: "My Attendance Calendar · FaceAttend AI" },
      { property: "og:description", content: "Day-by-day attendance calendar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentCalendarPage,
});
