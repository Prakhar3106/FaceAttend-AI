import React, { useState } from 'react';
import { NavLink, useLocation } from '@/lib/router-compat';
import { useApp } from '../../context/AppContext';
import { NeutralAvatar } from './NeutralAvatar';
import {
  LayoutDashboard,
  Building2,
  Layers,
  GraduationCap,
  Calendar,
  Grid3X3,
  BookOpen,
  Users,
  UserCheck,
  ScanFace,
  Activity,
  ClipboardList,
  FileBarChart2,
  PieChart,
  BrainCircuit,
  Bell,
  ShieldAlert,
  Settings,
  User,
  LogOut,
  FolderTree,
  CalendarDays,
  Download,
  Menu,
  X,
  Camera,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, currentRole, logout } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Grouped Navigation for Admin (All 23 required pages)
  const adminGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Institute Profile', path: '/admin/institute', icon: Building2 },
      ],
    },
    {
      title: 'Academics & Structure',
      items: [
        { label: 'Departments', path: '/admin/departments', icon: FolderTree },
        { label: 'Courses', path: '/admin/courses', icon: Layers },
        { label: 'Academic Years', path: '/admin/academic-years', icon: Calendar },
        { label: 'Semesters', path: '/admin/semesters', icon: CalendarDays },
        { label: 'Classes', path: '/admin/classes', icon: Grid3X3 },
        { label: 'Sections', path: '/admin/sections', icon: Layers },
        { label: 'Subjects', path: '/admin/subjects', icon: BookOpen },
      ],
    },
    {
      title: 'People & Assignments',
      items: [
        { label: 'Teachers', path: '/admin/teachers', icon: Users },
        { label: 'Students', path: '/admin/students', icon: GraduationCap },
        { label: 'Teacher Assignments', path: '/admin/assignments', icon: UserCheck },
        { label: 'Student Records', path: '/admin/student-records', icon: ClipboardList },
      ],
    },
    {
      title: 'AI Face & Attendance',
      items: [
        { label: 'Face Enrollment', path: '/admin/face-enrollment', icon: ScanFace },
        { label: 'Live Monitoring', path: '/admin/attendance-live', icon: Camera },
        { label: 'Attendance Records', path: '/admin/attendance', icon: ClipboardList },
        { label: 'Attendance Reports', path: '/admin/reports', icon: FileBarChart2 },
      ],
    },
    {
      title: 'Analytics & Intelligence',
      items: [
        { label: 'Analytics', path: '/admin/analytics', icon: PieChart },
        { label: 'AI Insights', path: '/admin/insights', icon: BrainCircuit },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { label: 'Audit Activity', path: '/admin/audit', icon: ShieldAlert },
      ],
    },
    {
      title: 'System & Admin',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: Settings },
        { label: 'Admin Profile', path: '/admin/profile', icon: User },
      ],
    },
  ];

  // Teacher Navigation (All 15 required pages)
  const teacherNav = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/teacher/profile', icon: User },
    { label: 'My Classes', path: '/teacher/classes', icon: Grid3X3 },
    { label: 'My Sections', path: '/teacher/sections', icon: Layers },
    { label: 'My Subjects', path: '/teacher/subjects', icon: BookOpen },
    { label: 'My Students', path: '/teacher/students', icon: GraduationCap },
    { label: 'Face Enrollment', path: '/teacher/face-enrollment', icon: ScanFace },
    { label: 'Live AI Attendance', path: '/teacher/live-attendance', icon: Camera, highlight: true },
    { label: 'Attendance History', path: '/teacher/history', icon: ClipboardList },
    { label: 'Attendance Calendar', path: '/teacher/calendar', icon: CalendarDays },
    { label: 'Attendance Reports', path: '/teacher/reports', icon: FileBarChart2 },
    { label: 'Excel / CSV Export', path: '/teacher/export', icon: Download },
    { label: 'AI Insights', path: '/teacher/insights', icon: BrainCircuit },
    { label: 'Notifications', path: '/teacher/notifications', icon: Bell },
    { label: 'Settings', path: '/teacher/settings', icon: Settings },
  ];

  // Student Navigation (All 10 required pages)
  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: User },
    { label: 'My Attendance', path: '/student/attendance', icon: Activity },
    { label: 'Attendance Calendar', path: '/student/calendar', icon: CalendarDays },
    { label: 'Subject-wise Attendance', path: '/student/subjects', icon: BookOpen },
    { label: 'Monthly Attendance', path: '/student/monthly', icon: Calendar },
    { label: 'Attendance History', path: '/student/history', icon: ClipboardList },
    { label: 'Download Report', path: '/student/reports', icon: Download },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const renderNavLinks = () => {
    if (currentRole === 'teacher') {
      return (
        <div className="space-y-1">
          {teacherNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : item.highlight
                    ? 'text-cyan-400 hover:bg-slate-800/80 bg-cyan-950/20 border border-cyan-800/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2B]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      );
    }

    if (currentRole === 'student') {
      return (
        <div className="space-y-1">
          {studentNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2B]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      );
    }

    // Default to Admin grouped navigation
    return (
      <div className="space-y-5">
        {adminGroups.map(group => (
          <div key={group.title}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2B]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-500 transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-[#101624] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>FaceAttend</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded font-mono">AI</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {currentRole === 'admin' ? 'Institute Administration' : currentRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
              </div>
            </div>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {renderNavLinks()}
          </div>
        </div>

        {/* Footer Account & Status */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0D121F]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#151C2B]">
            <div className="flex items-center gap-2.5 overflow-hidden">
<NeutralAvatar src={currentUser?.avatar} name={currentUser?.name} role={currentUser?.role} size="xs" rounded="rounded-full" className="shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-200 truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 capitalize truncate">{currentUser?.role}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
