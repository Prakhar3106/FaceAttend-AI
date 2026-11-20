import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '@/views/admin/AuditPage';

export const Route = createFileRoute('/admin/audit')({
  head: () => ({
    meta: [
      { title: "Audit Activity · FaceAttend AI" },
      { name: "description", content: "Security and activity audit trail." },
      { property: "og:title", content: "Audit Activity · FaceAttend AI" },
      { property: "og:description", content: "Security and activity audit trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditPage,
});
