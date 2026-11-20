import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';

function Layout() {
  return (
    <DashboardLayout
      requiredRole="admin"
      title="Institute Control & Governance"
      roleBadge="Main Admin / HOD"
    />
  );
}

export const Route = createFileRoute('/admin')({
  component: Layout,
});
