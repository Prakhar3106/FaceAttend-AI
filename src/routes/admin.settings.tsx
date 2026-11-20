import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/views/common/SettingsPage';

export const Route = createFileRoute('/admin/settings')({
  head: () => ({
    meta: [
      { title: "Admin Settings · FaceAttend AI" },
      { name: "description", content: "Institute rules, attendance policies and account security." },
      { property: "og:title", content: "Admin Settings · FaceAttend AI" },
      { property: "og:description", content: "Institute rules, attendance policies and account security." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
