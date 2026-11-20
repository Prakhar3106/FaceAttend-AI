import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { Navigate } from '@/lib/router-compat';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/common/Sidebar';
import { TopBar } from '../components/common/TopBar';
import { Toast } from '../components/common/Toast';
import { InstituteSetupModal } from '../components/admin/InstituteSetupModal';
import { UserRole } from '../types';

interface DashboardLayoutProps {
  requiredRole: UserRole;
  title: string;
  subtitle?: string;
  roleBadge: string;
}

const LoadingScreen: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  </div>
);

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ requiredRole, title, subtitle, roleBadge }) => {
  const { authReady, dataLoading, isSignedIn, currentUser, needsInstituteSetup, settings } = useApp();

  if (!authReady || (isSignedIn && dataLoading && !currentUser)) {
    return <LoadingScreen label="Loading your secure workspace..." />;
  }

  if (!isSignedIn) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }

  // Signed in but not yet linked to an institute: first-time Main Admin registration
  if (needsInstituteSetup) {
    if (requiredRole !== 'admin') return <Navigate to="/admin/dashboard" replace />;
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <InstituteSetupModal isOpen required onClose={() => undefined} />
        <Toast />
      </div>
    );
  }

  if (!currentUser) {
    return <LoadingScreen label="Loading your secure workspace..." />;
  }

  // No automatic role switching: send users to their own portal instead
  if (currentUser.role !== requiredRole) {
    return <Navigate to={`/${currentUser.role}/dashboard`} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-[#F1F5F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} subtitle={subtitle || settings.instituteName} roleBadge={roleBadge} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
};
