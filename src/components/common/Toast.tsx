import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[#151C2B] text-slate-100 border border-slate-700/80 rounded-xl shadow-2xl transition-all duration-300">
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
      <span className="text-sm font-medium pr-2">{toast.message}</span>
    </div>
  );
};

