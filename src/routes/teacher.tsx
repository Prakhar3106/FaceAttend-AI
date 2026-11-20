import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';

function Layout() {
  return (
    <DashboardLayout
      requiredRole="teacher"
      title="Faculty Attendance Terminal"
      subtitle="Class, Section & Live Face Recognition Management"
      roleBadge="Faculty"
    />
  );
}

export const Route = createFileRoute('/teacher')({
  component: Layout,
});
