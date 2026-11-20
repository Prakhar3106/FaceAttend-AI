import { createFileRoute } from '@tanstack/react-router';
import { AIInsightsPage } from '@/views/common/AIInsightsPage';

export const Route = createFileRoute('/teacher/insights')({
  head: () => ({
    meta: [
      { title: "Teacher Insights · FaceAttend AI" },
      { name: "description", content: "Attendance risks in your sections." },
      { property: "og:title", content: "Teacher Insights · FaceAttend AI" },
      { property: "og:description", content: "Attendance risks in your sections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AIInsightsPage,
});
