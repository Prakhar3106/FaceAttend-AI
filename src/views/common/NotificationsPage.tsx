import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Calendar,
  Layers,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, showToast } =
    useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredNotifications = notifications.filter(
    n => activeCategory === 'all' || n.category === activeCategory
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Institutional Notification Center</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time biometric attendance confirmations, threshold warnings, and academic announcements.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-600/40 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#151C2B] border border-slate-800 rounded-xl text-xs">
        {['all', 'attendance', 'alert', 'academic', 'announcement', 'system'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#151C2B] border border-slate-800 rounded-2xl">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map(item => {
            let Icon = Bell;
            let iconColor = 'text-blue-400';

            if (item.category === 'alert') {
              Icon = AlertTriangle;
              iconColor = 'text-rose-400';
            } else if (item.category === 'attendance') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-400';
            } else if (item.category === 'academic') {
              Icon = Calendar;
              iconColor = 'text-purple-400';
            } else if (item.category === 'announcement') {
              Icon = Megaphone;
              iconColor = 'text-amber-400';
            }

            return (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !item.read
                    ? 'bg-blue-950/20 border-blue-700/50 hover:bg-blue-950/30'
                    : 'bg-[#151C2B] border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-[#101624] border border-slate-800 ${iconColor} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">{item.timestamp}</div>
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
