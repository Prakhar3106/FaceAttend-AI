import { createFileRoute } from '@tanstack/react-router';
import { AIInsightsPage } from '@/views/common/AIInsightsPage';

export const Route = createFileRoute('/admin/insights')({
  head: () => ({
    meta: [
      { title: "AI Insights · FaceAttend AI" },
      { name: "description", content: "Attendance risk patterns computed from real records." },
      { property: "og:title", content: "AI Insights · FaceAttend AI" },
      { property: "og:description", content: "Attendance risk patterns computed from real records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AIInsightsPage,
});
