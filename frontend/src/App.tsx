import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Server, Database, ShieldCheck, ArrowRight } from 'lucide-react';
import { checkSupabaseConnection } from './lib/supabase';
import type { SupabaseStatus } from './lib/supabase';

interface HealthStatus {
  status: string;
  service: string;
}

export const App: React.FC = () => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-10 bg-slate-950/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25">
              C
            </div>
            <span className="font-bold tracking-wider text-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CAMPVENTO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Step 3.3 Foundation Ready
            </span>
          </div>
        </div>
      </header>

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

          {/* Description */}
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto mb-12">
            The full-stack foundation has been successfully established with React, Vite, TypeScript, Tailwind CSS, FastAPI, and Supabase Client.
          </p>

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
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Supabase</span>
                <Database
                  className={`w-4 h-4 ${supabaseStatus?.initialized ? 'text-emerald-400' : 'text-amber-400'}`}
                />
              </div>
              <p className="text-sm font-semibold text-white">Supabase Client</p>
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
              <span>Independent Decoupled Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-indigo-400" />
              <span>Ready for Next Step</span>
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

export default App;
