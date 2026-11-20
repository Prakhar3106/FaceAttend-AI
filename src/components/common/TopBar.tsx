import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NeutralAvatar } from './NeutralAvatar';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { useNavigate } from '@/lib/router-compat';

interface TopBarProps {
  title: string;
  subtitle?: string;
  roleBadge: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, roleBadge }) => {
  const {
    currentUser,
    currentRole,
    logout,
    settings,
    academicYears,
    setCurrentAcademicYear,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#101624]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h1>
            <span className="text-[11px] font-medium tracking-wide text-blue-400 bg-blue-950/70 border border-blue-800/50 px-2 py-0.5 rounded">
              {roleBadge}
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {/* Center Search / Academic Year Indicator */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search classes, students, subjects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-[#151C2B] text-slate-200 placeholder-slate-500 border border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Academic Year Badge / Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151C2B] border border-slate-800 rounded-lg text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-slate-200">{currentYear?.name}</span>
          {currentRole === 'admin' && (
            <select
              aria-label="Select Current Academic Year"
              value={currentYear?.id}
              onChange={e => setCurrentAcademicYear(e.target.value)}
              className="bg-transparent text-xs text-slate-400 focus:outline-none cursor-pointer border-none p-0 ml-1"
            >
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id} className="bg-[#151C2B] text-slate-200">
                  {ay.name} {ay.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Actions & Profiles */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-[#151C2B] rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#151C2B] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#101624]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/40 ${
                        !n.read ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 pr-2 hover:bg-[#151C2B] rounded-lg transition-colors"
          >
            <NeutralAvatar src={currentUser?.avatar} name={currentUser?.name} role={currentUser?.role} size="sm" rounded="rounded-full" />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser?.name || 'Authorized User'}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight capitalize">
                {currentUser?.role === 'admin' ? 'HOD / Main Admin' : currentUser?.role}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-[#151C2B] border border-slate-700/80 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-medium text-slate-200">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (currentRole === 'admin') navigate('/admin/profile');
                  else if (currentRole === 'teacher') navigate('/teacher/profile');
                  else navigate('/student/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                View Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
