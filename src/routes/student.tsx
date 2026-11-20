import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';

function Layout() {
  return (
    <DashboardLayout
      requiredRole="student"
      title="Student Academic Dashboard"
      subtitle="Personal Biometric Attendance & Examination Compliance"
      roleBadge="Student"
    />
  );
}

export const Route = createFileRoute('/student')({
  component: Layout,
});
