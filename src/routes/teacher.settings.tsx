import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/views/common/SettingsPage';

export const Route = createFileRoute('/teacher/settings')({
  head: () => ({
    meta: [
      { title: "Teacher Settings · FaceAttend AI" },
      { name: "description", content: "Preferences and password." },
      { property: "og:title", content: "Teacher Settings · FaceAttend AI" },
      { property: "og:description", content: "Preferences and password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
