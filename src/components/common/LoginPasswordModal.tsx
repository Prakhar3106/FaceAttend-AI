import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LoginPasswordModalProps {
  kind: 'teacher' | 'student';
  recordId: string;
  name: string;
  email: string;
  hasLogin: boolean;
  onClose: () => void;
}

/** Create the sign-in account for a teacher/student, or set a new password for an existing one. */
export const LoginPasswordModal: React.FC<LoginPasswordModalProps> = ({ kind, recordId, name, email, hasLogin, onClose }) => {
  const { setMemberPassword } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError('');
    setSaving(true);
    const ok = await setMemberPassword(kind, recordId, password);
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-400" />
            <span>{hasLogin ? 'Set New Password' : 'Create Login Account'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          {hasLogin ? 'New sign-in password for' : 'Sign-in account for'} <span className="text-slate-200 font-semibold">{name}</span> ·{' '}
          <span className="font-mono">{email}</span>. Share it securely; they can change it later or use “Forgot password”.
        </p>
        <form onSubmit={submit} className="space-y-3 text-xs">
          {error && <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300">{error}</div>}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30"
            >
              {saving ? 'Saving…' : hasLogin ? 'Update Password' : 'Create Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
