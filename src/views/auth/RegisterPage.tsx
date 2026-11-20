import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../assets';
import { ScanFace, ArrowLeft, ArrowRight, Mail, Lock, User, Eye, EyeOff, BadgeAlert, CheckCircle2, Building2 } from 'lucide-react';

/** Step 1 of institute registration: the founding Main Admin creates their sign-in account. */
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { authReady, currentRole, needsInstituteSetup } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sentTo, setSentTo] = useState('');

  React.useEffect(() => {
    if (!authReady) return;
    if (currentRole) navigate(`/${currentRole}/dashboard`, { replace: true });
    else if (needsInstituteSetup) navigate('/admin/dashboard', { replace: true });
  }, [authReady, currentRole, needsInstituteSetup, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) return setErrorMsg('Please enter your full name.');
    if (password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
    if (password !== confirm) return setErrorMsg('Passwords do not match.');
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login/admin`,
        data: { full_name: fullName.trim() },
      },
    });
    setIsLoading(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (data.session) {
      navigate('/admin/dashboard');
      return;
    }
    setSentTo(email.trim());
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0B0F19] overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_30%] bg-no-repeat"
        style={{ backgroundImage: `url(${ASSETS.authBackground})` }}
      >
        <div className="absolute inset-0 bg-[#0B0F19]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-[#0B0F19]/30" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#151C2B]/90 hover:bg-[#1E273A] border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white shadow-lg transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <ScanFace className="w-4 h-4 text-cyan-400" />
            <span>FaceAttend AI · Institute Registration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Register your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400">Institute</span>
          </h1>
          <p className="mt-3 text-sm text-slate-200">
            Create the Main Admin account. After confirming your email you will add your institute&apos;s details, logo and campus photo.
          </p>
        </div>

        <div className="bg-[#151C2B]/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {sentTo ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Confirm your email</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-white">{sentTo}</span>. Open it, then sign in to the Admin portal to complete your institute registration.
              </p>
              <button
                onClick={() => navigate('/login/admin')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Admin Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Main Admin Account</h2>
                  <p className="text-[11px] text-slate-400">The first registered user becomes the institute&apos;s Main Admin.</p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@your-institute.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full pl-3 pr-9 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        aria-label="Show password"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
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
                      <span>Create Main Admin Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
                Already registered?{' '}
                <button onClick={() => navigate('/login/admin')} className="text-blue-400 hover:text-blue-300 font-semibold">
                  Sign in to the Admin portal
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
