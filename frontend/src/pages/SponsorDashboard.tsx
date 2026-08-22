import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SponsorDashboard: React.FC = () => {
  const { user, fullName, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-8 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {role} PORTAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Sponsor Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Welcome back, {fullName || user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Session Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Authentication Session</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">User ID</span>
              <span className="text-slate-200 font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-200 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Full Name</span>
              <span className="text-slate-200 font-medium">{fullName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Assigned Role</span>
              <span className="text-blue-400 font-bold">{role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Session Status</span>
              <span className="text-blue-400 font-semibold">Active (Persisted)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Step 3.4A Verification Notice
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This dashboard is a placeholder verifying that Supabase Auth, session persistence across page refreshes, and role-based route guards are fully operational for the <strong className="text-blue-400">SPONSOR</strong> role.
            </p>
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
              ✓ Route protection active: Organizer and Admin pages are locked against this account.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Next steps will integrate sponsorship intelligence and brand discovery.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
