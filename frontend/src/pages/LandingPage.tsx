import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Server, Database, ShieldCheck, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { checkSupabaseConnection } from '../lib/supabase';
import type { SupabaseStatus } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HealthStatus {
  status: string;
  service: string;
}

export const LandingPage: React.FC = () => {
  const { user, role, getDashboardPath } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingBackend, setLoadingBackend] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [loadingSupabase, setLoadingSupabase] = useState<boolean>(false);

  const checkBackendHealth = async () => {
    setLoadingBackend(true);
    setBackendError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as HealthStatus;
      setHealth(data);
    } catch (err) {
      setBackendError(err instanceof Error ? err.message : 'Backend unreachable');
    } finally {
      setLoadingBackend(false);
    }
  };

  const verifySupabase = async () => {
    setLoadingSupabase(true);
    try {
      const status = await checkSupabaseConnection();
      setSupabaseStatus(status);
    } catch {
      setSupabaseStatus({
        initialized: false,
        configured: false,
        message: 'Supabase initialization failed',
      });
    } finally {
      setLoadingSupabase(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    verifySupabase();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs md:text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Campus Sponsorship Intelligence Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            CAMPVENTO
          </h1>

          {/* Subtitle / Quote */}
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-300 italic mb-10 max-w-2xl mx-auto leading-relaxed">
            &ldquo;Connecting the right campus opportunities with the right sponsors.&rdquo;
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {user ? (
              <Link
                to={getDashboardPath(role)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Go to {role} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Platform Capabilities Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left mt-12 mb-12">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">Event & Package Hub</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizers publish campus hackathons and festivals with custom sponsorship tiers and reach metrics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-white">AI Compatibility Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic matching based on industry alignment, budget ranges, audience profiles, and locations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-white">Requests & Commitments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured workflow from sponsor expression of interest to organizer acceptance and active agreements.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h3 className="text-sm font-bold text-white">Impact & Activity Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversion pipeline visualization, category distributions, and committed sponsorship values.
              </p>
            </div>
          </div>

          {/* Service Status Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            {/* Frontend Status Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frontend</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white">React + Vite + TypeScript</p>
              <p className="text-xs text-slate-400 mt-1">Tailwind CSS configured & active</p>
            </div>

            {/* Backend Status Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend API</span>
                <Server className={`w-4 h-4 ${health ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
              <p className="text-sm font-semibold text-white">FastAPI (Python)</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {loadingBackend
                    ? 'Checking /health...'
                    : health
                    ? `Status: ${health.status} (${health.service})`
                    : backendError
                    ? 'Backend not connected'
                    : 'Ready'}
                </span>
                <button
                  onClick={checkBackendHealth}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Retry
                </button>
              </div>
            </div>

            {/* Supabase Status Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supabase Auth</span>
                <Database
                  className={`w-4 h-4 ${supabaseStatus?.initialized ? 'text-emerald-400' : 'text-amber-400'}`}
                />
              </div>
              <p className="text-sm font-semibold text-white">Auth & Session Ready</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {loadingSupabase
                    ? 'Verifying client...'
                    : supabaseStatus?.message || 'Client ready'}
                </span>
                <button
                  onClick={verifySupabase}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Row Level Security (RLS) Enforced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              <span>Role-Based Access Control</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-slate-950/60 backdrop-blur-md">
        <p>© 2026 CAMPVENTO. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
