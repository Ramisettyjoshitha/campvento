import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PublicUserRole } from '../lib/supabase';
import {
  UserPlus,
  Lock,
  Mail,
  User,
  AlertCircle,
  Loader2,
  ArrowLeft,
  GraduationCap,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Public registration allows ONLY 'ORGANIZER' or 'SPONSOR'
  const [role, setRole] = useState<PublicUserRole>('ORGANIZER');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        fullName,
        email,
        password,
        role,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setSuccessNotice(
          'Registration successful! Please check your email inbox to confirm your account before logging in.'
        );
        setLoading(false);
      } else {
        // Logged in immediately, navigate to the assigned role dashboard
        navigate(getDashboardPath(role), { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 -right-32 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your Account</h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Join Campvento to connect campus events with ideal sponsors
            </p>
          </div>

          {/* Success Notice */}
          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-300">Account Created</p>
                <p className="mt-0.5 text-slate-300">{successNotice}</p>
                <Link
                  to="/login"
                  className="inline-block mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs transition-colors"
                >
                  Proceed to Login
                </Link>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!successNotice && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@campus.edu or alex@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Role Selection (ORGANIZER vs SPONSOR only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Organizer Option */}
                  <button
                    type="button"
                    onClick={() => setRole('ORGANIZER')}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      role === 'ORGANIZER'
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap
                        className={`w-4 h-4 ${role === 'ORGANIZER' ? 'text-emerald-400' : 'text-slate-400'}`}
                      />
                      <span className="text-xs font-bold text-white">Organizer</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Campus clubs, fests, and hackathons
                    </p>
                  </button>

                  {/* Sponsor Option */}
                  <button
                    type="button"
                    onClick={() => setRole('SPONSOR')}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      role === 'SPONSOR'
                        ? 'bg-blue-500/15 border-blue-500/50 shadow-sm shadow-blue-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2
                        className={`w-4 h-4 ${role === 'SPONSOR' ? 'text-blue-400' : 'text-slate-400'}`}
                      />
                      <span className="text-xs font-bold text-white">Sponsor</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Brands and companies funding campus events
                    </p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <span>Register as {role}</span>
                )}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
