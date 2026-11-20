import React, { useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ASSETS } from '../../assets';
import { supabase } from '@/integrations/supabase/client';
import {
  ScanFace,
  ShieldCheck,
  GraduationCap,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  BadgeAlert,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { roleParam } = useParams<{ roleParam?: string }>();
  const navigate = useNavigate();
  const { signIn, authReady, currentRole, needsInstituteSetup } = useApp();

  const [activePortal, setActivePortal] = useState<UserRole | null>(
    roleParam === 'admin' || roleParam === 'teacher' || roleParam === 'student'
      ? (roleParam as UserRole)
      : null
  );

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotDone, setForgotDone] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Already signed in: go straight to the account's own portal
  React.useEffect(() => {
    if (!authReady || isLoading) return;
    if (currentRole) navigate(`/${currentRole}/dashboard`, { replace: true });
    else if (needsInstituteSetup) navigate('/admin/dashboard', { replace: true });
  }, [authReady, currentRole, needsInstituteSetup, isLoading, navigate]);

  const handleSelectPortal = (role: UserRole) => {
    setActivePortal(role);
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
  };

  const handleBackToPortals = () => {
    setActivePortal(null);
    setErrorMsg('');
  };

  const portalLabel = (r: UserRole) => (r === 'admin' ? 'Admin' : r === 'teacher' ? 'Teacher' : 'Student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim() || !identifier.includes('@')) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.removeItem('fa_no_remember');
      } else {
        localStorage.setItem('fa_no_remember', '1');
        sessionStorage.setItem('fa_session_alive', '1');
      }
      const res = await signIn(identifier, password);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      if (!res.role) {
        // Signed in but not linked to an institute yet: first-time Main Admin setup
        navigate('/admin/dashboard');
        return;
      }
      if (activePortal && res.role !== activePortal) {
        setErrorMsg(
          `This account is registered as ${portalLabel(res.role)}. Opening the ${portalLabel(res.role)} portal instead.`
        );
      }
      navigate(`/${res.role}/dashboard`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
    setForgotError('');
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSubmitted(false);
    if (error) {
      setForgotError(error.message);
      return;
    }
    setForgotDone(`If an account exists for ${forgotEmail.trim()}, a password reset link has been sent. Check your inbox.`);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0B0F19] overflow-hidden font-sans">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_30%] bg-no-repeat transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${ASSETS.authBackground})`,
        }}
      >
        {/* Overlay keeps cards readable */}
        <div className="absolute inset-0 bg-[#0B0F19]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-[#0B0F19]/30" />
      </div>

      {/* Decorative Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Bar with Back to Homepage */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#151C2B]/90 hover:bg-[#1E273A] border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white shadow-lg transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl my-8">
        {/* Brand Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <ScanFace className="w-4 h-4 text-cyan-400" />
            <span>FaceAttend AI · Institutional Access Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Smart Attendance. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400">Smarter Institutions.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-normal">
            Experience the future of attendance with intelligent face recognition technology.
          </p>
        </div>

        {/* Portal Selection vs Dedicated Login Panel */}
        {!activePortal ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Admin Portal Card */}
              <div
                onClick={() => handleSelectPortal('admin')}
                className="group relative bg-[#151C2B]/90 hover:bg-[#1A2337] border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>Admin Login</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded font-mono">HOD</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Main institute authority. Manage departments, faculties, students, sections, and global attendance parameters.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>Enter Admin Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Teacher Portal Card */}
              <div
                onClick={() => handleSelectPortal('teacher')}
                className="group relative bg-[#151C2B]/90 hover:bg-[#1A2337] border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>Teacher Login</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-mono">Faculty</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live camera face scanning, class rosters, attendance validation, timetable monitoring, and student analytics.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Enter Teacher Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Student Portal Card */}
              <div
                onClick={() => handleSelectPortal('student')}
                className="group relative bg-[#151C2B]/90 hover:bg-[#1A2337] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1.5 flex items-center justify-between">
                    <span>Student Login</span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded font-mono">Enrolled</span>
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Personal attendance dashboard, interactive calendar, subject percentages, biometric enrollment status, and reports.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="bg-[#101624]/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>New to FaceAttend AI? Register your institute — the first registered user becomes its Main Admin.</span>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Register Institute</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Role Login Form */
          <div className="max-w-md mx-auto bg-[#151C2B]/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Header with Back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleBackToPortals}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All Portals</span>
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Homepage
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Role:</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
                    activePortal === 'admin'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : activePortal === 'teacher'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {activePortal === 'admin' ? 'HOD / Admin' : activePortal}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {activePortal === 'admin'
                ? 'Institute Admin Portal'
                : activePortal === 'teacher'
                ? 'Faculty Sign In'
                : 'Student Attendance Portal'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Sign in with the account your institute created for you.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {activePortal === 'admin'
                    ? 'Admin Email'
                    : activePortal === 'teacher'
                    ? 'Faculty Email'
                    : 'Student Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="name@your-institute.edu"

                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-[#101624] text-blue-600 focus:ring-0"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(identifier);
                    setForgotDone('');
                    setForgotError('');
                    setForgotModalOpen(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to {activePortal.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-400">
                Faculty and student accounts are created by your Institute Admin.{' '}
                {activePortal === 'admin' && (
                  <>
                    New institute?{' '}
                    <button type="button" onClick={() => navigate('/register')} className="text-blue-400 hover:text-blue-300 font-semibold">
                      Register your institute
                    </button>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151C2B] border border-slate-700 rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the email of your FaceAttend account. We will email you a secure link to choose a new password.
            </p>
            {forgotDone && (
              <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotDone}</span>
              </div>
            )}
            {forgotError && (
              <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="name@your-institute.edu"
                className="w-full px-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitted}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition-colors"
                >
                  {forgotSubmitted ? 'Sending...' : 'Send Recovery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
